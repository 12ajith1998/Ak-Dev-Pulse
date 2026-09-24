import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Task, StandupEntry } from '../../types';
import { audioService } from '../../services/audioService';
import { 
  MessageSquareCode, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  Terminal, 
  Brain, 
  Cpu, 
  Layers, 
  Database,
  ArrowDown,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

interface AIChatPageProps {
  tasks: Task[];
  standupDraft: any;
}

const STARTER_PROMPTS = [
  {
    category: 'Spring Boot & JPA',
    icon: Layers,
    prompt: 'How do I resolve Hibernate N+1 query issues in Spring Boot 3 using @EntityGraph and spring.jpa.properties.hibernate.default_batch_fetch_size?',
  },
  {
    category: 'PostgreSQL Indexing',
    icon: Database,
    prompt: 'Explain how to interpret PostgreSQL EXPLAIN (ANALYZE, BUFFERS) output for slow sequential scans and how to design composite B-Tree indexes.',
  },
  {
    category: 'Full-Stack Architecture',
    icon: Cpu,
    prompt: 'Provide a production-ready docker-compose.yml for Spring Boot 3 (JDK 21), Angular 18 (Nginx), and PostgreSQL 16 with health checks and volume persistence.',
  },
  {
    category: 'Angular Signals',
    icon: Terminal,
    prompt: 'How should I refactor legacy Angular RxJS BehaviorSubjects into modern Angular 18 Signals and computed properties? Provide before/after code.',
  },
];

export const AIChatPage: React.FC<AIChatPageProps> = ({ tasks, standupDraft }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **DevPulse Senior Staff Engineer & System Architect AI**, running with **Gemini 3.1 Pro High-Thinking Mode** enabled.

I can help you with:
- **Spring Boot 3 & Microservices:** Spring Security 6, HikariCP, JPA query optimization, Kafka event streaming.
- **PostgreSQL Database:** Schema design, DDL migrations, EXPLAIN ANALYZE, indexing strategies, deadlocks.
- **Angular 18 & Frontend:** Standalone components, Signals, OnPush change detection, HTTP interceptors.
- **DevOps & Containers:** Docker multi-stage builds, Kubernetes manifests, CI/CD pipelines, Prometheus/Grafana metrics.

Feel free to ask a question below or click any of the starter engineering prompts!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    audioService.playBeep(850, 0.04);

    try {
      // Build engineer workspace context if enabled
      let workspaceContext = null;
      if (includeContext) {
        workspaceContext = {
          activeTasks: tasks.filter((t) => t.status === 'in_progress' || t.status === 'review').map((t) => ({
            title: t.title,
            priority: t.priority,
            tags: t.tags,
            points: t.storyPoints,
          })),
          standupSummary: standupDraft ? {
            sprintGoal: standupDraft.sprintGoal,
            today: standupDraft.today,
            blockers: standupDraft.blockers,
          } : null,
        };
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          context: workspaceContext,
          thinkingMode: true, // High Thinking enabled via gemini-3.1-pro-preview
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error communicating with Gemini API');
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      audioService.playSuccessTone();
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Error communicating with Gemini 3.1 Thinking Model:**\n\n${err.message}\n\nPlease verify your network or Gemini API key quota.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    audioService.playBeep(1200, 0.04);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (confirm('Clear chat conversation history?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Chat cleared. Ask anything regarding Spring Boot, Angular, PostgreSQL, or system architecture.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      audioService.playBeep(450, 0.05);
    }
  };

  // Basic markdown renderer for code blocks and bold text
  const renderMarkdown = (text: string) => {
    // Split by code blocks
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0]?.trim() || 'code';
        const code = (lines.length > 1 ? lines.slice(1).join('\n') : lines[0]) || '';

        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
              <span className="uppercase text-[11px] font-semibold text-cyan-400">{lang}</span>
              <button
                onClick={() => handleCopy(code, `code-${index}`)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedId === `code-${index}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="text-[11px]">{copiedId === `code-${index}` ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-slate-200 leading-relaxed scrollbar-thin">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Regular text formatting: headers, bold, bullet points
      const lines = part.split('\n');
      return (
        <div key={index} className="space-y-1">
          {lines.map((line, lIdx) => {
            if (line.startsWith('### ')) {
              return <h4 key={lIdx} className="text-sm font-bold text-cyan-300 mt-2">{line.replace('### ', '')}</h4>;
            }
            if (line.startsWith('## ')) {
              return <h3 key={lIdx} className="text-base font-bold text-white mt-3">{line.replace('## ', '')}</h3>;
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2">
                  <span className="text-cyan-400">•</span>
                  <span>{line.substring(2)}</span>
                </div>
              );
            }
            if (!line.trim()) {
              return <div key={lIdx} className="h-2"></div>;
            }
            return <p key={lIdx} className="leading-relaxed">{line}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-semibold">GEMINI 3.1 PRO • HIGH THINKING MODE</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px]">
              Active
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Senior Staff Architect & AI Copilot
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Deep reasoning agent specialized in Spring Boot 3, Angular 18, PostgreSQL 16, and cloud infrastructure.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeContext}
              onChange={(e) => setIncludeContext(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950"
            />
            <span>Inject Workspace Context</span>
          </label>

          <button
            onClick={handleClearChat}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Starter Prompts Carousel (when few messages) */}
      {messages.length <= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {STARTER_PROMPTS.map((starter, idx) => {
            const Icon = starter.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(starter.prompt)}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-mono font-semibold mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{starter.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-200 line-clamp-3 leading-relaxed">
                    {starter.prompt}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-cyan-500 mt-2 block">Click to ask →</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="min-h-[480px] max-h-[580px] overflow-y-auto p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 scrollbar-thin">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                  <Brain className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-4 text-xs ${
                  isAssistant
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
                    : 'bg-cyan-600 text-white shadow-md'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-white/10 text-[10px] font-mono opacity-80">
                  <span className="font-semibold">
                    {isAssistant ? 'DevPulse AI (Gemini 3.1 Pro Thinking)' : 'You'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {isAssistant && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:text-white"
                        title="Copy entire response"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="leading-relaxed">
                  {renderMarkdown(msg.content)}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 flex-shrink-0 mt-0.5 font-mono text-xs font-bold">
                  IT
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator with Thinking Mode */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 animate-pulse">
              <Brain className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-xl bg-slate-900 border border-cyan-800/60 text-xs text-cyan-300 font-mono flex items-center gap-3">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Gemini 3.1 Pro is reasoning deeply (ThinkingLevel.HIGH)...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything about Spring Boot, Angular, Postgres queries, system architecture, or debug a stack trace... (Press Enter to send)"
            className="flex-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none font-sans"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-10 px-5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
          <span>Shift + Enter for new line</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Thinking Mode: HIGH
          </span>
        </div>
      </div>
    </div>
  );
};
