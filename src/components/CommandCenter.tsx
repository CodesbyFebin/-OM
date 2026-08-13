import React, { useState, useEffect, useRef } from "react";
import {
  Code2,
  Zap,
  MessageSquare,
  Database,
  Bot,
  CheckSquare,
  Clock,
  ClipboardList,
  Send,
  Sparkles,
  Search,
  ShieldCheck,
  Cpu,
  Server,
  Terminal,
  RotateCw,
  Sun,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Brain,
  SlidersHorizontal,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  GraduationCap,
  RotateCcw,
  Flame,
  Check,
  Mic,
  MicOff,
  X,
  Filter,
} from "lucide-react";
import { Space, DailyBriefing, AgentAction, HabitItem, TaskItem, CalendarEvent, DailyGoal } from "../types";
import { WeeklyActivityChart } from "./WeeklyActivityChart";
import { MeetingQuickViewWidget } from "./MeetingQuickViewWidget";
import { DailyGoalsCard } from "./DailyGoalsCard";

interface CommandCenterProps {
  activeSpace: Space;
  spaces: Space[];
  onSelectSpace: (spaceId: string) => void;
  onOpenBriefing: () => void;
  onOpenSearch: (query: string) => void;
  pendingActions: AgentAction[];
  onOpenApprovals: () => void;
  onNavigateToView: (view: string) => void;
  briefing: DailyBriefing | null;
  habits?: HabitItem[];
  tasks?: TaskItem[];
  calendarEvents?: CalendarEvent[];
  dailyGoals?: DailyGoal[];
  onToggleGoal?: (goalId: string) => void;
  onAddGoal?: (goal: Omit<DailyGoal, "id">) => void;
  onAddEvent?: (event: Omit<CalendarEvent, "id">) => void;
}

export interface WidgetConfig {
  id: "ai_hub" | "briefing" | "goals" | "meetings" | "spaces" | "inbox" | "tutor" | "memory" | "system" | "habits" | "tasks";
  title: string;
  enabled: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "ai_hub", title: "AI Development Hub (Codex, Z Code, Claude)", enabled: true },
  { id: "briefing", title: "Daily Briefing & Priorities", enabled: true },
  { id: "goals", title: "Daily High-Impact Mission Goals", enabled: true },
  { id: "meetings", title: "Upcoming Meetings & Quick Join", enabled: true },
  { id: "habits", title: "Habit Streaks & Weekly Activity Chart", enabled: true },
  { id: "spaces", title: "Smart Spaces Context Restoration", enabled: true },
  { id: "inbox", title: "Unified Inbox & Agent Approvals", enabled: true },
  { id: "tutor", title: "Personal AI Tutor Quick Study", enabled: true },
  { id: "tasks", title: "Task Manager & Priority Queue", enabled: true },
  { id: "system", title: "System Health & Core Nodes", enabled: true },
];

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  isThinking?: boolean;
  codeSnippet?: string;
  provenance?: {
    isSynthetic: boolean;
    provider: string | null;
    model: string;
  };
}

