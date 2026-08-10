import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Sparkles,
  Globe,
  Brain,
  FileText,
  CheckSquare,
  ExternalLink,
  Loader2,
  Mail,
  Filter,
  History,
  Trash2,
} from "lucide-react";
import { Space, MemoryItem, NoteItem, TaskItem, TabItem, FileItem } from "../types";

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery: string;
  activeSpace: Space;
  onUniversalSearch: (query: string, useWeb: boolean) => Promise<any>;
  memoryItems?: MemoryItem[];
  notes?: NoteItem[];
  tasks?: TaskItem[];
  tabs?: TabItem[];
  files?: FileItem[];
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery,
  activeSpace,
  onUniversalSearch,
  memoryItems = [],
  notes = [],
  tasks = [],
  tabs = [],
  files = [],
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Recent Searches local storage state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("om_recent_searches");
      return saved ? JSON.parse(saved) : ["Zero-Knowledge Vault", "Docker local build", "Weekly habits", "Google Meet"];
    } catch {
      return ["Zero-Knowledge Vault", "Docker local build", "Weekly habits", "Google Meet"];
    }
  });

  useEffect(() => {
    if (initialQuery && isOpen) {
      setQuery(initialQuery);
      executeSearch(initialQuery, useWebSearch);
    }
  }, [initialQuery, isOpen]);

  if (!isOpen) return null;

  const saveRecentSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem("om_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("om_recent_searches");
  };

  const executeSearch = async (searchQ: string, webSearchFlag: boolean) => {
    if (!searchQ.trim()) return;
    saveRecentSearch(searchQ);
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await onUniversalSearch(searchQ, webSearchFlag);
      setSearchResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, useWebSearch);
  };

  // Local Index Filter Results
  const matchedNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.content.toLowerCase().includes(query.toLowerCase())
  );

  const matchedTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  const matchedMemory = memoryItems.filter(
    (m) =>
      m.content.toLowerCase().includes(query.toLowerCase()) ||
      m.entityTags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const matchedTabs = tabs.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.url.toLowerCase().includes(query.toLowerCase())
  );

  const matchedFiles = files.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  // Simulated Unified Email Inbox items matching query
  const sampleEmails = [
    { id: "em_1", subject: "OM Production Deployment Status", sender: "alex@om.ai", snippet: "All edge nodes green on port 3000" },
    { id: "em_2", subject: "Security Audit Report for Zero-Knowledge Vault", sender: "security@om.ai", snippet: "No vulnerabilities detected in local memory store." },
  ].filter(
    (em) =>
      em.subject.toLowerCase().includes(query.toLowerCase()) ||
      em.snippet.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900/95 border border-indigo-500/30 p-6 sm:p-8 text-slate-100 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Universal AI Search & Cross-Module Index</h2>
              <p className="text-xs text-slate-400">Index & retrieve across Notes, Tasks, Web History, Memory Vault, Docs & Emails.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-indigo-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents, notes, emails, web history, tasks, or ask Gemini..."
              className="w-full pl-12 pr-32 py-4 rounded-2xl bg-slate-950 border border-indigo-500/30 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="absolute right-2.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-md flex items-center gap-1.5"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5" /><span>Search</span></>}
            </button>
          </div>

          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1 font-bold text-[11px]">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Recent Searches:</span>
              </span>
              {recentSearches.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(s);
                    executeSearch(s, useWebSearch);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-950/90 hover:bg-indigo-950 text-indigo-300 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer text-[11px] font-medium"
                >
                  {s}
                </button>
              ))}
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1"
                title="Clear recent searches"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useWebSearch}
                onChange={(e) => setUseWebSearch(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
              />
              <span>Google Search Grounding (Web citations)</span>
            </label>

            {/* Module Category Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {[
                { id: "all", label: "All" },
                { id: "notes", label: `Notes (${matchedNotes.length})` },
                { id: "tasks", label: `Tasks (${matchedTasks.length})` },
                { id: "tabs", label: `Web Tabs (${matchedTabs.length})` },
                { id: "memory", label: `Memory (${matchedMemory.length})` },
                { id: "emails", label: `Emails (${sampleEmails.length})` },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-indigo-600 text-white font-bold"
                      : "bg-slate-950/80 hover:bg-slate-800 text-slate-400"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {searching ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">
                Searching across OM Memory, Workspace Index & Google Grounding...
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Synthesized AI Answer */}
              {searchResult && (
                <div className="p-5 rounded-3xl bg-indigo-950/40 border border-indigo-500/30 text-slate-200 space-y-3 leading-relaxed shadow-xl">
                  <div className="font-bold text-indigo-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>AI Synthesized Answer</span>
                  </div>
                  <div className="whitespace-pre-wrap text-slate-200">{searchResult.answer}</div>
                </div>
              )}

              {/* Categorized Module Hits */}
              {(activeCategory === "all" || activeCategory === "notes") && matchedNotes.length > 0 && (
                <div className="space-y-2">
                  <div className="font-mono text-[11px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Notes ({matchedNotes.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedNotes.map((n) => (
                      <div key={n.id} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                        <div className="font-bold text-slate-200 truncate">{n.title}</div>
                        <div className="text-slate-400 text-[11px] line-clamp-2">{n.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeCategory === "all" || activeCategory === "tasks") && matchedTasks.length > 0 && (
                <div className="space-y-2">
                  <div className="font-mono text-[11px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tasks ({matchedTasks.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedTasks.map((t) => (
                      <div key={t.id} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                        <span className="font-medium text-slate-200">{t.title}</span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeCategory === "all" || activeCategory === "tabs") && matchedTabs.length > 0 && (
                <div className="space-y-2">
                  <div className="font-mono text-[11px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Web Tabs ({matchedTabs.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedTabs.map((tb) => (
                      <div key={tb.id} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                        <div className="truncate pr-2">
                          <div className="font-medium text-slate-200 truncate">{tb.title}</div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">{tb.url}</div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeCategory === "all" || activeCategory === "memory") && matchedMemory.length > 0 && (
                <div className="space-y-2">
                  <div className="font-mono text-[11px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    <span>Memory Vault ({matchedMemory.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedMemory.map((m) => (
                      <div key={m.id} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-300">
                        <p>{m.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeCategory === "all" || activeCategory === "emails") && sampleEmails.length > 0 && (
                <div className="space-y-2">
                  <div className="font-mono text-[11px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span>Emails & Inbox ({sampleEmails.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {sampleEmails.map((em) => (
                      <div key={em.id} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200">{em.subject}</div>
                          <div className="text-[11px] text-slate-400">{em.snippet}</div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{em.sender}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Web Sources Citations */}
              {searchResult?.sources && searchResult.sources.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Web Grounding Citations</span>
                  </div>
                  <div className="space-y-1.5">
                    {searchResult.sources.map((src: any, idx: number) => (
                      <a
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-indigo-300 border border-slate-800 transition"
                      >
                        <span className="truncate max-w-lg">{src.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
