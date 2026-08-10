import React, { useState } from "react";
import {
  LayoutDashboard,
  Layers,
  Globe,
  Brain,
  Terminal,
  ShieldCheck,
  Cpu,
  CheckSquare,
  Plus,
  GraduationCap,
  Flame,
  CloudCheck,
  CloudOff,
  RefreshCw,
} from "lucide-react";
import { Space, AgentAction } from "../types";

interface SidebarNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  spaces: Space[];
  activeSpace: Space;
  onSelectSpace: (spaceId: string) => void;
  pendingActions: AgentAction[];
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentView,
  onNavigate,
  spaces,
  activeSpace,
  onSelectSpace,
  pendingActions,
}) => {
  const [syncState, setSyncState] = useState<"Synced" | "Syncing..." | "Offline">("Synced");
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Just now");

  const handleManualSync = () => {
    if (syncState === "Syncing...") return;
    setSyncState("Syncing...");
    setTimeout(() => {
      setSyncState("Synced");
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 1200);
  };

  const mainNav = [
    { id: "command", label: "Command Center", icon: LayoutDashboard },
    { id: "spaces", label: "Spaces & Missions", icon: Layers, count: spaces.length },
    { id: "browser", label: "Intelligent Browser", icon: Globe, count: activeSpace.tabsCount },
    { id: "tutor", label: "Personal AI Tutor", icon: GraduationCap },
    { id: "memory", label: "Memory & Knowledge", icon: Brain, count: activeSpace.memoryCount },
    { id: "developer", label: "Developer Cloud", icon: Terminal },
    { id: "tasks", label: "Missions & Tasks", icon: CheckSquare, count: activeSpace.tasksCount },
    { id: "habits", label: "Habits & Streaks", icon: Flame },
    {
      id: "approvals",
      label: "Specialist Agents",
      icon: ShieldCheck,
      badge: pendingActions.length > 0 ? pendingActions.length : undefined,
    },
    { id: "control", label: "Control Plane & AI Router", icon: Cpu },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-amber-500/20 flex flex-col justify-between h-screen sticky top-0 text-slate-300 select-none">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
            🕉
          </div>
          <div>
            <div className="font-extrabold text-slate-100 text-sm tracking-wide">
              OM <span className="text-indigo-400 font-mono text-xs">v1.0</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Personal AI Cloud</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            Universe Navigation
          </div>

          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-medium text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.badge === undefined && (
                  <span className="text-[10px] font-mono text-slate-400">{item.count}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Spaces List */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between px-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Active Spaces
            </span>
            <button
              onClick={() => onNavigate("spaces")}
              className="text-slate-400 hover:text-indigo-400 transition cursor-pointer"
              title="Manage Spaces"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {spaces.map((sp) => {
              const isSpaceActive = sp.id === activeSpace.id;
              return (
                <button
                  key={sp.id}
                  onClick={() => onSelectSpace(sp.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSpaceActive
                      ? "bg-slate-800/90 text-slate-100 border-l-2 border-indigo-500 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: sp.color }}
                    />
                    <span className="truncate">{sp.name}</span>
                  </div>

                  {isSpaceActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sync Status Indicator */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {syncState === "Synced" && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50" />
            )}
            {syncState === "Syncing..." && (
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            )}
            {syncState === "Offline" && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}

            <div className="flex flex-col">
              <span
                className={`font-bold text-[11px] ${
                  syncState === "Synced"
                    ? "text-emerald-300"
                    : syncState === "Syncing..."
                    ? "text-amber-300"
                    : "text-rose-400"
                }`}
              >
                {syncState}
              </span>
              <span className="text-[9px] text-slate-500">
                {syncState === "Synced" ? `Updated ${lastSyncedTime}` : syncState === "Syncing..." ? "Reconciling nodes..." : "Offline local backup"}
              </span>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
            title="Trigger State Sync"
          >
            <RefreshCw className={`w-3 h-3 ${syncState === "Syncing..." ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Footer Profile & Security Badge */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center font-bold text-xs text-indigo-300">
            FF
          </div>
          <div className="flex-1 truncate">
            <div className="text-xs font-semibold text-slate-200 truncate">Febin Francis</div>
            <div className="text-[10px] text-slate-400 font-mono">Self-Hosted Node</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
