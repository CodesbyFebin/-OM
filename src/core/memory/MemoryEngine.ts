import { MemoryItem, MemoryScope } from '../../types';
import { sqliteAdapter } from '../../infrastructure/database/sqliteAdapter';
import { globalEventBus } from '../events/EventBus';

export interface MemorySearchResult {
  item: MemoryItem;
  relevanceScore: number;
  matchedTags: string[];
}

export interface MemoryLink {
  id: string;
  sourceMemoryId: string;
  targetEntityId: string; // taskId, noteId, spaceId, etc.
  targetEntityType: 'task' | 'note' | 'space' | 'mission' | 'decision';
  relationshipType: 'references' | 'derived_from' | 'supports' | 'blocks';
  createdAt: string;
}

export class MemoryEngine {
  private static TABLE_NAME = 'memories';
  private static LINKS_TABLE = 'memory_links';

  /**
   * Initializes memory store with initial default memories if database is empty.
   */
  public static initializeDefaults(initialMemories: MemoryItem[]) {
    sqliteAdapter.ensureTable(this.TABLE_NAME);
    sqliteAdapter.ensureTable(this.LINKS_TABLE);

    const existingCount = sqliteAdapter.count(this.TABLE_NAME);
    if (existingCount === 0 && initialMemories.length > 0) {
      sqliteAdapter.insertBatch(this.TABLE_NAME, initialMemories);
    }
  }

  /**
   * Saves or creates a new memory item and triggers an EventBus notification.
   */
  public static addMemory(item: Omit<MemoryItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): MemoryItem {
    const memory: MemoryItem = {
      ...item,
      id: item.id || 'mem-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      createdAt: item.createdAt || new Date().toISOString().split('T')[0],
      userEditable: item.userEditable ?? true,
    };

    sqliteAdapter.insert(this.TABLE_NAME, memory);

    globalEventBus.publish('MEMORY_SAVED', memory, {
      actor: 'user',
      spaceId: memory.spaceId,
    });

    return memory;
  }

  /**
   * Performs semantic / tag-weighted search across all stored memories.
   */
  public static searchMemories(
    query: string,
    filters?: {
      scope?: MemoryScope | 'all';
      spaceId?: string;
      onlyDecisions?: boolean;
      limit?: number;
    }
  ): MemorySearchResult[] {
    const allMemories = sqliteAdapter.query<MemoryItem>(this.TABLE_NAME);
    const normalizedQuery = query.toLowerCase().trim();
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    const results: MemorySearchResult[] = [];

    for (const mem of allMemories) {
      // Scope filter
      if (filters?.scope && filters.scope !== 'all' && mem.scope !== filters.scope) {
        continue;
      }

      // Space filter
      if (filters?.spaceId && mem.spaceId && mem.spaceId !== filters.spaceId) {
        continue;
      }

      // Decisions only filter
      if (filters?.onlyDecisions && !mem.decisionFlag) {
        continue;
      }

      if (!queryTokens.length) {
        results.push({ item: mem, relevanceScore: 1.0, matchedTags: mem.entityTags });
        continue;
      }

      // Calculate relevance score
      let score = 0;
      const matchedTags: string[] = [];
      const contentLower = mem.content.toLowerCase();

      for (const token of queryTokens) {
        // Tag exact match (high weight)
        for (const tag of mem.entityTags) {
          if (tag.toLowerCase().includes(token)) {
            score += 3.0;
            if (!matchedTags.includes(tag)) matchedTags.push(tag);
          }
        }

        // Content substring match
        if (contentLower.includes(token)) {
          score += 1.5;
        }
      }

      // Boost by confidence rating
      score *= mem.confidence || 0.8;

      if (score > 0) {
        results.push({ item: mem, relevanceScore: score, matchedTags });
      }
    }

    // Sort by relevance score descending
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    if (filters?.limit) {
      return results.slice(0, filters.limit);
    }

    return results;
  }

  /**
   * Links a memory item to another entity (task, note, space, decision).
   */
  public static linkEntity(
    sourceMemoryId: string,
    targetEntityId: string,
    targetEntityType: MemoryLink['targetEntityType'],
    relationshipType: MemoryLink['relationshipType'] = 'references'
  ): MemoryLink {
    const link: MemoryLink = {
      id: 'mlink-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      sourceMemoryId,
      targetEntityId,
      targetEntityType,
      relationshipType,
      createdAt: new Date().toISOString(),
    };

    sqliteAdapter.insert(this.LINKS_TABLE, link);
    return link;
  }

  /**
   * Retrieves all linked entity IDs for a given memory item.
   */
  public static getLinksForMemory(memoryId: string): MemoryLink[] {
    return sqliteAdapter.query<MemoryLink>(this.LINKS_TABLE, {
      where: { sourceMemoryId: memoryId },
    });
  }

  /**
   * Retrieves all decision memories.
   */
  public static getDecisions(spaceId?: string): MemoryItem[] {
    return sqliteAdapter.query<MemoryItem>(this.TABLE_NAME, {
      where: (mem) => {
        if (!mem.decisionFlag) return false;
        if (spaceId && mem.spaceId && mem.spaceId !== spaceId) return false;
        return true;
      },
      orderBy: 'createdAt',
      order: 'desc',
    });
  }

  /**
   * Deletes a memory item.
   */
  public static deleteMemory(id: string): boolean {
    return sqliteAdapter.delete(this.TABLE_NAME, id);
  }
}
