import React, { useState } from "react";
import {
  Cpu,
  Server,
  ShieldCheck,
  HardDrive,
  Download,
  Trash2,
  RefreshCw,
  Key,
  Globe,
  Radio,
  CheckCircle2,
  Lock,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import { ModelRoute, EdgeNode, ContainerInfo } from "../types";

interface ControlPlaneProps {
  modelRoutes: ModelRoute[];
  edgeNodes: EdgeNode[];
  onCheckOllamaStatus: () => Promise<any>;
  theme?: "dark" | "light";
  onToggleTheme?: (theme: "dark" | "light") => void;
}

export const ControlPlane: React.FC<ControlPlaneProps> = ({
  modelRoutes,
  edgeNodes,
  onCheckOllamaStatus,
  theme = "dark",
  onToggleTheme,
}) => {
  const [checkingOllama, setCheckingOllama] = useState(false);
  const [ollamaInfo, setOllamaInfo] = useState<any | null>(null);

  const handleRefreshOllama = async () => {
    setCheckingOllama(true);
    try {
      const res = await onCheckOllamaStatus();
      setOllamaInfo(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingOllama(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-400" />
              <span>Control Plane & Sovereign AI Router</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              User-Owned Infrastructure
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure local Ollama models, cloud model fallback policies, encrypted EdgeNode mesh topologies, and zero-knowledge vault secrets.
          </p>
        </div>

        <button
          onClick={handleRefreshOllama}
          disabled={checkingOllama}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-400 ${checkingOllama ? "animate-spin" : ""}`} />
          <span>Check Local Ollama Node</span>
        </button>
      </div>

      {/* Theme Controls & High Contrast Display Mode */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Display Theme & Contrast Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Switch between Deep Space canvas and High Contrast Light Mode for well-lit environments.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
            {theme === "light" ? "Light Mode Active" : "Deep Space Active"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onToggleTheme && onToggleTheme("dark")}
            className={`p-4 rounded-2xl border transition text-left cursor-pointer flex items-center justify-between ${
              theme === "dark"
                ? "bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/30 text-white"
                : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Deep Space (Dark Canvas)</span>
              </div>
              <p className="text-xs text-slate-400">
                Low-eyestrain dark obsidian backdrop with glow highlights.
              </p>
            </div>
            {theme === "dark" && <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />}
          </button>

          <button
            onClick={() => onToggleTheme && onToggleTheme("light")}
            className={`p-4 rounded-2xl border transition text-left cursor-pointer flex items-center justify-between ${
              theme === "light"
                ? "bg-slate-950 border-amber-500 ring-2 ring-amber-500/30 text-white"
                : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>High Contrast Light Mode</span>
              </div>
              <p className="text-xs text-slate-400">
                Crisp high-contrast light theme optimized for bright workspaces.
              </p>
            </div>
            {theme === "light" && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
          </button>
        </div>
      </div>

      {/* Local Ollama Status Box */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Ollama Local AI Engine Status</h3>
          </div>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            OFFLINE FALLBACK ACTIVE
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {ollamaInfo?.message ||
            "Local Ollama daemon is offline or uninstalled. OM automatically degraded gracefully to the OM Cloud Router (Gemini 3.6 Flash) so your workspace remains fully functional."}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1">
          <span className="text-slate-400">Supported Local Models:</span>
          {["qwen2.5:7b", "llama3.2:3b", "deepseek-r1:8b"].map((m) => (
            <span key={m} className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Model Router Grid - Bento Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Model Router & Capabilities Map
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modelRoutes.map((m) => (
            <div key={m.id} className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 space-y-2.5 shadow-xl backdrop-blur-md hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="text-slate-100">{m.name}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                    m.status === "active"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {m.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>Provider: {m.provider.toUpperCase()}</span>
                <span>Latency: {m.latencyMs}ms</span>
                <span>Privacy: {m.privacyRating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EdgeNode Mesh Network - Bento Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          EdgeNode Mesh Network Topologies
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {edgeNodes.map((node) => (
            <div key={node.id} className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 space-y-3 shadow-xl backdrop-blur-md hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-xs text-slate-100">{node.name}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="text-xs font-mono space-y-1 text-slate-300">
                <div className="text-slate-400 text-[11px]">Type: {node.type}</div>
                <div className="text-slate-400 text-[11px]">IP: {node.ipAddress}</div>
                {node.gpuInfo && <div className="text-indigo-300 text-[11px]">GPU: {node.gpuInfo}</div>}
                <div className="text-slate-400 text-[11px]">RAM Usage: {node.ramUsage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vault & Sovereignty Controls */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Sovereign Data Controls & Export</span>
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed">
          In OM, you own your models, memory, machines, and rules. All user memory and Space configurations can be exported or purged at any time.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer">
            <Download className="w-4 h-4" />
            <span>Export Entire OM Universe (.json)</span>
          </button>

          <button className="px-4 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer">
            <Trash2 className="w-4 h-4" />
            <span>Purge Memory Vault</span>
          </button>
        </div>
      </div>
    </div>
  );
};
