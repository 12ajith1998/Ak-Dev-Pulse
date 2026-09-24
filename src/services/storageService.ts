import { Task, ChecklistTemplate, AlarmItem, StandupEntry, ReminderItem } from '../types';

const STORAGE_KEYS = {
  TASKS: 'devpulse_tasks_v1',
  CHECKLISTS: 'devpulse_checklists_v1',
  ALARMS: 'devpulse_alarms_v1',
  REMINDERS: 'devpulse_reminders_v1',
  WATER_INTAKE: 'devpulse_water_intake_v1',
  STANDUPS: 'devpulse_standups_v1',
  ACTIVE_STANDUP_DRAFT: 'devpulse_standup_draft_v1',
};

// Initial IT Engineer Seed Tasks
const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Review Spring Boot JPA Query N+1 and add @EntityGraph',
    description: 'Optimize user fetch queries in UserService to eliminate 140+ redundant database round-trips.',
    status: 'in_progress',
    priority: 'P0',
    tags: ['Backend', 'Database'],
    storyPoints: 5,
    pomodorosCompleted: 2,
    pomodorosEstimated: 4,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Migrate PostgreSQL connection pool to HikariCP with SSL',
    description: 'Ensure max pool size is 25 with 30s connection timeout and valid cert bundle in Kubernetes secret.',
    status: 'in_progress',
    priority: 'P1',
    tags: ['Database', 'DevOps'],
    storyPoints: 3,
    pomodorosCompleted: 1,
    pomodorosEstimated: 2,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Implement Angular OnPush change detection in analytics table',
    description: 'Stop unnecessary re-renders on high frequency WebSocket telemetry streams.',
    status: 'review',
    priority: 'P1',
    tags: ['Frontend'],
    storyPoints: 3,
    pomodorosCompleted: 3,
    pomodorosEstimated: 3,
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Setup GitHub Actions CI for multi-stage Docker build',
    description: 'Include Maven test caching, Trivy vulnerability scan, and push to container registry.',
    status: 'done',
    priority: 'P2',
    tags: ['DevOps', 'Security'],
    storyPoints: 5,
    pomodorosCompleted: 4,
    pomodorosEstimated: 4,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'task-5',
    title: 'Add Redis Cache-Aside layer for JWT public key verification',
    description: 'Cache JWKS response with 1 hour TTL to reduce IdP roundtrips under high concurrency.',
    status: 'backlog',
    priority: 'P2',
    tags: ['Backend', 'Security'],
    storyPoints: 2,
    pomodorosCompleted: 0,
    pomodorosEstimated: 2,
    createdAt: new Date().toISOString(),
  },
];

