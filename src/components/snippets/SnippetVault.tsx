import React, { useState, useEffect } from 'react';
import { audioService } from '../../services/audioService';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  GitPullRequest, 
  Terminal, 
  Code2, 
  Copy, 
  Check, 
  Search, 
  Plus, 
  Trash2, 
  FileText, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  Database, 
  Flame, 
  BookOpen,
  Edit2,
  Edit3,
  Bookmark,
  Share2,
  RotateCcw,
  X
} from 'lucide-react';

export interface CodeSnippet {
  id: string;
  title: string;
  language: 'java' | 'typescript' | 'sql' | 'docker' | 'bash' | 'yaml';
  tags: string[];
  code: string;
  description: string;
  isCustom?: boolean;
}

const DEFAULT_SNIPPETS: CodeSnippet[] = [
  {
    id: 'snip-1',
    title: 'Spring Boot 3 • JPA EntityGraph & Batch Fetching',
    language: 'java',
    tags: ['SpringBoot', 'JPA', 'Performance', 'Postgres'],
    description: 'Eliminates Hibernate N+1 select queries by fetching associations in single batch joins.',
    code: `@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"customer", "orderItems", "orderItems.product"})
    @Query("SELECT o FROM Order o WHERE o.status = :status")
    List<Order> findAllWithDetailsByStatus(@Param("status") OrderStatus status);
}

// application.yml tuning
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 30
        jdbc:
          batch_size: 50
          order_inserts: true
          order_updates: true`,
  },
  {
    id: 'snip-2',
    title: 'PostgreSQL • Composite Index & EXPLAIN ANALYZE',
    language: 'sql',
    tags: ['PostgreSQL', 'Indexing', 'QueryTuning'],
    description: 'Optimal B-Tree composite index syntax and execution plan inspection for high-volume joins.',
    code: `-- Composite index adhering to Equality, Range, Sort (ESR) rule
CREATE INDEX CONCURRENTLY idx_orders_tenant_status_created 
ON orders (tenant_id, status, created_at DESC)
INCLUDE (total_amount);

-- Benchmark query with buffer and timing statistics
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT tenant_id, status, total_amount, created_at
FROM orders
WHERE tenant_id = 'c9b4e112-9844-42b7' 
  AND status = 'COMPLETED'
ORDER BY created_at DESC
LIMIT 50;`,
  },
  {
    id: 'snip-3',
    title: 'Angular 18 • Reactive Signal Store Pattern',
    language: 'typescript',
    tags: ['Angular', 'Signals', 'StateManagement'],
    description: 'Lightweight reactive store using computed signals and immutable state updates.',
    code: `@Injectable({ providedIn: 'root' })
export class EngineerTaskStore {
  // Private Writable Signal
  private state = signal<{ tasks: Task[]; filter: TaskStatus | 'ALL' }>({
    tasks: [],
    filter: 'ALL',
  });

  // Public Computed Readonly Signals
  readonly activeTasks = computed(() => {
    const { tasks, filter } = this.state();
    return filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);
  });

  readonly totalStoryPoints = computed(() => 
    this.activeTasks().reduce((acc, t) => acc + (t.storyPoints || 0), 0)
  );

  updateFilter(newFilter: TaskStatus | 'ALL') {
    this.state.update(s => ({ ...s, filter: newFilter }));
  }
}`,
  },
  {
    id: 'snip-4',
    title: 'Production Dockerfile • Multi-Stage Java 21 Distroless',
    language: 'docker',
    tags: ['Docker', 'DevOps', 'Security', 'Java21'],
    description: 'Hardened, non-root, ultra-small container footprint with Google Distroless runtime.',
    code: `# Stage 1: Build & Optimize
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Distroless Minimal Secure Runtime
FROM gcr.io/distroless/java21-debian12:nonroot
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

ENV JAVA_OPTS="-XX:+UseZGC -XX:+ZGenerational -XX:MaxRAMPercentage=75.0"
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["java", "-jar", "app.jar"]`,
  },
  {
    id: 'snip-5',
    title: 'Linux Log Analysis • Awk, Grep & Sed One-Liners',
    language: 'bash',
    tags: ['Linux', 'Bash', 'Debugging', 'SRE'],
    description: 'High-speed CLI pipe commands to analyze HTTP access logs and find top offending IPs/URLs.',
    code: `# Top 10 IP addresses hitting 5xx server errors
cat access.log | grep -E 'HTTP/1.[01]" 5[0-9]{2}' | awk '{print $1}' | sort | uniq -c | sort -rn | head -n 10

# Count response status distribution
awk '{print $9}' access.log | sort | uniq -c | sort -rn

# Real-time stream of Slow Queries (> 500ms) from Spring / Postgres log
tail -f app.log | grep --line-buffered -E 'execution time: [0-9]{3,5} ms'`,
  },
];

