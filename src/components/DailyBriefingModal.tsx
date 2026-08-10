import React, { useState } from "react";
import { X, Sun, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Sparkles, Brain } from "lucide-react";
import { DailyBriefing, Space } from "../types";

interface DailyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSpace: Space;
  briefing: DailyBriefing | null;
  onRefreshBriefing: () => Promise<void>;
  onResumeUniverse: () => void;
}

export const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({
  isOpen,
  onClose,
  activeSpace,
  briefing,
  onRefreshBriefing,
  onResumeUniverse,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setLoading(true);
    await onRefreshBriefing();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 sm:p-8 text-slate-100 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sun className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs font-mono font-medium text-amber-400">
                DAILY INTELLIGENCE LOOP
              </div>
              <h2 className="text-2xl font-bold text-white">Good morning, Febin.</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {briefing ? (
          <div className="space-y-5">
            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span>Executive Context Summary</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{briefing.summary}</p>
            </div>

            {/* Priorities */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Today's Core Priorities
              </h3>
              <div className="space-y-2">
                {briefing.priorities.map((pri, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-xs text-slate-200 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pri}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security & Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <div className="text-slate-400 font-mono">Active Space Context</div>
                <div className="text-indigo-300 font-bold text-sm">{activeSpace.name}</div>
                <div className="text-[11px] text-slate-400">{activeSpace.tabsCount} tabs • {activeSpace.notesCount} notes • {activeSpace.tasksCount} open tasks</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <div className="text-slate-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Security & Vault Review</span>
                </div>
                <div className="text-emerald-400 font-bold text-sm">100% Zero-Trust</div>
                <div className="text-[11px] text-slate-400">{briefing.securityNotice}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Synthesizing personalized morning briefing from OM Memory & Spaces...</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
            <span>Re-synthesize Briefing</span>
          </button>

          <button
            onClick={() => {
              onResumeUniverse();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
          >
            <span>Resume Universe Context</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
