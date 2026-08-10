export type RiskLevel = 'READ' | 'DRAFT' | 'ASK' | 'ACT' | 'NEVER';

export type MemoryScope = 'private' | 'space' | 'session' | 'team';

export interface Space {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  active: boolean;
  securityPolicy: 'strict' | 'standard' | 'isolated';
  tabsCount: number;
  notesCount: number;
  tasksCount: number;
  memoryCount: number;
  lastActiveTime: string;
}

export interface Mission {
  id: string;
  title: string;
  spaceId: string;
  goal: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  tasksCount: number;
  dueDate: string;
}

export interface MemoryItem {
  id: string;
  content: string;
  entityTags: string[];
  confidence: number;
  source: string;
  scope: MemoryScope;
  spaceId?: string;
  createdAt: string;
  userEditable: boolean;
  decisionFlag?: boolean;
}

export interface TabItem {
  id: string;
  spaceId: string;
  title: string;
  url: string;
  favicon?: string;
  isActive: boolean;
  pinned: boolean;
  isSleeping?: boolean;
  readerMode?: boolean;
  summary?: string;
  contentSnippet?: string;
}

export interface NoteItem {
  id: string;
  spaceId: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  spaceId: string;
  missionId?: string;
  title: string;
  completed: boolean;
  priority: 'p1' | 'p2' | 'p3';
  dueDate: string;
  category: string;
  dependencies?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  joinUrl?: string;
  attendees?: string[];
  location?: string;
  spaceId?: string;
  category?: string;
}

export interface DailyGoal {
  id: string;
  title: string;
  completed: boolean;
  spaceId?: string;
  linkedTaskId?: string;
  linkedHabitId?: string;
  category: 'High Impact' | 'Mission Milestone' | 'Personal Growth';
}

export interface SpaceActivityPoint {
  day: string;
  tabsOpened: number;
  tasksCompleted: number;
  memoryAdded: number;
  totalIntensity: number;
}

export interface HabitItem {
  id: string;
  spaceId: string;
  title: string;
  category: string;
  frequency: 'daily' | 'weekdays' | 'weekly';
  streak: number;
  bestStreak: number;
  completedToday: boolean;
  history: Record<string, boolean>; // e.g. '2026-08-10': true
  linkedTaskId?: string;
  createdAt: string;
}

export interface FileItem {
  id: string;
  spaceId: string;
  name: string;
  size: string;
  type: string;
  path: string;
  encrypted: boolean;
  updatedAt: string;
  contentSnippet?: string;
}

export interface AgentAction {
  id: string;
  agentName: string;
  title: string;
  type: 'terminal' | 'deployment' | 'file' | 'memory' | 'task' | 'notification' | 'email';
  riskLevel: RiskLevel;
  command?: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  timestamp: string;
  spaceId?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  agent: string;
  tool: string;
  action: string;
  target: string;
  result: 'success' | 'rejected' | 'failed';
  riskLevel: RiskLevel;
}

export interface ModelRoute {
  id: string;
  name: string;
  provider: 'ollama' | 'gemini' | 'edge';
  role: 'fast_chat' | 'coding' | 'thinking' | 'vision' | 'embeddings';
  status: 'active' | 'available' | 'offline';
  latencyMs: number;
  privacyRating: 'Strict Local' | 'Encrypted Cloud' | 'Zero Log';
}

export interface EdgeNode {
  id: string;
  name: string;
  type: 'Homelab Server' | 'Laptop Edge' | 'Private VPS' | 'NAS Storage';
  status: 'online' | 'offline' | 'busy';
  ipAddress: string;
  gpuInfo?: string;
  ramUsage: string;
  lastSeen: string;
}

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'restarting';
  ports: string;
  cpu: string;
  memory: string;
  uptime: string;
}

export interface DailyBriefing {
  greeting: string;
  summary: string;
  priorities: string[];
  contextToResume: string;
  securityNotice: string;
  suggestedAction?: string;
}
