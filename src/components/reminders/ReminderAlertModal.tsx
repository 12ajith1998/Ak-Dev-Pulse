import React from 'react';
import { 
  Droplet, 
  Utensils, 
  Coffee, 
  Eye, 
  Activity, 
  Moon, 
  Footprints, 
  Sparkles, 
  Check, 
  Clock, 
  X,
  Volume2
} from 'lucide-react';
import { ReminderItem } from '../../types';
import { audioService } from '../../services/audioService';

interface ReminderAlertModalProps {
  reminder: ReminderItem | null;
  onComplete: (reminder: ReminderItem) => void;
  onSnooze: (reminder: ReminderItem, minutes: number) => void;
  onDismiss: () => void;
}

export const ReminderAlertModal: React.FC<ReminderAlertModalProps> = ({
  reminder,
  onComplete,
  onSnooze,
  onDismiss,
}) => {
  if (!reminder) return null;

  const getIcon = (icon: ReminderItem['icon']) => {
    switch (icon) {
      case 'droplet':
        return <Droplet className="w-8 h-8 text-cyan-400 fill-cyan-400/30 animate-bounce" />;
      case 'utensils':
        return <Utensils className="w-8 h-8 text-amber-400 animate-pulse" />;
      case 'coffee':
        return <Coffee className="w-8 h-8 text-amber-500 animate-pulse" />;
      case 'eye':
        return <Eye className="w-8 h-8 text-emerald-400 animate-pulse" />;
      case 'activity':
        return <Activity className="w-8 h-8 text-rose-400 animate-pulse" />;
      case 'walk':
        return <Footprints className="w-8 h-8 text-teal-400 animate-bounce" />;
      case 'moon':
        return <Moon className="w-8 h-8 text-indigo-400 animate-pulse" />;
      default:
        return <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] space-y-5 text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-cyan-500/20 blur-2xl pointer-events-none" />

        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Center Animated Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-lg">
          {getIcon(reminder.icon)}
        </div>

        <div>
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
            HEALTH & SCHEDULE REMINDER
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight mt-1">
            {reminder.title}
          </h3>
          <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
            {reminder.description || 'Time to step away, refresh, and maintain healthy engineering habits!'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onComplete(reminder);
              audioService.playSuccessTone();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>I Completed This! (+1 Done)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onSnooze(reminder, 10);
                audioService.playBeep(600, 0.05);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Snooze 10m</span>
            </button>

            <button
              onClick={onDismiss}
              className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
