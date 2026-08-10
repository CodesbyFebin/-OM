import React, { useState } from "react";
import {
  Brain,
  Search,
  Plus,
  Tag,
  Trash2,
  Edit2,
  CheckCircle2,
  Filter,
  Download,
  Lock,
  Sparkles,
  Layers,
  FileText,
  Clock,
} from "lucide-react";
import { MemoryItem, Space } from "../types";

interface MemoryVaultProps {
  memoryItems: MemoryItem[];
  activeSpace: Space;
  onAddMemory: (content: string, entityTags: string[], scope: 'private' | 'space' | 'session', decisionFlag: boolean) => void;
  onDeleteMemory: (id: string) => void;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({
  memoryItems,
  activeSpace,
  onAddMemory,
  onDeleteMemory,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScope, setSelectedScope] = useState<string>("all");
  const [onlyDecisions, setOnlyDecisions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newScope, setNewScope] = useState<'private' | 'space' | 'session'>("space");
  const [newDecision, setNewDecision] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    const tagsArr = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onAddMemory(newContent.trim(), tagsArr, newScope, newDecision);
    setNewContent("");
    setNewTags("");
    setShowAddModal(false);
  };

  const filteredMemories = memoryItems.filter((mem) => {
    const matchesSearch =
      mem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.entityTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesScope = selectedScope === "all" || mem.scope === selectedScope;
    const matchesDecision = !onlyDecisions || mem.decisionFlag;
    return matchesSearch && matchesScope && matchesDecision;
  });

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memoryItems, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `om-personal-memory-backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              <span>Personal Memory & Knowledge Graph</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Zero-Knowledge Vault
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            OM remembers decisions, entity relationships, user preferences, and project facts across sessions. User maintains full edit and deletion control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Memory</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 glass-panel p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memory contents or entity tags (e.g. architecture, express, theme)..."
            className="w-full pl-10 pr-3 py-2 bg-slate-950/80 border border-amber-500/20 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
            className="bg-slate-950/80 border border-amber-500/20 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Scopes</option>
            <option value="space">Space Scope</option>
            <option value="private">Private Scope</option>
            <option value="session">Session Scope</option>
          </select>

          <button
            onClick={() => setOnlyDecisions(!onlyDecisions)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition shrink-0 cursor-pointer ${
              onlyDecisions
                ? "bg-amber-500/30 text-amber-300 border-amber-500/40 font-bold"
                : "bg-slate-950/80 text-slate-400 border-amber-500/20 hover:text-slate-200"
            }`}
          >
            Decisions Only
          </button>
        </div>
      </div>

      {/* Memory Items Grid - Bento Card Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs space-y-2">
            <Brain className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No matching memory entries found in your Knowledge Graph.</p>
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="p-5 sm:p-6 rounded-3xl glass-panel space-y-3.5 flex flex-col justify-between hover:scale-[1.01] transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        mem.scope === "private"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      }`}
                    >
                      {mem.scope.toUpperCase()} SCOPE
                    </span>

                    {mem.decisionFlag && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        DECISION
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteMemory(mem.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition cursor-pointer"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">{mem.content}</p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
                {/* Entity Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {mem.entityTags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 font-mono flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5 text-indigo-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Source: {mem.source}</span>
                  <span>{mem.createdAt}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 space-y-4 text-slate-100">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>Record Personal Memory</span>
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Memory Content / Decision</label>
                <textarea
                  rows={3}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g., Decision: Standardized Express backend on port 3000..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Entity Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g., express, architecture, security"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Scope</label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  >
                    <option value="space">Space Scope</option>
                    <option value="private">Private Scope</option>
                    <option value="session">Session Scope</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDecision}
                      onChange={(e) => setNewDecision(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Key Decision</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  Commit to Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
