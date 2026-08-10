import React, { useState } from "react";
import {
  Flame,
  CheckCircle2,
  Plus,
  RotateCcw,
  Sparkles,
  Trophy,
  Calendar,
  CheckSquare,
  Link,
  Tag,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { HabitItem, TaskItem, Space } from "../types";
import { WeeklyActivityChart } from "./WeeklyActivityChart";

interface HabitDashboardProps {
  activeSpace: Space;
  habits: HabitItem[];
  tasks: TaskItem[];
  onToggleHabit: (habitId: string) => void;
  onAddHabit: (habit: Omit<HabitItem, "id" | "createdAt">) => void;
  onToggleTask: (taskId: string) => void;
  onAddNote?: (title: string, content: string, tags: string[]) => void;
}

export const HabitDashboard: React.FC<HabitDashboardProps> = ({
  activeSpace,
  habits,
  tasks,
  onToggleHabit,
  onAddHabit,
  onToggleTask,
}) => {
  const [filterSpaceOnly, setFilterSpaceOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Habit form fields
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Engineering");
  const [newFrequency, setNewFrequency] = useState<"daily" | "weekdays" | "weekly">("daily");
  const [selectedLinkedTask, setSelectedLinkedTask] = useState<string>("");

  const todayStr = new Date().toISOString().split("T")[0];

  const displayedHabits = habits.filter((h) => {
    if (filterSpaceOnly && h.spaceId !== activeSpace.id) return false;
    if (selectedCategory !== "all" && h.category.toLowerCase() !== selectedCategory.toLowerCase())
      return false;
    return true;
  });

  const categories = Array.from(new Set(habits.map((h) => h.category)));

  const totalCompletedToday = habits.filter((h) => h.completedToday).length;
  const totalStreakDays = habits.reduce((acc, h) => acc + h.streak, 0);
  const highestStreak = habits.length ? Math.max(...habits.map((h) => h.streak)) : 0;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddHabit({
      spaceId: activeSpace.id,
      title: newTitle.trim(),
      category: newCategory,
      frequency: newFrequency,
      streak: 0,
      bestStreak: 0,
      completedToday: false,
      history: {},
      linkedTaskId: selectedLinkedTask || undefined,
    });

    setNewTitle("");
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/80 to-slate-900 p-6 sm:p-8 border border-emerald-500/30 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Personal Habit Engine & Streak Tracker</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
              <span>Daily Habits & Task Momentum</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Build daily momentum with habit streak tracking integrated directly with <strong className="text-emerald-300 font-semibold">{activeSpace.name}</strong> task queues.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(!isCreateOpen)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 cursor-pointer hover:scale-[1.02] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Personal Habit</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 mt-6 text-xs font-mono">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <Flame className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[11px]">Today Completed</div>
              <div className="text-amber-400 font-bold text-sm">
                {totalCompletedToday} / {habits.length}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <div className="text-slate-400 text-[11px]">Best Active Streak</div>
              <div className="text-amber-300 font-bold text-sm">{highestStreak} Days 🔥</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[11px]">Total Combined Streaks</div>
              <div className="text-emerald-400 font-bold text-sm">{totalStreakDays} Days</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[11px]">Tasks Completed</div>
              <div className="text-indigo-300 font-bold text-sm">
                {tasks.filter((t) => t.completed).length} / {tasks.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Habit Creation Drawer */}
      {isCreateOpen && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-slate-900/95 rounded-3xl border border-emerald-500/40 p-6 space-y-4 shadow-2xl backdrop-blur-xl animate-fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Create New Daily Habit</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-mono text-slate-400 font-bold">Habit Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. 15-min Code Refactoring, Morning Meditation, Drink 2L Water..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-slate-400 font-bold">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Mindset">Mindset</option>
                <option value="Health">Health</option>
                <option value="Sovereignty">Sovereignty</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-slate-400 font-bold">Frequency</label>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="daily">Daily Every Day</option>
                <option value="weekdays">Weekdays Only (Mon-Fri)</option>
                <option value="weekly">Weekly Target</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-mono text-slate-400 font-bold">Link to Task (Optional)</label>
              <select
                value={selectedLinkedTask}
                onChange={(e) => setSelectedLinkedTask(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="">No linked task</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              Add Habit & Start Streak
            </button>
          </div>
        </form>
      )}

      {/* Embedded Recharts Weekly Summary Data Visualization Widget */}
      <WeeklyActivityChart tasks={tasks} habits={habits} />

      {/* Main Habits List & Space Filters */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800/80 p-6 space-y-5 shadow-xl backdrop-blur-md">
        {/* Controls & Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Daily Habits & Active Streaks</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <label className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={filterSpaceOnly}
                onChange={(e) => setFilterSpaceOnly(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-emerald-600"
              />
              <span>Filter by Active Space ({activeSpace.name})</span>
            </label>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Habit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedHabits.map((habit) => {
            const linkedTask = tasks.find((t) => t.id === habit.linkedTaskId);

            return (
              <div
                key={habit.id}
                className={`p-5 rounded-3xl transition-all space-y-4 shadow-lg ${
                  habit.completedToday
                    ? "glass-panel-golden gold-glow ring-1 ring-amber-500/40"
                    : "glass-panel hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-900 text-emerald-400 border border-slate-800">
                        {habit.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 capitalize">
                        • {habit.frequency}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <span>{habit.title}</span>
                    </h3>
                  </div>

                  <button
                    onClick={() => onToggleHabit(habit.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold font-mono transition cursor-pointer flex items-center gap-2 shrink-0 ${
                      habit.completedToday
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{habit.completedToday ? "Done Today" : "Mark Done"}</span>
                  </button>
                </div>

                {/* Streak Badge & Progress Row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold text-xs">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>{habit.streak} Day Streak</span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      Best: <strong className="text-slate-200">{habit.bestStreak}</strong> days
                    </div>
                  </div>

                  {/* History mini dots */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const dayVal = Object.values(habit.history)[idx] ?? habit.completedToday;
                      return (
                        <span
                          key={idx}
                          className={`w-2.5 h-2.5 rounded-full ${
                            dayVal ? "bg-emerald-400" : "bg-slate-800"
                          }`}
                          title={`Day ${idx + 1}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Linked Task Bar if linked */}
                {linkedTask && (
                  <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate text-slate-300">
                      <Link className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">Linked Task: {linkedTask.title}</span>
                    </div>

                    <button
                      onClick={() => onToggleTask(linkedTask.id)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                        linkedTask.completed
                          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {linkedTask.completed ? "Task Done" : "Complete Task"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
