import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { audioService } from '../../services/audioService';
import { Download, Upload, RotateCcw, Check, AlertTriangle, FileJson, X } from 'lucide-react';

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => void;
}

export const DataModal: React.FC<DataModalProps> = ({ isOpen, onClose, onDataReload }) => {
  const [importJson, setImportJson] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = storageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devpulse-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    audioService.playSuccessTone();
    setFeedback('Workspace exported successfully!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleImport = () => {
    if (!importJson.trim()) return;
    const success = storageService.importAllData(importJson);
    if (success) {
      audioService.playSuccessTone();
      setFeedback('Workspace restored successfully!');
      onDataReload();
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
    } else {
      audioService.playBeep(400, 0.1);
      alert('Invalid JSON format. Please check the backup content.');
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all tasks, checklists, alarms, and standups to factory sample state?')) {
      storageService.resetToDefaults();
      audioService.playSuccessTone();
      onDataReload();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Workspace Data & Backup</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedback && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Export Section */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Export Complete State</h4>
              <p className="text-[11px] text-slate-400">Download JSON snapshot of tasks, standups, checklists & alarms.</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
          <h4 className="text-xs font-bold text-white">Restore from Backup</h4>
          <textarea
            rows={3}
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder="Paste your exported JSON backup content here..."
            className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={!importJson.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Apply Backup</span>
            </button>
          </div>
        </div>

        {/* Reset to Factory Defaults */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-400 font-mono text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Initial Demo State</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
