import React, { useState, useEffect } from 'react';
import { TabType } from '../types';
import { 
  Clock, 
  Timer, 
  Headphones, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square,
  Download, 
  Terminal,
  Monitor,
  PanelLeft,
  PanelLeftClose,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { audioService } from '../services/audioService';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeSoundscape: string | null;
  activeTimerSeconds: number | null;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onToggleSoundscape: () => void;
  onOpenDataModal: () => void;
  onOpenScreensaver: () => void;
  onOpenStyleStudio: () => void;
}

const TAB_TITLES: Record<TabType, { name: string; category: string }> = {
  'standup': { name: 'Standup Sync', category: 'Workflow' },
  'checklist': { name: 'Check List', category: 'Workflow' },
  'todos': { name: 'Todo List', category: 'Workflow' },
  'calculator': { name: 'Dev Calculator', category: 'Toolkit' },
  'reminders': { name: 'Health & Routine Reminders', category: 'Toolkit' },
  'timer': { name: 'Focus Pomodoro', category: 'Toolkit' },
  'alarm': { name: 'Routine Alarms', category: 'Toolkit' },
  'music': { name: 'Focus Soundscapes', category: 'Focus' },
  'ai-chat': { name: 'AI Copilot (Thinking)', category: 'Engineering' },
  'profile': { name: 'Developed By: Ajith Kumar', category: 'About Developer' },
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  activeSoundscape,
  activeTimerSeconds,
  isTimerRunning,
  onToggleTimer,
  onToggleSoundscape,
  onOpenDataModal,
  onOpenScreensaver,
  onOpenStyleStudio,
}) => {
  const [localTime, setLocalTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [epochTime, setEpochTime] = useState<number>(Math.floor(Date.now() / 1000));
  const [isMuted, setIsMuted] = useState<boolean>(audioService.getMuted());

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
      setEpochTime(Math.floor(Date.now() / 1000));
    };

    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMuteToggle = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  const currentTabMeta = TAB_TITLES[activeTab] || { name: 'Workspace', category: 'Cockpit' };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      {/* Primary Engineering Ribbon */}
      <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
        {/* Left Side: Sidebar Toggle + Current Context Breadcrumbs + Telemetry */}
        <div className="flex items-center gap-3">
          {/* Sidebar Hide/Show Button */}
          <button
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              audioService.playBeep(750, 0.03);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              !isSidebarOpen
                ? 'bg-cyan-950/70 border-cyan-600/60 text-cyan-300 hover:bg-cyan-900/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isSidebarOpen ? 'Hide Vertical Tabs (Full Width)' : 'View / Open Vertical Tabs'}
          >
            <PanelLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSidebarOpen ? 'Hide Tabs' : 'View Tabs'}</span>
          </button>

          {/* Breadcrumb Context */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span className="hidden lg:inline text-slate-500">{currentTabMeta.category}</span>
            <ChevronRight className="hidden lg:inline w-3 h-3 text-slate-600" />
            <span className="text-white font-semibold flex items-center gap-1.5">
              <span>{currentTabMeta.name}</span>
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-3 text-[11px] font-mono text-slate-400 border-l border-slate-800/80 pl-3">
            <span>LOCAL: <span className="text-slate-200">{localTime}</span></span>
            <span>UTC: <span className="text-slate-300">{utcTime}</span></span>
            <span>EPOCH: <span className="text-amber-400/90 font-bold">{epochTime}</span></span>
          </div>
        </div>

        {/* Right Side: Screensaver Launch + Style Studio + Mini Timer / Audio + Data Backup */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* UI Style & Effects Studio Button */}
          <button
            onClick={() => {
              onOpenStyleStudio();
              audioService.playSuccessTone();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-700/50 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-mono transition-all shadow-sm active:scale-95 group"
            title="Customize Font & UI Atmosphere Effects"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden lg:inline">Style & Effects</span>
          </button>

          {/* Active Timer Pill */}
          {activeTimerSeconds !== null && (
            <div 
              onClick={() => setActiveTab('timer')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer transition-colors border text-xs font-mono ${
                isTimerRunning 
                  ? 'bg-amber-950/60 border-amber-600/60 text-amber-300 hover:border-amber-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
              title="Click to view timer"
            >
              <Timer className={`w-3.5 h-3.5 ${isTimerRunning ? 'animate-spin text-amber-400' : ''}`} />
              <span>
                {Math.floor(activeTimerSeconds / 60).toString().padStart(2, '0')}:
                {(activeTimerSeconds % 60).toString().padStart(2, '0')}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTimer();
                }}
                className="hover:text-white ml-0.5 p-0.5"
              >
                {isTimerRunning ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              </button>
            </div>
          )}

          {/* Active Ambient Music Pill */}
          {activeSoundscape && (
            <div 
              onClick={() => setActiveTab('music')}
              className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl cursor-pointer bg-gradient-to-r from-cyan-950/80 to-purple-950/80 border border-cyan-500/50 text-cyan-300 hover:border-cyan-400 transition-all text-xs font-mono shadow-md shadow-cyan-500/15"
              title="Music Playing - Click to view audio visualizer"
            >
              {/* Dancing mini equalizer */}
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-cyan-400 rounded-full animate-[bounce_0.6s_infinite] h-2.5" />
                <span className="w-0.5 bg-cyan-300 rounded-full animate-[bounce_0.4s_infinite_0.1s] h-1.5" />
                <span className="w-0.5 bg-cyan-400 rounded-full animate-[bounce_0.7s_infinite_0.2s] h-3" />
              </div>
              <Headphones className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="capitalize truncate max-w-[120px] font-semibold">{activeSoundscape.replace('-', ' ')}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSoundscape();
                }}
                className="hover:text-rose-400 ml-0.5 p-0.5"
                title="Stop audio"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
              </button>
            </div>
          )}

          {/* Master Mute Button */}
          <button
            onClick={handleMuteToggle}
            className={`p-1.5 rounded-lg border transition-colors ${
              isMuted 
                ? 'bg-rose-950/70 border-rose-800 text-rose-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Web Audio' : 'Mute Web Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Data Backup / Restore Modal Trigger */}
          <button
            onClick={onOpenDataModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono transition-colors"
            title="Export / Restore JSON Data"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Backup</span>
          </button>
        </div>
      </div>
    </header>
  );
};
