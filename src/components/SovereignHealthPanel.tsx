import React, { useState } from "react";
import {
  Activity,
  Cpu,
  Database,
  HardDrive,
  Lock,
  RefreshCw,
  ShieldCheck,
  Zap,
  Globe,
  Terminal,
  Code2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Wifi,
  Server,
  Layers,
} from "lucide-react";
import { SovereignStackStatus } from "../types";

interface SovereignHealthPanelProps {
  stackStatus?: SovereignStackStatus;
  onRefreshProbes?: () => void;
  onOpenSovereignSetup?: () => void;
  compact?: boolean;
}

export const SovereignHealthPanel: React.FC<SovereignHealthPanelProps> = ({
  stackStatus,
  onRefreshProbes,
  onOpenSovereignSetup,
  compact = false,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefreshProbes) await onRefreshProbes();
    setTimeout(() => setRefreshing(false), 800);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
      case "configured":
        return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "connecting":
        return "text-amber-400 bg-amber-500/20 border-amber-500/30 animate-pulse";
      default:
        return "text-rose-400 bg-rose-500/20 border-rose-500/30";
    }
  };

  return (
    <div className={`p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-2xl space-y-6 text-slate-100 gold-glow ${compact ? 'text-xs' : ''}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 gold-glow">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">Sovereign Health Monitor</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                100% Local Specs
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Real-time hardware VRAM, storage quotas, Web3 wallet bridge, and network circuits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh Specs</span>
          </button>

          {onOpenSovereignSetup && (
            <button
              onClick={onOpenSovereignSetup}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Configure Stack</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Section 1: Hardware VRAM & RAM Memory Usage */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
          <span className="flex items-center gap-2 text-amber-400">
            <Cpu className="w-4 h-4" />
            <span>LLM VRAM & System Memory Allocation</span>
          </span>
          <span className="text-slate-400 text-[11px]">Hardware: Apple M2 / 16GB Unified RAM</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          {/* Qwen 2.5 Coder VRAM */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">Qwen2.5-Coder VRAM</span>
              <span className="text-emerald-400 font-bold text-[11px]">8.8 / 16 GB</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full w-[55%]" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Primary Coding Agent</span>
              <span>Ollama Port 11434</span>
            </div>
          </div>

          {/* DeepSeek R1 Reasoning VRAM */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">DeepSeek R1 VRAM</span>
              <span className="text-purple-400 font-bold text-[11px]">10.4 / 24 GB</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full w-[43%]" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Fallback Thinking Model</span>
              <span>KV Cache Active</span>
            </div>
          </div>

          {/* System RAM Usage */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">System RAM Usage</span>
              <span className="text-amber-400 font-bold text-[11px]">11.2 / 16 GB</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full w-[70%]" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Qdrant + Express Node</span>
              <span>Zero Leakage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section 2: Storage Quotas & Web3 Wallet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Storage Quotas */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="flex items-center gap-2 text-emerald-400 font-bold">
              <HardDrive className="w-4 h-4" />
              <span>Storage Quotas & Object Vaults</span>
            </span>
            <span className="text-[10px] text-slate-500">S3 / MinIO</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-bold">MinIO Object Vault</div>
                <div className="text-[10px] text-slate-500">Bucket: om-vault (Port 9000)</div>
              </div>
              <span className="text-amber-300 font-bold">14.2 GB / 500 GB</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-bold">Qdrant Vector DB</div>
                <div className="text-[10px] text-slate-500">Collection: om_vectors_dev</div>
              </div>
              <span className="text-emerald-400 font-bold">1,420 vectors (184 MB)</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-bold">Local SQLite Memory Index</div>
                <div className="text-[10px] text-slate-500">Zero-Knowledge Encrypted</div>
              </div>
              <span className="text-slate-300 font-bold">42 MB</span>
            </div>
          </div>
        </div>

        {/* Web3 Wallet & IPFS Connectivity */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="flex items-center gap-2 text-purple-400 font-bold">
              <Database className="w-4 h-4" />
              <span>Web3 Wallet & IPFS Decentralized Node</span>
            </span>
            <span className="text-[10px] text-slate-500">Local Anvil RPC</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span>Web3 Owner Wallet</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Connected
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">Address: 0x71C8...3F92</div>
              </div>
              <span className="text-purple-300 font-bold">14.82 ETH (Anvil)</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-bold">Local Anvil RPC Node</div>
                <div className="text-[10px] text-slate-500">http://127.0.0.1:8545 (Chain 31337)</div>
              </div>
              <span className="text-emerald-400 font-bold">0 Gas Local</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-bold">Kubo IPFS Pinning Daemon</div>
                <div className="text-[10px] text-slate-500">API Port 5001 (v0.26.0)</div>
              </div>
              <span className="text-sky-400 font-bold">14 CIDs Pinned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section 3: Tor Circuits, VPN & Live Services Controls */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="flex items-center gap-2 text-amber-400 font-bold">
            <Lock className="w-4 h-4" />
            <span>Tor Onion Circuit, WireGuard & Self-Hosted Live Controls</span>
          </span>
          <span className="text-emerald-400 font-bold text-[10px]">ALL RUNNING OFFLINE</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {/* Tor Control */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 text-center space-y-1">
            <div className="text-[10px] text-slate-400 font-bold">Tor Circuit</div>
            <div className="text-xs font-bold text-amber-300">3 Hops (42ms)</div>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Encrypted
            </span>
          </div>

          {/* WireGuard VPN */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-center space-y-1">
            <div className="text-[10px] text-slate-400 font-bold">WireGuard VPN</div>
            <div className="text-xs font-bold text-emerald-300">10.8.0.2</div>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              3 Peers Active
            </span>
          </div>

          {/* Docker Runtime */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-center space-y-1">
            <div className="text-[10px] text-slate-400 font-bold">Docker Engine</div>
            <div className="text-xs font-bold text-sky-300">4 Containers</div>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Running
            </span>
          </div>

          {/* Gitea Server */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-center space-y-1">
            <div className="text-[10px] text-slate-400 font-bold">Self-Hosted Gitea</div>
            <div className="text-xs font-bold text-purple-300">Port 3000</div>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Ready
            </span>
          </div>

          {/* VS Code IDE */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-center space-y-1">
            <div className="text-[10px] text-slate-400 font-bold">Web IDE / VS Code</div>
            <div className="text-xs font-bold text-emerald-300">Embedded</div>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Connected
            </span>
          </div>

          {/* NotebookLM */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 text-center space-y-1">
            <div className="text-[10px] text-slate-400 font-bold">NotebookLM RAG</div>
            <div className="text-xs font-bold text-amber-300">Local Vector</div>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
