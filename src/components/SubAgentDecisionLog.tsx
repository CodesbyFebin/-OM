import React, { useState } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Filter,
  Play,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

export interface DecisionLogEntry {
  id: string;
  agentName: string;
  agentAvatar: string;
  taskTitle: string;
  previousColumn: string;
  newColumn: string;
  ruleCode: string;
  ruleReason: string;
  confidenceScore: number; // e.g. 0.98
  timestamp: string;
  riskLevel: "READ" | "DRAFT" | "ASK" | "ACT";
  codeImpactSnippet?: string;
}

interface SubAgentDecisionLogProps {
  logs?: DecisionLogEntry[];
  onTriggerSimulation?: () => void;
  compact?: boolean;
}

export const initialDecisionLogs: DecisionLogEntry[] = [
  {
    id: "log-1",
    agentName: "OM Refactor Agent",
    agentAvatar: "🤖",
    taskTitle: "Refactor Qdrant memory vector indexer",
    previousColumn: "In Progress",
    newColumn: "Done",
    ruleCode: "RULE #204: AST Syntax Verification",
    ruleReason: "Verified zero syntax errors and passing linter tests across /src/core/memory. Advanced task to Done.",
    confidenceScore: 0.99,
    timestamp: "2 mins ago",
    riskLevel: "ACT",
    codeImpactSnippet: "export const memoryIndexer = new QdrantClient({ endpoint: 'http://127.0.0.1:6333' });",
  },
  {
    id: "log-2",
    agentName: "OM QA Agent",
    agentAvatar: "🔍",
    taskTitle: "Verify WCAG AA theme contrast variables",
    previousColumn: "Backlog",
    newColumn: "In Progress",
    ruleCode: "RULE #102: Dependency Satisfaction",
    ruleReason: "Prerequisite CSS token mapping completed in index.css. Promoted task to active queue.",
    confidenceScore: 0.96,
    timestamp: "12 mins ago",
    riskLevel: "READ",
  },
  {
    id: "log-3",
    agentName: "OM Security Agent",
    agentAvatar: "🛡️",
    taskTitle: "Audit WireGuard peer connections",
    previousColumn: "Review",
    newColumn: "Done",
    ruleCode: "RULE #401: Zero-Trust Signature Lock",
    ruleReason: "Cryptographic handshakes verified for all 3 edge nodes. Owner signature confirmed.",
    confidenceScore: 1.0,
    timestamp: "28 mins ago",
    riskLevel: "ASK",
    codeImpactSnippet: "wg show | grep 'handshake' // Result: < 10 seconds ago for 10.8.0.2",
  },
  {
    id: "log-4",
    agentName: "OM Router Agent",
    agentAvatar: "⚡",
    taskTitle: "Optimize DeepSeek R1 fallback latency",
    previousColumn: "Backlog",
    newColumn: "In Progress",
    ruleCode: "RULE #305: Latency Threshold Auto-Route",
    ruleReason: "Local Ollama Qwen model latency measured at 142ms. Auto-activated primary policy route.",
    confidenceScore: 0.94,
    timestamp: "1 hour ago",
    riskLevel: "READ",
  },
];

export const SubAgentDecisionLog: React.FC<SubAgentDecisionLogProps> = ({
  logs = initialDecisionLogs,
  onTriggerSimulation,
  compact = false,
}) => {
  const [logList, setLogList] = useState<DecisionLogEntry[]>(logs);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>("All");
  const [expandedLogId, setExpandedLogId] = useState<string | null>("log-1");

  const agents = ["All", "OM Refactor Agent", "OM QA Agent", "OM Security Agent", "OM Router Agent"];

  const handleSimulateDecision = () => {
    const newEntry: DecisionLogEntry = {
      id: `log-${Date.now()}`,
      agentName: "OM Refactor Agent",
      agentAvatar: "🤖",
      taskTitle: "Automated code analysis & linter check",
      previousColumn: "In Progress",
      newColumn: "Done",
      ruleCode: `RULE #${Math.floor(Math.random() * 800 + 100)}: Autonomous Verification`,
      ruleReason: "Verified code integrity via local qwen2.5-coder with zero lint warnings. Task auto-promoted.",
      confidenceScore: +(0.92 + Math.random() * 0.07).toFixed(2),
      timestamp: "Just now",
      riskLevel: "ACT",
      codeImpactSnippet: "npm run lint // Passed with 0 errors.",
    };

    setLogList((prev) => [newEntry, ...prev]);
    setExpandedLogId(newEntry.id);
    if (onTriggerSimulation) onTriggerSimulation();
  };

  const filteredLogs = logList.filter(
    (l) => selectedAgentFilter === "All" || l.agentName === selectedAgentFilter
  );

  return (
    <div className={`p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-4 shadow-xl text-slate-100 ${compact ? 'text-xs' : ''}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">Sub-Agent Decision Log</h3>
              <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                Real-Time
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Live audit feed explaining *why* sub-agents auto-advanced tasks
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateDecision}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Simulate Decision</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {agents.map((ag) => (
            <button
              key={ag}
              onClick={() => setSelectedAgentFilter(ag)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                selectedAgentFilter === ag
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                  : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {ag === "All" ? "All Agents" : ag.replace("OM ", "")}
            </button>
          ))}
        </div>

        <span className="text-[10px] font-mono text-slate-500 shrink-0">
          {filteredLogs.length} Events
        </span>
      </div>

      {/* Log Feed Items */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {filteredLogs.map((log) => {
          const isExpanded = expandedLogId === log.id;

          return (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 transition space-y-2"
            >
              {/* Header row */}
              <div
                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{log.agentAvatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{log.agentName}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {log.riskLevel}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <span>{log.taskTitle}</span>
                      <span className="text-amber-400 font-bold">
                        ({log.previousColumn} → {log.newColumn})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                      {(log.confidenceScore * 100).toFixed(0)}% Conf.
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono block">{log.timestamp}</span>
                  </div>

                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Rule & Reasoning Breakdown */}
              {isExpanded && (
                <div className="pt-2 border-t border-slate-900 space-y-2 text-xs font-mono animate-fade-in">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{log.ruleCode}</span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    "{log.ruleReason}"
                  </p>

                  {log.codeImpactSnippet && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-emerald-300 overflow-x-auto">
                      <div className="text-[9px] text-slate-500 pb-1 mb-1 border-b border-slate-800 font-mono">
                        Verification Output / AST Check
                      </div>
                      <pre className="whitespace-pre">{log.codeImpactSnippet}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
