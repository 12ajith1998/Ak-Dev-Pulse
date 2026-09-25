import React, { useState, useEffect } from 'react';
import { TabType } from '../../types';
import { 
  Clock, 
  CheckSquare, 
  ListTodo, 
  Calculator, 
  Timer, 
  Bell, 
  Headphones, 
  MessageSquareCode, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  PanelLeftClose, 
  PanelLeftOpen, 
  EyeOff, 
  Sparkles, 
  Monitor, 
  Terminal,
  Activity,
  Flame,
  Radio,
  HeartPulse,
  User,
  Globe,
  Code2,
  Workflow
} from 'lucide-react';
import { audioService } from '../../services/audioService';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenScreensaver: () => void;
  activeSoundscape: string | null;
  activeTimerSeconds: number | null;
  isTimerRunning: boolean;
}

interface NavCategory {
  category: string;
  items: {
    id: TabType;
    label: string;
    icon: any;
    badge?: string;
    shortcut: string;
  }[];
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    category: 'Daily Workflow',
    items: [
      { id: 'standup', label: 'Standup Sync', icon: Clock, shortcut: '1' },
      { id: 'checklist', label: 'Check List', icon: CheckSquare, shortcut: '2' },
      { id: 'todos', label: 'Todo List', icon: ListTodo, shortcut: '3' },
    ],
  },
  {
    category: 'Toolkit & Focus',
    items: [
      { id: 'reminders', label: 'Smart Reminders', icon: HeartPulse, badge: 'Water', shortcut: '4' },
      { id: 'calculator', label: 'Dev Calculator', icon: Calculator, shortcut: '5' },
      { id: 'timer', label: 'Focus Pomodoro', icon: Timer, shortcut: '6' },
      { id: 'alarm', label: 'Routine Alarms', icon: Bell, shortcut: '7' },
      { id: 'music', label: 'Focus Audio', icon: Headphones, shortcut: '8' },
    ],
  },
  {
    category: 'Engineering & Architecture',
    items: [
      { id: 'api-client', label: 'API Workbench', icon: Globe, badge: 'REST', shortcut: 'w' },
      { id: 'snippets', label: 'Git & Snippets', icon: Code2, badge: 'Stash', shortcut: 's' },
      { id: 'diagrams', label: 'System Topology', icon: Workflow, badge: 'Flow', shortcut: 'd' },
      { id: 'ai-chat', label: 'AI Copilot', icon: MessageSquareCode, badge: 'Thinking', shortcut: '9' },
    ],
  },
  {
    category: 'Developer Identity',
    items: [
      { id: 'profile', label: 'Developed By', icon: User, badge: 'Ajith', shortcut: '0' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
  onOpenScreensaver,
  activeSoundscape,
  activeTimerSeconds,
  isTimerRunning,
}) => {
  // Tooltip state for collapsed rail mode
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    audioService.playBeep(800, 0.03);
    // On mobile, auto-close sidebar after selection
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  // Keyboard shortcut listener for tabs 1-9
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const allItems = NAV_CATEGORIES.flatMap((c) => c.items);
      const match = allItems.find((item) => item.shortcut === e.key);
      if (match) {
        e.preventDefault();
        setActiveTab(match.id);
        audioService.playBeep(850, 0.03);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div 
        onClick={() => setIsOpen(false)} 
        className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-xs md:hidden"
      />

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen flex flex-col justify-between bg-slate-950 border-r border-slate-800/80 transition-all duration-300 ease-in-out select-none ${
          isCollapsed ? 'w-18' : 'w-64'
        } shadow-2xl md:shadow-none`}
      >
        {/* Top Header / Branding */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800/80">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 flex-shrink-0">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-bold font-mono text-sm tracking-tight text-white">
                  <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">AK DevPulse</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400/80 truncate">IT Cockpit v2.5</span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Terminal className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Collapse / Expand Toggle Button */}
          <button
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              audioService.playBeep(700, 0.03);
            }}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse to Mini Dock'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tab Items List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6 scrollbar-thin">
          {NAV_CATEGORIES.map((categoryGroup, cIdx) => (
            <div key={cIdx} className="space-y-1">
              {/* Category label (expanded mode only) */}
              {!isCollapsed && (
                <div className="px-2.5 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  {categoryGroup.category}
                </div>
              )}

              {/* Category item tabs */}
              <div className="space-y-1">
                {categoryGroup.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isMusicActive = item.id === 'music' && activeSoundscape !== null;
                  const isTimerActive = item.id === 'timer' && isTimerRunning;

                  return (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => handleTabClick(item.id)}
                        onMouseEnter={() => setHoveredTab(item.id)}
                        onMouseLeave={() => setHoveredTab(null)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs transition-all relative ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 text-cyan-300 font-semibold border border-cyan-700/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                        }`}
                      >
                        {/* Active glowing indicator pill */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
                        )}

                        {/* Icon with active or background pulse */}
                        <div className="relative flex-shrink-0">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                          {isMusicActive && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                          )}
                          {isTimerActive && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                          )}
                        </div>

                        {/* Text Label & Badge (when expanded) */}
                        {!isCollapsed && (
                          <div className="flex-1 flex items-center justify-between overflow-hidden">
                            <span className="truncate">{item.label}</span>

                            <div className="flex items-center gap-1.5">
                                {item.badge && (
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border font-semibold ${
                                    item.badge === 'Flow'
                                      ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                                      : item.badge === 'REST'
                                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60'
                                      : item.badge === 'Stash'
                                      ? 'bg-amber-950/90 text-amber-300 border-amber-700/60'
                                      : item.badge === 'Thinking' 
                                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800' 
                                      : item.badge === 'Ajith'
                                      ? 'bg-purple-950/90 text-purple-300 border-purple-700/60'
                                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              <kbd className="hidden group-hover:inline-block px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-500 font-mono">
                                {item.shortcut}
                              </kbd>
                            </div>
                          </div>
                        )}
                      </button>

                      {/* Tooltip on Collapsed Rail Mode */}
                      {isCollapsed && hoveredTab === item.id && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white shadow-xl z-50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] text-cyan-400 font-bold">({item.badge})</span>
                          )}
                          <kbd className="text-[10px] text-slate-500 bg-slate-950 px-1 rounded">{item.shortcut}</kbd>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Screensaver Launcher & Hide Sidebar button */}
        <div className="p-3 border-t border-slate-800/80 space-y-2 bg-slate-950/60">
          {/* Screensaver Launch Button */}
          <button
            onClick={() => {
              onOpenScreensaver();
              audioService.playSuccessTone();
            }}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2'} rounded-xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-800/60 hover:border-purple-500 text-purple-300 hover:text-white transition-all shadow-sm active:scale-95 text-xs font-mono group`}
            title="Launch Screensaver (14 Visual Effects: Matrix, Synthwave, Warp, DNA, Fireworks, Black Hole...)"
          >
            <Monitor className="w-4 h-4 text-purple-400 group-hover:rotate-6 transition-transform" />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between text-left">
                <span className="font-semibold">Screensaver</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-bold">14 FX</span>
              </div>
            )}
          </button>

          {/* Hide Sidebar Completely button (allows 100% full screen work) */}
          <button
            onClick={() => {
              setIsOpen(false);
              audioService.playBeep(500, 0.04);
            }}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-1.5'} rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-colors text-xs font-mono`}
            title="Hide Sidebar for Full-Screen Workspace"
          >
            <EyeOff className="w-3.5 h-3.5" />
            {!isCollapsed && <span>Hide Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
