import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../../types';
import { audioService } from '../../services/audioService';
import { storageService } from '../../services/storageService';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Flame, 
  FastForward, 
  Clock, 
  Flag,
  CheckCircle2
} from 'lucide-react';

interface TimerModuleProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  selectedTaskForTimer: Task | null;
  setSelectedTaskForTimer: (task: Task | null) => void;
  onGlobalTimerUpdate?: (secondsLeft: number | null, isRunning: boolean) => void;
}

export const TimerModule: React.FC<TimerModuleProps> = ({
  tasks,
  setTasks,
  selectedTaskForTimer,
  setSelectedTaskForTimer,
  onGlobalTimerUpdate,
}) => {
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'custom' | 'stopwatch'>('pomodoro');
  const [pomoPhase, setPomoPhase] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');

  // Pomodoro Durations (in seconds)
  const [focusDuration, setFocusDuration] = useState<number>(25 * 60);
  const [shortBreakDuration, setShortBreakDuration] = useState<number>(5 * 60);
  const [longBreakDuration, setLongBreakDuration] = useState<number>(15 * 60);

  // Active Countdown State
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [cyclesCompletedToday, setCyclesCompletedToday] = useState<number>(3);

  // Custom Countdown inputs
  const [customMinutes, setCustomMinutes] = useState<number>(45);

  // Stopwatch State
  const [stopwatchMs, setStopwatchMs] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);
  const stopwatchRef = useRef<any>(null);

  // Inform parent for top navbar badge
  useEffect(() => {
    if (onGlobalTimerUpdate) {
      onGlobalTimerUpdate(timerMode !== 'stopwatch' ? timeLeft : null, isRunning);
    }
  }, [timeLeft, isRunning, timerMode, onGlobalTimerUpdate]);

  // Main countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Stopwatch effect
  useEffect(() => {
    if (isStopwatchRunning) {
      const start = Date.now() - stopwatchMs;
      stopwatchRef.current = setInterval(() => {
        setStopwatchMs(Date.now() - start);
      }, 33);
    } else {
      clearInterval(stopwatchRef.current);
    }
    return () => clearInterval(stopwatchRef.current);
  }, [isStopwatchRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    audioService.playAlarmSound('chime');

    if (timerMode === 'pomodoro') {
      if (pomoPhase === 'focus') {
        setCyclesCompletedToday((prev) => prev + 1);
        // If an active task is selected, increment its completed pomodoros
        if (selectedTaskForTimer) {
          const updated = tasks.map((t) => {
            if (t.id === selectedTaskForTimer.id) {
              return { ...t, pomodorosCompleted: t.pomodorosCompleted + 1 };
            }
            return t;
          });
          setTasks(updated);
          storageService.saveTasks(updated);
        }

        // Switch to break
        const nextPhase = (cyclesCompletedToday + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
        setPomoPhase(nextPhase);
        setTimeLeft(nextPhase === 'longBreak' ? longBreakDuration : shortBreakDuration);
      } else {
        // Break ended, back to focus
        setPomoPhase('focus');
        setTimeLeft(focusDuration);
      }
    }
  };

  const switchPomoPhase = (phase: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setPomoPhase(phase);
    if (phase === 'focus') setTimeLeft(focusDuration);
    else if (phase === 'shortBreak') setTimeLeft(shortBreakDuration);
    else if (phase === 'longBreak') setTimeLeft(longBreakDuration);
    audioService.playBeep(700, 0.04);
  };

  const toggleStartPause = () => {
    setIsRunning(!isRunning);
    audioService.playBeep(isRunning ? 600 : 850, 0.05);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (pomoPhase === 'focus') setTimeLeft(focusDuration);
    else if (pomoPhase === 'shortBreak') setTimeLeft(shortBreakDuration);
    else if (pomoPhase === 'longBreak') setTimeLeft(longBreakDuration);
    audioService.playBeep(500, 0.05);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const mill = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${mill.toString().padStart(2, '0')}`;
  };

  // Progress percentage calculation
  const totalPhaseSeconds = pomoPhase === 'focus' 
    ? focusDuration 
    : pomoPhase === 'shortBreak' 
      ? shortBreakDuration 
      : longBreakDuration;
  const progressPercent = Math.max(0, Math.min(100, ((totalPhaseSeconds - timeLeft) / totalPhaseSeconds) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs mb-1">
            <Timer className="w-3.5 h-3.5" />
            <span>DEEP WORK & RECOVERY</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Focus Pomodoro & Code Benchmark Stopwatch
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Block out high-leverage focus sessions, prevent burnout with scheduled micro-breaks, and benchmark task times.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => { setTimerMode('pomodoro'); setIsRunning(false); }}
            className={`px-3 py-1.5 rounded transition-colors ${
              timerMode === 'pomodoro' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pomodoro (25/5)
          </button>
          <button
            onClick={() => { setTimerMode('custom'); setIsRunning(false); setTimeLeft(customMinutes * 60); }}
            className={`px-3 py-1.5 rounded transition-colors ${
              timerMode === 'custom' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom Sprint
          </button>
          <button
            onClick={() => { setTimerMode('stopwatch'); }}
            className={`px-3 py-1.5 rounded transition-colors ${
              timerMode === 'stopwatch' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* 1. POMODORO OR CUSTOM COUNTDOWN VIEW */}
      {timerMode !== 'stopwatch' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Dial & Controls (8 cols) */}
          <div className="md:col-span-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center space-y-6 shadow-2xl">
            {/* Phase Selector (if pomodoro) */}
            {timerMode === 'pomodoro' ? (
              <div className="flex items-center gap-2 p-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => switchPomoPhase('focus')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
                    pomoPhase === 'focus' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Deep Focus (25m)</span>
                </button>
                <button
                  onClick={() => switchPomoPhase('shortBreak')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
                    pomoPhase === 'shortBreak' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Short Break (5m)</span>
                </button>
                <button
                  onClick={() => switchPomoPhase('longBreak')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
                    pomoPhase === 'longBreak' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Long Break (15m)</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Sprint Length:</span>
                {[15, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setCustomMinutes(mins);
                      setTimeLeft(mins * 60);
                      setIsRunning(false);
                    }}
                    className={`px-2.5 py-1 rounded border transition-colors ${
                      customMinutes === mins ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}

            {/* Circular Digital Timer Display */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* SVG Ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  stroke="#1e293b"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  stroke={pomoPhase === 'focus' ? '#f59e0b' : '#06b6d4'}
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 112}
                  strokeDashoffset={2 * Math.PI * 112 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Time digits */}
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-extrabold font-mono text-white tracking-widest">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest mt-1">
                  {pomoPhase.replace(/([A-Z])/g, ' $1')}
                </span>
              </div>
            </div>

            {/* Primary Control Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={resetTimer}
                className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={toggleStartPause}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm tracking-wider shadow-lg transition-all active:scale-95 ${
                  isRunning
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>START FOCUS</span>
                  </>
                )}
              </button>

              <button
                onClick={handleTimerComplete}
                className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Skip to next phase"
              >
                <FastForward className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Sidebar: Active Task Context & Stats (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            {/* Task Binding Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
                  Linked Kanban Task
                </span>
                {selectedTaskForTimer && (
                  <button
                    onClick={() => setSelectedTaskForTimer(null)}
                    className="text-[11px] text-slate-500 hover:text-rose-400 font-mono"
                  >
                    Unlink
                  </button>
                )}
              </div>

              {selectedTaskForTimer ? (
                <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400">
                    <Flame className="w-3 h-3" />
                    <span>LOGGING FOCUS TIME</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white leading-snug">
                    {selectedTaskForTimer.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                    <span>Cycles Completed:</span>
                    <span className="text-amber-400 font-bold">
                      {selectedTaskForTimer.pomodorosCompleted} / {selectedTaskForTimer.pomodorosEstimated}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">
                    Select a task to automatically increment its completed pomodoro count:
                  </p>
                  <select
                    onChange={(e) => {
                      const task = tasks.find((t) => t.id === e.target.value);
                      if (task) setSelectedTaskForTimer(task);
                    }}
                    value=""
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select In-Progress Task...</option>
                    {tasks.filter((t) => t.status !== 'done').map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Today's Productivity Milestones */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
              <span className="text-slate-400 font-semibold block">DAILY FOCUS RECORD</span>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Pomodoros Done Today:</span>
                <span className="text-amber-400 font-bold text-sm">{cyclesCompletedToday}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Deep Work Time:</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {Math.round((cyclesCompletedToday * 25) / 60 * 10) / 10} hrs
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. PRECISION STOPWATCH VIEW */
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-slate-400 tracking-widest uppercase">
              Execution / Task Stopwatch
            </span>
            <div className="text-6xl font-extrabold font-mono text-white tracking-widest py-4">
              {formatStopwatch(stopwatchMs)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsStopwatchRunning(!isStopwatchRunning);
                audioService.playBeep(isStopwatchRunning ? 600 : 900, 0.04);
              }}
              className={`px-8 py-3 rounded-full font-bold text-sm font-mono tracking-wider shadow-lg transition-all ${
                isStopwatchRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isStopwatchRunning ? 'STOP' : 'START'}
            </button>

            {isStopwatchRunning && (
              <button
                onClick={() => {
                  setLaps([stopwatchMs, ...laps]);
                  audioService.playBeep(1000, 0.04);
                }}
                className="flex items-center gap-1.5 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-sm font-semibold"
              >
                <Flag className="w-4 h-4 text-cyan-400" />
                <span>LAP</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsStopwatchRunning(false);
                setStopwatchMs(0);
                setLaps([]);
                audioService.playBeep(450, 0.04);
              }}
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Reset stopwatch"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Lap Table */}
          {laps.length > 0 && (
            <div className="w-full max-w-md p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-800">
                <span>Lap #</span>
                <span>Split Time</span>
              </div>
              {laps.map((lap, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-300 py-0.5">
                  <span className="text-cyan-400">Lap {laps.length - idx}</span>
                  <span>{formatStopwatch(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
