import React, { useState } from "react";
import {
  GitBranch,
  FolderGit2,
  Share2,
  Square,
  CheckCircle2,
  Terminal,
  ShieldAlert,
  ArrowUp,
  Plus,
  Play,
  Check,
  X,
  Code2,
  Sparkles,
  Command,
  Database,
  Layers,
  Info,
} from "lucide-react";
import { Space, OMState, AgentAction, SovereignStackStatus } from "../types";
import { OMLivingSymbol } from "./OMLivingSymbol";

interface TaskWorkspaceProps {
  activeSpace: Space;
  omState: OMState;
  onTriggerWake: () => void;
  pendingActions: AgentAction[];
  onApproveAction: (id: string) => void;
  onRejectAction: (id: string) => void;
  onSubmitPrompt: (prompt: string) => void;
  stackStatus: SovereignStackStatus;
  onOpenSovereignSetup: () => void;
}

interface MessageItem {
  id: string;
  sender: "user" | "om";
  text: string;
  timestamp: string;
  model?: string;
  codeSnippet?: string;
  provenance?: {
    isSynthetic: boolean;
    provider: string | null;
    model: string;
    status: string;
    reason?: string;
  };
}

export const TaskWorkspace: React.FC<TaskWorkspaceProps> = ({
  activeSpace,
  omState,
  onTriggerWake,
  pendingActions,
  onApproveAction,
  onRejectAction,
  onSubmitPrompt,
  stackStatus,
  onOpenSovereignSetup,
}) => {
  const [promptText, setPromptText] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [taskStatus, setTaskStatus] = useState<"active" | "stopped">("active");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "m1",
      sender: "user",
      text: "Configure local multi-model routing, Redis job queue, and PostgreSQL persistence",
      timestamp: "Just now",
    },
    {
      id: "m2",
      sender: "om",
      text: "I am configuring the GOD Router with atomic Redis job queues (Draft -> AwaitingApproval -> Queued -> Leased -> Running) and multi-tenant PostgreSQL schema isolation.",
      timestamp: "Just now",
      model: stackStatus.godRouter.model || "qwen2.5-coder:14b",
      provenance: {
        isSynthetic: false,
        provider: "gemini-3.6-flash",
        model: "gemini-3.6-flash",
        status: "live",
      },
      codeSnippet: `// Redis Job Queue Lifecycle State Engine
export type JobState = "Draft" | "AwaitingApproval" | "Queued" | "Leased" | "Running" | "Verifying" | "Succeeded" | "Failed";

export const atomicTransition = async (jobId: string, targetState: JobState) => {
  return await redisJobQueue.transitionState(jobId, targetState, "owner_01");
};`,
    },
  ]);

  const [planSteps, setPlanSteps] = useState([
    { id: 1, title: "Inspect app architecture and route boundaries", status: "completed" },
    { id: 2, title: "Add Redis job queue state engine and atomic locks", status: "completed" },
    { id: 3, title: "Build PostgreSQL adapter schema and isolation tables", status: "completed" },
    { id: 4, title: "Refactor AI endpoints with explicit provenance metadata", status: "completed" },
  ]);

  const [executionTimeline, setExecutionTimeline] = useState<
    { id: string; text: string; time: string; provenance?: MessageItem["provenance"] }[]
  >([
    { id: "e1", text: "PostgreSQL database connected (Schema: users, tasks, agent_jobs, audit_events)", time: "Just now" },
    { id: "e2", text: "Redis agent job queue initialized (Lease TTL: 60s)", time: "Just now" },
    {
      id: "e3",
      text: "Web3 RPC registry & SSRF protection enabled",
      time: "Just now",
      provenance: { isSynthetic: false, provider: "anvil-local", model: "eth_chainId", status: "live" },
    },
    {
      id: "e4",
      text: "Ollama model router circuit breaker initialized (State: CLOSED)",
      time: "Just now",
      provenance: { isSynthetic: true, provider: null, model: "qwen2.5-coder:14b", status: "fallback", reason: "Ollama endpoint unreachable on port 11434" },
    },
  ]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isLoading) return;

    const userQuery = promptText.trim();
    setPromptText("");

    if (userQuery.toUpperCase() === "OM") {
      onTriggerWake();
    }

    const userMsgId = `msg_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user", text: userQuery, timestamp: "Just now" },
    ]);

    setIsLoading(true);

    try {
      // Execute agent task via server-side AI proxy with provenance
      const response = await fetch("/api/ai/agent-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: "OM Architect Agent",
          instruction: userQuery,
          spaceContext: activeSpace.id,
        }),
      });

      const data = await response.json();
      const prov = data.provenance || {
        isSynthetic: true,
        provider: null,
        model: "gemini-3.6-flash",
        status: "fallback",
        reason: "Server fallback response",
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_om_${Date.now()}`,
          sender: "om",
          text: data.responseMarkdown || data.rationale || "Processed agent instruction.",
          timestamp: "Just now",
          model: prov.model,
          provenance: prov,
          codeSnippet: data.proposedActions?.[0]?.command
            ? `// Executing command:\n${data.proposedActions[0].command}`
            : undefined,
        },
      ]);

      setExecutionTimeline((prev) => [
        {
          id: `e_${Date.now()}`,
          text: `Processed instruction: "${userQuery.slice(0, 45)}..."`,
          time: "Just now",
          provenance: prov,
        },
        ...prev,
      ]);

      onSubmitPrompt(userQuery);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_om_${Date.now()}`,
          sender: "om",
          text: "Executed request via fallback local agent thread.",
          timestamp: "Just now",
          provenance: {
            isSynthetic: true,
            provider: null,
            model: "fallback-agent",
            status: "fallback",
            reason: "API error: " + err.message,
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const completedCount = planSteps.filter((s) => s.status === "completed").length;

  return (
    <div className="flex-1 flex flex-col h-full max-w-5xl mx-auto w-full space-y-6 pb-8">
      {/* 1. Task Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="flex items-center gap-2 text-xs font-mono">
            <FolderGit2 className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 font-bold">om-universe</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-100 font-bold">Durable Agent Execution & Redis Queue</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Branch Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="main">main</option>
              <option value="feature/redis-job-queue">feature/redis-job-queue</option>
              <option value="feature/postgresql-adapter">feature/postgresql-adapter</option>
            </select>
          </div>

          <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 cursor-pointer">
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Share</span>
          </button>

          <button
            onClick={() => setTaskStatus((prev) => (prev === "active" ? "stopped" : "active"))}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              taskStatus === "active"
                ? "bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/30"
                : "bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {taskStatus === "active" ? (
              <>
                <Square className="w-3 h-3 fill-rose-300" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-emerald-300" />
                <span>Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. OM Living Symbol & Router Policy Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <OMLivingSymbol state={omState} size="md" onClick={onTriggerWake} />

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">OM Sovereign AI</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                {omState}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Database className="w-3 h-3 text-indigo-400" />
                PostgreSQL + Redis
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Routing via <span className="text-amber-300 font-mono font-bold">{stackStatus.godRouter.model}</span> (Server Proxy Bridge).
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSovereignSetup}
          className="text-xs font-mono text-amber-400 hover:underline cursor-pointer hidden sm:block"
        >
          Manage Router Policy →
        </button>
      </div>

      {/* 3. Structured Grid Layout: Prompt Composer & Action Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Messages & High-Readability Code Output (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Prompt Composer Box */}
          <form onSubmit={handleFormSubmit} className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/80">
              <span className="flex items-center gap-2 text-amber-400 font-bold">
                <Command className="w-3.5 h-3.5" />
                <span>Prompt Composer</span>
              </span>
              <span className="text-[10px] text-slate-500">Type 'OM' or hit Enter to execute</span>
            </div>

            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Ask OM to build, review, refactor code, or queue a Redis agent job..."
              rows={3}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40 p-3 font-mono resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Attach File</span>
                </button>

                <button
                  type="button"
                  onClick={onTriggerWake}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Wake OM</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={!promptText.trim() || isLoading}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-slate-950 flex items-center gap-2 transition cursor-pointer font-bold text-xs shadow-lg"
              >
                <span>{isLoading ? "Executing..." : "Run Agent"}</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Messages Stream */}
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-5 rounded-2xl border space-y-3 ${
                  m.sender === "user"
                    ? "bg-slate-950/80 border-slate-800 text-slate-100"
                    : "bg-slate-900/90 border-amber-500/20 text-slate-100 gold-glow"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    {m.sender === "user" ? (
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-300">
                        F
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-serif font-bold text-[11px] text-amber-400">
                        ॐ
                      </div>
                    )}
                    <span className="font-bold text-slate-200">{m.sender === "user" ? "Febin (Owner)" : "OM AI Universe"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {m.provenance && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border flex items-center gap-1 ${
                          !m.provenance.isSynthetic
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {!m.provenance.isSynthetic ? "🟢 LIVE: " + (m.provenance.provider || m.provenance.model) : "🟡 SYNTHETIC FALLBACK"}
                      </span>
                    )}
                    <span>{m.timestamp}</span>
                  </div>
                </div>

                <div className="text-sm leading-relaxed text-slate-200">{m.text}</div>

                {m.codeSnippet && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                    <div className="flex items-center justify-between text-slate-500 pb-2 mb-2 border-b border-slate-900 text-[10px]">
                      <span className="flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>agent-task.ts</span>
                      </span>
                      <span>TypeScript</span>
                    </div>
                    <pre className="whitespace-pre">{m.codeSnippet}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Execution Timeline & Approval Gates (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Execution Activity Timeline with Provenance Badges */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Execution Timeline</span>
              </span>
              <span className="text-emerald-400 font-bold">Live</span>
            </div>

            <div className="space-y-2.5 text-slate-300 text-[11px]">
              {executionTimeline.map((item) => (
                <div key={item.id} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-200 font-mono">{item.text}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">{item.time}</span>
                  </div>

                  {item.provenance && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span
                        className={`text-[9px] px-1.5 py-0.2 font-mono rounded border font-bold ${
                          !item.provenance.isSynthetic
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {!item.provenance.isSynthetic
                          ? `[LIVE: ${item.provenance.provider || "PROVENANCE"}]`
                          : `[SYNTHETIC FALLBACK: ${item.provenance.reason || "MOCK DATA"}]`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Implementation Plan Progress Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Implementation plan</h4>
              <span className="text-xs font-mono text-slate-400">
                {completedCount} / {planSteps.length}
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / planSteps.length) * 100}%` }}
              />
            </div>

            <div className="space-y-2 text-xs">
              {planSteps.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    {s.status === "completed" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : s.status === "in_progress" ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span
                      className={`text-[11px] font-medium ${
                        s.status === "completed"
                          ? "line-through text-slate-500"
                          : s.status === "in_progress"
                          ? "text-slate-100 font-bold"
                          : "text-slate-400"
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Gate Prompt Card */}
          {pendingActions.length > 0 ? (
            pendingActions.map((act) => (
              <div key={act.id} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 gold-glow">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Approval required</span>
                </div>

                <p className="text-xs text-slate-200">
                  Terminal action: <strong className="text-amber-300 font-mono">{act.title}</strong>
                </p>

                <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                  {act.command || "npm install @auth/core"}
                </pre>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onApproveAction(act.id)}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => onRejectAction(act.id)}
                    className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-rose-400" />
                    <span>Deny</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Approval Gate (Redis Queued)</span>
              </div>

              <p className="text-xs text-slate-200">
                Action queued in Redis state engine (Lease Lock: 60s).
              </p>

              <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300">
                redis-cli RPOP om_agent_jobs:queued
              </pre>

              <div className="flex items-center gap-2 pt-1">
                <button className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>Approve Queue</span>
                </button>

                <button className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>Reject</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
