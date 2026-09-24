import React, { useState, useEffect, useMemo } from 'react';
import { audioService } from '../../services/audioService';
import { SOUNDSCAPE_TRACKS, TRACK_CATEGORIES } from './tracksData';
import { AudioVisualizer } from './AudioVisualizer';
import { 
  Headphones, 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sparkles, 
  Activity, 
  Search,
  Radio,
  Sliders,
  Filter,
  Flame,
  Zap,
  Music2
} from 'lucide-react';

interface RelaxingMusicPlayerProps {
  activeSoundscape: string | null;
  setActiveSoundscape: (id: string | null) => void;
}

export const RelaxingMusicPlayer: React.FC<RelaxingMusicPlayerProps> = ({
  activeSoundscape,
  setActiveSoundscape,
}) => {
  const [volume, setVolume] = useState<number>(audioService.getVolume());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState<number | null>(null);

  // Sleep timer countdown ticker
  useEffect(() => {
    let interval: any = null;
    if (sleepTimerSecondsLeft !== null && sleepTimerSecondsLeft > 0) {
      interval = setInterval(() => {
        setSleepTimerSecondsLeft((prev) => {
          if (prev && prev <= 1) {
            audioService.stopSoundscape();
            setActiveSoundscape(null);
            setSleepTimerMinutes(null);
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sleepTimerSecondsLeft, setActiveSoundscape]);

  const handleToggleTrack = (trackId: string) => {
    if (activeSoundscape === trackId) {
      audioService.stopSoundscape();
      setActiveSoundscape(null);
    } else {
      audioService.playSoundscape(trackId);
      setActiveSoundscape(trackId);
    }
  };

  const handleStopAll = () => {
    audioService.stopSoundscape();
    setActiveSoundscape(null);
    setSleepTimerSecondsLeft(null);
    setSleepTimerMinutes(null);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioService.setVolume(newVol);
  };

  const setSleepTimer = (mins: number) => {
    setSleepTimerMinutes(mins);
    setSleepTimerSecondsLeft(mins * 60);
    audioService.playBeep(900, 0.05);
  };

  const activeTrackObj = useMemo(() => {
    return SOUNDSCAPE_TRACKS.find((t) => t.id === activeSoundscape);
  }, [activeSoundscape]);

  // Filtered tracks based on category & search
  const filteredTracks = useMemo(() => {
    return SOUNDSCAPE_TRACKS.filter((track) => {
      const matchesCategory = selectedCategory === 'All' || track.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        track.title.toLowerCase().includes(query) ||
        track.subtitle.toLowerCase().includes(query) ||
        track.description.toLowerCase().includes(query) ||
        track.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. TOP HEADER & COCKPIT CONTROLS */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-cyan-950/40 border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className={`absolute top-0 right-1/4 w-96 h-32 blur-3xl pointer-events-none transition-all duration-700 ${
          activeSoundscape ? 'bg-cyan-500/20' : 'bg-slate-800/10'
        }`} />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
            <Headphones className="w-4 h-4 text-cyan-400" />
            <span className="tracking-widest uppercase font-semibold">
              DevPulse Audio Cockpit • 31 Synthesized Soundscapes
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Focus Music & Neurological Soundscapes</span>
            {activeSoundscape && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                ACTIVE PLAYBACK
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            100% procedurally synthesized Web Audio. Zero external network streams, zero ads, uninterrupted deep work flow.
          </p>
        </div>

        {/* Master Control Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/90 p-2.5 rounded-2xl border border-slate-800 shadow-lg relative z-10">
          {/* Master Volume Slider */}
          <div className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-slate-300">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-24 sm:w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="w-9 text-right font-bold text-white">{Math.round(volume * 100)}%</span>
          </div>

          {/* Sleep Timer Selector */}
          <div className="flex items-center gap-1 text-xs font-mono border-l border-slate-800 pl-3">
            {sleepTimerSecondsLeft !== null ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-semibold">
                <Moon className="w-3.5 h-3.5" />
                <span>
                  {Math.floor(sleepTimerSecondsLeft / 60)}:
                  {(sleepTimerSecondsLeft % 60).toString().padStart(2, '0')}
                </span>
                <button
                  onClick={() => { setSleepTimerSecondsLeft(null); setSleepTimerMinutes(null); }}
                  className="hover:text-rose-400 ml-1 text-slate-400"
                  title="Cancel sleep timer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-slate-400">
                <Moon className="w-3.5 h-3.5 mr-1" />
                {[15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setSleepTimer(mins)}
                    className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-300 text-[11px] transition-colors"
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeSoundscape && (
            <button
              onClick={handleStopAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/90 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-mono font-bold shadow-lg transition-all active:scale-95 cursor-pointer ml-1"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop All</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. REAL-TIME AUDIO VISUALIZER & PLAYING EFFECTS STAGE */}
      <AudioVisualizer
        isPlaying={!!activeSoundscape}
        trackTitle={activeTrackObj?.title}
        trackCategory={activeTrackObj?.category}
        bpm={activeTrackObj?.bpm}
      />

      {/* 3. SEARCH & CATEGORY FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {TRACK_CATEGORIES.map((cat) => {
            const count = cat === 'All' 
              ? SOUNDSCAPE_TRACKS.length 
              : SOUNDSCAPE_TRACKS.filter((t) => t.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                    : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-slate-950/30 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 31 tracks (rain, lofi, techno...)"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 4. TRACKS GRID WITH LIVE PLAYING EFFECTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTracks.map((track) => {
          const isPlaying = activeSoundscape === track.id;
          return (
            <div
              key={track.id}
              className={`flex flex-col justify-between p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                isPlaying
                  ? 'bg-gradient-to-br from-cyan-950/50 via-slate-900 to-slate-950 border-cyan-500/70 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Animated corner glow when playing */}
              {isPlaying && (
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/20 blur-2xl pointer-events-none animate-pulse" />
              )}

              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                    isPlaying ? 'text-cyan-300' : 'text-slate-400'
                  }`}>
                    {track.category}
                  </span>

                  {track.bpm && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                      {track.bpm} BPM
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white leading-snug tracking-tight">
                    {track.title}
                  </h3>

                  {/* Dancing Equalizer Bars Indicator when playing */}
                  {isPlaying && (
                    <div className="flex items-end gap-0.5 h-4 shrink-0 bg-cyan-950 px-1.5 py-1 rounded border border-cyan-800">
                      <span className="w-1 bg-cyan-400 rounded-full animate-[bounce_0.6s_infinite] h-3" />
                      <span className="w-1 bg-cyan-300 rounded-full animate-[bounce_0.4s_infinite_0.15s] h-2" />
                      <span className="w-1 bg-cyan-400 rounded-full animate-[bounce_0.75s_infinite_0.3s] h-3.5" />
                    </div>
                  )}
                </div>

                <p className={`text-xs font-medium ${isPlaying ? 'text-cyan-200' : 'text-slate-300'}`}>
                  {track.subtitle}
                </p>

                <p className="text-xs text-slate-400 leading-relaxed pt-1">
                  {track.description}
                </p>
              </div>

              {/* Action Button & Status Bar */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  {isPlaying ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Audio Playing</span>
                    </span>
                  ) : (
                    <span className="text-slate-500">Offline Synth</span>
                  )}
                </div>

                <button
                  onClick={() => handleToggleTrack(track.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                    isPlaying
                      ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Track</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTracks.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
          <Music2 className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-mono text-slate-300">No tracks match "{searchQuery}"</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-cyan-400 hover:text-white"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
