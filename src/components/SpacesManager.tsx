import React, { useState } from "react";
import {
  Layers,
  Plus,
  RotateCw,
  ShieldCheck,
  CheckCircle2,
  Rocket,
  Code2,
  Compass,
  Server,
  ArrowRight,
  Clock,
  Sparkles,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Space, Mission } from "../types";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from "recharts";

interface SpacesManagerProps {
  spaces: Space[];
  activeSpace: Space;
  onSelectSpace: (spaceId: string) => void;
  onCreateSpace: (name: string, description: string) => void;
  missions: Mission[];
}

export const SpacesManager: React.FC<SpacesManagerProps> = ({
  spaces,
  activeSpace,
  onSelectSpace,
  onCreateSpace,
  missions,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceDesc, setNewSpaceDesc] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSpaceName.trim()) {
      onCreateSpace(newSpaceName.trim(), newSpaceDesc.trim());
      setNewSpaceName("");
      setNewSpaceDesc("");
      setShowCreateModal(false);
    }
  };

  const getSpaceIcon = (iconName: string) => {
    switch (iconName) {
      case "Code2":
        return <Code2 className="w-5 h-5" />;
      case "Compass":
        return <Compass className="w-5 h-5" />;
      case "Rocket":
        return <Rocket className="w-5 h-5" />;
      case "Server":
        return <Server className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  const generateSparkline = (sp: Space) => {
    const seed = sp.tabsCount + sp.tasksCount * 2 + sp.memoryCount * 3;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, idx) => {
      const tabsOpened = Math.max(1, (seed + idx * 3) % 7);
      const tasksCompleted = Math.max(0, (seed + idx * 2) % 5);
      const memoryAdded = Math.max(0, (seed + idx * 4) % 6);
      return {
        day,
        tabsOpened,
        tasksCompleted,
        memoryAdded,
        intensity: tabsOpened + tasksCompleted * 2 + memoryAdded * 3,
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            <span>Spaces & Context Restoration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Isolate your work into distinct universes. Selecting a Space instantly restores browser tabs, notes, terminal sessions, and tasks.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Private Space</span>
        </button>
      </div>

      {/* Spaces Grid - Bento Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {spaces.map((sp) => {
          const isActive = sp.id === activeSpace.id;
          const spaceMissions = missions.filter((m) => m.spaceId === sp.id);

          return (
            <div
              key={sp.id}
              className={`rounded-3xl border p-6 space-y-5 transition-all backdrop-blur-md shadow-xl ${
                isActive
                  ? "bg-slate-900/90 border-indigo-500/60 shadow-2xl ring-1 ring-indigo-500/30"
                  : "bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:scale-[1.01]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg font-bold text-xl"
                    style={{ backgroundColor: sp.color }}
                  >
                    🕉
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-100">{sp.name}</h3>
                      
                      {/* Mini inline sparkline chart directly next to space name */}
                      <div className="w-24 h-6 px-1.5 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-1" title="7-Day Activity Intensity (Tasks, Notes, Memory)">
                        <Activity className="w-3 h-3 text-indigo-400 shrink-0" />
                        <div className="w-full h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={generateSparkline(sp)}>
                              <Area
                                type="monotone"
                                dataKey="intensity"
                                stroke={sp.color}
                                fill={sp.color}
                                fillOpacity={0.3}
                                strokeWidth={1.5}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{sp.description}</p>
                  </div>
                </div>
              </div>

              {/* Context Breakdown - Bento Metric Strip */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono py-2.5 bg-slate-950/70 rounded-2xl border border-slate-800/80">
                <div>
                  <div className="text-indigo-400 font-bold text-sm">{sp.tabsCount}</div>
                  <div className="text-[10px] text-slate-400">Tabs</div>
                </div>
                <div>
                  <div className="text-emerald-400 font-bold text-sm">{sp.notesCount}</div>
                  <div className="text-[10px] text-slate-400">Notes</div>
                </div>
                <div>
                  <div className="text-amber-400 font-bold text-sm">{sp.tasksCount}</div>
                  <div className="text-[10px] text-slate-400">Tasks</div>
                </div>
                <div>
                  <div className="text-purple-400 font-bold text-sm">{sp.memoryCount}</div>
                  <div className="text-[10px] text-slate-400">Memory</div>
                </div>
              </div>

              {/* 7-Day Sparkline Intensity Mini Chart */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>7-Day Activity Intensity Sparkline</span>
                  </span>
                  <span className="text-indigo-300 text-[10px]">Tabs • Tasks • Memory</span>
                </div>
                <div className="h-16 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generateSparkline(sp)}>
                      <defs>
                        <linearGradient id={`sparkGrad-${sp.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={sp.color} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={sp.color} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          fontSize: "11px",
                          color: "#f8fafc",
                          padding: "6px 10px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="intensity"
                        name="Activity Intensity"
                        stroke={sp.color}
                        fill={`url(#sparkGrad-${sp.id})`}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Space Missions List */}
              {spaceMissions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Space Missions
                  </div>
                  <div className="space-y-2">
                    {spaceMissions.map((m) => (
                      <div key={m.id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-medium text-slate-200">
                          <span>{m.title}</span>
                          <span className="text-[10px] font-mono text-indigo-400">{m.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full transition-all"
                            style={{ width: `${m.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Last active: {sp.lastActiveTime}</span>
                </span>

                <button
                  onClick={() => onSelectSpace(sp.id)}
                  disabled={isActive}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-slate-800 text-slate-400 cursor-default"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isActive ? "Currently Active" : "Resume Universe Context"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating New Space */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 space-y-4 text-slate-100">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>Create New Private Space</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Space Name</label>
                <input
                  type="text"
                  required
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="e.g., Client Alpha, Research Space"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newSpaceDesc}
                  onChange={(e) => setNewSpaceDesc(e.target.value)}
                  placeholder="Brief purpose of this space..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  Initialize Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
