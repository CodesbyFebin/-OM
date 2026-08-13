import React from "react";
import {
  LayoutDashboard,
  Grid,
  Kanban,
  ClipboardList,
  StickyNote,
  Lightbulb,
  Terminal,
  Globe,
  Radio,
  BookOpen,
  Plug,
  GitBranch,
  Server,
  Store,
  ShieldCheck,
  Lock,
  Users,
  Search,
  Plus,
  Shield,
  Sparkles,
  Zap,
  Sun,
  Activity,
  Layers,
  Brain,
  Cpu,
} from "lucide-react";
import { Space, AgentAction, OMTheme } from "../types";

interface SidebarNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  spaces: Space[];
  activeSpace: Space;
  onSelectSpace: (spaceId: string) => void;
  pendingActions: AgentAction[];
  theme?: OMTheme;
  onToggleTheme?: (theme: OMTheme) => void;
  onOpenSovereignSetup?: () => void;
  onOpenSearch?: () => void;
  onNewThread?: () => void;
  onOpenFeatureVault?: () => void;
  onOpenAudioPlayer?: () => void;
  onOpenHealthPanel?: () => void;
  recentTasks?: string[];
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentView,
  onNavigate,
  spaces,
  activeSpace,
  onSelectSpace,
  pendingActions,
  theme = "cosmic-gold",
  onToggleTheme,
  onOpenSovereignSetup,
  onOpenSearch,
  onNewThread,
  onOpenFeatureVault,
  onOpenAudioPlayer,
  onOpenHealthPanel,
  recentTasks = [
    "Build auth flow",
    "Fix model router fallback",
    "Refactor Qdrant memory vault",
  ],
}) => {
  const handleCycleTheme = () => {
    if (!onToggleTheme) return;
    if (theme === "cosmic-gold") onToggleTheme("neon-astral");
    else if (theme === "neon-astral") onToggleTheme("calm-light");
    else onToggleTheme("cosmic-gold");
  };

  // 17 Dedicated Destinations
  const sidebarSections = [
    {
      title: "Core Workspace",
      items: [
        { id: "command", label: "Command Center", icon: LayoutDashboard },
        { id: "vault", label: "Feature Vault", icon: Grid, badge: "50" },
      ],
    },
    {
      title: "Productivity & Knowledge",
      items: [
        { id: "kanban", label: "AI Kanban", icon: Kanban, badge: "3" },
        { id: "projects", label: "Project Tracker", icon: ClipboardList, count: activeSpace.tasksCount },
        { id: "notes", label: "Keep Notes", icon: StickyNote },
        { id: "findings", label: "My Findings", icon: Lightbulb },
        { id: "prompts", label: "Prompt Vault", icon: Terminal },
        { id: "browser", label: "Private Browser", icon: Globe },
        { id: "audio", label: "Audio Deck", icon: Radio, badge: "528Hz" },
        { id: "notebooklm", label: "NotebookLM", icon: BookOpen },
      ],
    },
    {
      title: "Infrastructure & Compute",
      items: [
        { id: "integrations", label: "Integrations", icon: Plug },
        { id: "gitea", label: "Git Selfhost", icon: GitBranch },
        { id: "ubuntu", label: "Ubuntu Server", icon: Server },
        { id: "marketplace", label: "Marketplace", icon: Store },
        { id: "sovereign", label: "Sovereign Setup", icon: ShieldCheck },
      ],
    },
    {
      title: "Private & Team",
      items: [
        { id: "private", label: "Private Mode", icon: Lock, badge: "ON" },
        { id: "teammate", label: "Teammate Backed", icon: Users },
      ],
    },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-amber-500/20 flex flex-col justify-between h-screen sticky top-0 text-slate-300 select-none shrink-0 z-20">
      <div className="p-3.5 space-y-3.5 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center gap-2.5">
            <img
              src="/src/assets/images/om_logo_icon_1786624400276.jpg"
              alt="OM Icon"
              className="w-9 h-9 rounded-2xl object-cover shadow-md border border-amber-500/30"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="font-extrabold text-slate-100 text-sm tracking-wide flex items-center gap-1.5">
                <span>OM</span>
                <span className="text-amber-400 font-mono text-[9px] px-1 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 uppercase">
                  Sovereign
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Private Operating Universe</div>
            </div>
          </div>

          <button
            onClick={handleCycleTheme}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-amber-500/20 transition cursor-pointer"
            title={`Active Theme: ${theme}. Click to cycle.`}
          >
            {theme === "neon-astral" ? (
              <Zap className="w-3.5 h-3.5 text-purple-400" />
            ) : theme === "calm-light" ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>
        </div>

        {/* Action Controls: New Thread & Universal Search */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            onClick={() => {
              if (onNewThread) onNewThread();
              onNavigate("command");
            }}
            className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Mission</span>
          </button>

          <button
            onClick={() => {
              if (onOpenSearch) onOpenSearch();
            }}
            className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Search</span>
          </button>
        </div>

        {/* Sovereign Setup Direct Entry */}
        <button
          onClick={() => {
            if (onOpenSovereignSetup) onOpenSovereignSetup();
            else onNavigate("sovereign");
          }}
          className="w-full p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Sovereign Setup</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">v2.4</span>
        </button>

        {/* Grouped 17 Nav Destinations */}
        <nav className="space-y-3 pt-1">
          {sidebarSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 pb-0.5">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                      isActive
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                        item.badge === "ON" 
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {item.count !== undefined && item.badge === undefined && (
                      <span className="text-[10px] font-mono text-slate-500">{item.count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Recent Tasks */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2">
            Recent Tasks
          </div>

          <div className="space-y-0.5">
            {recentTasks.slice(0, 3).map((t, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate("command")}
                className="w-full text-left px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 truncate transition cursor-pointer flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0" />
                <span className="truncate">{t}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Profile & Network Lock Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-1.5 shrink-0">
        <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 px-1">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Network Locked</span>
          </span>
          <span className="text-[10px] text-slate-400">100% Private</span>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center font-bold text-[10px] text-amber-300 shrink-0">
            FF
          </div>
          <div className="flex-1 truncate">
            <div className="text-xs font-semibold text-slate-200 truncate">Febin Francis</div>
            <div className="text-[9px] text-slate-400 font-mono truncate">Sovereign OS</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

