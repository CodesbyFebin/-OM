import React, { useState } from "react";
import {
  CheckSquare,
  FileText,
  Plus,
  CheckCircle2,
  Circle,
  Tag,
  Clock,
  Sparkles,
  Rocket,
  Trash2,
} from "lucide-react";
import { TaskItem, NoteItem, Mission, Space } from "../types";

interface MissionsTasksProps {
  activeSpace: Space;
  tasks: TaskItem[];
  notes: NoteItem[];
  missions: Mission[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, priority: 'p1' | 'p2' | 'p3', category: string) => void;
  onAddNote: (title: string, content: string, tags: string[]) => void;
  onDeleteNote: (noteId: string) => void;
}

export const MissionsTasks: React.FC<MissionsTasksProps> = ({
  activeSpace,
  tasks,
  notes,
  missions,
  onToggleTask,
  onAddTask,
  onAddNote,
  onDeleteNote,
}) => {
  const [activeTab, setActiveTab] = useState<"tasks" | "notes" | "missions">("tasks");

  // Add Task State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<'p1' | 'p2' | 'p3'>("p1");
  const [newTaskCategory, setNewTaskCategory] = useState("General");

  // Add Note State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTags, setNewNoteTags] = useState("");

  const spaceTasks = tasks.filter((t) => t.spaceId === activeSpace.id);
  const spaceNotes = notes.filter((n) => n.spaceId === activeSpace.id);
  const spaceMissions = missions.filter((m) => m.spaceId === activeSpace.id);

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), newTaskPriority, newTaskCategory);
    setNewTaskTitle("");
    setShowTaskModal(false);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    const tagsArr = newNoteTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onAddNote(newNoteTitle.trim(), newNoteContent.trim(), tagsArr);
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteTags("");
    setShowNoteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-amber-400" />
              <span>Missions, Tasks & Notes</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {activeSpace.name}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Goal-oriented Missions, prioritized local tasks, and Markdown notes synced with OM Personal Memory.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === "tasks" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Tasks ({spaceTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === "notes" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Notes ({spaceNotes.length})
          </button>
          <button
            onClick={() => setActiveTab("missions")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === "missions" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Missions ({spaceMissions.length})
          </button>
        </div>
      </div>

      {/* 1. Tasks View */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Task Backlog
            </div>

            <button
              onClick={() => setShowTaskModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-2">
            {spaceTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No tasks in this space.</div>
            ) : (
              spaceTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`p-4 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    task.completed
                      ? "bg-slate-900/40 border-slate-800 text-slate-500 line-through"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-semibold">{task.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Category: {task.category}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      task.priority === "p1"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : task.priority === "p2"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. Notes View */}
      {activeTab === "notes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Space Notes Workspace
            </div>

            <button
              onClick={() => setShowNoteModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Note</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spaceNotes.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">No notes in this space.</div>
            ) : (
              spaceNotes.map((note) => (
                <div key={note.id} className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 space-y-3.5 shadow-xl backdrop-blur-md hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                    <h4 className="font-bold text-xs text-slate-100">{note.title}</h4>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="text-slate-500 hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </pre>

                  <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-slate-800/80">
                    {note.tags.map((tg, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono">
                        #{tg}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. Missions View */}
      {activeTab === "missions" && (
        <div className="space-y-4">
          <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
            Active Space Missions
          </div>

          <div className="space-y-4">
            {spaceMissions.map((m) => (
              <div key={m.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-sm text-slate-100">{m.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {m.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{m.goal}</p>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Progress</span>
                    <span>{m.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all" style={{ width: `${m.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 space-y-4 text-slate-100">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>Add Task</span>
            </h3>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task description..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  >
                    <option value="p1">P1 - High</option>
                    <option value="p2">P2 - Medium</option>
                    <option value="p3">P3 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Category</label>
                  <input
                    type="text"
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    placeholder="DevOps, Feature, Fix..."
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 space-y-4 text-slate-100">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>Create Note</span>
            </h3>

            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Note title..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Content</label>
                <textarea
                  rows={4}
                  required
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Markdown or text content..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newNoteTags}
                  onChange={(e) => setNewNoteTags(e.target.value)}
                  placeholder="architecture, express, security"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
