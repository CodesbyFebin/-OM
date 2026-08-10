import React, { useState } from "react";
import { DailyGoal, TaskItem, HabitItem, Space } from "../types";
import { Target, CheckCircle2, Plus, Sparkles, Flame, CheckSquare, Edit3, Trophy, Zap } from "lucide-react";

interface DailyGoalsCardProps {
  goals: DailyGoal[];
  tasks: TaskItem[];
  habits: HabitItem[];
  activeSpace: Space;
  onToggleGoal: (goalId: string) => void;
  onAddGoal: (goal: Omit<DailyGoal, "id">) => void;
}

export const DailyGoalsCard: React.FC<DailyGoalsCardProps> = ({
  goals,
  tasks,
  habits,
  activeSpace,
  onToggleGoal,
  onAddGoal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"High Impact" | "Mission Milestone" | "Personal Growth">("High Impact");
  const [selectedLinkedTask, setSelectedLinkedTask] = useState("");
  const [selectedLinkedHabit, setSelectedLinkedHabit] = useState("");

  const completedCount = goals.filter((g) => g.completed).length;
  const totalGoals = goals.length;
  const progressPct = totalGoals > 0 ? Math.round((completedCount / totalGoals) * 100) : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddGoal({
      title: newTitle.trim(),
      completed: false,
      spaceId: activeSpace.id,
      linkedTaskId: selectedLinkedTask || undefined,
      linkedHabitId: selectedLinkedHabit || undefined,
      category: newCategory,
    });

    setNewTitle("");
    setShowAddModal(false);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel-golden p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Daily High-Impact Mission Goals</span>
              {completedCount === totalGoals && totalGoals > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>ALL GOALS COMPLETED</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Focus on up to 3 vital outcomes for today linked directly to tasks & habits.
            </p>
          </div>
        </div>

        {totalGoals < 3 && (
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal ({3 - totalGoals} left)</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Daily Goal Completion</span>
          <span className="font-bold text-emerald-400">
            {completedCount} / {totalGoals} ({progressPct}%)
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <form onSubmit={handleAddSubmit} className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3 text-xs animate-fade-in">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>Define High-Impact Daily Goal</span>
            <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <input
            type="text"
            required
            placeholder="Goal Title (e.g. Verify Docker Local Build & API Health)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 font-mono">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
              >
                <option value="High Impact">High Impact</option>
                <option value="Mission Milestone">Mission Milestone</option>
                <option value="Personal Growth">Personal Growth</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-mono">Link Task (Optional)</label>
              <select
                value={selectedLinkedTask}
                onChange={(e) => setSelectedLinkedTask(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
              >
                <option value="">None</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-mono">Link Habit (Optional)</label>
              <select
                value={selectedLinkedHabit}
                onChange={(e) => setSelectedLinkedHabit(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
              >
                <option value="">None</option>
                {habits.map((h) => (
                  <option key={h.id} value={h.id}>{h.title}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Save Goal
          </button>
        </form>
      )}

      {/* Goals Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {goals.map((goal) => {
          const linkedTask = tasks.find((t) => t.id === goal.linkedTaskId);
          const linkedHabit = habits.find((h) => h.id === goal.linkedHabitId);

          return (
            <div
              key={goal.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 shadow-md ${
                goal.completed
                  ? "bg-emerald-950/20 border-emerald-500/40"
                  : "bg-slate-950/80 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-900 text-emerald-400 border border-slate-800">
                  {goal.category}
                </span>

                <button
                  onClick={() => onToggleGoal(goal.id)}
                  className={`p-1.5 rounded-xl transition cursor-pointer ${
                    goal.completed
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                  }`}
                  title={goal.completed ? "Mark incomplete" : "Mark completed"}
                >
                  <CheckCircle2 className={`w-5 h-5 ${goal.completed ? "fill-emerald-500 text-slate-950" : ""}`} />
                </button>
              </div>

              <h4 className={`font-bold text-sm leading-snug ${goal.completed ? "line-through text-slate-400" : "text-slate-100"}`}>
                {goal.title}
              </h4>

              {/* Linked indicators */}
              <div className="space-y-1.5 pt-1 border-t border-slate-800/60 text-[11px] font-mono">
                {linkedTask && (
                  <div className="flex items-center gap-1.5 text-indigo-300 truncate">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">Task: {linkedTask.title}</span>
                    {linkedTask.completed && (
                      <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-300 rounded">Done</span>
                    )}
                  </div>
                )}

                {linkedHabit && (
                  <div className="flex items-center gap-1.5 text-amber-300 truncate">
                    <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">Habit: {linkedHabit.title}</span>
                    {linkedHabit.completedToday && (
                      <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded">Done</span>
                    )}
                  </div>
                )}

                {!linkedTask && !linkedHabit && (
                  <div className="text-slate-500 text-[10px] italic">Direct High-Impact Goal</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