export interface GitCommandScenario {
  id: string;
  title: string;
  category: 'Rebase & Clean' | 'Undo & Reset' | 'Stash & Shelve' | 'Branches & Remote';
  description: string;
  safety: 'safe' | 'medium' | 'high_risk';
  commandTemplate: string;
  explanation: string;
}

const DEFAULT_GIT_SCENARIOS: GitCommandScenario[] = [
  {
    id: 'git-rebase-interactive',
    title: 'Interactive Rebase & Squash Last N Commits',
    category: 'Rebase & Clean',
    safety: 'medium',
    description: 'Combine WIP commits into a clean, atomic PR commit before review.',
    commandTemplate: 'git rebase -i HEAD~3',
    explanation: 'Opens your editor to squash (s), reword (r), or drop (d) recent commits. Never force push to shared branches without --force-with-lease.',
  },
  {
    id: 'git-reset-soft',
    title: 'Undo Last Commit (Keep All Staged Changes)',
    category: 'Undo & Reset',
    safety: 'safe',
    description: 'Uncommits your last commit without losing any code or staged changes.',
    commandTemplate: 'git reset --soft HEAD~1',
    explanation: 'Leaves all modified files staged in index. Perfect for fixing commit message or adding forgotten files.',
  },
  {
    id: 'git-reset-hard',
    title: 'Nuclear Reset to Remote HEAD (Discard All Local Changes)',
    category: 'Undo & Reset',
    safety: 'high_risk',
    description: 'Completely wipes local uncommitted modifications and aligns with origin branch.',
    commandTemplate: 'git reset --hard origin/main',
    explanation: 'WARNING: Irreversibly discards any uncommitted local work. Ensure you have stashed or backed up your changes.',
  },
  {
    id: 'git-stash-message',
    title: 'Stash Uncommitted Work with Custom Tag/Message',
    category: 'Stash & Shelve',
    safety: 'safe',
    description: 'Temporarily stashes changes with a clear label so you can switch branches.',
    commandTemplate: 'git stash push -m "WIP: PostgreSQL HikariCP connection pool tuning"',
    explanation: 'Re-apply later anytime via: git stash pop or git stash apply stash@{0}',
  },
  {
    id: 'git-prune-remote',
    title: 'Prune Deleted Remote Tracking Branches',
    category: 'Branches & Remote',
    safety: 'safe',
    description: 'Cleans up local references to branches that were already merged and deleted on GitHub.',
    commandTemplate: 'git fetch --prune && git branch -vv | grep ": gone]" | awk \'{print $1}\' | xargs git branch -D',
    explanation: 'Fetches remote state and deletes local branches whose upstream was deleted.',
  },
  {
    id: 'git-cherry-pick',
    title: 'Cherry-Pick Specific Hotfix Commit to Staging/Prod',
    category: 'Rebase & Clean',
    safety: 'medium',
    description: 'Applies a single commit from another branch without merging the whole branch.',
    commandTemplate: 'git cherry-pick <COMMIT_HASH>',
    explanation: 'Transfers exact patch changes cleanly into your current checked-out branch.',
  },
  {
    id: 'git-log-graph',
    title: 'Panoramic One-Line Git Graph with Branch Tags',
    category: 'Branches & Remote',
    safety: 'safe',
    description: 'Generates a clean ASCII visual branching tree directly in your terminal.',
    commandTemplate: 'git log --graph --oneline --decorate --all -n 20',
    explanation: 'Displays commit hashes, branch pointers, and commit messages with colorized branch tracks.',
  },
];

