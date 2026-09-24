import React, { useState, useEffect } from 'react';
import { Task, StandupEntry } from '../../types';
import { storageService } from '../../services/storageService';
import { audioService } from '../../services/audioService';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Send,
  History,
  FileText,
  ExternalLink,
  X
} from 'lucide-react';

interface StandupGeneratorProps {
  tasks: Task[];
  onTaskUpdated?: () => void;
}

export const StandupGenerator: React.FC<StandupGeneratorProps> = ({ tasks }) => {
  const [sprintGoal, setSprintGoal] = useState<string>('Sprint 42: Complete HikariCP & Postgres Connection pooling + Angular Signal Migration');
  const [yesterdayItems, setYesterdayItems] = useState<string[]>([
    'Optimized PostgreSQL connection pool parameters in application.yml',
    'Reviewed and merged PR #142: Spring Security JWT filter chain',
  ]);
  const [todayItems, setTodayItems] = useState<string[]>([
    'Fix N+1 query in UserService with JPA @EntityGraph',
    'Benchmark latency under 500 RPS load test on staging',
  ]);
  const [blockerItems, setBlockerItems] = useState<string[]>([
    'Waiting on DevOps for RDS staging credentials rotation',
  ]);
  const [ticketInput, setTicketInput] = useState<string>('');
  const [tickets, setTickets] = useState<string[]>(['DEV-892', 'PR #145']);

  const [rawNewYesterday, setRawNewYesterday] = useState<string>('');
  const [rawNewToday, setRawNewToday] = useState<string>('');
  const [rawNewBlocker, setRawNewBlocker] = useState<string>('');

  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [polishedOutput, setPolishedOutput] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<'slack' | 'jira' | 'plain'>('slack');
  const [history, setHistory] = useState<StandupEntry[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    // Load history
    setHistory(storageService.getStandups());

    // Load draft if available
    const draft = storageService.getStandupDraft();
    if (draft) {
      if (draft.yesterday) setYesterdayItems(draft.yesterday);
      if (draft.today) setTodayItems(draft.today);
      if (draft.blockers) setBlockerItems(draft.blockers);
      if (draft.sprintGoal) setSprintGoal(draft.sprintGoal);
      if (draft.tickets) setTickets(draft.tickets);
      if (draft.polishedOutput) setPolishedOutput(draft.polishedOutput);
    }
  }, []);

  // Save draft on changes
  useEffect(() => {
    storageService.saveStandupDraft({
      yesterday: yesterdayItems,
      today: todayItems,
      blockers: blockerItems,
      sprintGoal,
      tickets,
      polishedOutput,
    });
  }, [yesterdayItems, todayItems, blockerItems, sprintGoal, tickets, polishedOutput]);

  // Import completed tasks from Kanban
  const handleImportCompletedTasks = () => {
    const completedTasks = tasks.filter((t) => t.status === 'done');
    if (completedTasks.length === 0) {
      alert('No completed tasks in Kanban. Mark some tasks as Done first!');
      return;
    }
    const newItems = completedTasks.map((t) => `Completed: ${t.title}`);
    // Merge without duplicates
    const merged = Array.from(new Set([...yesterdayItems, ...newItems]));
    setYesterdayItems(merged);
    audioService.playSuccessTone();
  };

  // Import in-progress tasks from Kanban
  const handleImportInProgressTasks = () => {
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress' || t.status === 'review');
    if (inProgressTasks.length === 0) {
      alert('No active in-progress or review tasks found.');
      return;
    }
    const newItems = inProgressTasks.map((t) => `Working on: ${t.title}`);
    const merged = Array.from(new Set([...todayItems, ...newItems]));
    setTodayItems(merged);
    audioService.playSuccessTone();
  };

  // Quick Blocker presets
  const addPresetBlocker = (blockerText: string) => {
    if (!blockerItems.includes(blockerText)) {
      setBlockerItems([...blockerItems, blockerText]);
      audioService.playBeep(650, 0.05);
    }
  };

  const handleAddTicket = () => {
    if (ticketInput.trim() && !tickets.includes(ticketInput.trim())) {
      setTickets([...tickets, ticketInput.trim()]);
      setTicketInput('');
    }
  };

  const handleRemoveTicket = (t: string) => {
    setTickets(tickets.filter((item) => item !== t));
  };

  // AI Polish
  const handleAIPolish = async () => {
    setIsPolishing(true);
    audioService.playBeep(900, 0.08);

    try {
      const response = await fetch('/api/standup/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yesterday: yesterdayItems.join('\n'),
          today: todayItems.join('\n'),
          blockers: blockerItems.join('\n') || 'None',
          sprintGoal,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to polish standup with AI');
      }

      const data = await response.json();
      setPolishedOutput(data.polished);
      audioService.playSuccessTone();
    } catch (err: any) {
      console.error(err);
      // Fallback local formatter if offline
      generateStandardMarkdown();
    } finally {
      setIsPolishing(false);
    }
  };

  const generateStandardMarkdown = () => {
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    let text = `*Daily Standup - ${dateStr}*\n`;
    if (sprintGoal) text += `🎯 *Sprint Goal:* ${sprintGoal}\n\n`;
    
    text += `*✅ Yesterday:*\n`;
    if (yesterdayItems.length === 0) text += `- Ongoing task progress\n`;
    else yesterdayItems.forEach((item) => (text += `• ${item}\n`));

    text += `\n*🚀 Today:*\n`;
    if (todayItems.length === 0) text += `- Continued sprint tasks\n`;
    else todayItems.forEach((item) => (text += `• ${item}\n`));

    text += `\n*⚠️ Blockers:*\n`;
    if (blockerItems.length === 0) text += `• None\n`;
    else blockerItems.forEach((item) => (text += `• ${item}\n`));

    if (tickets.length > 0) {
      text += `\n*🔗 Tickets:* ${tickets.join(', ')}\n`;
    }

    setPolishedOutput(text);
  };

  const getFormattedText = (format: 'slack' | 'jira' | 'plain') => {
    if (polishedOutput && format === 'slack') {
      return polishedOutput;
    }

    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (format === 'slack') {
      let t = `*Daily Standup - ${dateStr}*\n`;
      if (sprintGoal) t += `🎯 *Goal:* ${sprintGoal}\n`;
      t += `*Yesterday:*\n${yesterdayItems.map((i) => `• ${i}`).join('\n') || '• Routine maintenance'}\n`;
      t += `*Today:*\n${todayItems.map((i) => `• ${i}`).join('\n') || '• Continue current backlog'}\n`;
      t += `*Blockers:*\n${blockerItems.length ? blockerItems.map((i) => `• ${i}`).join('\n') : '• None'}\n`;
      if (tickets.length) t += `*Tickets:* ${tickets.join(', ')}`;
      return t;
    } else if (format === 'jira') {
      let t = `h3. Daily Standup - ${dateStr}\n`;
      if (sprintGoal) t += `*Goal:* ${sprintGoal}\n`;
      t += `*Yesterday:*\n${yesterdayItems.map((i) => `# ${i}`).join('\n') || '# Ongoing'}\n`;
      t += `*Today:*\n${todayItems.map((i) => `# ${i}`).join('\n') || '# Ongoing'}\n`;
      t += `*Blockers:*\n${blockerItems.length ? blockerItems.map((i) => `* ${i}`).join('\n') : '* None'}\n`;
      if (tickets.length) t += `*Tickets:* ${tickets.join(', ')}`;
      return t;
    } else {
      let t = `Daily Standup - ${dateStr}\n\n`;
      if (sprintGoal) t += `Goal: ${sprintGoal}\n\n`;
      t += `Yesterday:\n${yesterdayItems.map((i) => `- ${i}`).join('\n') || '- Ongoing'}\n\n`;
      t += `Today:\n${todayItems.map((i) => `- ${i}`).join('\n') || '- Ongoing'}\n\n`;
      t += `Blockers:\n${blockerItems.length ? blockerItems.map((i) => `- ${i}`).join('\n') : '- None'}\n\n`;
      if (tickets.length) t += `Tickets: ${tickets.join(', ')}`;
      return t;
    }
  };

  const handleCopy = (format: 'slack' | 'jira' | 'plain') => {
    const text = getFormattedText(format);
    navigator.clipboard.writeText(text);
    audioService.playBeep(1200, 0.08);
    setCopyFeedback(format);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Save to history
  const handleSaveToHistory = () => {
    const entry: StandupEntry = {
      id: 'standup-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      sprintGoal,
      yesterday: [...yesterdayItems],
      today: [...todayItems],
      blockers: [...blockerItems],
      jiraTickets: [...tickets],
      polishedMarkdown: polishedOutput || getFormattedText('slack'),
      submittedAt: new Date().toLocaleTimeString(),
    };

    const updated = [entry, ...history];
    setHistory(updated);
    storageService.saveStandups(updated);
    audioService.playSuccessTone();
    alert('Standup recorded to history! You can view past updates anytime.');
  };

  // Delete single history entry
  const handleDeleteHistoryEntry = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Delete this standup archive?')) {
      const updated = history.filter((h) => h.id !== id);
      setHistory(updated);
      storageService.saveStandups(updated);
      audioService.playBeep(450, 0.05);
    }
  };

  // Delete all history
  const handleClearAllHistory = () => {
    if (history.length === 0) return;
    if (confirm(`Delete all ${history.length} archived standups? This cannot be undone.`)) {
      setHistory([]);
      storageService.saveStandups([]);
      audioService.playBeep(400, 0.08);
    }
  };

  // Reset entire draft
  const handleClearAllDraft = () => {
    if (confirm('Reset and clear all standup draft fields?')) {
      setYesterdayItems([]);
      setTodayItems([]);
      setBlockerItems([]);
      setTickets([]);
      setSprintGoal('');
      setPolishedOutput('');
      storageService.saveStandupDraft({});
      audioService.playBeep(400, 0.06);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>AGILE STANDUP COPILOT</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Daily Standup & Status Synchronizer
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Synthesize yesterday's wins, today's focus, and blockers. 1-click import from Kanban & AI polish for Slack.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleClearAllDraft}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 hover:border-rose-700/60 text-slate-300 hover:text-rose-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Delete all inputs in draft"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Draft</span>
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showHistory ? 'Hide History' : 'Standup History'} ({history.length})</span>
          </button>

          <button
            onClick={handleSaveToHistory}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Archive Today's Update</span>
          </button>
        </div>
      </div>

      {/* Standup History Drawer */}
      {showHistory && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-800/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Previous Standup Submissions</span>
            </h3>
            <div className="flex items-center gap-3">
              {history.length > 0 && (
                <button
                  onClick={handleClearAllHistory}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-mono transition-colors cursor-pointer"
                  title="Delete all archived standups"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All History</span>
                </button>
              )}
              <span className="text-xs text-slate-400 font-mono">Archived in LocalStorage</span>
            </div>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">No past standups archived yet. Click "Archive Today's Update" above.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {history.map((h) => (
                <div key={h.id} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-2 relative group">
                  <div className="flex items-center justify-between text-slate-400 font-mono">
                    <span className="font-semibold text-cyan-400">{h.date}</span>
                    <div className="flex items-center gap-1.5">
                      <span>{h.submittedAt}</span>
                      <button
                        onClick={(e) => handleDeleteHistoryEntry(h.id, e)}
                        className="p-1 rounded bg-slate-800/80 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Delete this standup entry"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div className="font-medium text-emerald-400 text-[11px]">Yesterday ({h.yesterday.length}):</div>
                    <p className="line-clamp-2 text-slate-400">{h.yesterday.join(' • ')}</p>
                    <div className="font-medium text-cyan-400 text-[11px] mt-1">Today ({h.today.length}):</div>
                    <p className="line-clamp-2 text-slate-400">{h.today.join(' • ')}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (h.polishedMarkdown) {
                        navigator.clipboard.writeText(h.polishedMarkdown);
                        audioService.playBeep(1100, 0.06);
                        alert('Archived standup copied to clipboard!');
                      }
                    }}
                    className="w-full mt-2 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Input Builder (Left) & Output / AI Polish (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Input Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Sprint Goal & Ticket tags */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Active Sprint Objective
              </label>
              <div className="flex items-center gap-2">
                {sprintGoal && (
                  <button
                    onClick={() => {
                      setSprintGoal('');
                      audioService.playBeep(450, 0.03);
                    }}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Clear sprint objective"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Goal</span>
                  </button>
                )}
                <span className="text-[11px] text-slate-500 font-mono">Context for Team</span>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={sprintGoal}
                onChange={(e) => setSprintGoal(e.target.value)}
                placeholder="e.g. Sprint 14: Finish DB migration and improve latency"
                className="w-full px-3 py-2 pr-8 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
              />
              {sprintGoal && (
                <button
                  onClick={() => {
                    setSprintGoal('');
                    audioService.playBeep(450, 0.03);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
                  title="Clear text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* JIRA / PR Tickets */}
            <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Tickets/PRs:</span>
              {tickets.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-mono"
                >
                  {t}
                  <button
                    onClick={() => handleRemoveTicket(t)}
                    className="hover:text-rose-400 ml-0.5 cursor-pointer"
                    title={`Delete ticket ${t}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {tickets.length > 0 && (
                <button
                  onClick={() => {
                    setTickets([]);
                    audioService.playBeep(450, 0.03);
                  }}
                  className="text-[11px] font-mono text-slate-500 hover:text-rose-400 px-1 py-0.5 rounded transition-colors cursor-pointer ml-auto"
                  title="Delete all tickets"
                >
                  Clear Tickets
                </button>
              )}
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTicket())}
                  placeholder="+ Add (e.g. AUTH-102)"
                  className="w-28 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleAddTicket}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Yesterday's Accomplishments */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">What did you accomplish yesterday?</h3>
              </div>
              <div className="flex items-center gap-2">
                {yesterdayItems.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete all ${yesterdayItems.length} yesterday items?`)) {
                        setYesterdayItems([]);
                        audioService.playBeep(450, 0.04);
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/60 text-rose-300 text-xs font-mono transition-colors cursor-pointer"
                    title="Delete all items in Yesterday's section"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All ({yesterdayItems.length})</span>
                  </button>
                )}
                <button
                  onClick={handleImportCompletedTasks}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60 text-xs font-mono transition-colors cursor-pointer"
                  title="Auto-fill with tasks marked 'done' in your Kanban board"
                >
                  <Download className="w-3 h-3" />
                  <span>Import Done Tasks</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {yesterdayItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <span className="text-emerald-400 text-xs">•</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const updated = [...yesterdayItems];
                      updated[idx] = e.target.value;
                      setYesterdayItems(updated);
                    }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={() => {
                      setYesterdayItems(yesterdayItems.filter((_, i) => i !== idx));
                      audioService.playBeep(450, 0.03);
                    }}
                    className="text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Delete this item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add item input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={rawNewYesterday}
                  onChange={(e) => setRawNewYesterday(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && rawNewYesterday.trim()) {
                      e.preventDefault();
                      setYesterdayItems([...yesterdayItems, rawNewYesterday.trim()]);
                      setRawNewYesterday('');
                    }
                  }}
                  placeholder="+ Add yesterday accomplishment (press Enter)"
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-dashed border-slate-800 text-xs text-slate-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={() => {
                    if (rawNewYesterday.trim()) {
                      setYesterdayItems([...yesterdayItems, rawNewYesterday.trim()]);
                      setRawNewYesterday('');
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Today's Plan */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">What will you work on today?</h3>
              </div>
              <div className="flex items-center gap-2">
                {todayItems.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete all ${todayItems.length} today items?`)) {
                        setTodayItems([]);
                        audioService.playBeep(450, 0.04);
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/60 text-rose-300 text-xs font-mono transition-colors cursor-pointer"
                    title="Delete all items in Today's section"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All ({todayItems.length})</span>
                  </button>
                )}
                <button
                  onClick={handleImportInProgressTasks}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/60 text-xs font-mono transition-colors cursor-pointer"
                  title="Auto-fill with In-Progress / Review tasks from Kanban"
                >
                  <Download className="w-3 h-3" />
                  <span>Import In-Progress</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {todayItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <span className="text-cyan-400 text-xs">•</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const updated = [...todayItems];
                      updated[idx] = e.target.value;
                      setTodayItems(updated);
                    }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={() => {
                      setTodayItems(todayItems.filter((_, i) => i !== idx));
                      audioService.playBeep(450, 0.03);
                    }}
                    className="text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Delete this item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add item input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={rawNewToday}
                  onChange={(e) => setRawNewToday(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && rawNewToday.trim()) {
                      e.preventDefault();
                      setTodayItems([...todayItems, rawNewToday.trim()]);
                      setRawNewToday('');
                    }
                  }}
                  placeholder="+ Add today's commitment (press Enter)"
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-dashed border-slate-800 text-xs text-slate-400 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={() => {
                    if (rawNewToday.trim()) {
                      setTodayItems([...todayItems, rawNewToday.trim()]);
                      setRawNewToday('');
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Blockers / Risks */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Any blockers or impediments?</h3>
              </div>
              <div className="flex items-center gap-2">
                {blockerItems.length > 0 && (
                  <button
                    onClick={() => {
                      setBlockerItems([]);
                      audioService.playBeep(450, 0.04);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/60 text-rose-300 text-xs font-mono transition-colors cursor-pointer"
                    title="Clear all blockers"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Blockers ({blockerItems.length})</span>
                  </button>
                )}
                <span className="text-[11px] text-slate-500 font-mono">Keep it actionable</span>
              </div>
            </div>

            {/* Quick preset badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-mono mr-1">Presets:</span>
              {[
                'Waiting on PR code review',
                'Blocked by upstream microservice',
                'Pending DB migration approval',
                'Staging environment unstable',
                'No blockers ✅',
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    if (preset === 'No blockers ✅') {
                      setBlockerItems([]);
                    } else {
                      addPresetBlocker(preset);
                    }
                  }}
                  className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700/60 transition-colors cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              {blockerItems.length === 0 ? (
                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>Zero blockers reported. Full speed ahead!</span>
                </div>
              ) : (
                blockerItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 group">
                    <span className="text-amber-400 text-xs">⚠️</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...blockerItems];
                        updated[idx] = e.target.value;
                        setBlockerItems(updated);
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-amber-200 focus:outline-none focus:border-amber-500/50"
                    />
                    <button
                      onClick={() => {
                        setBlockerItems(blockerItems.filter((_, i) => i !== idx));
                        audioService.playBeep(450, 0.03);
                      }}
                      className="text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Delete this blocker"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}

              {/* Add blocker input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={rawNewBlocker}
                  onChange={(e) => setRawNewBlocker(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && rawNewBlocker.trim()) {
                      e.preventDefault();
                      setBlockerItems([...blockerItems, rawNewBlocker.trim()]);
                      setRawNewBlocker('');
                    }
                  }}
                  placeholder="+ Add blocker description (press Enter)"
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-dashed border-slate-800 text-xs text-slate-400 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                />
                <button
                  onClick={() => {
                    if (rawNewBlocker.trim()) {
                      setBlockerItems([...blockerItems, rawNewBlocker.trim()]);
                      setRawNewBlocker('');
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Output Preview, Formats & AI Polish (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-cyan-900/40 shadow-xl space-y-4">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Synchronized Output</span>
                </div>
                {polishedOutput && (
                  <button
                    onClick={() => {
                      setPolishedOutput('');
                      audioService.playBeep(450, 0.03);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-[11px] font-mono transition-colors cursor-pointer"
                    title="Clear custom polished text and reset to default preview"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Polish</span>
                  </button>
                )}
              </div>

              {/* AI Polish Button with High Thinking badge */}
              <button
                onClick={handleAIPolish}
                disabled={isPolishing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-medium transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isPolishing ? 'animate-spin' : ''}`} />
                <span>{isPolishing ? 'Thinking & Polishing...' : 'AI Polish (Gemini 3.1)'}</span>
              </button>
            </div>

            {/* Target Channel Format Selector */}
            <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveFormat('slack')}
                className={`flex-1 py-1.5 text-center rounded font-mono transition-colors ${
                  activeFormat === 'slack'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Slack / Discord
              </button>
              <button
                onClick={() => setActiveFormat('jira')}
                className={`flex-1 py-1.5 text-center rounded font-mono transition-colors ${
                  activeFormat === 'jira'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Jira / Confluence
              </button>
              <button
                onClick={() => setActiveFormat('plain')}
                className={`flex-1 py-1.5 text-center rounded font-mono transition-colors ${
                  activeFormat === 'plain'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Plain Text
              </button>
            </div>

            {/* Formatted Textarea / View */}
            <div className="relative">
              <textarea
                value={getFormattedText(activeFormat)}
                onChange={(e) => setPolishedOutput(e.target.value)}
                rows={14}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
              />

              {/* Floating Copy Button */}
              <button
                onClick={() => handleCopy(activeFormat)}
                className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-medium shadow-md transition-all active:scale-95"
              >
                {copyFeedback === activeFormat ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy for {activeFormat}</span>
                  </>
                )}
              </button>
            </div>

            {/* Bottom Quick Actions */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="font-mono text-[11px] text-slate-500">
                Tip: Paste directly into #daily-standup in Slack or Teams.
              </span>
              <button
                onClick={handleClearAllDraft}
                className="text-slate-500 hover:text-rose-400 transition-colors text-[11px] flex items-center gap-1 cursor-pointer"
                title="Delete all inputs and reset draft"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset / Clear Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
