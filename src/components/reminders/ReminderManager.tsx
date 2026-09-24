import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Utensils, 
  Coffee, 
  Eye, 
  Activity, 
  Moon, 
  Sparkles, 
  Plus, 
  Trash2, 
  Volume2, 
  CheckCircle2, 
  Clock, 
  Timer, 
  Bell, 
  Check, 
  X,
  Play,
  RotateCcw,
  Footprints,
  Flame,
  Award
} from 'lucide-react';
import { ReminderItem, ReminderType, ReminderCategory, ReminderSound } from '../../types';
import { storageService } from '../../services/storageService';
import { audioService } from '../../services/audioService';

interface ReminderManagerProps {
  onTriggerGlobalAlert?: (reminder: ReminderItem) => void;
}

export const ReminderManager: React.FC<ReminderManagerProps> = ({ onTriggerGlobalAlert }) => {
  const [reminders, setReminders] = useState<ReminderItem[]>(() => storageService.getReminders());
  const [waterData, setWaterData] = useState<{ count: number; date: string }>(() => storageService.getWaterIntake());
  const [activeFilter, setActiveFilter] = useState<'all' | ReminderCategory>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Form State for Create/Edit
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: ReminderCategory;
    type: ReminderType;
    intervalMinutes: number;
    scheduledTime: string;
    icon: ReminderItem['icon'];
    sound: ReminderSound;
    dailyTarget: number;
  }>({
    title: '',
    description: '',
    category: 'health',
    type: 'interval',
    intervalMinutes: 45,
    scheduledTime: '12:30',
    icon: 'droplet',
    sound: 'water',
    dailyTarget: 8,
  });

  // Track current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const saveAndUpdateReminders = (updated: ReminderItem[]) => {
    setReminders(updated);
    storageService.saveReminders(updated);
  };

  // Water Tracker Actions
  const handleLogWater = (increment = 1) => {
    const newCount = Math.max(0, waterData.count + increment);
    setWaterData({ ...waterData, count: newCount });
    storageService.saveWaterIntake(newCount);
    audioService.playWaterDropTone();

    // Also update the water reminder's daily count if it exists
    const updated = reminders.map((r) => {
      if (r.id === 'rem-water') {
        return { ...r, completionsToday: newCount };
      }
      return r;
    });
    saveAndUpdateReminders(updated);
  };

  const handleToggleEnable = (id: string) => {
    const updated = reminders.map((r) => {
      if (r.id === id) {
        const nextEnabled = !r.enabled;
        audioService.playBeep(nextEnabled ? 880 : 440, 0.05);
        return { ...r, enabled: nextEnabled };
      }
      return r;
    });
    saveAndUpdateReminders(updated);
  };

  const handleMarkCompleted = (id: string) => {
    const updated = reminders.map((r) => {
      if (r.id === id) {
        const nextCount = r.completionsToday + 1;
        audioService.playSuccessTone();
        if (r.id === 'rem-water') {
          handleLogWater(1);
        }
        return {
          ...r,
          completionsToday: nextCount,
          lastTriggered: new Date().toISOString(),
        };
      }
      return r;
    });
    saveAndUpdateReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    saveAndUpdateReminders(updated);
    audioService.playBeep(400, 0.05);
  };

  const handleTestSound = (sound: ReminderSound) => {
    audioService.playReminderSound(sound);
  };

  const handleTriggerTest = (reminder: ReminderItem) => {
    audioService.playReminderSound(reminder.sound);
    if (onTriggerGlobalAlert) {
      onTriggerGlobalAlert(reminder);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingReminder(null);
    setFormData({
      title: '',
      description: '',
      category: 'health',
      type: 'interval',
      intervalMinutes: 45,
      scheduledTime: '12:30',
      icon: 'droplet',
      sound: 'water',
      dailyTarget: 6,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (reminder: ReminderItem) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      category: reminder.category,
      type: reminder.type,
      intervalMinutes: reminder.intervalMinutes || 45,
      scheduledTime: reminder.scheduledTime || '12:30',
      icon: reminder.icon,
      sound: reminder.sound,
      dailyTarget: reminder.dailyTarget || 1,
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingReminder) {
      const updated = reminders.map((r) => {
        if (r.id === editingReminder.id) {
          return {
            ...r,
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            type: formData.type,
            intervalMinutes: formData.type === 'interval' ? Number(formData.intervalMinutes) : undefined,
            scheduledTime: formData.type === 'scheduled' ? formData.scheduledTime : undefined,
            icon: formData.icon,
            sound: formData.sound,
            dailyTarget: Number(formData.dailyTarget),
          };
        }
        return r;
      });
      saveAndUpdateReminders(updated);
    } else {
      const newReminder: ReminderItem = {
        id: `rem-${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        type: formData.type,
        intervalMinutes: formData.type === 'interval' ? Number(formData.intervalMinutes) : undefined,
        scheduledTime: formData.type === 'scheduled' ? formData.scheduledTime : undefined,
        icon: formData.icon,
        sound: formData.sound,
        enabled: true,
        completionsToday: 0,
        dailyTarget: Number(formData.dailyTarget),
      };
      saveAndUpdateReminders([newReminder, ...reminders]);
    }

    setIsCreateModalOpen(false);
    audioService.playSuccessTone();
  };

  // Quick Preset Add
  const handleAddPreset = (preset: {
    title: string;
    description: string;
    category: ReminderCategory;
    type: ReminderType;
    intervalMinutes?: number;
    scheduledTime?: string;
    icon: ReminderItem['icon'];
    sound: ReminderSound;
    dailyTarget: number;
  }) => {
    const newRem: ReminderItem = {
      id: `rem-${Date.now()}`,
      title: preset.title,
      description: preset.description,
      category: preset.category,
      type: preset.type,
      intervalMinutes: preset.intervalMinutes,
      scheduledTime: preset.scheduledTime,
      icon: preset.icon,
      sound: preset.sound,
      enabled: true,
      completionsToday: 0,
      dailyTarget: preset.dailyTarget,
    };
    saveAndUpdateReminders([...reminders, newRem]);
    audioService.playSuccessTone();
  };

  const getIconComponent = (icon: ReminderItem['icon'], className = 'w-4 h-4') => {
    switch (icon) {
      case 'droplet':
        return <Droplet className={`${className} text-cyan-400`} />;
      case 'utensils':
        return <Utensils className={`${className} text-amber-400`} />;
      case 'coffee':
        return <Coffee className={`${className} text-amber-500`} />;
      case 'eye':
        return <Eye className={`${className} text-emerald-400`} />;
      case 'activity':
        return <Activity className={`${className} text-rose-400`} />;
      case 'walk':
        return <Footprints className={`${className} text-teal-400`} />;
      case 'moon':
        return <Moon className={`${className} text-indigo-400`} />;
      case 'sparkles':
      default:
        return <Sparkles className={`${className} text-purple-400`} />;
    }
  };

  const filteredReminders = reminders.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.category === activeFilter;
  });

  const targetWaterGlasses = 8;
  const waterProgress = Math.min(100, Math.round((waterData.count / targetWaterGlasses) * 100));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <HeartPulseIcon className="w-3.5 h-3.5" />
            <span>IT ENGINEER WELLNESS & ROUTINE ASSISTANT</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Smart Health & Schedule Reminders
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Never forget to drink water, take lunch breaks, stretch your spine, or rest your eyes during intensive coding marathons.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Custom Reminder</span>
          </button>
        </div>
      </div>

      {/* 1. INTERACTIVE HYDRATION HERO TRACKER */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 border border-cyan-800/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                <Droplet className="w-5 h-5 fill-cyan-400/40" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Daily Hydration Tracker</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-cyan-950 text-cyan-300 border border-cyan-800">
                    250ml / Glass
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Target: 8 glasses (2.0L) daily to sustain peak cognitive concentration and avoid dev fatigue
                </p>
              </div>
            </div>

            {/* Glasses interactive checklist visual */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {Array.from({ length: targetWaterGlasses }).map((_, index) => {
                const isFilled = index < waterData.count;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (isFilled && index === waterData.count - 1) {
                        handleLogWater(-1);
                      } else {
                        handleLogWater(index + 1 - waterData.count);
                      }
                    }}
                    className={`group relative flex flex-col items-center justify-center w-10 h-13 rounded-xl border transition-all ${
                      isFilled
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] text-cyan-300'
                        : 'bg-slate-950/60 border-slate-800 hover:border-cyan-600/50 text-slate-500 hover:text-slate-300'
                    }`}
                    title={`Glass ${index + 1}: ${isFilled ? 'Drank! Click to adjust' : 'Click to log drink'}`}
                  >
                    <Droplet className={`w-5 h-5 transition-transform group-hover:scale-110 ${isFilled ? 'fill-cyan-400 text-cyan-300' : ''}`} />
                    <span className="text-[9px] font-mono mt-0.5 font-semibold">#{index + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics & Drink Water Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-center min-w-[130px] w-full sm:w-auto">
              <span className="text-slate-400 block text-[10px] tracking-wider">TODAY'S INTAKE</span>
              <span className="text-2xl font-bold text-white tracking-tight">
                {waterData.count} <span className="text-cyan-400 text-sm font-normal">/ {targetWaterGlasses}</span>
              </span>
              <span className="text-[11px] text-cyan-300 block mt-0.5">
                {waterData.count * 250} ml ({waterProgress}%)
              </span>
            </div>

            <button
              onClick={() => handleLogWater(1)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-600/25 active:scale-95 transition-all cursor-pointer"
            >
              <Droplet className="w-4 h-4 fill-white" />
              <span>Drink a Glass (+250ml)</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${waterProgress}%` }}
          />
        </div>
      </div>

      {/* 2. QUICK PRESET LIBRARY CAROUSEL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>1-Click Preset Engineering Routines</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">Click to instantly add</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => handleAddPreset({
              title: 'Go for Lunch Break',
              description: 'Step away from screen, enjoy a nutritious meal, and refresh your mind.',
              category: 'routine',
              type: 'scheduled',
              scheduledTime: '12:30',
              icon: 'utensils',
              sound: 'gong',
              dailyTarget: 1,
            })}
            className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-center group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform mb-1.5">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">Go for Lunch</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Daily 12:30 PM</span>
          </button>

          <button
            onClick={() => handleAddPreset({
              title: 'Drink Water (45m)',
              description: 'Take a sip of water (250ml) to stay sharp.',
              category: 'health',
              type: 'interval',
              intervalMinutes: 45,
              icon: 'droplet',
              sound: 'water',
              dailyTarget: 8,
            })}
            className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 transition-all text-center group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform mb-1.5">
              <Droplet className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">Drink Water</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Every 45 mins</span>
          </button>

          <button
            onClick={() => handleAddPreset({
              title: 'Posture & Spine Stretch',
              description: 'Unclench jaw, pull shoulders back, stretch neck and lower spine.',
              category: 'wellness',
              type: 'interval',
              intervalMinutes: 60,
              icon: 'activity',
              sound: 'chime',
              dailyTarget: 6,
            })}
            className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-850 transition-all text-center group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform mb-1.5">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">Posture Stretch</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Every 60 mins</span>
          </button>

          <button
            onClick={() => handleAddPreset({
              title: '20-20-20 Eye Rest',
              description: 'Look 20 feet away for 20 seconds to prevent digital eye strain.',
              category: 'health',
              type: 'interval',
              intervalMinutes: 20,
              icon: 'eye',
              sound: 'pip',
              dailyTarget: 12,
            })}
            className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all text-center group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform mb-1.5">
              <Eye className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">20-20-20 Eye Rest</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Every 20 mins</span>
          </button>

          <button
            onClick={() => handleAddPreset({
              title: 'Afternoon Tea / Coffee',
              description: 'Mid-afternoon gentle boost & cognitive recharge.',
              category: 'routine',
              type: 'scheduled',
              scheduledTime: '15:30',
              icon: 'coffee',
              sound: 'pip',
              dailyTarget: 1,
            })}
            className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-center group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform mb-1.5">
              <Coffee className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">Coffee Break</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Daily 3:30 PM</span>
          </button>

          <button
            onClick={() => handleAddPreset({
              title: 'Logoff & Wind Down',
              description: 'Push commits, write standup notes, and shut down workstation on time.',
              category: 'routine',
              type: 'scheduled',
              scheduledTime: '18:30',
              icon: 'moon',
              sound: 'gong',
              dailyTarget: 1,
            })}
            className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition-all text-center group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform mb-1.5">
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">Evening Logoff</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Daily 6:30 PM</span>
          </button>
        </div>
      </div>

      {/* 3. CATEGORY FILTER TABS */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['all', 'health', 'routine', 'wellness', 'work'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeFilter === cat
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat === 'all' ? 'All Active Reminders' : `${cat.toUpperCase()}`}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Local System Time: <strong className="text-white">{currentTime}</strong></span>
        </div>
      </div>

      {/* 4. REMINDERS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReminders.map((reminder) => {
          return (
            <div
              key={reminder.id}
              className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                reminder.enabled
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div>
                {/* Top Row: Icon + Category Badge + Toggle */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {getIconComponent(reminder.icon, 'w-5 h-5')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{reminder.title}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                          {reminder.category}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                          {reminder.type === 'interval' 
                            ? `Every ${reminder.intervalMinutes}m` 
                            : `At ${reminder.scheduledTime}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enable Switch */}
                  <button
                    onClick={() => handleToggleEnable(reminder.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                      reminder.enabled ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                    title={reminder.enabled ? 'Click to disable' : 'Click to enable'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                        reminder.enabled ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Description */}
                {reminder.description && (
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                    {reminder.description}
                  </p>
                )}
              </div>

              {/* Bottom Actions & Completion Counter */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleMarkCompleted(reminder.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 font-mono text-xs transition-colors cursor-pointer"
                    title="Mark Done for this cycle"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Done ({reminder.completionsToday})</span>
                  </button>

                  <button
                    onClick={() => handleTestSound(reminder.sound)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title={`Test Sound Tone (${reminder.sound})`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleTriggerTest(reminder)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                    title="Trigger Alert Now"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(reminder)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit"
                  >
                    <SlidersIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. CREATE / EDIT REMINDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {editingReminder ? 'Edit Reminder' : 'Create Custom Reminder'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Reminder Title * (e.g. Drink Water, Go for Lunch)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drink Water & Hydrate"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Description / Purpose (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take 250ml sip to maintain peak cognitive focus"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ReminderCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 outline-none"
                  >
                    <option value="health">Health (Water, Eyes)</option>
                    <option value="routine">Routine (Lunch, Coffee)</option>
                    <option value="wellness">Wellness (Posture, Walk)</option>
                    <option value="work">Work (Commit, Sync)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Trigger Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ReminderType })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 outline-none"
                  >
                    <option value="interval">Repeating Interval (Every X mins)</option>
                    <option value="scheduled">Scheduled Time of Day (Fixed HH:MM)</option>
                  </select>
                </div>
              </div>

              {formData.type === 'interval' ? (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Interval Frequency (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="360"
                    value={formData.intervalMinutes}
                    onChange={(e) => setFormData({ ...formData, intervalMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Scheduled Time (24h format, e.g. 12:30)
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Sound Tone</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={formData.sound}
                      onChange={(e) => setFormData({ ...formData, sound: e.target.value as ReminderSound })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 outline-none"
                    >
                      <option value="water">💧 Water Drop</option>
                      <option value="gong">🧘 Calming Gong</option>
                      <option value="chime">🔔 Gentle Chime</option>
                      <option value="pip">⏱ Digital Pip</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleTestSound(formData.sound)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                      title="Preview Sound"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Icon Theme</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 outline-none"
                  >
                    <option value="droplet">💧 Water Droplet</option>
                    <option value="utensils">🥗 Lunch Utensils</option>
                    <option value="coffee">☕ Coffee / Tea</option>
                    <option value="eye">👀 Eye Rest</option>
                    <option value="activity">🧘 Posture Stretch</option>
                    <option value="walk">🚶 Walk / Steps</option>
                    <option value="moon">🌙 Evening Logoff</option>
                    <option value="sparkles">✨ Sparkles</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function HeartPulseIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}

function SlidersIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="1" x2="7" y1="14" y2="14" />
      <line x1="9" x2="15" y1="8" y2="8" />
      <line x1="17" x2="23" y1="16" y2="16" />
    </svg>
  );
}
