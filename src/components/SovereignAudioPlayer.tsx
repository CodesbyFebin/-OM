import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  ListMusic,
  Sparkles,
  Plus,
  Trash2,
  X,
  Music,
  Wifi,
  Shuffle,
  Repeat,
} from "lucide-react";

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  duration: string; // e.g. "03:45"
  sourceType: "Radio Stream" | "Local Vault" | "Ambient Generator";
  streamUrl?: string;
  coverColor: string;
}

export const initialPlaylist: AudioTrack[] = [
  {
    id: "track-1",
    title: "Sovereign Alpha Waves 528Hz",
    artist: "OM Sacred Binaural Engine",
    duration: "12:00",
    sourceType: "Ambient Generator",
    coverColor: "from-amber-500 to-amber-700",
  },
  {
    id: "track-2",
    title: "Cyberpunk Zero-Knowledge Chill",
    artist: "Synthwave Local Radio",
    duration: "04:12",
    sourceType: "Radio Stream",
    coverColor: "from-purple-600 to-cyan-500",
  },
  {
    id: "track-3",
    title: "Deep Focus Coding Loop",
    artist: "MinIO Audio Vault",
    duration: "06:30",
    sourceType: "Local Vault",
    coverColor: "from-emerald-600 to-teal-800",
  },
  {
    id: "track-4",
    title: "Cosmic Solfeggio Frequency 432Hz",
    artist: "OM Meditation Core",
    duration: "15:00",
    sourceType: "Ambient Generator",
    coverColor: "from-rose-500 to-amber-600",
  },
];

interface SovereignAudioPlayerProps {
  compact?: boolean;
  onClose?: () => void;
}

export const SovereignAudioPlayer: React.FC<SovereignAudioPlayerProps> = ({
  compact = false,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [radioMode, setRadioMode] = useState(true);
  const [currentStation, setCurrentStation] = useState<string>("Sovereign Focus Radio");
  const [playlist, setPlaylist] = useState<AudioTrack[]>(initialPlaylist);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [progressPercent, setProgressPercent] = useState(35);
  const [queueOpen, setQueueOpen] = useState(!compact);
  const [newTrackTitle, setNewTrackTitle] = useState("");
  const [newTrackUrl, setNewTrackUrl] = useState("");

  const activeTrack = playlist[currentTrackIndex] || playlist[0];

  // Simulated playback progress increment
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 100) {
            handleNextTrack();
            return 0;
          }
          return prev + 0.5;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTrackIndex]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setProgressPercent(0);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setProgressPercent(0);
  };

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim()) return;

    const track: AudioTrack = {
      id: `track-${Date.now()}`,
      title: newTrackTitle,
      artist: "Local User Stream",
      duration: "03:30",
      sourceType: "Radio Stream",
      streamUrl: newTrackUrl || "http://127.0.0.1:9000/om-vault/stream.mp3",
      coverColor: "from-sky-500 to-indigo-600",
    };

    setPlaylist((prev) => [...prev, track]);
    setNewTrackTitle("");
    setNewTrackUrl("");
  };

  const handleRemoveTrack = (id: string) => {
    setPlaylist((prev) => prev.filter((t) => t.id !== id));
  };

  const radioStations = [
    { name: "Sovereign Focus Radio", desc: "Binaural 528Hz & Ambient Alpha", icon: Sparkles },
    { name: "Cyber Synthwave 24/7", desc: "Dark Retrowave Coding Beats", icon: Radio },
    { name: "MinIO Local Music Vault", desc: "FLAC/MP3 Files from Local S3", icon: Music },
    { name: "Lo-Fi Study Public Stream", desc: "Chillhop & Ambient Soundscapes", icon: Wifi },
  ];

  return (
    <div className={`p-4 rounded-2xl bg-slate-900/95 border border-amber-500/30 shadow-2xl space-y-4 text-slate-100 gold-glow ${compact ? 'text-xs' : ''}`}>
      {/* Player Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-100">Sovereign Radio & Audio Vault</h3>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {radioMode ? "Radio Mode" : "Queue Mode"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {radioMode ? currentStation : `Playlist Track ${currentTrackIndex + 1} of ${playlist.length}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRadioMode(!radioMode)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
              radioMode
                ? "bg-amber-500 text-slate-950 shadow"
                : "bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-700"
            }`}
          >
            {radioMode ? "Radio ON" : "Playlist ON"}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector / Stations */}
      {radioMode ? (
        <div className="grid grid-cols-2 gap-2">
          {radioStations.map((st) => {
            const Icon = st.icon;
            const isSelected = currentStation === st.name;

            return (
              <button
                key={st.name}
                onClick={() => {
                  setCurrentStation(st.name);
                  setIsPlaying(true);
                }}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                    : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-400" : "text-slate-400"}`} />
                <div className="truncate">
                  <div className="text-xs truncate">{st.name}</div>
                  <div className="text-[9px] text-slate-400 font-mono truncate">{st.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Active Track Display Card & Equalizer Visualizer */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
        {/* Cover Art Box */}
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeTrack.coverColor} flex items-center justify-center font-bold text-white shadow-md shrink-0 relative overflow-hidden`}
        >
          <Music className="w-6 h-6 text-white/80" />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-1 gap-0.5">
              <span className="w-1 bg-amber-300 h-3 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1 bg-amber-300 h-5 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1 bg-amber-300 h-2 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>

        {/* Info & Progress */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-100 truncate">{activeTrack.title}</h4>
            <span className="text-[10px] font-mono text-amber-400 font-bold">{activeTrack.duration}</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono truncate">{activeTrack.artist}</p>

          {/* Seek Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Playback Controls Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevTrack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer shadow-lg gold-glow"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={handleNextTrack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              setIsMuted(false);
            }}
            className="w-20 accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />

          <button
            onClick={() => setQueueOpen(!queueOpen)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              queueOpen
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
            title="Playlist Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Playlist Queue Drawer */}
      {queueOpen && (
        <div className="pt-3 border-t border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Playlist Queue ({playlist.length})</span>
            <span className="text-amber-400 font-normal">MinIO Local Synced</span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {playlist.map((t, idx) => (
              <div
                key={t.id}
                className={`p-2 rounded-xl border flex items-center justify-between transition ${
                  idx === currentTrackIndex
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold"
                    : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40"
                }`}
              >
                <div
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className="flex items-center gap-2 cursor-pointer truncate flex-1"
                >
                  <span className="text-[10px] text-slate-500 font-bold">{idx + 1}.</span>
                  <div className="truncate">
                    <div className="text-xs truncate">{t.title}</div>
                    <div className="text-[9px] text-slate-500 truncate">{t.artist}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{t.duration}</span>
                  {playlist.length > 1 && (
                    <button
                      onClick={() => handleRemoveTrack(t.id)}
                      className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Track Stream */}
          <form onSubmit={handleAddTrack} className="flex gap-2 pt-1">
            <input
              type="text"
              value={newTrackTitle}
              onChange={(e) => setNewTrackTitle(e.target.value)}
              placeholder="Add track title or audio URL..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
            />
            <button
              type="submit"
              disabled={!newTrackTitle.trim()}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Queue</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
