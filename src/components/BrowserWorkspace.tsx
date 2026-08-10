import React, { useState } from "react";
import {
  Globe,
  Plus,
  X,
  Pin,
  Moon,
  BookOpen,
  Sparkles,
  ExternalLink,
  Search,
  MessageSquare,
  Bookmark,
  Share2,
  Copy,
  Check,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { TabItem, Space } from "../types";

interface BrowserWorkspaceProps {
  activeSpace: Space;
  tabs: TabItem[];
  onAddTab: (url: string, title: string) => void;
  onCloseTab: (tabId: string) => void;
  onSelectTab: (tabId: string) => void;
  onAskPage: (tab: TabItem, question: string) => Promise<any>;
}

export const BrowserWorkspace: React.FC<BrowserWorkspaceProps> = ({
  activeSpace,
  tabs,
  onAddTab,
  onCloseTab,
  onSelectTab,
  onAskPage,
}) => {
  const [newTabUrl, setNewTabUrl] = useState("");
  const [askQuestion, setAskQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [askResponse, setAskResponse] = useState<any | null>(null);
  const [readerMode, setReaderMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeTab = tabs.find((t) => t.isActive && t.spaceId === activeSpace.id) || tabs[0];

  const handleCreateTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabUrl.trim()) return;
    let url = newTabUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const title = url.replace("https://", "").replace("http://", "").split("/")[0];
    onAddTab(url, title);
    setNewTabUrl("");
  };

  const handleAskPageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTab || !askQuestion.trim()) return;
    setAsking(true);
    setAskResponse(null);
    try {
      const res = await onAskPage(activeTab, askQuestion);
      setAskResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAsking(false);
    }
  };

  const handleCopySummary = () => {
    if (activeTab?.summary) {
      navigator.clipboard.writeText(activeTab.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Intelligent Browser</h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {activeSpace.name}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Spatial browser tabs with Ask-This-Page AI, source citations, and distraction-free reader mode.
          </p>
        </div>

        {/* Tab Creation Input */}
        <form onSubmit={handleCreateTab} className="flex items-center gap-2">
          <div className="relative">
            <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={newTabUrl}
              onChange={(e) => setNewTabUrl(e.target.value)}
              placeholder="Open website URL..."
              className="pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-56 sm:w-64"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Open</span>
          </button>
        </form>
      </div>

      {/* Tabs Strip Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab?.id;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 max-w-xs border ${
                isActive
                  ? "bg-slate-800 text-slate-100 border-indigo-500/50 shadow-md"
                  : "bg-slate-900/60 text-slate-400 hover:bg-slate-800/60 border-slate-800"
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
              <span className="truncate max-w-[140px]">{tab.title}</span>

              {tab.pinned && <Pin className="w-3 h-3 text-amber-400" />}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="hover:text-red-400 p-0.5 rounded transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Main Browser View: Content Frame & Ask-Page Sidebar */}
      {activeTab && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulated Browser Webpage View - Bento Card */}
          <div className="lg:col-span-2 bg-slate-900/90 rounded-3xl border border-slate-800/80 overflow-hidden flex flex-col h-[620px] shadow-xl backdrop-blur-md">
            {/* Address bar */}
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-3 flex-1 mr-4 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 truncate font-mono">
                <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate text-slate-200">{activeTab.url}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReaderMode(!readerMode)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    readerMode
                      ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/40"
                      : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700"
                  }`}
                  title="Toggle Reader Mode"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <a
                  href={activeTab.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Page Display Body */}
            <div className={`p-6 flex-1 overflow-y-auto ${readerMode ? "bg-slate-950 text-slate-100 max-w-2xl mx-auto font-serif leading-relaxed" : "space-y-4"}`}>
              <div className="space-y-2 pb-4 border-b border-slate-800">
                <h2 className="text-xl font-bold text-slate-100">{activeTab.title}</h2>
                <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                  <span>Source: {new URL(activeTab.url).hostname}</span>
                  <span>•</span>
                  <span>OM Context Saved</span>
                </div>
              </div>

              {activeTab.summary && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      AI Page Brief
                    </span>
                    <button
                      onClick={handleCopySummary}
                      className="text-slate-400 hover:text-white transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="leading-relaxed">{activeTab.summary}</p>
                </div>
              )}

              <div className="text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
                <p>
                  {activeTab.contentSnippet ||
                    "This webpage content is synced into your OM Space memory. You can ask Gemini questions about this page, summarize key decisions, or turn insights into actionable tasks."}
                </p>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-slate-200">Key Takeaways from Page</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    <li>Zero-knowledge encrypted memory keeps user context private.</li>
                    <li>Context restoration allows resuming tabs and state across browser restarts.</li>
                    <li>Multi-agent orchestration approves actions with granular risk levels.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Ask-This-Page AI Panel - Bento Side Block */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800/80 p-5 sm:p-6 flex flex-col justify-between h-[620px] space-y-4 shadow-xl backdrop-blur-md">
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="pb-3 border-b border-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-200">Ask-This-Page AI</h3>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                <div className="text-slate-400 font-mono">Current Page Context</div>
                <div className="font-semibold text-slate-200 truncate">{activeTab.title}</div>
              </div>

              {/* AI Response Output */}
              {askResponse ? (
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-slate-200 space-y-2">
                    <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Gemini Analysis</span>
                    </div>
                    <p className="leading-relaxed text-slate-200">{askResponse.answer || askResponse.summary}</p>

                    {askResponse.keyTakeaways && (
                      <div className="pt-2 border-t border-indigo-500/20 space-y-1">
                        <div className="font-semibold text-indigo-300">Takeaways</div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300">
                          {askResponse.keyTakeaways.map((point: string, i: number) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <Sparkles className="w-6 h-6 text-indigo-400/50 mx-auto" />
                  <p>Ask anything about this page or instruct Gemini to extract action items.</p>
                </div>
              )}
            </div>

            {/* Ask Prompt Form */}
            <form onSubmit={handleAskPageSubmit} className="pt-3 border-t border-slate-800 space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  value={askQuestion}
                  onChange={(e) => setAskQuestion(e.target.value)}
                  placeholder="e.g., What are the key takeaways from this document?"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={asking || !askQuestion.trim()}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {asking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Page Content...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask Gemini</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
