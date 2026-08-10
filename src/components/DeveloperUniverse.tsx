import React, { useState } from "react";
import {
  Terminal as TerminalIcon,
  Server,
  Cpu,
  Play,
  RotateCw,
  Square,
  AlertTriangle,
  Sparkles,
  GitBranch,
  HardDrive,
  Copy,
  Check,
  Loader2,
  Send,
} from "lucide-react";
import { ContainerInfo, Space } from "../types";

interface DeveloperUniverseProps {
  activeSpace: Space;
  containers: ContainerInfo[];
  onDiagnoseLog: (logText: string) => Promise<any>;
}

export const DeveloperUniverse: React.FC<DeveloperUniverseProps> = ({
  activeSpace,
  containers,
  onDiagnoseLog,
}) => {
  const [activeTab, setActiveTab] = useState<"terminal" | "containers" | "diagnostics">("terminal");

  // Terminal state
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "[OM-SYSTEM] Operating Universe Environment Connected",
    "[OM-SYSTEM] Node.js Runtime: ES2022 ESM / Express v4.21",
    "[OM-SYSTEM] Container Ingress: Port 3000 bound to 0.0.0.0",
    "Type 'help' or 'om status' to inspect current system state.",
  ]);
  const [cliInput, setCliInput] = useState("");

  // Diagnostics state
  const [logInput, setLogInput] = useState(`[OM-SERVER] GET /api/health 200 OK - 1.2ms
[OM-SERVER] Gemini 3.6 Flash client initialized with aistudio-build header.
[WARN] Vite bundle warning: chunk size exceeds 500kB in dist/assets.
[ERROR] Ollama connection refused at 127.0.0.1:11434. Routing through OM Cloud Router (Gemini).`);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    const cmd = cliInput.trim();
    const newLogs = [...terminalOutput, `febin@om-space:${activeSpace.name.toLowerCase().replace(/\s+/g, "-")}$ ${cmd}`];

    if (cmd === "help") {
      newLogs.push("Available CLI commands:");
      newLogs.push("  om status      - Check container and API health");
      newLogs.push("  om space       - Show active Space context");
      newLogs.push("  docker ps      - List running containers");
      newLogs.push("  git status     - Show git branch and changes");
      newLogs.push("  vault status   - Inspect zero-knowledge vault state");
      newLogs.push("  clear          - Clear terminal output");
    } else if (cmd === "om status") {
      newLogs.push("[HEALTH] Express Server: ONLINE (Port 3000)");
      newLogs.push("[HEALTH] Gemini API: CONNECTED");
      newLogs.push("[HEALTH] Vault Encryption: ACTIVE");
      newLogs.push(`[SPACE] Active Space: ${activeSpace.name}`);
    } else if (cmd === "docker ps") {
      containers.forEach((c) => {
        newLogs.push(`${c.id}\t${c.name}\t${c.status}\t${c.ports}`);
      });
    } else if (cmd === "git status") {
      newLogs.push("On branch main");
      newLogs.push("Your branch is up to date with 'origin/main'.");
      newLogs.push("nothing to commit, working tree clean");
    } else if (cmd === "vault status") {
      newLogs.push("[VAULT] Engine: HashiCorp Vault / OM Sealed");
      newLogs.push("[VAULT] Keys: 3 encrypted SSH keys, 2 API tokens");
    } else if (cmd === "clear") {
      setTerminalOutput([]);
      setCliInput("");
      return;
    } else {
      newLogs.push(`Command executed: ${cmd}`);
      newLogs.push("[OM-AGENT] Command recorded in Audit Log.");
    }

    setTerminalOutput(newLogs);
    setCliInput("");
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logInput.trim()) return;
    setDiagnosing(true);
    try {
      const res = await onDiagnoseLog(logInput);
      setDiagnosisResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <TerminalIcon className="w-6 h-6 text-emerald-400" />
              <span>Developer Workspace & Infrastructure</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Linux Container Env
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Integrated terminal CLI, Docker container dashboard, Git intelligence, and AI Log Diagnostic Agent.
          </p>
        </div>

        {/* View Tab Selector */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("terminal")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === "terminal" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Terminal CLI
          </button>
          <button
            onClick={() => setActiveTab("containers")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === "containers" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Docker Containers
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === "diagnostics" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Log Diagnostics AI
          </button>
        </div>
      </div>

      {/* 1. Terminal View - Bento Grid Block */}
      {activeTab === "terminal" && (
        <div className="bg-slate-950/90 rounded-3xl border border-slate-800/80 p-5 font-mono text-xs text-slate-200 h-[520px] flex flex-col justify-between shadow-2xl backdrop-blur-md">
          {/* Terminal Output Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-slate-400 text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 font-bold text-slate-300">om-terminal :: {activeSpace.name}</span>
            </div>
            <span>Shell: bash</span>
          </div>

          {/* Terminal Logs Window */}
          <div className="flex-1 overflow-y-auto py-3 space-y-1 text-slate-300 font-mono leading-relaxed">
            {terminalOutput.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.startsWith("febin@om-space")
                    ? "text-emerald-400 font-semibold"
                    : line.startsWith("[OM-SYSTEM]")
                    ? "text-indigo-400"
                    : line.startsWith("[HEALTH]")
                    ? "text-amber-300"
                    : "text-slate-300"
                }
              >
                {line}
              </div>
            ))}
          </div>

          {/* CLI Input */}
          <form onSubmit={handleCliSubmit} className="pt-3 border-t border-slate-800 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">$</span>
            <input
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              placeholder="Type command ('help', 'om status', 'docker ps', 'git status')..."
              className="flex-1 bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
            />
            <button type="submit" className="text-slate-400 hover:text-indigo-400 transition cursor-pointer">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 2. Containers View - Bento Grid Tiles */}
      {activeTab === "containers" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {containers.map((c) => (
              <div key={c.id} className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 space-y-3.5 shadow-xl backdrop-blur-md hover:border-indigo-500/40 transition-all">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs text-slate-100">{c.name}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      c.status === "running"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs space-y-1 font-mono text-slate-300">
                  <div className="text-slate-400 text-[11px] truncate">Image: {c.image}</div>
                  <div className="text-slate-400 text-[11px]">Ports: {c.ports}</div>
                  <div className="flex justify-between pt-1">
                    <span>CPU: {c.cpu}</span>
                    <span>RAM: {c.memory}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 text-xs">
                  <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer font-medium">
                    Logs
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 transition cursor-pointer font-medium">
                    Restart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Log Diagnostics View */}
      {activeTab === "diagnostics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Log Input */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Paste Console / Container Error Log</span>
            </h3>

            <form onSubmit={handleDiagnose} className="space-y-4">
              <textarea
                rows={10}
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                placeholder="Paste application logs or error backtraces here..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />

              <button
                type="submit"
                disabled={diagnosing || !logInput.trim()}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {diagnosing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Log Stack Trace...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Log with Developer Agent</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Diagnosis Result */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Log Diagnosis & Proposed Fix</span>
            </h3>

            {diagnosisResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="font-bold text-indigo-300">Diagnosis Summary</div>
                  <p className="text-slate-200 leading-relaxed">{diagnosisResult.diagnosis}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="font-bold text-amber-400">Root Cause</div>
                  <p className="text-slate-300 leading-relaxed">{diagnosisResult.rootCause}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 space-y-2">
                  <div className="font-bold text-emerald-400">Suggested Resolution</div>
                  <p className="leading-relaxed">{diagnosisResult.suggestedFix}</p>

                  {diagnosisResult.proposedCommand && (
                    <div className="pt-2 font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-emerald-500/30 text-emerald-300">
                      $ {diagnosisResult.proposedCommand}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 text-indigo-400/40 mx-auto" />
                <p>Paste an error trace or container log on the left and click 'Analyze' to generate AI diagnostic fixes.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
