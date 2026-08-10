import { Space, TaskItem, NoteItem, MemoryItem, Mission, TabItem, AgentAction } from '../../types';

export interface ContextSnapshot {
  spaceId: string;
  spaceName: string;
  timestamp: string;
  activeTasksCount: number;
  completedTasksCount: number;
  notesCount: number;
  memoriesCount: number;
  missionsCount: number;
  openTabsCount: number;
  pendingActionsCount: number;
  recentTasks: TaskItem[];
  recentNotes: NoteItem[];
  recentMemories: MemoryItem[];
}

export interface UniverseState {
  activeSpaceId: string;
  spaces: Space[];
  tasks: TaskItem[];
  notes: NoteItem[];
  memoryItems: MemoryItem[];
  missions: Mission[];
  tabs: TabItem[];
  actions: AgentAction[];
}

export interface RestorationOutcome {
  targetSpaceId: string;
  targetSpaceName: string;
  summary: string;
  snapshot: ContextSnapshot | null;
  restoredAt: string;
}

export class ContextEngine {
  private static STORAGE_KEY_SNAPSHOT = 'om_context_snapshot';
  private static STORAGE_KEY_ACTIVE_SPACE = 'om_active_space';

  /**
   * Captures a complete snapshot of the current active workspace state.
   */
  public static captureSnapshot(state: UniverseState): ContextSnapshot {
    const activeSpace = state.spaces.find((s) => s.id === state.activeSpaceId) || state.spaces[0];
    const spaceTasks = state.tasks.filter((t) => t.spaceId === state.activeSpaceId);
    const spaceNotes = state.notes.filter((n) => n.spaceId === state.activeSpaceId);
    const spaceMemories = state.memoryItems.filter((m) => m.spaceId === state.activeSpaceId);
    const spaceMissions = state.missions.filter((m) => m.spaceId === state.activeSpaceId);
    const spaceTabs = state.tabs.filter((tb) => tb.spaceId === state.activeSpaceId);
    const pendingActions = state.actions.filter(
      (a) => a.spaceId === state.activeSpaceId && a.status === 'pending'
    );

    const snapshot: ContextSnapshot = {
      spaceId: activeSpace?.id || 'space-dev',
      spaceName: activeSpace?.name || 'Development & Engineering',
      timestamp: new Date().toISOString(),
      activeTasksCount: spaceTasks.filter((t) => !t.completed).length,
      completedTasksCount: spaceTasks.filter((t) => t.completed).length,
      notesCount: spaceNotes.length,
      memoriesCount: spaceMemories.length,
      missionsCount: spaceMissions.length,
      openTabsCount: spaceTabs.length,
      pendingActionsCount: pendingActions.length,
      recentTasks: spaceTasks.slice(0, 5),
      recentNotes: spaceNotes.slice(0, 5),
      recentMemories: spaceMemories.slice(0, 5),
    };

    try {
      localStorage.setItem(this.STORAGE_KEY_SNAPSHOT, JSON.stringify(snapshot));
      localStorage.setItem(this.STORAGE_KEY_ACTIVE_SPACE, snapshot.spaceId);
    } catch (e) {
      console.warn('[ContextEngine] Failed to persist snapshot to localStorage:', e);
    }

    return snapshot;
  }

  /**
   * Decoupled execution for 'Continue my universe' context restoration.
   * Resolves target workspace, snapshot metadata, and summary briefing.
   */
  public static restoreUniverseContext(defaultSpaceId: string = 'space-dev'): RestorationOutcome {
    const snapshot = this.getSavedSnapshot();
    const targetSpaceId = snapshot?.spaceId || this.getInitialActiveSpaceId(defaultSpaceId);
    const targetSpaceName = snapshot?.spaceName || 'Development & Engineering';
    const summary = this.buildRestorationSummary(snapshot);

    return {
      targetSpaceId,
      targetSpaceName,
      summary,
      snapshot,
      restoredAt: new Date().toISOString(),
    };
  }

  /**
   * Loads the last persisted context snapshot from storage.
   */
  public static getSavedSnapshot(): ContextSnapshot | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY_SNAPSHOT);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  /**
   * Restores active space ID or returns default
   */
  public static getInitialActiveSpaceId(defaultId: string = 'space-dev'): string {
    try {
      return localStorage.getItem(this.STORAGE_KEY_ACTIVE_SPACE) || defaultId;
    } catch {
      return defaultId;
    }
  }

  /**
   * Generates a context restoration summary briefing prompt string
   */
  public static buildRestorationSummary(snapshot: ContextSnapshot | null): string {
    if (!snapshot) {
      return 'Restoring OM operating context for Development & Engineering space. All zero-knowledge nodes online.';
    }

    return `Context snapshot restored for space "${snapshot.spaceName}" (${snapshot.activeTasksCount} active tasks, ${snapshot.notesCount} notes, ${snapshot.memoriesCount} vault memories, ${snapshot.pendingActionsCount} pending agent actions).`;
  }
}
