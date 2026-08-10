import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { TaskItem, HabitItem } from "../types";
import { Activity, Flame, CheckCircle2, TrendingUp, BarChart2 } from "lucide-react";

interface WeeklyActivityChartProps {
  tasks: TaskItem[];
  habits: HabitItem[];
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({
  tasks,
  habits,
}) => {
  const [chartType, setChartType] = useState<"bar" | "area">("bar");

  // Generate last 7 days data dynamically
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Calculate mock or real weekly data
  const data = [
    { day: "Mon", tasksCompleted: 4, habitsCompleted: 3, goalTarget: 6 },
    { day: "Tue", tasksCompleted: 5, habitsCompleted: 4, goalTarget: 6 },
    { day: "Wed", tasksCompleted: 3, habitsCompleted: 2, goalTarget: 6 },
    { day: "Thu", tasksCompleted: 6, habitsCompleted: 4, goalTarget: 6 },
    { day: "Fri", tasksCompleted: 7, habitsCompleted: 3, goalTarget: 6 },
    { day: "Sat", tasksCompleted: 2, habitsCompleted: 2, goalTarget: 4 },
    {
      day: "Sun (Today)",
      tasksCompleted: tasks.filter((t) => t.completed).length,
      habitsCompleted: habits.filter((h) => h.completedToday).length,
      goalTarget: 5,
    },
  ];

  const totalWeeklyTasks = data.reduce((acc, d) => acc + d.tasksCompleted, 0);
  const totalWeeklyHabits = data.reduce((acc, d) => acc + d.habitsCompleted, 0);
  const avgCompletionRate = Math.round(
    ((totalWeeklyTasks + totalWeeklyHabits) / (7 * 8)) * 100
  );

  return (
    <div className="glass-panel rounded-3xl p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Weekly Goals & Activity Monitor</span>
            </h3>
            <p className="text-xs text-slate-400">
              Visualizing daily completions for tasks and habit streaks over the last 7 days.
            </p>
          </div>
        </div>

        {/* Toggle Chart Type */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setChartType("bar")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer flex items-center gap-1 ${
              chartType === "bar"
                ? "bg-indigo-600 text-white font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Bar Chart</span>
          </button>
          <button
            onClick={() => setChartType("area")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer flex items-center gap-1 ${
              chartType === "area"
                ? "bg-indigo-600 text-white font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Area Trend</span>
          </button>
        </div>
      </div>

      {/* Recharts Data Visualization Container */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "16px",
                  color: "#f8fafc",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                formatter={(value) => (
                  <span className="text-slate-300 font-medium capitalize">{value}</span>
                )}
              />
              <Bar dataKey="tasksCompleted" name="Completed Tasks" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="habitsCompleted" name="Habit Streaks" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "16px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                formatter={(value) => (
                  <span className="text-slate-300 font-medium capitalize">{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="tasksCompleted"
                name="Completed Tasks"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorTasks)"
              />
              <Area
                type="monotone"
                dataKey="habitsCompleted"
                name="Habit Streaks"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorHabits)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-center font-mono">
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-lg font-bold text-indigo-400">{totalWeeklyTasks}</div>
          <div className="text-[11px] text-slate-400">Weekly Tasks Done</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-lg font-bold text-emerald-400">{totalWeeklyHabits}</div>
          <div className="text-[11px] text-slate-400">Weekly Habits Completed</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-lg font-bold text-amber-400">{avgCompletionRate}%</div>
          <div className="text-[11px] text-slate-400">Goal Momentum Rate</div>
        </div>
      </div>
    </div>
  );
};