export const SnippetVault: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'snippets' | 'git' | 'scratchpad'>('snippets');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  
  // Snippets with Full LocalStorage persistence for edit & delete
  const [snippets, setSnippets] = useState<CodeSnippet[]>(() => {
    try {
      const saved = localStorage.getItem('devpulse_all_snippets_v3');
      if (saved) {
        return JSON.parse(saved);
      }
      return DEFAULT_SNIPPETS;
    } catch {
      return DEFAULT_SNIPPETS;
    }
  });

  // Git Scenarios with LocalStorage persistence for edit & delete
  const [gitScenarios, setGitScenarios] = useState<GitCommandScenario[]>(() => {
    try {
      const saved = localStorage.getItem('devpulse_git_scenarios_v1');
      if (saved) return JSON.parse(saved);
      return DEFAULT_GIT_SCENARIOS;
    } catch {
      return DEFAULT_GIT_SCENARIOS;
    }
  });

  // Copied feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Snippet Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newLanguage, setNewLanguage] = useState<CodeSnippet['language']>('java');
  const [newTags, setNewTags] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newCode, setNewCode] = useState<string>('');

  // Edit Snippet Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingSnippetId, setEditingSnippetId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editLanguage, setEditLanguage] = useState<CodeSnippet['language']>('java');
  const [editTags, setEditTags] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCode, setEditCode] = useState<string>('');

  // Interactive Git parameters
  const [gitBranchParam, setGitBranchParam] = useState<string>('feature/auth-jwt');
  const [gitCommitParam, setGitCommitParam] = useState<string>('a8f92cd');

  // Scratchpad state
  const [scratchpadText, setScratchpadText] = useState<string>(() => {
    return localStorage.getItem('devpulse_scratchpad_v1') || 
`# DevPulse Scratchpad

// Temporary buffer for meeting notes, curl outputs, or SQL sketches.
// Auto-saves to your local browser storage.

SELECT * FROM pg_stat_activity WHERE state = 'active';
`;
  });

  // Save snippets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('devpulse_all_snippets_v3', JSON.stringify(snippets));
    } catch (e) {
      console.warn('Failed to save snippets', e);
    }
  }, [snippets]);

  // Save git scenarios to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('devpulse_git_scenarios_v1', JSON.stringify(gitScenarios));
    } catch (e) {
      console.warn('Failed to save git scenarios', e);
    }
  }, [gitScenarios]);

  // Save scratchpad
  useEffect(() => {
    localStorage.setItem('devpulse_scratchpad_v1', scratchpadText);
  }, [scratchpadText]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    audioService.playBeep(1100, 0.05);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Open Edit Modal for a snippet
  const handleOpenEdit = (snip: CodeSnippet) => {
    setEditingSnippetId(snip.id);
    setEditTitle(snip.title);
    setEditLanguage(snip.language);
    setEditTags(snip.tags.join(', '));
    setEditDescription(snip.description);
    setEditCode(snip.code);
    setIsEditModalOpen(true);
    audioService.playBeep(850, 0.03);
  };

  // Save Edited Snippet
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSnippetId || !editTitle.trim() || !editCode.trim()) return;

    setSnippets((prev) =>
      prev.map((s) => {
        if (s.id !== editingSnippetId) return s;
        return {
          ...s,
          title: editTitle.trim(),
          language: editLanguage,
          tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
          description: editDescription.trim(),
          code: editCode.trim(),
        };
      })
    );

    setIsEditModalOpen(false);
    setEditingSnippetId(null);
    audioService.playSuccessTone();
  };

  // Create Snippet
  const handleCreateSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;

    const newSnip: CodeSnippet = {
      id: 'snip-' + Date.now(),
      title: newTitle.trim(),
      language: newLanguage,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      description: newDescription.trim() || 'Custom engineer snippet',
      code: newCode.trim(),
      isCustom: true,
    };

    setSnippets([newSnip, ...snippets]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewCode('');
    setNewDescription('');
    setNewTags('');
    audioService.playSuccessTone();
  };

  // Delete Snippet (ANY snippet can be deleted)
  const handleDeleteSnippet = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete snippet "${title}" from your stash?`)) {
      setSnippets((prev) => prev.filter((s) => s.id !== id));
      audioService.playBeep(450, 0.05);
    }
  };

  // Reset Default Snippets
  const handleResetSnippets = () => {
    if (confirm('Reset snippet stash back to factory default blueprints? Any changes to default snippets will be restored.')) {
      setSnippets(DEFAULT_SNIPPETS);
      audioService.playSuccessTone();
    }
  };

  // Delete Git Scenario
  const handleDeleteGitScenario = (id: string, title: string) => {
    if (confirm(`Delete Git scenario "${title}"?`)) {
      setGitScenarios((prev) => prev.filter((s) => s.id !== id));
      audioService.playBeep(450, 0.05);
    }
  };

  // Reset Git Scenarios
  const handleResetGitScenarios = () => {
    if (confirm('Reset Git command scenarios back to defaults?')) {
      setGitScenarios(DEFAULT_GIT_SCENARIOS);
      audioService.playSuccessTone();
    }
  };

  const filteredSnippets = snippets.filter((s) => {
    const matchesSearch = 
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLang = selectedLanguage === 'all' || s.language === selectedLanguage;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. TOP HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <Code2 className="w-3.5 h-3.5" />
            <span className="font-semibold tracking-wider uppercase">DEVELOPER KNOWLEDGE & CLI VAULT</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] text-cyan-300 font-mono">
              Fully Editable & Deletable
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Git Command Copilot & Code Snippet Stash
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Battle-tested enterprise architecture snippets, interactive Git command scenarios, and an auto-saving developer scratchpad.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <button
            onClick={() => setActiveSection('snippets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeSection === 'snippets'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Code Stash ({snippets.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('git')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeSection === 'git'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>Git Copilot ({gitScenarios.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('scratchpad')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeSection === 'scratchpad'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Scratchpad</span>
          </button>
        </div>
      </div>

      {/* 2. SECTION A: CODE SNIPPET STASH */}
      {activeSection === 'snippets' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snippets by name, tag, or topic..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Language Filter & Action Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {['all', 'java', 'typescript', 'sql', 'docker', 'bash'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors uppercase cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 ml-1 shadow-md shadow-cyan-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Snippet</span>
              </button>

              <button
                onClick={handleResetSnippets}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer shrink-0"
                title="Reset factory default snippets"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Snippets Grid */}
          {filteredSnippets.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
              <Code2 className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-mono text-slate-300">No snippets found matching "{searchQuery}"</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedLanguage('all'); }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-cyan-400 hover:text-white cursor-pointer"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredSnippets.map((snippet) => (
                <div
                  key={snippet.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-950 text-cyan-400 border border-slate-800">
                            {snippet.language}
                          </span>
                          {snippet.isCustom && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                              Custom
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-white tracking-tight mt-1">
                          {snippet.title}
                        </h3>
                      </div>

                      {/* Snippet Card Controls: Copy, Edit, Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleCopy(snippet.code, snippet.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
                          title="Copy code to clipboard"
                        >
                          {copiedId === snippet.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {/* Edit Button (Available on ALL snippets) */}
                        <button
                          onClick={() => handleOpenEdit(snippet)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
                          title="Edit this snippet"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button (Available on ALL snippets) */}
                        <button
                          onClick={(e) => handleDeleteSnippet(snippet.id, snippet.title, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 transition-colors cursor-pointer"
                          title="Delete snippet from stash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {snippet.description}
                    </p>

                    {/* Code Container */}
                    <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
                      <pre className="p-3.5 text-xs font-mono text-cyan-200 overflow-x-auto max-h-48 leading-relaxed scrollbar-thin">
                        {snippet.code}
                      </pre>
                    </div>
                  </div>

                  {/* Tags row */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/60">
                    {snippet.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-mono text-slate-400 border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. SECTION B: INTERACTIVE GIT COPILOT */}
      {activeSection === 'git' && (
        <div className="space-y-5">
          {/* Quick Param Configurator & Reset */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>Interactive CLI Context:</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Target Branch:</span>
                <input
                  type="text"
                  value={gitBranchParam}
                  onChange={(e) => setGitBranchParam(e.target.value)}
                  placeholder="branch-name"
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 focus:outline-none focus:border-cyan-500 w-36"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Commit Hash:</span>
                <input
                  type="text"
                  value={gitCommitParam}
                  onChange={(e) => setGitCommitParam(e.target.value)}
                  placeholder="hash"
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 focus:outline-none focus:border-cyan-500 w-28"
                />
              </div>
            </div>

            <button
              onClick={handleResetGitScenarios}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Reset Git scenarios back to defaults"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <span>Reset Scenarios</span>
            </button>
          </div>

          {/* Git Scenarios Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gitScenarios.map((scenario) => {
              const command = scenario.commandTemplate
                .replace('<COMMIT_HASH>', gitCommitParam)
                .replace('<BRANCH>', gitBranchParam);

              return (
                <div
                  key={scenario.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {scenario.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                          scenario.safety === 'safe'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : scenario.safety === 'medium'
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
                        }`}>
                          {scenario.safety === 'safe' ? 'SAFE' : scenario.safety === 'medium' ? 'CAUTION' : 'HIGH RISK'}
                        </span>
                        
                        {/* Delete Scenario */}
                        <button
                          onClick={() => handleDeleteGitScenario(scenario.id, scenario.title)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer"
                          title="Delete scenario"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {scenario.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {scenario.description}
                    </p>

                    {/* Bash Command Box */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-cyan-800/40 relative font-mono text-xs flex items-center justify-between gap-3">
                      <code className="text-cyan-300 overflow-x-auto py-1 scrollbar-thin select-all">
                        {command}
                      </code>
                      <button
                        onClick={() => handleCopy(command, scenario.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 text-xs"
                        title="Copy command"
                      >
                        {copiedId === scenario.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 font-mono italic">
                      💡 {scenario.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SECTION C: LIVE AUTO-SAVING SCRATCHPAD */}
      {activeSection === 'scratchpad' && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Live Developer Scratchpad</h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Auto-saved in LocalStorage
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(scratchpadText);
                  audioService.playSuccessTone();
                  alert('Scratchpad content copied to clipboard!');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Clear all scratchpad text?')) {
                    setScratchpadText('');
                    audioService.playBeep(400, 0.05);
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-mono transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <textarea
            value={scratchpadText}
            onChange={(e) => setScratchpadText(e.target.value)}
            rows={18}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 leading-relaxed focus:outline-none focus:border-cyan-500 resize-y scrollbar-thin"
            placeholder="Type notes, SQL snippets, JSON payloads, or stack traces here..."
          />
        </div>
      )}

      {/* CREATE NEW SNIPPET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateSnippet}
            className="w-full max-w-xl bg-slate-900 border border-cyan-800/60 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Stash New Code Snippet</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Snippet Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. PostgreSQL Vacuum Full & Reindex Script"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Language</label>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="java">Java</option>
                    <option value="typescript">TypeScript</option>
                    <option value="sql">SQL / Postgres</option>
                    <option value="docker">Dockerfile / K8s</option>
                    <option value="bash">Bash / Shell</option>
                    <option value="yaml">YAML / Config</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Spring, Database, Linux"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Explanation / Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="When and why to use this code..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Code</label>
                <textarea
                  required
                  rows={8}
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="// Paste clean code snippet here..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                Save to Stash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT SNIPPET MODAL (WORKS FOR ANY SNIPPET) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-xl bg-slate-900 border border-cyan-800/60 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Edit Code Snippet</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Snippet Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Language</label>
                  <select
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="java">Java</option>
                    <option value="typescript">TypeScript</option>
                    <option value="sql">SQL / Postgres</option>
                    <option value="docker">Dockerfile / K8s</option>
                    <option value="bash">Bash / Shell</option>
                    <option value="yaml">YAML / Config</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Explanation / Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Code</label>
                <textarea
                  required
                  rows={9}
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
