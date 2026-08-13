import { Space, TaskItem, Mission, MemoryItem } from '../../types';

export interface Migration {
  version: number;
  name: string;
  up: (db: RelationalDatabase) => void;
}

export interface QueryFilter<T> {
  where?: Partial<Record<keyof T, any>> | ((item: T) => boolean);
  orderBy?: keyof T;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export class RelationalDatabase {
  private static STORAGE_PREFIX = 'om_db_table_';
  private static VERSION_KEY = 'om_db_version';

  private tables: Map<string, Map<string, any>> = new Map();
  private currentVersion: number = 0;

  constructor() {
    this.init();
  }

  private init() {
    this.currentVersion = parseInt(localStorage.getItem(RelationalDatabase.VERSION_KEY) || '0', 10);
    this.loadTablesFromStorage();
    this.runMigrations();
  }

  private loadTablesFromStorage() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(RelationalDatabase.STORAGE_PREFIX)) {
          const tableName = key.replace(RelationalDatabase.STORAGE_PREFIX, '');
          const dataJson = localStorage.getItem(key);
          if (dataJson) {
            const recordsArray: [string, any][] = JSON.parse(dataJson);
            this.tables.set(tableName, new Map(recordsArray));
          }
        }
      }
    } catch (err) {
      console.error('[RelationalDatabase] Failed to load table data from storage:', err);
    }
  }

  private saveTableToStorage(tableName: string) {
    const tableMap = this.tables.get(tableName);
    if (!tableMap) return;
    try {
      const recordsArray = Array.from(tableMap.entries());
      localStorage.setItem(
        RelationalDatabase.STORAGE_PREFIX + tableName,
        JSON.stringify(recordsArray)
      );
    } catch (err) {
      console.error(`[RelationalDatabase] Failed to persist table ${tableName}:`, err);
    }
  }

  public getMigrationVersion(): number {
    return this.currentVersion;
  }

  private runMigrations() {
    const migrations: Migration[] = [
      {
        version: 1,
        name: 'v1_create_core_tables',
        up: (db) => {
          db.ensureTable('spaces');
          db.ensureTable('tasks');
          db.ensureTable('missions');
          db.ensureTable('memories');
        },
      },
      {
        version: 2,
        name: 'v2_add_index_supports',
        up: (db) => {
          db.ensureTable('audit_logs');
          db.ensureTable('agent_actions');
        },
      },
    ];

    for (const m of migrations) {
      if (m.version > this.currentVersion) {
        console.log(`[RelationalDatabase] Running schema migration v${m.version}: ${m.name}`);
        m.up(this);
        this.currentVersion = m.version;
        localStorage.setItem(RelationalDatabase.VERSION_KEY, this.currentVersion.toString());
      }
    }
  }

  public ensureTable(tableName: string) {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, new Map());
      this.saveTableToStorage(tableName);
    }
  }

  public insert<T extends { id: string }>(tableName: string, record: T): T {
    this.ensureTable(tableName);
    const tableMap = this.tables.get(tableName)!;
    tableMap.set(record.id, { ...record });
    this.saveTableToStorage(tableName);
    return record;
  }

  public insertBatch<T extends { id: string }>(tableName: string, records: T[]): T[] {
    this.ensureTable(tableName);
    const tableMap = this.tables.get(tableName)!;
    records.forEach((r) => tableMap.set(r.id, { ...r }));
    this.saveTableToStorage(tableName);
    return records;
  }

  public findById<T>(tableName: string, id: string): T | null {
    const tableMap = this.tables.get(tableName);
    if (!tableMap) return null;
    return tableMap.get(id) || null;
  }

  public update<T extends { id: string }>(tableName: string, id: string, patch: Partial<T>): T | null {
    const tableMap = this.tables.get(tableName);
    if (!tableMap || !tableMap.has(id)) return null;
    const existing = tableMap.get(id);
    const updated = { ...existing, ...patch, id };
    tableMap.set(id, updated);
    this.saveTableToStorage(tableName);
    return updated as T;
  }

  public delete(tableName: string, id: string): boolean {
    const tableMap = this.tables.get(tableName);
    if (!tableMap || !tableMap.has(id)) return false;
    const deleted = tableMap.delete(id);
    if (deleted) {
      this.saveTableToStorage(tableName);
    }
    return deleted;
  }

  public query<T>(tableName: string, filter?: QueryFilter<T>): T[] {
    const tableMap = this.tables.get(tableName);
    if (!tableMap) return [];

    let results = Array.from(tableMap.values()) as T[];

    if (filter?.where) {
      if (typeof filter.where === 'function') {
        results = results.filter(filter.where);
      } else {
        const matchObj = filter.where;
        results = results.filter((item: any) => {
          for (const key in matchObj) {
            if (item[key] !== matchObj[key]) return false;
          }
          return true;
        });
      }
    }

    if (filter?.orderBy) {
      const orderKey = filter.orderBy;
      const desc = filter.order === 'desc';
      results.sort((a: any, b: any) => {
        if (a[orderKey] < b[orderKey]) return desc ? 1 : -1;
        if (a[orderKey] > b[orderKey]) return desc ? -1 : 1;
        return 0;
      });
    }

    if (filter?.offset) {
      results = results.slice(filter.offset);
    }

    if (filter?.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  public count(tableName: string): number {
    return this.tables.get(tableName)?.size || 0;
  }

  public clearTable(tableName: string) {
    if (this.tables.has(tableName)) {
      this.tables.get(tableName)!.clear();
      this.saveTableToStorage(tableName);
    }
  }
}

export const sqliteAdapter = new RelationalDatabase();
export const localStorageAdapter = sqliteAdapter;
