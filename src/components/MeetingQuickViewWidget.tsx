import React, { useState } from "react";
import { CalendarEvent, Space } from "../types";
import { Video, Calendar, Clock, ExternalLink, Plus, Users, MapPin, CheckCircle } from "lucide-react";

interface MeetingQuickViewWidgetProps {
  events: CalendarEvent[];
  activeSpace: Space;
  onAddEvent?: (event: Omit<CalendarEvent, "id">) => void;
}

export const MeetingQuickViewWidget: React.FC<MeetingQuickViewWidgetProps> = ({
  events,
  activeSpace,
  onAddEvent,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("03:00 PM - 03:30 PM");
  const [newDate, setNewDate] = useState("Today");
  const [newJoinUrl, setNewJoinUrl] = useState("https://meet.google.com/om-quick-sync");

  const upcomingEvents = events.slice(0, 3);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (onAddEvent) {
      onAddEvent({
        title: newTitle.trim(),
        time: newTime,
        date: newDate,
        joinUrl: newJoinUrl.trim() || undefined,
        location: "Google Meet",
        spaceId: activeSpace.id,
        category: "Quick Sync",
      });
    }

    setNewTitle("");
    setShowAddModal(false);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Upcoming Meetings & Quick Join</span>
            </h3>
            <p className="text-xs text-slate-400">
              Context calendar synced with <strong className="text-indigo-300">{activeSpace.name}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add Meeting</span>
        </button>
      </div>

      {/* Add Modal / Drawer Inline */}
      {showAddModal && (
        <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3 text-xs animate-fade-in">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>Add Quick Meeting Event</span>
            <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <input
            type="text"
            required
            placeholder="Meeting Title (e.g., Code Review & Architecture Sync)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Time (e.g., 03:00 PM - 03:30 PM)"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Join URL"
              value={newJoinUrl}
              onChange={(e) => setNewJoinUrl(e.target.value)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Save Event
          </button>
        </form>
      )}

      {/* Meetings List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {upcomingEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between space-y-3 hover:border-indigo-500/40 transition-all shadow-md"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                  {evt.category || "Meeting"}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{evt.date}</span>
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-100 line-clamp-2 leading-snug">
                {evt.title}
              </h4>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{evt.time}</span>
              </div>

              {evt.attendees && evt.attendees.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate pt-1">
                  <Users className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{evt.attendees.join(", ")}</span>
                </div>
              )}
            </div>

            {/* Join Button */}
            <div className="pt-2 border-t border-slate-800/60">
              {evt.joinUrl ? (
                <a
                  href={evt.joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer hover:scale-[1.02]"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Video Call</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              ) : (
                <div className="text-center text-[11px] font-mono text-slate-500 italic py-1">
                  No video link provided
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
