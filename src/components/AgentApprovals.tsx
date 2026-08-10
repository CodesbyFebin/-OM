import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Bot,
  Terminal,
  FileText,
  Send,
  Lock,
} from "lucide-react";
import { AgentAction, AuditEvent, RiskLevel } from "../types";

interface AgentApprovalsProps {
  actions: AgentAction[];
  auditEvents: AuditEvent[];
  onApproveAction: (actionId: string) => void;
  onRejectAction: (actionId: string) => void;
  onRunAgentTask: (agentType: string, instruction: string) => Promise<any>;
}

export const AgentApprovals: React.FC<AgentApprovalsProps> = ({
  actions,
  auditEvents,
  onApproveAction,
  onRejectAction,
  onRunAgentTask,
}) => {
  const [activeTab, setActiveTab] = useState<"pending" | "agents" | "audit">("pending");
  const [agentInput, setAgentInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("OM Guide");
  const [running, setRunning] = useState(false);
  const [agentResult, setAgentResult] = useState<any | null>(null);

  const pendingActions = actions.filter((a) => a.status === "pending");

  const agentsList = [
    {
      name: "OM Guide",
      role: "Orchestrator",
      desc: "General task management, daily briefings, and context synthesis.",
      status: "Active",
    },
    {
      name: "Developer Agent",
      role: "Code & Infra",
      desc: "Terminal commands, Docker containers, esbuild compilation, and Git intelligence.",
      status: "Active",
    },
    {
      name: "Guardian Agent",
      role: "Security & Vault",
      desc: "Zero-knowledge encryption, WireGuard key rotation, and privacy audits.",
      status: "Active",
    },
    {
      name: "Organizer Agent",
      role: "Context Cleanup",
      desc: "Tab archiving, sleeping tab management, and memory deduplication.",
      status: "Active",
    },
    {
      name: "Researcher Agent",
      role: "Search & Citing",
      desc: "Web search grounding, source citation, and multi-document comparison.",
      status: "Active",
    },
  ];

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim()) return;
    setRunning(true);
    setAgentResult(null);
    try {
      const res = await onRunAgentTask(selectedAgent, agentInput.trim());
      setAgentResult(res);
      setAgentInput("");
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case "READ":
        return "bg-slate-800 text-slate-300 border-slate-700";
      case "DRAFT":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      case "ASK":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "ACT":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "NEVER":
        return "bg-red-500/20 text-red-300 border-red-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <span>Specialist Agents & Action Approvals</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Risk Gate Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Consequential actions proposed by specialist agents undergo explicit risk categorization. No action executes silently without authorization.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pending" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Approval Queue</span>
            {pendingActions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold">
                {pendingActions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("agents")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === "agents" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Agent Roster & Tasks
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === "audit" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Audit History
          </button>
        </div>
      </div>

      {/* 1. Approval Queue View */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingActions.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-semibold text-slate-200">No Pending Approvals</p>
              <p>All agent tasks have been pre-approved or executed under trust policies.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingActions.map((act) => (
                <div
                  key={act.id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 space-y-4 shadow-xl backdrop-blur-md hover:border-amber-500/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100">{act.agentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">Timestamp: {act.timestamp}</div>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${getRiskBadge(act.riskLevel)}`}>
                      RISK: {act.riskLevel} (REQUIRES APPROVAL)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-slate-200">{act.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{act.details}</p>

                    {act.command && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300">
                        $ {act.command}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      onClick={() => onRejectAction(act.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span>Reject Action</span>
                    </button>

                    <button
                      onClick={() => onApproveAction(act.id)}
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Approve & Execute</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Agent Roster & Interactive Task Runner */}
      {activeTab === "agents" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roster List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Specialist Agent Roster
            </h3>

            <div className="space-y-2">
              {agentsList.map((ag) => (
                <div
                  key={ag.name}
                  onClick={() => setSelectedAgent(ag.name)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                    selectedAgent === ag.name
                      ? "bg-indigo-600/20 border-indigo-500/50 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>{ag.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400">{ag.status}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{ag.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Runner Form */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Instruct Agent: {selectedAgent}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Formulate an instruction. The agent will analyze intent, draft proposed actions, and submit risky steps for approval.
              </p>
            </div>

            <form onSubmit={handleAgentSubmit} className="space-y-4">
              <textarea
                rows={4}
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                placeholder={`Instruct ${selectedAgent} (e.g., 'Check container health, compile server, and log deployment decision')...`}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />

              <button
                type="submit"
                disabled={running || !agentInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Execute Agent Task</span>
              </button>
            </form>

            {/* Result */}
            {agentResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs text-slate-200 space-y-2 font-mono">
                <div className="font-bold text-indigo-300">Agent Rationale</div>
                <p className="text-slate-300 leading-relaxed">{agentResult.rationale}</p>

                {agentResult.proposedActions && agentResult.proposedActions.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <div className="font-bold text-amber-300">Proposed Actions Drafted</div>
                    {agentResult.proposedActions.map((pa: any, i: number) => (
                      <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-200">
                        {pa.title} ({pa.riskLevel})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Immutable Audit Log View */}
      {activeTab === "audit" && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Immutable Audit Trail</span>
          </h3>

          <div className="space-y-2">
            {auditEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-semibold">{evt.action}</div>
                  <div className="text-[11px] text-slate-400">
                    Actor: {evt.actor} • Agent: {evt.agent} • Target: {evt.target}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-slate-500">{evt.timestamp}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {evt.result.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
