import { AuditEvent, RiskLevel } from '../../types';
import { sqliteAdapter } from '../../infrastructure/database/sqliteAdapter';

export type EventType =
  | 'CONTEXT_RESTORED'
  | 'AGENT_ACTION_REQUESTED'
  | 'AGENT_ACTION_APPROVED'
  | 'AGENT_ACTION_REJECTED'
  | 'AGENT_ACTION_EXECUTED'
  | 'PERMISSION_EVALUATED'
  | 'TASK_COMPLETED'
  | 'TASK_CREATED'
  | 'MEMORY_SAVED'
  | 'SPACE_SWITCHED'
  | 'SYSTEM_ALERT';

export interface SystemEvent<T = any> {
  id: string;
  type: EventType;
  timestamp: string;
  payload: T;
  actor?: string;
  agent?: string;
  spaceId?: string;
}

export type EventListener<T = any> = (event: SystemEvent<T>) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<EventType, Set<EventListener>> = new Map();

  private constructor() {
    this.setupAuditLogging();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribes a listener function to a specific event type.
   */
  public subscribe<T = any>(type: EventType, listener: EventListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    // Unsubscribe helper
    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  /**
   * Publishes an event to all subscribed listeners and logs to audit trail.
   */
  public async publish<T = any>(
    type: EventType,
    payload: T,
    meta?: { actor?: string; agent?: string; spaceId?: string }
  ): Promise<SystemEvent<T>> {
    const event: SystemEvent<T> = {
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      type,
      timestamp: new Date().toISOString(),
      payload,
      actor: meta?.actor || 'user',
      agent: meta?.agent,
      spaceId: meta?.spaceId,
    };

    const listeners = this.listeners.get(type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          await listener(event);
        } catch (err) {
          console.error(`[EventBus] Error executing listener for event ${type}:`, err);
        }
      }
    }

    return event;
  }

  /**
   * Internal hook to persist audit events for compliance & timeline views.
   */
  private setupAuditLogging() {
    const auditHandler = (evt: SystemEvent) => {
      const riskLevel: RiskLevel = evt.payload?.riskLevel || 'READ';
      const auditLog: AuditEvent = {
        id: evt.id,
        timestamp: evt.timestamp,
        actor: evt.actor || 'user',
        agent: evt.agent || evt.payload?.agentName || 'SystemCore',
        tool: evt.payload?.type || evt.type,
        action: evt.payload?.title || evt.type,
        target: evt.spaceId || evt.payload?.spaceId || 'global',
        result: evt.type.includes('REJECTED') ? 'rejected' : 'success',
        riskLevel,
      };

      sqliteAdapter.insert('audit_logs', auditLog);
    };

    // Auto-record security-relevant events
    this.subscribe('AGENT_ACTION_REQUESTED', auditHandler);
    this.subscribe('AGENT_ACTION_APPROVED', auditHandler);
    this.subscribe('AGENT_ACTION_REJECTED', auditHandler);
    this.subscribe('AGENT_ACTION_EXECUTED', auditHandler);
    this.subscribe('PERMISSION_EVALUATED', auditHandler);
    this.subscribe('CONTEXT_RESTORED', auditHandler);
  }

  /**
   * Retrieves past audit logs with optional filtering.
   */
  public getAuditLogs(filter?: {
    agent?: string;
    result?: AuditEvent['result'];
    riskLevel?: RiskLevel;
    limit?: number;
  }): AuditEvent[] {
    return sqliteAdapter.query<AuditEvent>('audit_logs', {
      where: (item) => {
        if (filter?.agent && item.agent !== filter.agent) return false;
        if (filter?.result && item.result !== filter.result) return false;
        if (filter?.riskLevel && item.riskLevel !== filter.riskLevel) return false;
        return true;
      },
      orderBy: 'timestamp',
      order: 'desc',
      limit: filter?.limit || 50,
    });
  }
}

export const globalEventBus = EventBus.getInstance();
