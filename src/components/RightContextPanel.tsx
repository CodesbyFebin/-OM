import React, { useState } from "react";
import {
  GitBranch,
  FolderGit2,
  Package,
  Cpu,
  Brain,
  HardDrive,
  Globe,
  Radio,
  Sliders,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Space, MemoryItem, SovereignStackStatus, ProbeStatus } from "../types";

interface RightContextPanelProps {
  activeSpace: Space;
  stackStatus: SovereignStackStatus;
  memoryItems: MemoryItem[];
  onOpenSovereignSetup: () => void;
  tokenUsage?: { used: number; total: number };
}

export const RightContextPanel: React.FC<RightContextPanelProps> = ({
  activeSpace,
  stackStatus,
  memoryItems,
  onOpenSovereignSetup,
  tokenUsage = { used: 76000, total: 200000 },
}) => {
  const [activeTab, setActiveTab] = useState<"context" | "changes">("context");

  const usagePercent = Math.round((tokenUsage.used / tokenUsage.total) * 100);

  const renderBadge = (st: ProbeStatus | string) => {
    switch (st) {
      case "online":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>;
      case "connecting":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">CONNECTING</span>;
      case "cors_blocked":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">CORS</span>;
      case "configured":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">CONFIGURED</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">OFFLINE</span>;
    }
  };

  return (
    <aside className="w-80 glass-panel border-l border-amber-500/20 flex flex-col h-screen sticky top-0 text-slate-300 select-none overflow-y-auto p-4 space-y-5 hidden xl:flex shrink-0">
      {/* Configure Private Stack Quick Banner */}
      <button
        onClick={onOpenSovereignSetup}
        className="w-full p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center justify-between cursor-pointer gold-glow"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Configure Private Sovereign Stack</span>
        </div>
        <span className="text-amber-400 font-mono text-sm">→</span>
      </button>

      {/* Panel View Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab("context")}
          className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer ${
            activeTab === "context"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Context
        </button>
        <button
          onClick={() => setActiveTab("changes")}
          className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer ${
            activeTab === "changes"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Changes (3)
        </button>
      </div>

      {activeTab === "context" && (
        <div className="space-y-5">
          {/* Repository & Workspace Context */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-amber-400" />
                <span>om-universe</span>
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                <span>main</span>
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span>Space: {activeSpace.name}</span>
              <span className="text-emerald-400">Security: Strict</span>
            </div>
          </div>

          {/* Sovereign Stack Probes Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Sovereign Stack Probes</span>
              <button
                onClick={onOpenSovereignSetup}
                className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>GOD Router</span>
                </span>
                {renderBadge(stackStatus.godRouter.status)}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span>GOD Memory</span>
                </span>
                {renderBadge(stackStatus.godMemory.status)}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>MinIO Local Storage</span>
                </span>
                {renderBadge(stackStatus.localMinio.status)}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Web3 JSON-RPC</span>
                </span>
                {renderBadge(stackStatus.web3Bridge.status)}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <Radio className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Edge Exec Node</span>
                </span>
                {renderBadge(stackStatus.edgeNode.status)}
              </div>
            </div>
          </div>

          {/* Active Memory Context */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Active Memory Vault</span>
              <span className="text-[10px] font-mono text-slate-500">{memoryItems.length} items</span>
            </div>

            <div className="space-y-2">
              {memoryItems.slice(0, 3).map((m) => (
                <div key={m.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                  <div className="font-medium text-slate-200 line-clamp-2">{m.content}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="text-amber-400">#{m.entityTags[0] || "memory"}</span>
                    <span>{(m.confidence * 100).toFixed(0)}% score</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Context Window Consumption Gauge */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 uppercase tracking-wider text-[11px]">Context Window</span>
              <span className="font-mono text-amber-400">{usagePercent}%</span>
            </div>

            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{(tokenUsage.used / 1000).toFixed(0)}k used</span>
              <span>{(tokenUsage.total / 1000).toFixed(0)}k max tokens</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "changes" && (
        <div className="space-y-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-bold">+ src/core/permissions/PermissionEngine.ts</div>
            <div className="text-slate-400 text-[11px]">Added risk policy evaluator for agent tasks</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-bold">+ src/components/SovereignSetupModal.tsx</div>
            <div className="text-slate-400 text-[11px]">7-tab control plane setup interface</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-amber-400 font-bold">M src/App.tsx</div>
            <div className="text-slate-400 text-[11px]">Integrated 3-column sovereign workspace</div>
          </div>
        </div>
      )}
    </aside>
  );
};
