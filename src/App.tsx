/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { TabType, Task, AlarmItem, ReminderItem } from './types';
import { storageService } from './services/storageService';
import { audioService } from './services/audioService';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/navigation/Sidebar';
import { ScreenSaver } from './components/screensaver/ScreenSaver';
import { StandupGenerator } from './components/standup/StandupGenerator';
import { TodoList } from './components/todo/TodoList';
import { DevCalculator } from './components/calculator/DevCalculator';
import { ChecklistHub } from './components/checklist/ChecklistHub';
import { ReminderManager } from './components/reminders/ReminderManager';
import { ReminderAlertModal } from './components/reminders/ReminderAlertModal';
import { TimerModule } from './components/timer/TimerModule';
import { AlarmManager } from './components/alarm/AlarmManager';
import { RelaxingMusicPlayer } from './components/music/RelaxingMusicPlayer';
import { ApiWorkbench } from './components/api/ApiWorkbench';
import { SnippetVault } from './components/snippets/SnippetVault';
import { ArchitectureStudio } from './components/diagrams/ArchitectureStudio';
import { AIChatPage } from './components/ai/AIChatPage';
import { DeveloperProfile } from './components/profile/DeveloperProfile';
import { DataModal } from './components/modals/DataModal';
import { StyleStudioModal, UIStyleConfig, ACCENT_COLOR_MAP, FONT_OPTIONS } from './components/modals/StyleStudioModal';
import { PanelLeftOpen } from 'lucide-react';

