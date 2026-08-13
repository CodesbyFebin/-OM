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
  Lock,
  Link,
  AlertCircle,
  Activity,
} from "lucide-react";
import { TaskItem, NoteItem, Mission, Space } from "../types";
import { SubAgentDecisionLog } from "./SubAgentDecisionLog";

interface MissionsTasksProps {
  activeSpace: Space;
  tasks: TaskItem[];
  notes: NoteItem[];
  missions: Mission[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, priority: 'p1' | 'p2' | 'p3', category: string, dependencies?: string[]) => void;
  onUpdateTaskDependencies?: (taskId: string, dependencies: string[]) => void;
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
  onUpdateTaskDependencies = (_taskId: string, _dependencies: string[]) => {},
  onAddNote,
  onDeleteNote,
}) => {
  const [activeTab, setActiveTab] = useState<"tasks" | "notes" | "missions" | "subagent">("tasks");

  // Add Task State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<'p1' | 'p2' | 'p3'>("p1");
  const [newTaskCategory, setNewTaskCategory] = useState("General");
  const [newTaskDependencies, setNewTaskDependencies] = useState<string[]>([]);

  // Dependency Linking Editor State
  const [editingDependenciesTaskId, setEditingDependenciesTaskId] = useState<string | null>(null);

  // Add Note State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTags, setNewNoteTags] = useState("");

  const spaceTasks = tasks.filter((t) => t.spaceId === activeSpace.id);
  const spaceNotes = notes.filter((n) => n.spaceId === activeSpace.id);
  const spaceMissions = missions.filter((m) => m.spaceId === activeSpace.id);

  const isTaskBlocked = (task: TaskItem) => {
    if (!task.dependencies || task.dependencies.length === 0) return false;
    return task.dependencies.some((depId) => {
      const depTask = tasks.find((t) => t.id === depId);
      return depTask && !depTask.completed;
    });
  };

  const getUncompletedDependencyNames = (task: TaskItem) => {
    if (!task.dependencies) return [];
    return task.dependencies
      .map((depId) => tasks.find((t) => t.id === depId))
      .filter((t): t is TaskItem => !!t && !t.completed)
      .map((t) => t.title);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(
      newTaskTitle.trim(),
      newTaskPriority,
      newTaskCategory,
      newTaskDependencies.length > 0 ? newTaskDependencies : undefined
    );
    setNewTaskTitle("");
    setNewTaskDependencies([]);
    setShowTaskModal(false);
  };

  const handleToggleDependencyInModal = (taskId: string) => {
    setNewTaskDependencies((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
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
          <button
            onClick={() => setActiveTab("subagent")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "subagent" ? "bg-amber-500 text-slate-950 font-bold" : "text-amber-400 hover:text-amber-300"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Sub-Agent Log</span>
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
              spaceTasks.map((task) => {
                const blocked = isTaskBlocked(task);
                const blockedByNames = getUncompletedDependencyNames(task);

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition space-y-2 ${
                      task.completed
                        ? "bg-slate-900/40 border-slate-800 text-slate-500 line-through"
                        : blocked
                        ? "bg-slate-900/90 border-rose-500/40 text-slate-200 shadow-md"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => onToggleTask(task.id)}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : blocked ? (
                          <Lock className="w-5 h-5 text-rose-400 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-semibold flex items-center gap-2">
                            <span>{task.title}</span>
                            {blocked && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-rose-400" />
                                <span>BLOCKED</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>Category: {task.category}</span>
                            {task.dependencies && task.dependencies.length > 0 && (
                              <span className="text-indigo-400 flex items-center gap-1">
                                <Link className="w-3 h-3" />
                                {task.dependencies.length} prerequisite(s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDependenciesTaskId(task.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-800 text-[10px] font-mono transition cursor-pointer flex items-center gap-1"
                          title="Link Prerequisite Task Dependencies"
                        >
                          <Link className="w-3 h-3 text-indigo-400" />
                          <span>Dependencies</span>
                        </button>

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
                    </div>

                    {/* Blocked Alert Banner if blocked */}
                    {blocked && (
                      <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] font-mono text-rose-300 flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>
                          Prerequisites pending: <strong className="text-white">{blockedByNames.join(", ")}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
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

      {activeTab === "subagent" && (
        <SubAgentDecisionLog />
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

              {/* Prerequisite Dependencies Selector */}
              {spaceTasks.length > 0 && (
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    Prerequisite Dependencies (Blocks this task until done)
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                    {spaceTasks.map((st) => (
                      <label
                        key={st.id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-900 cursor-pointer text-slate-300"
                      >
                        <input
                          type="checkbox"
                          checked={newTaskDependencies.includes(st.id)}
                          onChange={() => handleToggleDependencyInModal(st.id)}
                          className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                        />
                        <span className="truncate">{st.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

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

      {/* Edit Task Dependencies Linker Modal */}
      {editingDependenciesTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Link className="w-4 h-4 text-indigo-400" />
                <span>Link Task Prerequisites</span>
              </h3>
              <button
                onClick={() => setEditingDependenciesTaskId(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select tasks that must be completed before "
              <strong className="text-slate-200">
                {tasks.find((t) => t.id === editingDependenciesTaskId)?.title}
              </strong>
              " can be started.
            </p>

            <div className="max-h-48 overflow-y-auto space-y-1.5 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs">
              {spaceTasks
                .filter((st) => st.id !== editingDependenciesTaskId)
                .map((st) => {
                  const targetTask = tasks.find((t) => t.id === editingDependenciesTaskId);
                  const currentDeps = targetTask?.dependencies || [];
                  const isChecked = currentDeps.includes(st.id);

                  return (
                    <label
                      key={st.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 cursor-pointer text-slate-300"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const newDeps = isChecked
                              ? currentDeps.filter((id) => id !== st.id)
                              : [...currentDeps, st.id];
                            onUpdateTaskDependencies(editingDependenciesTaskId, newDeps);
                          }}
                          className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                        />
                        <span className="truncate">{st.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {st.completed ? "Completed" : "Pending"}
                      </span>
                    </label>
                  );
                })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setEditingDependenciesTaskId(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
              >
                Done
              </button>
            </div>
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