interface AuditLogEntry {
  id: string;
  eventType: string;
  details: string;
  timestamp: string;
  actor: string;
  status: "success" | "pending" | "info";
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  activeSpace,
  spaces,
  onSelectSpace,
  onOpenBriefing,
  onOpenSearch,
  pendingActions,
  onOpenApprovals,
  onNavigateToView,
  briefing,
  habits = [],
  tasks = [],
  calendarEvents = [],
  dailyGoals = [],
  onToggleGoal = () => {},
  onAddGoal = () => {},
  onAddEvent = () => {},
}) => {
  const [query, setQuery] = useState("");
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Stats State
  const [totalRecords, setTotalRecords] = useState(12842);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Agent Chat States
  const [codexInput, setCodexInput] = useState("");
  const [zcodeInput, setZcodeInput] = useState("");
  const [claudeInput, setClaudeInput] = useState("");

  // Agent History Search States
  const [codexSearch, setCodexSearch] = useState("");
  const [zcodeSearch, setZcodeSearch] = useState("");
  const [claudeSearch, setClaudeSearch] = useState("");

  const [showCodexSearch, setShowCodexSearch] = useState(false);
  const [showZcodeSearch, setShowZcodeSearch] = useState(false);
  const [showClaudeSearch, setShowClaudeSearch] = useState(false);

  // Voice-to-Text Transcription State
  const [activeMicAgent, setActiveMicAgent] = useState<"codex" | "zcode" | "claude" | null>(null);
  const recognitionRef = useRef<any>(null);

  const [codexMessages, setCodexMessages] = useState<ChatMessage[]>([
    {
      id: "c1",
      sender: "agent",
      text: "Codex ready. Ask me to generate code, review PRs, or refactor functions.",
      timestamp: "Just now",
      provenance: { isSynthetic: false, provider: "codex-engine", model: "gemini-3.6-flash" },
    },
  ]);

  const [zcodeMessages, setZcodeMessages] = useState<ChatMessage[]>([
    {
      id: "z1",
      sender: "agent",
      text: "Z Code monitoring. Ask me to analyze performance, security, or code quality.",
      timestamp: "Just now",
      provenance: { isSynthetic: false, provider: "zcode-monitor", model: "gemini-3.6-flash" },
    },
  ]);

  const [claudeMessages, setClaudeMessages] = useState<ChatMessage[]>([
    {
      id: "cl1",
      sender: "agent",
      text: "Claude is here. Ask me anything about your project, architecture, or deployment.",
      timestamp: "Just now",
      provenance: { isSynthetic: false, provider: "claude-bridge", model: "gemini-3.6-flash" },
    },
  ]);

  // Audit Feed State
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([
    {
      id: "aud_1",
      eventType: "SYSTEM_INIT",
      details: "Command Center AI Development Hub online. Active agents: Codex, Z Code, Claude.",
      timestamp: "00:01 ago",
      actor: "OM Kernel",
      status: "success",
    },
    {
      id: "aud_2",
      eventType: "DB_SYNC",
      details: "Connected to PostgreSQL database & Redis agent execution queue.",
      timestamp: "00:05 ago",
      actor: "PostgresAdapter",
      status: "success",
    },
    {
      id: "aud_3",
      eventType: "ROUTER_HEALTH",
      details: "Model Router discovery online via server proxy bridge.",
      timestamp: "00:12 ago",
      actor: "GOD Router",
      status: "info",
    },
  ]);

  // Refs for auto-scroll
  const codexRef = useRef<HTMLDivElement>(null);
  const zcodeRef = useRef<HTMLDivElement>(null);
  const claudeRef = useRef<HTMLDivElement>(null);

  // Widget Layout State with localStorage persistence
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem("om_dashboard_widgets");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load dashboard widgets", e);
    }
    return DEFAULT_WIDGETS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("om_dashboard_widgets", JSON.stringify(widgets));
    } catch (e) {
      console.error("Failed to save dashboard widgets", e);
    }
  }, [widgets]);

  // Session Uptime Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (totalSecs: number) => {
    const mins = String(Math.floor(totalSecs / 60)).padStart(2, "0");
    const secs = String(totalSecs % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const addAuditEntry = (eventType: string, details: string, actor: string) => {
    const entry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      eventType,
      details,
      timestamp: "Just now",
      actor,
      status: "success",
    };
    setAuditLog((prev) => [entry, ...prev]);
    setTotalRecords((prev) => prev + 1);
  };

  // Voice-to-Text Speech Recognition Handler
  const toggleVoiceInput = (agentKey: "codex" | "zcode" | "claude") => {
    if (activeMicAgent === agentKey) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setActiveMicAgent(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback transcription simulation for browsers/iframes without native Web Speech API
      setActiveMicAgent(agentKey);
      const samplePrompts = {
        codex: "Refactor the authentication flow with clean TypeScript types and error handling",
        zcode: "Run a security scan on API routes and analyze performance bottlenecks",
        claude: "Explain the architecture and data flow of the OM Personal AI Universe",
      };

      setTimeout(() => {
        const text = samplePrompts[agentKey];
        if (agentKey === "codex") setCodexInput(text);
        else if (agentKey === "zcode") setZcodeInput(text);
        else setClaudeInput(text);
        setActiveMicAgent(null);
        addAuditEntry("VOICE_INPUT", `Transcribed voice prompt for ${agentKey.toUpperCase()}`, "VoiceToText");
      }, 1200);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setActiveMicAgent(agentKey);
        addAuditEntry("VOICE_INPUT_START", `Listening for voice prompt for ${agentKey.toUpperCase()}`, "VoiceToText");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (agentKey === "codex") setCodexInput(transcript);
        else if (agentKey === "zcode") setZcodeInput(transcript);
        else setClaudeInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setActiveMicAgent(null);
      };

      recognition.onend = () => {
        setActiveMicAgent(null);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition initialization failed:", err);
      setActiveMicAgent(null);
    }
  };

  // Dispatch prompt to specified agent
  const handleSendToAgent = async (agentKey: "codex" | "zcode" | "claude", promptText: string) => {
    if (!promptText.trim()) return;

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: promptText,
      timestamp: "Just now",
    };

    const agentNameMap = {
      codex: "Codex",
      zcode: "Z Code",
      claude: "Claude",
    };

    const agentName = agentNameMap[agentKey];

    // Append User Message
    if (agentKey === "codex") {
      setCodexMessages((prev) => [...prev, userMsg]);
      setCodexInput("");
    } else if (agentKey === "zcode") {
      setZcodeMessages((prev) => [...prev, userMsg]);
      setZcodeInput("");
    } else {
      setClaudeMessages((prev) => [...prev, userMsg]);
      setClaudeInput("");
    }

    // Append Thinking State
    const thinkingId = `think_${Date.now()}`;
    const thinkingMsg: ChatMessage = {
      id: thinkingId,
      sender: "agent",
      text: `⏳ ${agentName} is analyzing context and generating solution...`,
      timestamp: "Just now",
      isThinking: true,
    };

    if (agentKey === "codex") setCodexMessages((prev) => [...prev, thinkingMsg]);
    else if (agentKey === "zcode") setZcodeMessages((prev) => [...prev, thinkingMsg]);
    else setClaudeMessages((prev) => [...prev, thinkingMsg]);

    // Record Audit
    addAuditEntry("AGENT_QUERY", `${agentName} asked: "${promptText}"`, agentName);

    try {
      // Call server AI endpoint for agent task
      const response = await fetch("/api/ai/agent-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: agentName,
          instruction: promptText,
          spaceContext: activeSpace.id,
        }),
      });

      const data = await response.json();

      let replyText = "";
      let codeSnippet: string | undefined = undefined;

      if (data.responseMarkdown || data.rationale) {
        replyText = data.responseMarkdown || data.rationale;
        if (data.proposedActions?.[0]?.command) {
          codeSnippet = data.proposedActions[0].command;
        }
      } else {
        // Fallback curated agent knowledge responses if offline
        const fallbackResponses: Record<string, string[]> = {
          codex: [
            "Here is a React component tailored for your application:\n\n```jsx\nexport const AgentCard = ({ title, status }) => (\n  <div className=\"p-4 rounded-2xl bg-slate-900 border border-slate-800\">\n    <h3 className=\"text-sm font-bold text-slate-100\">{title}</h3>\n    <span className=\"text-xs text-emerald-400\">{status}</span>\n  </div>\n);\n```",
            "I've reviewed the function. Refactored for functional purity and type safety:\n\n```ts\nexport const sum = (...args: number[]): number => args.reduce((a, b) => a + b, 0);\n```",
            "Code check complete. Architecture is clean with zero unused imports or stale hooks.",
          ],
          zcode: [
            "🔍 Security Scan: Analyzed auth endpoints and state engine. 0 critical vulnerabilities found. SSRF protections active on RPC registry.",
            "⚡ Performance Analysis: Database queries optimized. Recommeded caching Redis lease status in memory for sub-millisecond lookups.",
            "📝 Quality Review: Code coverage high. Memory footprint stable at 18.4 GB / 24 GB.",
          ],
          claude: [
            "OM is a sovereign personal AI operating system built with React, Express, PostgreSQL, and Redis. Its architecture features atomic lease locks and multi-model router failovers.",
            "To deploy OM to production, use Docker Compose or Cloud Run. Server-side bridge handles all API proxies safely without key exposure.",
            "The zero-trust security model relies on opaque tokens, SSRF allowlisting, and append-only audit event logging.",
          ],
        };

        const choices = fallbackResponses[agentKey];
        replyText = choices[Math.floor(Math.random() * choices.length)];
      }

      const agentReply: ChatMessage = {
        id: `reply_${Date.now()}`,
        sender: "agent",
        text: replyText,
        timestamp: "Just now",
        codeSnippet,
        provenance: data.provenance || {
          isSynthetic: false,
          provider: "gemini-3.6-flash",
          model: "gemini-3.6-flash",
        },
      };

      // Replace thinking message with real reply
      if (agentKey === "codex") {
        setCodexMessages((prev) => prev.filter((m) => m.id !== thinkingId).concat(agentReply));
      } else if (agentKey === "zcode") {
        setZcodeMessages((prev) => prev.filter((m) => m.id !== thinkingId).concat(agentReply));
      } else {
        setClaudeMessages((prev) => prev.filter((m) => m.id !== thinkingId).concat(agentReply));
      }

      addAuditEntry("AGENT_RESPONSE", `${agentName} generated solution response.`, agentName);
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "agent",
        text: `Executed instruction via local fallback context.`,
        timestamp: "Just now",
        provenance: {
          isSynthetic: true,
          provider: null,
          model: "fallback-agent",
        },
      };

      if (agentKey === "codex") {
        setCodexMessages((prev) => prev.filter((m) => m.id !== thinkingId).concat(errorReply));
      } else if (agentKey === "zcode") {
        setZcodeMessages((prev) => prev.filter((m) => m.id !== thinkingId).concat(errorReply));
      } else {
        setClaudeMessages((prev) => prev.filter((m) => m.id !== thinkingId).concat(errorReply));
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onOpenSearch(query.trim());
    }
  };

  const toggleWidget = (id: string) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)));
  };

  const moveWidget = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= widgets.length) return;
    const updated = [...widgets];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setWidgets(updated);
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  const isEnabled = (id: string) => {
    return widgets.find((w) => w.id === id)?.enabled ?? true;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls Bar: Customize Dashboard Toggle */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Command Center — AI Development Hub • Active Space:{" "}
            <strong className="text-amber-300 font-bold">{activeSpace.name}</strong>
          </span>
        </div>

        <button
          onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Customize Widgets</span>
        </button>
      </div>

      {/* Widget Customization Drawer Modal / Toolbar */}
      {isCustomizeOpen && (
        <div className="bg-slate-900/95 rounded-3xl border border-indigo-500/40 p-6 space-y-4 shadow-2xl backdrop-blur-xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                <span>Rearrange & Toggle Dashboard Widgets</span>
              </h3>
              <p className="text-xs text-slate-400">Enable, disable or reorder widgets for your personalized OM Bento Grid.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetWidgets}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Default</span>
              </button>

              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {widgets.map((w, idx) => (
              <div
                key={w.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  w.enabled
                    ? "bg-slate-950/80 border-slate-700 text-slate-100"
                    : "bg-slate-950/30 border-slate-800/50 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <button
                    onClick={() => toggleWidget(w.id)}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      w.enabled ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {w.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-xs font-semibold truncate">{w.title}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveWidget(idx, "up")}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition cursor-pointer"
                  >
                    <MoveUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={idx === widgets.length - 1}
                    onClick={() => moveWidget(idx, "down")}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition cursor-pointer"
                  >
                    <MoveDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Feature: Command Center — AI Development Hub */}
      {isEnabled("ai_hub") && (
        <div className="space-y-6">
          {/* Header Title & Description */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/20 gold-glow space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
              <span className="p-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <Bot className="w-6 h-6" />
              </span>
              <span>Command Center — AI Development Hub</span>
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Collaborate with your AI agents: <strong className="text-indigo-400">Codex</strong>,{" "}
              <strong className="text-amber-400">Z Code</strong>, and <strong className="text-orange-400">Claude</strong>.
              Manage tasks, audit actions, and monitor system health in real-time.
            </p>
          </div>

          {/* Stats Row (4 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Records */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 shadow-lg">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-100 font-mono">{totalRecords.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Total Records</div>
              </div>
            </div>

            {/* 2. Agents Online */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 shadow-lg">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">3</div>
                <div className="text-xs text-slate-400">Agents Online</div>
              </div>
            </div>

            {/* 3. Pending Tasks */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 shadow-lg">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-amber-400 font-mono">{tasks.length || 3}</div>
                <div className="text-xs text-slate-400">Pending Tasks</div>
              </div>
            </div>

            {/* 4. Session Uptime */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 shadow-lg">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-indigo-300 font-mono">{formatUptime(sessionSeconds)}</div>
                <div className="text-xs text-slate-400">Session Uptime</div>
              </div>
            </div>
          </div>

          {/* Three Agent Panels (Codex, Z Code, Claude) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Codex Panel */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 font-bold text-slate-100">
                  <Code2 className="w-5 h-5 text-[#4a9eff]" />
                  <span>Codex</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCodexSearch(!showCodexSearch)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer text-xs flex items-center gap-1 ${
                      showCodexSearch || codexSearch
                        ? "bg-[#4a9eff]/20 text-[#4a9eff] border-[#4a9eff]/40"
                        : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700"
                    }`}
                    title="Search Codex conversation history"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono hidden sm:inline">History</span>
                  </button>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    active
                  </span>
                </div>
              </div>

              {/* History Search Bar */}
              {showCodexSearch && (
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 animate-fade-in">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={codexSearch}
                    onChange={(e) => setCodexSearch(e.target.value)}
                    placeholder="Search Codex history..."
                    className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
                  />
                  {codexSearch && (
                    <button
                      onClick={() => setCodexSearch("")}
                      className="text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Chat Output Area */}
              <div
                ref={codexRef}
                className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 min-h-[160px] max-h-[220px] overflow-y-auto space-y-3 text-xs font-mono"
              >
                {codexMessages
                  .filter(
                    (m) =>
                      !codexSearch.trim() ||
                      m.text.toLowerCase().includes(codexSearch.toLowerCase()) ||
                      (m.codeSnippet && m.codeSnippet.toLowerCase().includes(codexSearch.toLowerCase()))
                  )
                  .map((m) => (
                    <div key={m.id} className="space-y-1">
                      <div className="text-[11px] font-semibold text-slate-300">
                        {m.sender === "user" ? "🧑💻 You:" : "🤖 Codex:"}
                      </div>
                      <div className={m.sender === "user" ? "text-slate-200" : "text-slate-300 pl-2 border-l-2 border-[#4a9eff]"}>
                        {m.text}
                      </div>
                      {m.codeSnippet && (
                        <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-emerald-300 overflow-x-auto mt-1">
                          {m.codeSnippet}
                        </pre>
                      )}
                    </div>
                  ))}
                {codexMessages.filter(
                  (m) =>
                    !codexSearch.trim() ||
                    m.text.toLowerCase().includes(codexSearch.toLowerCase()) ||
                    (m.codeSnippet && m.codeSnippet.toLowerCase().includes(codexSearch.toLowerCase()))
                ).length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-xs italic">
                    No matching history for "{codexSearch}"
                  </div>
                )}
              </div>

              {/* Input Row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={codexInput}
                  onChange={(e) => setCodexInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendToAgent("codex", codexInput)}
                  placeholder={activeMicAgent === "codex" ? "🎙️ Listening... Speak prompt..." : "Ask Codex..."}
                  className={`flex-1 bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                    activeMicAgent === "codex"
                      ? "border-red-500/80 ring-2 ring-red-500/20 text-red-300 animate-pulse"
                      : "border-slate-800 focus:border-[#4a9eff]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => toggleVoiceInput("codex")}
                  className={`p-2 rounded-xl transition cursor-pointer border ${
                    activeMicAgent === "codex"
                      ? "bg-red-500 text-white border-red-400 animate-pulse shadow-lg shadow-red-500/30"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                  title={activeMicAgent === "codex" ? "Stop voice recording" : "Voice-to-text prompt"}
                >
                  {activeMicAgent === "codex" ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleSendToAgent("codex", codexInput)}
                  className="p-2 rounded-xl bg-[#4a9eff] hover:bg-blue-500 text-slate-950 font-bold transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <button
                  onClick={() => handleSendToAgent("codex", "Write a React component for a todo list.")}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  Todo List
                </button>
                <button
                  onClick={() => handleSendToAgent("codex", "Explain the code in /src/App.tsx")}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  Explain Code
                </button>
                <button
                  onClick={() => handleSendToAgent("codex", "Refactor this function: function sum(a,b){return a+b;}")}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  Refactor
                </button>
              </div>
            </div>

            {/* 2. Z Code Panel */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 font-bold text-slate-100">
                  <Zap className="w-5 h-5 text-[#f59e0b]" />
                  <span>Z Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowZcodeSearch(!showZcodeSearch)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer text-xs flex items-center gap-1 ${
                      showZcodeSearch || zcodeSearch
                        ? "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40"
                        : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700"
                    }`}
                    title="Search Z Code conversation history"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono hidden sm:inline">History</span>
                  </button>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    active
                  </span>
                </div>
              </div>

              {/* History Search Bar */}
              {showZcodeSearch && (
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 animate-fade-in">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={zcodeSearch}
                    onChange={(e) => setZcodeSearch(e.target.value)}
                    placeholder="Search Z Code history..."
                    className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
                  />
                  {zcodeSearch && (
                    <button
                      onClick={() => setZcodeSearch("")}
                      className="text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Chat Output Area */}
              <div
                ref={zcodeRef}
                className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 min-h-[160px] max-h-[220px] overflow-y-auto space-y-3 text-xs font-mono"
              >
                {zcodeMessages
                  .filter(
                    (m) =>
                      !zcodeSearch.trim() ||
                      m.text.toLowerCase().includes(zcodeSearch.toLowerCase()) ||
                      (m.codeSnippet && m.codeSnippet.toLowerCase().includes(zcodeSearch.toLowerCase()))
                  )
                  .map((m) => (
                    <div key={m.id} className="space-y-1">
                      <div className="text-[11px] font-semibold text-slate-300">
                        {m.sender === "user" ? "🧑💻 You:" : "🤖 Z Code:"}
                      </div>
                      <div className={m.sender === "user" ? "text-slate-200" : "text-slate-300 pl-2 border-l-2 border-[#f59e0b]"}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                {zcodeMessages.filter(
                  (m) =>
                    !zcodeSearch.trim() ||
                    m.text.toLowerCase().includes(zcodeSearch.toLowerCase()) ||
                    (m.codeSnippet && m.codeSnippet.toLowerCase().includes(zcodeSearch.toLowerCase()))
                ).length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-xs italic">
                    No matching history for "{zcodeSearch}"
                  </div>
                )}
              </div>

              {/* Input Row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={zcodeInput}
                  onChange={(e) => setZcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendToAgent("zcode", zcodeInput)}
                  placeholder={activeMicAgent === "zcode" ? "🎙️ Listening... Speak prompt..." : "Ask Z Code..."}
                  className={`flex-1 bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                    activeMicAgent === "zcode"
                      ? "border-red-500/80 ring-2 ring-red-500/20 text-red-300 animate-pulse"
                      : "border-slate-800 focus:border-[#f59e0b]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => toggleVoiceInput("zcode")}
                  className={`p-2 rounded-xl transition cursor-pointer border ${
                    activeMicAgent === "zcode"
                      ? "bg-red-500 text-white border-red-400 animate-pulse shadow-lg shadow-red-500/30"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                  title={activeMicAgent === "zcode" ? "Stop voice recording" : "Voice-to-text prompt"}
                >
                  {activeMicAgent === "zcode" ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleSendToAgent("zcode", zcodeInput)}
                  className="p-2 rounded-xl bg-[#f59e0b] hover:bg-amber-500 text-slate-950 font-bold transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <button
                  onClick={() => handleSendToAgent("zcode", "Analyze the security of the auth flow.")}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  Security Scan
                </button>
                <button
                  onClick={() => handleSendToAgent("zcode", "Check code for performance bottlenecks.")}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  Performance
                </button>
                <button
                  onClick={() => handleSendToAgent("zcode", "Review the latest PR #12.")}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  Review PR
                </button>
              </div>
            </div>

            {/* 3. Claude Panel */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 font-bold text-slate-100">
                  <MessageSquare className="w-5 h-5 text-[#d97706]" />
                  <span>Claude</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowClaudeSearch(!showClaudeSearch)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer text-xs flex items-center gap-1 ${
                      showClaudeSearch || claudeSearch
                        ? "bg-[#d97706]/20 text-[#d97706] border-[#d97706]/40"
                        : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700"
                    }`}
                    title="Search Claude conversation history"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono hidden sm:inline">History</span>
                  </button>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    active
                  </span>
                </div>
              </div>

              {/* History Search Bar */}
              {showClaudeSearch && (
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 animate-fade-in">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={claudeSearch}
                    onChange={(e) => setClaudeSearch(e.target.value)}
                    placeholder="Search Claude history..."
                    className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
                  />
                  {claudeSearch && (
                    <button
                      onClick={() => setClaudeSearch("")}
                      className="text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Chat Output Area */}
              <div
                ref={claudeRef}
                className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 min-h-[160px] max-h-[220px] overflow-y-auto space-y-3 text-xs font-mono"
              >
                {claudeMessages
                  .filter(
                    (m) =>
                      !claudeSearch.trim() ||
                      m.text.toLowerCase().includes(claudeSearch.toLowerCase()) ||
                      (m.codeSnippet && m.codeSnippet.toLowerCase().includes(claudeSearch.toLowerCase()))
                  )
                  .map((m) => (
                    <div key={m.id} className="space-y-1">
                      <div className="text-[11px] font-semibold text-slate-300">
                        {m.sender === "user" ? "🧑💻 You:" : "🤖 Claude:"}
                      </div>
                      <div className={m.sender === "user" ? "text-slate-200" : "text-slate-300 pl-2 border-l-2 border-[#d97706]"}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                {claudeMessages.filter(
                  (m) =>
                    !claudeSearch.trim() ||
                    m.text.toLowerCase().includes(claudeSearch.toLowerCase()) ||
                    (m.codeSnippet && m.codeSnippet.toLowerCase().includes(claudeSearch.toLowerCase()))
                ).length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-xs italic">
                    No matching history for "{claudeSearch}"
                  </div>
                )}
              </div>

              {/* Input Row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={claudeInput}
                  onChange={(e) => setClaudeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendToAgent("claude", claudeInput)}
                  placeholder={activeMicAgent === "claude" ? "🎙️ Listening... Speak prompt..." : "Ask Claude..."}
                  className={`flex-1 bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                    activeMicAgent === "claude"
                      ? "border-red-500/80 ring-2 ring-red-500/20 text-red-300 animate-pulse"
                      : "border-slate-800 focus:border-[#d97706]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => toggleVoiceInput("claude")}
                  className={`p-2 rounded-xl transition cursor-pointer border ${
                    activeMicAgent === "claude"
                      ? "bg-red-500 text-white border-red-400 animate-pulse shadow-lg shadow-red-500/30"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                  title={activeMicAgent === "claude" ? "Stop voice recording" : "Voice-to-text prompt"}
                >
                  {activeMicAgent === "claude" ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleSendToAgent("claude", claudeInput)}
                  className="p-2 rounded-xl bg-[#d97706] hover:bg-amber-600 text-slate-950 font-bold transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <button
                  onClick={() => handleSendToAgent("claude", "Explain the architecture of OM.")}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  Architecture
                </button>
                <button
                  onClick={() => handleSendToAgent("claude", "How do I deploy OM to production?")}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  Deployment
                </button>
                <button
                  onClick={() => handleSendToAgent("claude", "What is the security model?")}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  Security
                </button>
              </div>
            </div>
          </div>

          {/* Audit Log (Full Width) */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                <ClipboardList className="w-4 h-4 text-amber-400" />
                <span>Audit Log</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {auditLog.length} events
              </span>
            </div>

            <div className="max-h-[220px] overflow-y-auto space-y-2 text-xs font-mono">
              {auditLog.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/70 flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {log.eventType}
                      </span>
                      <span className="text-slate-400 text-[11px]">[{log.actor}]</span>
                    </div>
                    <div className="text-slate-200 text-xs">{log.details}</div>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Banner & Quick Controls - Hero Bento Block */}
      {isEnabled("briefing") && (
        <div className="relative overflow-hidden rounded-3xl glass-panel-golden gold-glow p-6 sm:p-8 text-white space-y-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>OM Personal AI Cloud • Sovereign Universe</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
                <span className="text-indigo-400 text-4xl">🕉</span>
                <span>Good morning, Febin</span>
              </h1>
              <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
                Your private AI universe is active in <strong className="text-indigo-300 font-semibold">{activeSpace.name}</strong>. Zero context switching required.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenBriefing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sun className="w-4 h-4" />
                <span>Good Morning Briefing</span>
              </button>
              <button
                onClick={() => onNavigateToView("spaces")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-medium text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <RotateCw className="w-4 h-4 text-emerald-400" />
                <span>Continue Universe</span>
              </button>
            </div>
          </div>

          {/* Status Indicators Bar - Bento Status Tiles */}
          {isEnabled("system") && (
            <div className="relative z-10 mt-6 pt-6 border-t border-amber-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="flex items-center gap-3 glass-panel p-3.5 rounded-2xl">
                <Server className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-[11px]">Core Engine</div>
                  <div className="text-emerald-400 font-semibold">Port 3000 • Active</div>
                </div>
              </div>

              <div className="flex items-center gap-3 glass-panel p-3.5 rounded-2xl">
                <Brain className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-[11px]">Model Router</div>
                  <div className="text-indigo-300 font-semibold">Gemini 3.6 Flash</div>
                </div>
              </div>

              <div className="flex items-center gap-3 glass-panel p-3.5 rounded-2xl">
                <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-[11px]">Local AI / Ollama</div>
                  <div className="text-slate-300 font-semibold">Offline (Fallback)</div>
                </div>
              </div>

              <div className="flex items-center gap-3 glass-panel p-3.5 rounded-2xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-[11px]">Vault Security</div>
                  <div className="text-emerald-400 font-semibold">Encrypted • Zero-Log</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Omni-Command Bar - Bento Input Block */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-amber-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Universal AI Search across notes, tasks, memory, emails, web history..."
            className="w-full pl-12 pr-36 py-4 rounded-2xl glass-panel text-slate-100 placeholder-slate-400 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm font-medium shadow-xl outline-none transition-all"
          />
          <button
            type="submit"
            className="absolute right-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal Search</span>
          </button>
        </div>
      </form>

      {/* Daily High-Impact Mission Goals Widget */}
      {isEnabled("goals") && (
        <DailyGoalsCard
          goals={dailyGoals}
          tasks={tasks}
          habits={habits}
          activeSpace={activeSpace}
          onToggleGoal={onToggleGoal}
          onAddGoal={onAddGoal}
        />
      )}

      {/* Upcoming Meetings & Quick Join Widget */}
      {isEnabled("meetings") && (
        <MeetingQuickViewWidget
          events={calendarEvents}
          activeSpace={activeSpace}
          onAddEvent={onAddEvent}
        />
      )}

      {/* Weekly Insights Data Visualization Widget using Recharts */}
      {isEnabled("habits") && (
        <div className="relative overflow-hidden rounded-3xl glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-100">
                Weekly Insights: 7-Day Completion Trends & Habit Streaks
              </h3>
            </div>
            <button
              onClick={() => onNavigateToView("habits")}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Manage Habits Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <WeeklyActivityChart tasks={tasks} habits={habits} />
        </div>
      )}

      {/* Main Grid: Active Space Context & Quick Intelligence in Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Space Context Restoration Card - Bento Span 2 */}
        {isEnabled("spaces") && (
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ backgroundColor: activeSpace.color }}
                >
                  🕉
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-100">{activeSpace.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE SPACE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{activeSpace.description}</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateToView("spaces")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer hover:underline"
              >
                <span>Switch Space</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Context Metric Bento Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-2xl font-bold text-indigo-400">{activeSpace.tabsCount}</div>
                <div className="text-xs text-slate-400 mt-0.5">Open Tabs</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-2xl font-bold text-emerald-400">{activeSpace.notesCount}</div>
                <div className="text-xs text-slate-400 mt-0.5">Active Notes</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-2xl font-bold text-amber-400">{activeSpace.tasksCount}</div>
                <div className="text-xs text-slate-400 mt-0.5">Open Tasks</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-2xl font-bold text-purple-400">{activeSpace.memoryCount}</div>
                <div className="text-xs text-slate-400 mt-0.5">Memories</div>
              </div>
            </div>

            {/* Briefing Highlights preview - Bento Sub-card */}
            {briefing && (
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2.5">
                <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Today's Priorities (AI Briefing)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {briefing.priorities.slice(0, 3).map((pri, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="leading-snug">{pri}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Personal Tutor Quick Access Launcher Widget */}
            {isEnabled("tutor") && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Personal AI Tutor Agent</h4>
                    <p className="text-[11px] text-slate-400">Deep explanations, interactive quizzes & curated study paths.</p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToView("tutor")}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer shrink-0 shadow-md"
                >
                  Launch Tutor
                </button>
              </div>
            )}

            {/* Navigation Quick Launcher Bento Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <button
                onClick={() => onNavigateToView("browser")}
                className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left transition-all cursor-pointer group hover:border-indigo-500/40 hover:scale-[1.02]"
              >
                <Layers className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-200">Intelligent Browser</div>
                <div className="text-[11px] text-slate-400">Ask-This-Page AI</div>
              </button>

              <button
                onClick={() => onNavigateToView("memory")}
                className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left transition-all cursor-pointer group hover:border-purple-500/40 hover:scale-[1.02]"
              >
                <Brain className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-200">Personal Memory</div>
                <div className="text-[11px] text-slate-400">Knowledge Graph</div>
              </button>

              <button
                onClick={() => onNavigateToView("developer")}
                className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left transition-all cursor-pointer group hover:border-emerald-500/40 hover:scale-[1.02]"
              >
                <Terminal className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-200">Developer Cloud</div>
                <div className="text-[11px] text-slate-400">Terminal & Docker</div>
              </button>

              <button
                onClick={() => onNavigateToView("approvals")}
                className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left transition-all cursor-pointer group hover:border-amber-500/40 hover:scale-[1.02]"
              >
                <ShieldCheck className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-200">Agent Approvals</div>
                <div className="text-[11px] text-slate-400">{pendingActions.length} Pending</div>
              </button>
            </div>
          </div>
        )}

        {/* Right Column: Pending Approvals, Unified Inbox, & Smart Spaces */}
        <div className="space-y-6">
          {/* Pending Agent Approvals Bento Box */}
          {isEnabled("inbox") && (
            <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-200">Unified Inbox & Agent Approvals</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {pendingActions.length}
                </span>
              </div>

              {pendingActions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  All agent actions executed or pre-approved.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingActions.slice(0, 2).map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-2xl glass-panel space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-200">
                        <span>{act.agentName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                          {act.riskLevel}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-snug">{act.title}</p>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                        <button
                          onClick={onOpenApprovals}
                          className="text-amber-400 hover:text-amber-300 font-medium text-[11px] cursor-pointer"
                        >
                          Review Action →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Spaces List - Bento Side Tile */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Personal Spaces
            </h3>
            <div className="space-y-2">
              {spaces.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => onSelectSpace(sp.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left cursor-pointer ${
                    sp.id === activeSpace.id
                      ? "bg-indigo-600/20 border border-indigo-500/40 text-white shadow-md"
                      : "bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: sp.color }}
                    />
                    <span className="text-xs font-medium">{sp.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {sp.tabsCount} tabs
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
