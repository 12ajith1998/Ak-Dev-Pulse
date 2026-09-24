import React, { useState, useEffect, useRef } from 'react';
import { AlarmItem } from '../../types';
import { storageService } from '../../services/storageService';
import { audioService } from '../../services/audioService';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Volume2, 
  Check, 
  AlertTriangle, 
  Clock, 
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface AlarmManagerProps {
  ringingAlarm: AlarmItem | null;
  setRingingAlarm: (alarm: AlarmItem | null) => void;
}

const DAYS_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AlarmManager: React.FC<AlarmManagerProps> = ({ ringingAlarm, setRingingAlarm }) => {
  const [alarms, setAlarms] = useState<AlarmItem[]>(storageService.getAlarms());
  const [isAdding, setIsAdding] = useState(false);

  // New alarm form state
  const [newTime, setNewTime] = useState('09:45');
  const [newLabel, setNewLabel] = useState('Morning Standup 🚀');
  const [newSound, setNewSound] = useState<'chime' | 'digital' | 'radar' | 'synth'>('chime');
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon - Fri default

  const lastTriggeredMinute = useRef<string>('');

  const saveUpdatedAlarms = (updated: AlarmItem[]) => {
    setAlarms(updated);
    storageService.saveAlarms(updated);
  };

  // Real-time alarm checker running every second
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${currentH}:${currentM}`;
      const dayOfWeek = now.getDay();

      if (lastTriggeredMinute.current === timeStr) {
        return; // already checked this minute
      }

      alarms.forEach((alarm) => {
        if (alarm.enabled && alarm.time === timeStr) {
          const isScheduledToday = alarm.repeatDays.length === 0 || alarm.repeatDays.includes(dayOfWeek);
          if (isScheduledToday && !ringingAlarm) {
            lastTriggeredMinute.current = timeStr;
            triggerAlarm(alarm);
          }
        }
      });
    };

    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [alarms, ringingAlarm]);

  const triggerAlarm = (alarm: AlarmItem) => {
    setRingingAlarm(alarm);
    audioService.playAlarmSound(alarm.sound);
  };

  const handleDismiss = () => {
    setRingingAlarm(null);
    audioService.playBeep(450, 0.05);
  };

  const handleSnooze = () => {
    if (!ringingAlarm) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const snoozedH = now.getHours().toString().padStart(2, '0');
    const snoozedM = now.getMinutes().toString().padStart(2, '0');
    const snoozedTime = `${snoozedH}:${snoozedM}`;

    const snoozedAlarm: AlarmItem = {
      ...ringingAlarm,
      id: 'snooze-' + Date.now(),
      time: snoozedTime,
      label: `[Snoozed 5m] ${ringingAlarm.label}`,
      enabled: true,
      repeatDays: [], // one-off
    };

    saveUpdatedAlarms([...alarms, snoozedAlarm]);
    setRingingAlarm(null);
    alert(`Alarm snoozed for 5 minutes (will ring at ${snoozedTime})`);
  };

  const handleToggleAlarm = (id: string) => {
    const updated = alarms.map((a) => {
      if (a.id === id) {
        const next = !a.enabled;
        if (next) audioService.playBeep(900, 0.04);
        else audioService.playBeep(500, 0.04);
        return { ...a, enabled: next };
      }
      return a;
    });
    saveUpdatedAlarms(updated);
  };

  const handleDeleteAlarm = (id: string) => {
    const updated = alarms.filter((a) => a.id !== id);
    saveUpdatedAlarms(updated);
    audioService.playBeep(400, 0.05);
  };

  const handleTestSound = (soundType: 'chime' | 'digital' | 'radar' | 'synth') => {
    audioService.playAlarmSound(soundType);
  };

  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlarm: AlarmItem = {
      id: 'alarm-' + Date.now(),
      time: newTime,
      label: newLabel.trim() || 'Scheduled Alarm',
      enabled: true,
      sound: newSound,
      repeatDays: newDays,
    };

    saveUpdatedAlarms([...alarms, newAlarm]);
    setIsAdding(false);
    audioService.playSuccessTone();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Active Ringing Alert Modal Banner */}
      {ringingAlarm && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 border-2 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-bounce duration-700 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-rose-300 font-mono text-xs tracking-widest uppercase">
            <Bell className="w-5 h-5 animate-spin text-rose-400" />
            <span>ALARM TRIGGERED</span>
          </div>

          <div>
            <h3 className="text-3xl font-extrabold text-white">{ringingAlarm.time}</h3>
            <p className="text-lg font-medium text-rose-200 mt-1">{ringingAlarm.label}</p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={handleSnooze}
              className="px-6 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white font-mono text-xs font-semibold border border-rose-400 transition-all"
            >
              Snooze 5 Min ⏱️
            </button>
            <button
              onClick={handleDismiss}
              className="px-8 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/40 transition-all active:scale-95"
            >
              Dismiss Alarm ✕
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs mb-1">
            <Bell className="w-3.5 h-3.5" />
            <span>IT SCHEDULE DISCIPLINE</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Engineering Routines & Schedule Alarms
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Never miss morning standup syncs, production code freezes, or health & hydration breaks.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Alarm</span>
        </button>
      </div>

      {/* New Alarm Form */}
      {isAdding && (
        <div className="p-5 rounded-xl bg-slate-900 border border-rose-800/60 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" />
              <span>Configure New Daily Alarm</span>
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>

          <form onSubmit={handleCreateAlarm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Time (24-Hour)</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Alarm Label</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Daily Standup Sync"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Sound Selection */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Alert Sound Tone</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'chime', label: 'Tubular Chime' },
                  { id: 'digital', label: 'Digital Beep' },
                  { id: 'radar', label: 'Radar Sweep' },
                  { id: 'synth', label: 'Synth Arp' },
                ].map((s) => (
                  <div key={s.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setNewSound(s.id as any)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono border transition-colors ${
                        newSound === s.id
                          ? 'bg-rose-950 text-rose-300 border-rose-700 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {s.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTestSound(s.id as any)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Test sound"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Repeat Days */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Repeat Schedule</label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_MAP.map((day, idx) => {
                  const isSelected = newDays.includes(idx);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => {
                        if (isSelected) setNewDays(newDays.filter((d) => d !== idx));
                        else setNewDays([...newDays, idx]);
                      }}
                      className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                        isSelected
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Save Alarm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alarms Listing */}
      <div className="space-y-3">
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              alarm.enabled
                ? 'bg-slate-900/90 border-slate-800 text-white'
                : 'bg-slate-950/50 border-slate-800/40 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleToggleAlarm(alarm.id)}
                className={`p-1 rounded transition-colors ${
                  alarm.enabled ? 'text-rose-400' : 'text-slate-600'
                }`}
              >
                {alarm.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>

              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold font-mono tracking-wider">
                    {alarm.time}
                  </span>
                  <span className="font-medium text-sm text-slate-200">
                    {alarm.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                  <span className="capitalize">Sound: {alarm.sound}</span>
                  <span>•</span>
                  <span>
                    {alarm.repeatDays.length === 5 && alarm.repeatDays.includes(1) && alarm.repeatDays.includes(5)
                      ? 'Mon - Fri'
                      : alarm.repeatDays.length === 7
                        ? 'Everyday'
                        : alarm.repeatDays.length === 0
                          ? 'Once'
                          : alarm.repeatDays.map((d) => DAYS_MAP[d]).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestSound(alarm.sound)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Test sound tone"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDeleteAlarm(alarm.id)}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                title="Delete alarm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
