import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus, TaskTag } from '../../types';
import { storageService } from '../../services/storageService';
import { audioService } from '../../services/audioService';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Tag, 
  ChevronRight, 
  ChevronLeft,
  Timer,
  Layers,
  Sparkles
} from 'lucide-react';

interface TodoListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onSelectTaskForTimer?: (task: Task) => void;
}

const ALL_TAGS: TaskTag[] = ['Backend', 'Frontend', 'Database', 'DevOps', 'Bugfix', 'Security', 'Docs'];
const ALL_PRIORITIES: TaskPriority[] = ['P0', 'P1', 'P2', 'P3'];

export const TodoList: React.FC<TodoListProps> = ({ tasks, setTasks, onSelectTaskForTimer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // New task modal / inline form state
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('P1');
  const [newTags, setNewTags] = useState<TaskTag[]>(['Backend']);
  const [newPoints, setNewPoints] = useState<number>(3);
  const [newEstimatedPomos, setNewEstimatedPomos] = useState<number>(2);

  const saveUpdatedTasks = (updated: Task[]) => {
    setTasks(updated);
    storageService.saveTasks(updated);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: 'task-' + Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      status: 'in_progress',
      priority: newPriority,
      tags: newTags,
      storyPoints: newPoints,
      pomodorosCompleted: 0,
      pomodorosEstimated: newEstimatedPomos,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTask, ...tasks];
    saveUpdatedTasks(updated);
    audioService.playSuccessTone();

    // Reset
    setNewTitle('');
    setNewDesc('');
    setIsAdding(false);
  };

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const isNowDone = newStatus === 'done';
        return {
          ...t,
          status: newStatus,
          completedAt: isNowDone ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    saveUpdatedTasks(updated);
    if (newStatus === 'done') {
      audioService.playSuccessTone();
    } else {
      audioService.playBeep(750, 0.05);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Delete this task?')) {
      const updated = tasks.filter((t) => t.id !== taskId);
      saveUpdatedTasks(updated);
      audioService.playBeep(400, 0.08);
    }
  };

  const handleIncrementPomo = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          pomodorosCompleted: t.pomodorosCompleted + 1,
        };
      }
      return t;
    });
    saveUpdatedTasks(updated);
    audioService.playBeep(1000, 0.07);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = selectedTag === 'ALL' || t.tags.includes(selectedTag as TaskTag);
    const matchesPriority = selectedPriority === 'ALL' || t.priority === selectedPriority;
    return matchesSearch && matchesTag && matchesPriority;
  });

  const columns: { id: TaskStatus; title: string; color: string; badgeColor: string }[] = [
    { id: 'backlog', title: 'Sprint Backlog', color: 'border-slate-800', badgeColor: 'bg-slate-800 text-slate-300' },
    { id: 'in_progress', title: 'In Progress', color: 'border-cyan-500/40', badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800' },
    { id: 'review', title: 'Code Review / PR', color: 'border-purple-500/40', badgeColor: 'bg-purple-950 text-purple-300 border-purple-800' },
    { id: 'done', title: 'Completed', color: 'border-emerald-500/40', badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  ];

  // Metrics
  const totalPoints = tasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
  const donePoints = tasks.filter((t) => t.status === 'done').reduce((acc, t) => acc + (t.storyPoints || 0), 0);
  const totalPomos = tasks.reduce((acc, t) => acc + t.pomodorosCompleted, 0);

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'P0':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">P0 BLOCKER</span>;
      case 'P1':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-800">P1 HIGH</span>;
      case 'P2':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">P2 MED</span>;
      case 'P3':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-400">P3 LOW</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>ENGINEER TODO LIST & KANBAN</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Todo List & Sprint Delivery
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track daily engineering tickets, estimate story points, log pomodoro focus cycles, and sync to standup.
          </p>
        </div>

        {/* Sprint Stats Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
            <span className="text-slate-400 block text-[10px]">SPRINT VELOCITY</span>
            <span className="text-white font-bold text-sm">
              {donePoints} / {totalPoints} <span className="text-cyan-400 text-xs">PTS</span>
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
            <span className="text-slate-400 block text-[10px]">FOCUS POMODOROS</span>
            <span className="text-amber-400 font-bold text-sm flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              {totalPomos} <span className="text-slate-400 text-xs font-normal">cycles</span>
            </span>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks, JIRA keys, tags..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-xs"
            >
              <option value="ALL">All Tags</option>
              {ALL_TAGS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-xs"
            >
              <option value="ALL">All Priorities</option>
              {ALL_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'kanban' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'list' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* New Task Modal Form */}
      {isAdding && (
        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-800/60 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Create New Engineering Task</span>
            </h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Task Title *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Implement Spring Data Redis cache layer for user sessions"
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Technical Notes / Acceptance Criteria</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                placeholder="Details, JIRA links, endpoints, test scenarios..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-mono text-slate-400 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="P0">P0 (Critical Blocker)</option>
                  <option value="P1">P1 (High Priority)</option>
                  <option value="P2">P2 (Medium Priority)</option>
                  <option value="P3">P3 (Low Priority)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-slate-400 mb-1">Story Points</label>
                <select
                  value={newPoints}
                  onChange={(e) => setNewPoints(parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="1">1 pt (Trivial)</option>
                  <option value="2">2 pts (Small)</option>
                  <option value="3">3 pts (Standard)</option>
                  <option value="5">5 pts (Complex)</option>
                  <option value="8">8 pts (Epic-sized)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-slate-400 mb-1">Estimated Pomodoros (25m)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={newEstimatedPomos}
                  onChange={(e) => setNewEstimatedPomos(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>
            </div>

            {/* Tags Selection */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TAGS.map((tag) => {
                  const isSelected = newTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => {
                        if (isSelected) {
                          setNewTags(newTags.filter((t) => t !== tag));
                        } else {
                          setNewTags([...newTags, tag]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                        isSelected
                          ? 'bg-cyan-600 text-white font-semibold'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 min-h-[420px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${col.badgeColor}`}>
                      {colTasks.length}
                    </span>
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                      {col.title}
                    </h3>
                  </div>
                </div>

                {/* Task Cards */}
                <div className="space-y-2.5 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-800/80 rounded-lg text-slate-600 text-xs font-mono">
                      No tasks in {col.title.toLowerCase()}
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group p-3 rounded-lg bg-slate-950/90 border border-slate-800 hover:border-cyan-600/50 transition-all hover:shadow-lg space-y-2.5 text-xs"
                      >
                        {/* Header: Priority + Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {getPriorityBadge(task.priority)}
                            {task.storyPoints && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                                {task.storyPoints} pts
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onSelectTaskForTimer && (
                              <button
                                onClick={() => onSelectTaskForTimer(task)}
                                className="p-1 hover:text-amber-400 text-slate-500"
                                title="Focus on this task with Timer"
                              >
                                <Timer className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 hover:text-rose-400 text-slate-500"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-semibold text-slate-100 leading-snug group-hover:text-cyan-300 transition-colors">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Pomodoro Progress & Status Advancer */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          {/* Pomodoro count */}
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                            <Flame className="w-3 h-3 text-amber-500" />
                            <span>
                              {task.pomodorosCompleted}/{task.pomodorosEstimated}
                            </span>
                            <button
                              onClick={() => handleIncrementPomo(task.id)}
                              className="ml-1 text-[10px] px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                              title="+1 completed pomodoro cycle"
                            >
                              +
                            </button>
                          </div>

                          {/* Quick advance button */}
                          <div className="flex items-center gap-1">
                            {col.id === 'backlog' && (
                              <button
                                onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                                className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[10px] font-mono flex items-center gap-0.5"
                              >
                                <span>Start</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                            {col.id === 'in_progress' && (
                              <button
                                onClick={() => handleUpdateStatus(task.id, 'review')}
                                className="px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-[10px] font-mono flex items-center gap-0.5"
                              >
                                <span>PR Review</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                            {col.id === 'review' && (
                              <button
                                onClick={() => handleUpdateStatus(task.id, 'done')}
                                className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[10px] font-mono flex items-center gap-0.5"
                              >
                                <span>Complete</span>
                                <CheckCircle2 className="w-3 h-3" />
                              </button>
                            )}
                            {col.id === 'done' && (
                              <button
                                onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-mono"
                                title="Reopen task"
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
          <div className="divide-y divide-slate-800">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3.5 hover:bg-slate-800/40 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => handleUpdateStatus(task.id, task.status === 'done' ? 'in_progress' : 'done')}
                    className={`p-1 rounded transition-colors ${
                      task.status === 'done' ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </span>
                      {getPriorityBadge(task.priority)}
                    </div>
                    {task.description && (
                      <p className="text-slate-500 text-[11px] mt-0.5">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400 text-[11px]">
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-amber-400">
                    <Flame className="w-3 h-3" />
                    <span>{task.pomodorosCompleted}/{task.pomodorosEstimated}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
