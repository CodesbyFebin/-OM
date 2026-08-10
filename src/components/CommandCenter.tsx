import React, { useState, useEffect } from "react";
import {
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
  Mail,
  CheckSquare,
  RotateCcw,
  Check,
  Flame,
  Video,
  Target,
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
  id: "briefing" | "goals" | "meetings" | "spaces" | "tasks" | "inbox" | "tutor" | "memory" | "system" | "habits";
  title: string;
  enabled: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onOpenSearch(query.trim());
    }
  };

  const toggleWidget = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
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
    <div className="space-y-6">
      {/* Top Controls Bar: Customize Dashboard Toggle */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Bento Grid Customizable Dashboard • Space: <strong className="text-indigo-300">{activeSpace.name}</strong></span>
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

      {/* Top Banner & Quick Controls - Hero Bento Block */}
      {isEnabled("briefing") && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 p-6 sm:p-8 text-white border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

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
            <div className="relative z-10 mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
                <Server className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-[11px]">Core Engine</div>
                  <div className="text-emerald-400 font-semibold">Port 3000 • Active</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
                <Brain className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-[11px]">Model Router</div>
                  <div className="text-indigo-300 font-semibold">Gemini 3.6 Flash</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
                <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-[11px]">Local AI / Ollama</div>
                  <div className="text-slate-300 font-semibold">Offline (Fallback)</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
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
          <Search className="absolute left-4 w-5 h-5 text-indigo-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Universal AI Search across notes, tasks, memory, emails, web history..."
            className="w-full pl-12 pr-32 py-4 rounded-2xl bg-slate-900/90 text-slate-100 placeholder-slate-400 border border-indigo-500/30 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium shadow-xl outline-none transition-all"
          />
          <button
            type="submit"
            className="absolute right-2.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
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
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-emerald-500/30 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-100">
                Weekly Insights: 7-Day Completion Trends & Habit Streaks
              </h3>
            </div>
            <button
              onClick={() => onNavigateToView("habits")}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
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
          <div className="lg:col-span-2 bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-7 space-y-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
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
            <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
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
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs"
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
                          className="text-indigo-400 hover:text-indigo-300 font-medium text-[11px] cursor-pointer"
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
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-5 sm:p-6 space-y-3.5 shadow-xl backdrop-blur-md">
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