// Initial IT Production Checklists
const INITIAL_CHECKLISTS: ChecklistTemplate[] = [
  {
    id: 'checklist-prod-deploy',
    title: 'Production Deployment Pre-Flight Checklist',
    description: 'Sanity runbook to execute before triggering production releases and canary cutovers.',
    category: 'deployment',
    items: [
      { id: 'c1', text: 'Database migration scripts tested backward-compatible (expand & contract)', completed: true, notes: 'Liquibase / Flyway verified' },
      { id: 'c2', text: 'Environment variables and secrets synced in Cloud Secret Manager', completed: true },
      { id: 'c3', text: 'All unit and integration tests green in CI pipeline (100% pass)', completed: true },
      { id: 'c4', text: 'Health checks (/actuator/health or /api/health) verified with liveness & readiness probes', completed: false },
      { id: 'c5', text: 'Grafana / Datadog dashboards and APM latency alerts open on secondary monitor', completed: false },
      { id: 'c6', text: 'Rollback plan and container image SHA documented in deployment ticket', completed: false },
      { id: 'c7', text: 'Traffic canary shifted to 5% with zero 5xx spike after 10 minutes', completed: false },
    ],
  },
  {
    id: 'checklist-pr-review',
    title: 'Pull Request & Code Review Standard',
    description: 'Senior engineer review checklist before merging pull requests.',
    category: 'code-review',
    items: [
      { id: 'pr1', text: 'No sensitive credentials, API keys, or raw JWT tokens hardcoded', completed: false },
      { id: 'pr2', text: 'Proper error handling with structured JSON responses and no stack traces exposed', completed: false },
      { id: 'pr3', text: 'Database queries check indexes and avoid SELECT * on large tables', completed: false },
      { id: 'pr4', text: 'TypeScript types strictly defined without "any" escapes', completed: false },
      { id: 'pr5', text: 'Unit tests cover happy path and error boundaries', completed: false },
      { id: 'pr6', text: 'Clean Git commit history rebased on main with descriptive message', completed: false },
    ],
  },
  {
    id: 'checklist-incident-runbook',
    title: 'Incident Response & Triage Runbook',
    description: 'High-severity production incident triage and communication checklist.',
    category: 'incident',
    items: [
      { id: 'inc1', text: 'Declare Incident in Slack #war-room and assign Incident Commander', completed: false },
      { id: 'inc2', text: 'Check APM error rate, p99 latency, and database active connection count', completed: false },
      { id: 'inc3', text: 'Determine blast radius and post initial internal status update within 15 min', completed: false },
      { id: 'inc4', text: 'Mitigate first: Roll back release, scale pods, or toggle feature flag off', completed: false },
      { id: 'inc5', text: 'Verify customer impact resolved before marking incident mitigated', completed: false },
      { id: 'inc6', text: 'Preserve logs/metrics snapshot and schedule blameless post-mortem', completed: false },
    ],
  },
  {
    id: 'checklist-db-migration',
    title: 'PostgreSQL Zero-Downtime Migration Checklist',
    description: 'Safe DDL execution guidelines for high-traffic PostgreSQL databases.',
    category: 'database',
    items: [
      { id: 'db1', text: 'Add column as nullable first (never ADD COLUMN with DEFAULT on legacy versions)', completed: false },
      { id: 'db2', text: 'Create indexes CONCURRENTLY to avoid blocking read/write transactions', completed: false },
      { id: 'db3', text: 'Set statement_timeout and lock_timeout on migration session to prevent cascade blocks', completed: false },
      { id: 'db4', text: 'Verify foreign keys created with NOT VALID then validated in separate transaction', completed: false },
      { id: 'db5', text: 'Run ANALYZE on modified tables to refresh planner statistics', completed: false },
    ],
  },
];

// Initial Alarms for IT engineer daily rhythm
const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 'alarm-standup',
    time: '09:45',
    label: 'Daily Standup Sync 🚀',
    enabled: true,
    sound: 'chime',
    repeatDays: [1, 2, 3, 4, 5], // Mon - Fri
  },
  {
    id: 'alarm-freeze',
    time: '17:00',
    label: 'Production Deployment Freeze 🛑',
    enabled: true,
    sound: 'radar',
    repeatDays: [1, 2, 3, 4, 5],
  },
  {
    id: 'alarm-water',
    time: '14:30',
    label: 'Post-Lunch Coffee & Stretch Break ☕',
    enabled: false,
    sound: 'synth',
    repeatDays: [1, 2, 3, 4, 5],
  },
];

const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-water',
    title: 'Drink Water & Hydrate',
    description: 'Drink a glass of water (250ml) to keep brain and cognitive focus sharp.',
    category: 'health',
    type: 'interval',
    intervalMinutes: 45,
    icon: 'droplet',
    enabled: true,
    sound: 'water',
    completionsToday: 3,
    dailyTarget: 8,
  },
  {
    id: 'rem-lunch',
    title: 'Go for Lunch Break',
    description: 'Step away from your workstation, refuel, and give your mind a true break.',
    category: 'routine',
    type: 'scheduled',
    scheduledTime: '12:30',
    icon: 'utensils',
    enabled: true,
    sound: 'gong',
    completionsToday: 0,
    dailyTarget: 1,
  },
  {
    id: 'rem-posture',
    title: 'Posture Check & Spine Stretch',
    description: 'Unclench jaw, roll shoulders backward, adjust chair lumbar, and do a quick stretch.',
    category: 'wellness',
    type: 'interval',
    intervalMinutes: 60,
    icon: 'activity',
    enabled: true,
    sound: 'chime',
    completionsToday: 2,
    dailyTarget: 6,
  },
  {
    id: 'rem-eyes',
    title: '20-20-20 Eye Strain Rest',
    description: 'Look away from the monitor at an object 20 feet away for 20 seconds.',
    category: 'health',
    type: 'interval',
    intervalMinutes: 20,
    icon: 'eye',
    enabled: true,
    sound: 'pip',
    completionsToday: 5,
    dailyTarget: 12,
  },
  {
    id: 'rem-walk',
    title: 'Stand Up & 5-Min Walk',
    description: 'Get blood flowing, walk to the pantry or patio, and stretch your legs.',
    category: 'wellness',
    type: 'interval',
    intervalMinutes: 90,
    icon: 'walk',
    enabled: true,
    sound: 'chime',
    completionsToday: 1,
    dailyTarget: 4,
  },
  {
    id: 'rem-coffee',
    title: 'Afternoon Tea / Coffee',
    description: 'Afternoon reboot and gentle cognitive reset.',
    category: 'routine',
    type: 'scheduled',
    scheduledTime: '15:30',
    icon: 'coffee',
    enabled: true,
    sound: 'pip',
    completionsToday: 0,
    dailyTarget: 1,
  },
  {
    id: 'rem-shutdown',
    title: 'Logoff & Evening Wind Down',
    description: 'Commit code, push PRs, update standup, and shut down workstation on time.',
    category: 'routine',
    type: 'scheduled',
    scheduledTime: '18:30',
    icon: 'moon',
    enabled: true,
    sound: 'gong',
    completionsToday: 0,
    dailyTarget: 1,
  },
];