const DEFAULT_STYLE_CONFIG: UIStyleConfig = {
  fontFamily: 'jakarta',
  accentColor: 'cyan',
  bgTone: 'slate',
  uiScale: 'balanced',
  enableCyberGrid: true,
  enableAmbientSpotlight: true,
  enableCrtScanlines: false,
  enableGlassCards: true,
  enableNeonGlow: true,
  enableAnimatedStars: false,
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('standup');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [standupDraft, setStandupDraft] = useState<any>(null);

  // UI Style & Effects Configuration
  const [styleConfig, setStyleConfig] = useState<UIStyleConfig>(() => {
    try {
      const saved = localStorage.getItem('devpulse_style_config_v1');
      return saved ? JSON.parse(saved) : DEFAULT_STYLE_CONFIG;
    } catch {
      return DEFAULT_STYLE_CONFIG;
    }
  });
  const [isStyleStudioOpen, setIsStyleStudioOpen] = useState<boolean>(false);

  // Active Reminder Alert Popup
  const [activeReminderAlert, setActiveReminderAlert] = useState<ReminderItem | null>(null);

  // Sidebar Layout State (Persisted in localStorage)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('devpulse_sidebar_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('devpulse_sidebar_collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Screensaver State
  const [isScreensaverActive, setIsScreensaverActive] = useState<boolean>(false);
  const idleTimerRef = useRef<any>(null);

  // Global Audio / Timer / Alarm states
  const [activeSoundscape, setActiveSoundscape] = useState<string | null>(null);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);
  const [selectedTaskForTimer, setSelectedTaskForTimer] = useState<Task | null>(null);

  // Backup / Data modal
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);

  // Sync style configuration to CSS variables and document
  // Persist style configuration
  useEffect(() => {
    localStorage.setItem('devpulse_style_config_v1', JSON.stringify(styleConfig));
  }, [styleConfig]);

  // Save sidebar preferences
  useEffect(() => {
    localStorage.setItem('devpulse_sidebar_open', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('devpulse_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Dynamic Browser Tab Title synchronized with active module, focus timer, and soundscapes
  useEffect(() => {
    const tabLabels: Record<TabType, string> = {
      standup: 'Standup Sync',
      checklist: 'Deployment Checklist',
      todos: 'Task Kanban',
      calculator: 'Dev Calculator',
      reminders: 'Smart Reminders',
      timer: 'Focus Timer',
      alarm: 'Routine Alarms',
      music: 'Focus Soundscapes',
      'api-client': 'REST Workbench',
      snippets: 'Git & Snippets',
      diagrams: 'Architecture Flow',
      'ai-chat': 'AI Copilot',
      profile: 'Developer Profile',
    };

    const currentLabel = tabLabels[currentTab] || 'IT Cockpit';

    if (isTimerRunning && activeTimerSeconds !== null) {
      const mins = Math.floor(activeTimerSeconds / 60);
      const secs = (activeTimerSeconds % 60).toString().padStart(2, '0');
      document.title = `(${mins}:${secs}) ${currentLabel} • DevPulse`;
    } else if (activeSoundscape) {
      document.title = `♪ ${currentLabel} • DevPulse Cockpit`;
    } else {
      document.title = `${currentLabel} | DevPulse - Daily IT Engineer Cockpit`;
    }
  }, [currentTab, isTimerRunning, activeTimerSeconds, activeSoundscape]);

  // Load initial workspace data
  useEffect(() => {
    loadWorkspaceData();
  }, []);

  const loadWorkspaceData = () => {
    setTasks(storageService.getTasks());
    setStandupDraft(storageService.getStandupDraft());
  };

  // Background reminder scheduler and checker
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const nowTimestamp = now.getTime();

      const reminders = storageService.getReminders();
      let hasUpdates = false;

      for (const r of reminders) {
        if (!r.enabled) continue;

        let shouldTrigger = false;

        if (r.type === 'scheduled' && r.scheduledTime === currentTimeStr) {
          const lastTriggeredTime = r.lastTriggered ? new Date(r.lastTriggered).getTime() : 0;
          if (nowTimestamp - lastTriggeredTime > 65000) {
            shouldTrigger = true;
          }
        } else if (r.type === 'interval' && r.intervalMinutes) {
          const lastTriggeredTime = r.lastTriggered ? new Date(r.lastTriggered).getTime() : 0;
          const intervalMs = r.intervalMinutes * 60 * 1000;
          if (!r.lastTriggered) {
            r.lastTriggered = new Date().toISOString();
            hasUpdates = true;
          } else if (nowTimestamp - lastTriggeredTime >= intervalMs) {
            shouldTrigger = true;
          }
        }

        if (shouldTrigger) {
          r.lastTriggered = new Date().toISOString();
          hasUpdates = true;
          audioService.playReminderSound(r.sound);
          setActiveReminderAlert(r);
          break; // show one alert at a time
        }
      }

      if (hasUpdates) {
        storageService.saveReminders(reminders);
      }
    };

    const interval = setInterval(checkReminders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCompleteReminderAlert = (reminder: ReminderItem) => {
    const reminders = storageService.getReminders();
    const updated = reminders.map((r) => {
      if (r.id === reminder.id) {
        return {
          ...r,
          completionsToday: r.completionsToday + 1,
          lastTriggered: new Date().toISOString(),
        };
      }
      return r;
    });
    storageService.saveReminders(updated);
    if (reminder.id === 'rem-water') {
      const currentWater = storageService.getWaterIntake();
      storageService.saveWaterIntake(currentWater.count + 1);
    }
    setActiveReminderAlert(null);
  };

  const handleSnoozeReminderAlert = (reminder: ReminderItem, minutes = 10) => {
    const reminders = storageService.getReminders();
    const updated = reminders.map((r) => {
      if (r.id === reminder.id) {
        const intervalMs = (r.intervalMinutes || 45) * 60 * 1000;
        const snoozeAdjust = intervalMs - (minutes * 60 * 1000);
        return {
          ...r,
          lastTriggered: new Date(Date.now() - snoozeAdjust).toISOString(),
        };
      }
      return r;
    });
    storageService.saveReminders(updated);
    setActiveReminderAlert(null);
  };

  // Idle Screensaver Detector (triggers after 8 minutes of total inactivity)
  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setIsScreensaverActive(true);
      }, 480000);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach((ev) => window.removeEventListener(ev, resetIdleTimer));
    };
  }, []);

  const handleSelectTaskForTimer = (task: Task) => {
    setSelectedTaskForTimer(task);
    setCurrentTab('timer');
    audioService.playBeep(850, 0.04);
  };

  const handleGlobalTimerUpdate = (secondsLeft: number | null, isRunning: boolean) => {
    setActiveTimerSeconds(secondsLeft);
    setIsTimerRunning(isRunning);
  };

  const handleToggleTimerFromNav = () => {
    setCurrentTab('timer');
  };

  const handleToggleSoundscapeFromNav = () => {
    if (activeSoundscape) {
      audioService.stopSoundscape();
      setActiveSoundscape(null);
    } else {
      setCurrentTab('music');
    }
  };

  // Live UI Style Synchronization
  useEffect(() => {
    try {
      const root = document.documentElement;
      const accent = ACCENT_COLOR_MAP[styleConfig.accentColor] || ACCENT_COLOR_MAP.cyan;
      const font = FONT_OPTIONS.find((f) => f.id === styleConfig.fontFamily) || FONT_OPTIONS[0];

      root.style.setProperty('--color-accent', accent.hex);
      root.style.setProperty('--color-accent-rgb', accent.rgb);
      root.style.setProperty('--font-primary', font.cssFont);
      root.style.setProperty('--font-heading', font.cssFont);

      localStorage.setItem('devpulse_style_config_v1', JSON.stringify(styleConfig));
    } catch (e) {
      console.error('Failed to sync style variables', e);
    }
  }, [styleConfig]);

  const getSpotlightClass = () => {
    switch (styleConfig.accentColor) {
      case 'emerald': return 'bg-radial-spotlight-emerald';
      case 'purple': return 'bg-radial-spotlight-purple';
      case 'amber': return 'bg-radial-spotlight-amber';
      case 'rose': return 'bg-radial-spotlight-rose';
      case 'blue': return 'bg-radial-spotlight-blue';
      case 'orange': return 'bg-radial-spotlight-orange';
      case 'crimson': return 'bg-radial-spotlight-crimson';
      case 'cyan':
      default: return 'bg-radial-spotlight-cyan';
    }
  };

  return (
    <div 
      className={`min-h-screen text-slate-100 flex flex-row relative transition-colors duration-300 font-fam-${styleConfig.fontFamily} bg-tone-${styleConfig.bgTone || 'slate'} ui-density-${styleConfig.uiScale || 'balanced'} ${
        styleConfig.enableCyberGrid ? 'bg-cyber-grid' : ''
      }`}
    >
      {/* Animated Cosmic Starfield Particles (if toggled) */}
      {styleConfig.enableAnimatedStars && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className="star-particle absolute rounded-full bg-white"
              style={{
                top: `${(i * 19) % 100}%`,
                left: `${(i * 29) % 100}%`,
                width: `${(i % 3) + 1.5}px`,
                height: `${(i % 3) + 1.5}px`,
                animationDelay: `${(i * 0.35) % 4}s`,
                opacity: 0.3 + (i % 4) * 0.15,
              }}
            />
          ))}
        </div>
      )}

      {/* Dynamic Ambient Spotlight Glow */}
      {styleConfig.enableAmbientSpotlight && (
        <div 
          className={`absolute top-0 left-0 right-0 h-96 pointer-events-none transition-all duration-700 ${getSpotlightClass()}`} 
        />
      )}

      {/* Retro CRT Scanline Shader Overlay (if toggled) */}
      {styleConfig.enableCrtScanlines && (
        <div className="fixed inset-0 crt-scanlines z-50 pointer-events-none opacity-30" />
      )}

      {/* 1. VERTICAL NAVIGATION SIDEBAR (Collapsible & Hideable) */}
      <Sidebar
        activeTab={currentTab}
        setActiveTab={setCurrentTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenScreensaver={() => setIsScreensaverActive(true)}
        activeSoundscape={activeSoundscape}
        activeTimerSeconds={activeTimerSeconds}
        isTimerRunning={isTimerRunning}
      />

      {/* 2. MAIN APPLICATION WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
        {/* Top Header / Command Ribbon */}
        <Navbar
          activeTab={currentTab}
          setActiveTab={setCurrentTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeSoundscape={activeSoundscape}
          activeTimerSeconds={activeTimerSeconds}
          isTimerRunning={isTimerRunning}
          onToggleTimer={handleToggleTimerFromNav}
          onToggleSoundscape={handleToggleSoundscapeFromNav}
          onOpenDataModal={() => setIsDataModalOpen(true)}
          onOpenScreensaver={() => setIsScreensaverActive(true)}
          onOpenStyleStudio={() => setIsStyleStudioOpen(true)}
        />

        {/* Main Workspace Stage */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto pb-20">
          {currentTab === 'standup' && (
            <StandupGenerator
              tasks={tasks}
              onTaskUpdated={loadWorkspaceData}
            />
          )}

          {currentTab === 'checklist' && (
            <ChecklistHub />
          )}

          {currentTab === 'todos' && (
            <TodoList
              tasks={tasks}
              setTasks={setTasks}
              onSelectTaskForTimer={handleSelectTaskForTimer}
            />
          )}

          {currentTab === 'reminders' && (
            <ReminderManager
              onTriggerGlobalAlert={(reminder) => setActiveReminderAlert(reminder)}
            />
          )}

          {currentTab === 'calculator' && (
            <DevCalculator />
          )}

          {currentTab === 'timer' && (
            <TimerModule
              tasks={tasks}
              setTasks={setTasks}
              selectedTaskForTimer={selectedTaskForTimer}
              setSelectedTaskForTimer={setSelectedTaskForTimer}
              onGlobalTimerUpdate={handleGlobalTimerUpdate}
            />
          )}

          {currentTab === 'alarm' && (
            <AlarmManager
              ringingAlarm={ringingAlarm}
              setRingingAlarm={setRingingAlarm}
            />
          )}

          {currentTab === 'music' && (
            <RelaxingMusicPlayer
              activeSoundscape={activeSoundscape}
              setActiveSoundscape={setActiveSoundscape}
            />
          )}

          {currentTab === 'api-client' && (
            <ApiWorkbench />
          )}

          {currentTab === 'snippets' && (
            <SnippetVault />
          )}

          {currentTab === 'diagrams' && (
            <ArchitectureStudio />
          )}

          {currentTab === 'ai-chat' && (
            <AIChatPage
              tasks={tasks}
              standupDraft={standupDraft}
            />
          )}

          {currentTab === 'profile' && (
            <DeveloperProfile />
          )}
        </main>
      </div>

      {/* Floating Unhide / View Tabs Button (When sidebar is hidden completely) */}
      {!isSidebarOpen && (
        <button
          onClick={() => {
            setIsSidebarOpen(true);
            audioService.playBeep(850, 0.04);
          }}
          className="fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-2xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 border border-cyan-400/40 cursor-pointer"
          title="View / Restore Vertical Navigation Tabs"
        >
          <PanelLeftOpen className="w-4 h-4" />
          <span>View Tabs</span>
        </button>
      )}

      {/* Persistent Audio Indicator / Floating Controls (if soundscape is playing outside music tab) */}
      {activeSoundscape && currentTab !== 'music' && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3 p-3 rounded-full bg-slate-900/95 border border-purple-600/60 shadow-2xl backdrop-blur-md text-xs font-mono">
          <div className="flex items-center gap-2 text-purple-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Focus Audio Active</span>
          </div>
          <button
            onClick={() => setCurrentTab('music')}
            className="px-2.5 py-1 rounded-full bg-purple-950 text-purple-200 border border-purple-800 hover:bg-purple-900 cursor-pointer"
          >
            Adjust
          </button>
          <button
            onClick={() => {
              audioService.stopSoundscape();
              setActiveSoundscape(null);
            }}
            className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 cursor-pointer"
          >
            Mute
          </button>
        </div>
      )}

      {/* Active Reminder Alert Popup Modal */}
      <ReminderAlertModal
        reminder={activeReminderAlert}
        onComplete={handleCompleteReminderAlert}
        onSnooze={handleSnoozeReminderAlert}
        onDismiss={() => setActiveReminderAlert(null)}
      />

      {/* UI Style & Effects Studio Modal */}
      <StyleStudioModal
        isOpen={isStyleStudioOpen}
        onClose={() => setIsStyleStudioOpen(false)}
        config={styleConfig}
        onChangeConfig={setStyleConfig}
        onResetDefaults={() => setStyleConfig(DEFAULT_STYLE_CONFIG)}
      />

      {/* Data Backup & Restore Modal */}
      <DataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onDataReload={loadWorkspaceData}
      />

      {/* Wonderful Screensaver Suite (Matrix / Warp / Wave Clock / Neural) */}
      <ScreenSaver
        isActive={isScreensaverActive}
        onClose={() => setIsScreensaverActive(false)}
      />
    </div>
  );
}
