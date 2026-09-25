export type TabType = 
  | 'standup'
  | 'todos'
  | 'checklist'
  | 'reminders'
  | 'timer'
  | 'alarm'
  | 'music'
  | 'calculator'
  | 'ai-chat'
  | 'profile';

export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done';
export type TaskTag = 'Backend' | 'Frontend' | 'Database' | 'DevOps' | 'Bugfix' | 'Security' | 'Docs';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: TaskTag[];
  storyPoints?: number;
  pomodorosCompleted: number;
  pomodorosEstimated: number;
  createdAt: string;
  completedAt?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  notes?: string;
}

export interface ChecklistTemplate {
  id: string;
  title: string;
  description: string;
  category: 'deployment' | 'code-review' | 'incident' | 'database' | 'custom';
  items: ChecklistItem[];
}

export interface AlarmItem {
  id: string;
  time: string; // 'HH:MM'
  label: string;
  enabled: boolean;
  sound: 'chime' | 'digital' | 'radar' | 'synth';
  repeatDays: number[]; // 0 = Sun, 1 = Mon ...
  isSnoozed?: boolean;
}

export type ReminderType = 'interval' | 'scheduled';
export type ReminderCategory = 'health' | 'wellness' | 'routine' | 'work';
export type ReminderSound = 'water' | 'gong' | 'chime' | 'pip';

export interface ReminderItem {
  id: string;
  title: string;
  description?: string;
  category: ReminderCategory;
  type: ReminderType; // 'interval' (every X minutes) or 'scheduled' (fixed time like '12:30')
  intervalMinutes?: number; // for interval type
  scheduledTime?: string; // 'HH:MM' for scheduled type
  icon: 'droplet' | 'utensils' | 'coffee' | 'eye' | 'activity' | 'walk' | 'moon' | 'sparkles';
  enabled: boolean;
  sound: ReminderSound;
  lastTriggered?: string; // ISO string
  nextTriggerTime?: string; // ISO string
  completionsToday: number;
  dailyTarget?: number; // e.g. 8 for 8 glasses of water
}

export interface StandupEntry {
  id: string;
  date: string; // YYYY-MM-DD
  sprintGoal: string;
  yesterday: string[];
  today: string[];
  blockers: string[];
  jiraTickets: string[];
  polishedMarkdown?: string;
  submittedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isThinking?: boolean;
  modelUsed?: string;
  fallbackNotice?: string;
  isError?: boolean;
  errorType?: '503' | 'quota' | 'network' | 'generic';
  originalPrompt?: string;
}

export type SoundscapeType = 
  | 'lofi'
  | 'rain'
  | 'brown-noise'
  | 'gamma-40hz'
  | 'cyberpunk'
  | 'ambient-drone'
  | 'lofi-beats'
  | 'synthwave-drive'
  | 'alpha-waves'
  | 'theta-deep'
  | 'coffee-shop'
  | 'forest-birds'
  | 'deep-ocean'
  | 'fireplace'
  | 'piano-solitude'
  | 'zen-garden'
  | 'space-voyager'
  | 'coding-pulse'
  | 'white-noise'
  | 'pink-noise'
  | 'chiptune-8bit'
  | 'solfeggio-528'
  | 'tibetan-bowls'
  | 'wind-pines'
  | 'night-crickets'
  | 'thunderstorm'
  | 'delta-sleep'
  | 'jazz-cafe'
  | 'ambient-pads'
  | 'cyber-matrix'
  | 'waterfall';

export interface SoundscapeTrack {
  id: SoundscapeType;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  bpm?: number;
}
