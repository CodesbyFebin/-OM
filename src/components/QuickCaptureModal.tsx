import React, { useState } from "react";
import { Zap, Plus, CheckSquare, FileText, Brain, Sparkles, X, Check } from "lucide-react";
import { Space, TaskItem, NoteItem, MemoryItem } from "../types";

interface QuickCaptureModalProps {
  activeSpace: Space;
  spaces: Space[];
  onAddTask: (task: Omit<TaskItem, "id" | "createdAt">) => void;
  onAddNote: (note: Omit<NoteItem, "id" | "updatedAt">) => void;
  onAddMemory: (memory: Omit<MemoryItem, "id" | "createdAt">) => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  activeSpace,
  spaces,
  onAddTask,
  onAddNote,
  onAddMemory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"task" | "note" | "memory">("task");
  const [selectedSpaceId, setSelectedSpaceId] = useState(activeSpace.id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form States
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<"high" | "medium" | "low">("high");

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("Quick Idea");

  const [memoryContent, setMemoryContent] = useState("");
  const [memoryTags, setMemoryTags] = useState("quick-capture, insight");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    onAddTask({
      title: taskTitle.trim(),
      completed: false,
      priority: taskPriority,
      spaceId: selectedSpaceId,
    });

    triggerToast(`Task "${taskTitle.trim()}" captured!`);
    setTaskTitle("");
    setIsOpen(false);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    onAddNote({
      title: noteTitle.trim(),
      content: noteContent.trim(),
      category: noteCategory,
      tags: ["quick-capture"],
      spaceId: selectedSpaceId,
    });

    triggerToast(`Note "${noteTitle.trim()}" saved!`);
    setNoteTitle("");
    setNoteContent("");
    setIsOpen(false);
  };

  const handleMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryContent.trim()) return;

    const tagsArray = memoryTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onAddMemory({
      content: memoryContent.trim(),
      type: "fact",
      confidenceScore: 0.95,
      entityTags: tagsArray.length > 0 ? tagsArray : ["quick-capture"],
      spaceId: selectedSpaceId,
      provenance: "Quick Capture FAB",
    });

    triggerToast("Insight stored in Memory Vault!");
    setMemoryContent("");
    setIsOpen(false);
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-2xl shadow-indigo-600/50 hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2 font-bold text-xs border border-white/20"
        title="Quick Capture (Task, Note, Memory)"
      >
        <Zap className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
        <span className="hidden sm:inline">Quick Capture</span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 sm:p-8 text-slate-100 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Rapid Quick Capture</h3>
                  <p className="text-xs text-slate-400">Capture ideas, tasks, or memory items immediately.</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Space Target Selector */}
            <div className="flex items-center justify-between text-xs font-mono bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-slate-400">Target Universe Space:</span>
              <select
                value={selectedSpaceId}
                onChange={(e) => setSelectedSpaceId(e.target.value)}
                className="bg-slate-900 text-indigo-300 font-bold px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Switcher Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab("task")}
                className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 font-bold ${
                  activeTab === "task"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Task</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("note")}
                className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 font-bold ${
                  activeTab === "note"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Note</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("memory")}
                className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 font-bold ${
                  activeTab === "memory"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>Memory</span>
              </button>
            </div>

            {/* Tab 1: Task */}
            {activeTab === "task" && (
              <form onSubmit={handleTaskSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="What needs to be done?"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  Save Task
                </button>
              </form>
            )}

            {/* Tab 2: Note */}
            {activeTab === "note" && (
              <form onSubmit={handleNoteSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Note Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Note subject or title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Note Content</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Write detailed note content..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  Save Note
                </button>
              </form>
            )}

            {/* Tab 3: Memory */}
            {activeTab === "memory" && (
              <form onSubmit={handleMemorySubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Memory Fact / Insight</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Server production port must always bind to 3000 on host 0.0.0.0..."
                    value={memoryContent}
                    onChange={(e) => setMemoryContent(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Entity Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. docker, deployment, architecture"
                    value={memoryTags}
                    onChange={(e) => setMemoryTags(e.target.value)}
                    className="w-full p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer"
                >
                  Commit to Memory Vault
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