export const storageService = {
  // Tasks
  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  },
  saveTasks(tasks: Task[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  },

  // Checklists
  getChecklists(): ChecklistTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
      return data ? JSON.parse(data) : INITIAL_CHECKLISTS;
    } catch {
      return INITIAL_CHECKLISTS;
    }
  },
  saveChecklists(checklists: ChecklistTemplate[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));
    } catch (e) {
      console.error(e);
    }
  },

  // Alarms
  getAlarms(): AlarmItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALARMS);
      return data ? JSON.parse(data) : INITIAL_ALARMS;
    } catch {
      return INITIAL_ALARMS;
    }
  },
  saveAlarms(alarms: AlarmItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
    } catch (e) {
      console.error(e);
    }
  },

  // Standup Entries
  getStandups(): StandupEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STANDUPS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveStandups(entries: StandupEntry[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.STANDUPS, JSON.stringify(entries));
    } catch (e) {
      console.error(e);
    }
  },

  // Standup Draft
  getStandupDraft(): any {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_STANDUP_DRAFT);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  saveStandupDraft(draft: any) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STANDUP_DRAFT, JSON.stringify(draft));
    } catch (e) {
      console.error(e);
    }
  },

  // Reminders (Hydration, Lunch, Posture, Eye rest, etc.)
  getReminders(): ReminderItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return data ? JSON.parse(data) : INITIAL_REMINDERS;
    } catch {
      return INITIAL_REMINDERS;
    }
  },
  saveReminders(reminders: ReminderItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (e) {
      console.error(e);
    }
  },

  // Water Tracker
  getWaterIntake(): { count: number; date: string } {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = localStorage.getItem(STORAGE_KEYS.WATER_INTAKE);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.date === today) return parsed;
      }
      return { count: 3, date: today }; // default 3 glasses
    } catch {
      return { count: 3, date: new Date().toISOString().split('T')[0] };
    }
  },
  saveWaterIntake(count: number) {
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(STORAGE_KEYS.WATER_INTAKE, JSON.stringify({ count, date: today }));
    } catch (e) {
      console.error(e);
    }
  },

  // Export / Import
  exportAllData(): string {
    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      tasks: this.getTasks(),
      checklists: this.getChecklists(),
      alarms: this.getAlarms(),
      reminders: this.getReminders(),
      waterIntake: this.getWaterIntake(),
      standups: this.getStandups(),
    };
    return JSON.stringify(backup, null, 2);
  },
  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.checklists) this.saveChecklists(data.checklists);
      if (data.alarms) this.saveAlarms(data.alarms);
      if (data.reminders) this.saveReminders(data.reminders);
      if (data.waterIntake) this.saveWaterIntake(data.waterIntake.count);
      if (data.standups) this.saveStandups(data.standups);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.CHECKLISTS);
    localStorage.removeItem(STORAGE_KEYS.ALARMS);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    localStorage.removeItem(STORAGE_KEYS.WATER_INTAKE);
    localStorage.removeItem(STORAGE_KEYS.STANDUPS);
  }
};
