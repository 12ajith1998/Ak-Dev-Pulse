import React, { useState } from 'react';
import { ChecklistTemplate, ChecklistItem } from '../../types';
import { storageService } from '../../services/storageService';
import { audioService } from '../../services/audioService';
import { 
  CheckSquare, 
  Plus, 
  RotateCcw, 
  Copy, 
  Check, 
  Trash2, 
  ShieldAlert, 
  GitPullRequest, 
  Rocket, 
  Database,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

export const ChecklistHub: React.FC = () => {
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>(storageService.getChecklists());
  const [activeChecklistId, setActiveChecklistId] = useState<string>(checklists[0]?.id || 'checklist-prod-deploy');
  const [expandedNotes, setExpandedNotes] = useState<{ [itemId: string]: boolean }>({});
  const [newItemText, setNewItemText] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // New Custom Runbook Modal
  const [isCreatingRunbook, setIsCreatingRunbook] = useState(false);
  const [newRunbookTitle, setNewRunbookTitle] = useState('');
  const [newRunbookDesc, setNewRunbookDesc] = useState('');

  const activeChecklist = checklists.find((c) => c.id === activeChecklistId) || checklists[0];

  const saveUpdated = (updated: ChecklistTemplate[]) => {
    setChecklists(updated);
    storageService.saveChecklists(updated);
  };

  const toggleItem = (itemId: string) => {
    const updated = checklists.map((c) => {
      if (c.id === activeChecklistId) {
        return {
          ...c,
          items: c.items.map((item) => {
            if (item.id === itemId) {
              const nextState = !item.completed;
              if (nextState) audioService.playBeep(950, 0.04);
              else audioService.playBeep(500, 0.04);
              return { ...item, completed: nextState };
            }
            return item;
          }),
        };
      }
      return c;
    });
    saveUpdated(updated);
  };

  const resetActiveChecklist = () => {
    if (confirm(`Reset all items in "${activeChecklist.title}" to unchecked?`)) {
      const updated = checklists.map((c) => {
        if (c.id === activeChecklistId) {
          return {
            ...c,
            items: c.items.map((item) => ({ ...item, completed: false })),
          };
        }
        return c;
      });
      saveUpdated(updated);
      audioService.playBeep(450, 0.08);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: 'item-' + Date.now(),
      text: newItemText.trim(),
      completed: false,
    };

    const updated = checklists.map((c) => {
      if (c.id === activeChecklistId) {
        return {
          ...c,
          items: [...c.items, newItem],
        };
      }
      return c;
    });

    saveUpdated(updated);
    setNewItemText('');
    audioService.playBeep(800, 0.04);
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = checklists.map((c) => {
      if (c.id === activeChecklistId) {
        return {
          ...c,
          items: c.items.filter((item) => item.id !== itemId),
        };
      }
      return c;
    });
    saveUpdated(updated);
    audioService.playBeep(400, 0.05);
  };

  const handleCreateRunbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRunbookTitle.trim()) return;

    const newTemplate: ChecklistTemplate = {
      id: 'custom-' + Date.now(),
      title: newRunbookTitle.trim(),
      description: newRunbookDesc.trim() || 'Custom engineering procedure.',
      category: 'custom',
      items: [
        { id: 'i1', text: 'Step 1: Verify prerequisites and permissions', completed: false },
        { id: 'i2', text: 'Step 2: Execute procedure and monitor logs', completed: false },
        { id: 'i3', text: 'Step 3: Run sanity verification and sign off', completed: false },
      ],
    };

    const updated = [...checklists, newTemplate];
    saveUpdated(updated);
    setActiveChecklistId(newTemplate.id);
    setIsCreatingRunbook(false);
    setNewRunbookTitle('');
    setNewRunbookDesc('');
    audioService.playSuccessTone();
  };

  const handleCopyMarkdown = () => {
    if (!activeChecklist) return;
    let md = `### ${activeChecklist.title}\n`;
    md += `_${activeChecklist.description}_\n\n`;
    activeChecklist.items.forEach((item) => {
      md += `${item.completed ? '[x]' : '[ ]'} ${item.text}\n`;
      if (item.notes) md += `   > Note: ${item.notes}\n`;
    });
    const completed = activeChecklist.items.filter((i) => i.completed).length;
    md += `\n**Status:** ${completed}/${activeChecklist.items.length} completed (${Math.round((completed / activeChecklist.items.length) * 100)}%)\n`;

    navigator.clipboard.writeText(md);
    audioService.playBeep(1100, 0.05);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const completedCount = activeChecklist.items.filter((i) => i.completed).length;
  const totalCount = activeChecklist.items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'deployment': return <Rocket className="w-4 h-4 text-emerald-400" />;
      case 'code-review': return <GitPullRequest className="w-4 h-4 text-purple-400" />;
      case 'incident': return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'database': return <Database className="w-4 h-4 text-cyan-400" />;
      default: return <CheckSquare className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs mb-1">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>OPERATIONAL RUNBOOKS</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Production & Engineering Checklists
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Zero-downtime deployment standards, PR code reviews, incident response protocols, and custom sanity lists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingRunbook(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Runbook</span>
          </button>
        </div>
      </div>

      {/* New Custom Runbook Form */}
      {isCreatingRunbook && (
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-800/60 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Create Custom Runbook</h3>
            <button onClick={() => setIsCreatingRunbook(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
          <form onSubmit={handleCreateRunbook} className="space-y-3">
            <input
              type="text"
              value={newRunbookTitle}
              onChange={(e) => setNewRunbookTitle(e.target.value)}
              placeholder="Runbook Title (e.g. Disaster Recovery Cold-Start)"
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={newRunbookDesc}
              onChange={(e) => setNewRunbookDesc(e.target.value)}
              placeholder="Brief description or purpose of this checklist..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingRunbook(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Save Runbook
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Checklist Tabs (Left) & Active Checklist Runner (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Checklist Catalog (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
            Available Runbooks ({checklists.length})
          </div>
          <div className="space-y-1.5">
            {checklists.map((template) => {
              const isSelected = template.id === activeChecklistId;
              const completed = template.items.filter((i) => i.completed).length;
              const percent = template.items.length > 0 ? Math.round((completed / template.items.length) * 100) : 0;

              return (
                <div
                  key={template.id}
                  onClick={() => {
                    setActiveChecklistId(template.id);
                    audioService.playBeep(750, 0.03);
                  }}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.12)]'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {template.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {template.description}
                  </p>

                  {/* Progress meter */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{completed}/{template.items.length} done</span>
                    <span className={percent === 100 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {percent}%
                    </span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-slate-800 mt-1 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        percent === 100 ? 'bg-emerald-400' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Active Checklist Execution (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            {/* Runbook Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(activeChecklist.category)}
                  <h3 className="text-base font-bold text-white">{activeChecklist.title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{activeChecklist.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={resetActiveChecklist}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                  title="Uncheck all items"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono transition-colors"
                  title="Copy as Markdown for Slack / Jira ticket"
                >
                  {copyFeedback ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copyFeedback ? 'Copied' : 'Export MD'}</span>
                </button>
              </div>
            </div>

            {/* Completion Progress Bar */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">
                  Verification Progress: {completedCount} of {totalCount} checks passed
                </span>
                <span className={`font-bold ${progressPercent === 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    progressPercent === 100 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
              {activeChecklist.items.map((item) => {
                const isNotesOpen = !!expandedNotes[item.id];
                return (
                  <div
                    key={item.id}
                    className={`group p-3 rounded-lg border transition-all ${
                      item.completed
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-400'
                        : 'bg-slate-950 border-slate-800/80 text-slate-100 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 cursor-pointer" onClick={() => toggleItem(item.id)}>
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 cursor-pointer"
                        />
                        <div>
                          <span className={`text-xs font-medium ${item.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                            {item.text}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.notes && (
                          <button
                            onClick={() => setExpandedNotes({ ...expandedNotes, [item.id]: !isNotesOpen })}
                            className="text-slate-500 hover:text-cyan-400 p-1 text-xs"
                            title="Toggle technical notes"
                          >
                            {isNotesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 p-1 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Notes */}
                    {item.notes && isNotesOpen && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 pl-7 text-[11px] font-mono text-cyan-400/90">
                        {item.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add New Checkpoint Form */}
            <form onSubmit={handleAddItem} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="+ Add custom checklist verification step..."
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-dashed border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Add Step
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
