import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Task } from '../../types';
import { audioService } from '../../services/audioService';
import { 
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
  RefreshCw,
  Zap,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
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

const AVAILABLE_MODELS = [
  {
    id: 'auto',
    name: 'Auto-Adaptive',
    badge: 'Zero-Downtime',
    color: 'emerald',
    icon: ShieldCheck,
    desc: 'Automatically routes to the fastest, most available Gemini model with zero downtime failover.',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    badge: 'Deep Thinking',
    color: 'purple',
    icon: Brain,
    desc: 'Flagship reasoning engine with ThinkingLevel.HIGH for complex algorithms and architectures.',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Balanced Flash',
    color: 'cyan',
    icon: Zap,
    desc: 'Balanced high-speed reasoning with low latency.',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Ultra-Resilient',
    color: 'amber',
    icon: Cpu,
    desc: 'High availability and sub-second responses, resilient against 503 demand spikes.',
  },
];

export const AIChatPage: React.FC<AIChatPageProps> = ({ tasks, standupDraft }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **DevPulse Senior Staff Engineer & System Architect AI**, running with **Gemini Auto-Adaptive Resilience & Thinking Mode**.

I can help you with:
- **Spring Boot 3 & Microservices:** Spring Security 6, HikariCP, JPA query optimization, Kafka event streaming.
- **PostgreSQL Database:** Schema design, DDL migrations, EXPLAIN ANALYZE, indexing strategies, deadlocks.
- **Angular 18 & Frontend:** Standalone components, Signals, OnPush change detection, HTTP interceptors.
- **DevOps & Containers:** Docker multi-stage builds, Kubernetes manifests, CI/CD pipelines, Prometheus/Grafana metrics.

Feel free to ask a question below or click any of the starter engineering prompts!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'Gemini Auto-Adaptive',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('auto');
  const [thinkingMode, setThinkingMode] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string, modelOverride?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // If customPrompt was passed, don't necessarily clear current typed input unless sending what's typed
    if (!customPrompt) {
      setInput('');
    }

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);
    audioService.playBeep(850, 0.04);

    const targetModel = modelOverride || selectedModel;

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
          messages: newMessages.filter((m) => !m.isError).map((m) => ({ role: m.role, content: m.content })),
          context: workspaceContext,
          preferredModel: targetModel,
          thinkingMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error communicating with Gemini API');
      }

      const aiMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelDisplayName || data.modelUsed,
        fallbackNotice: data.fallbackNotice,
      };

      setMessages((prev) => [...prev, aiMsg]);
      audioService.playSuccessTone();
    } catch (err: any) {
      console.error('Chat error:', err);
      const is503 = err.message?.includes('503') || err.message?.includes('high demand') || err.message?.includes('UNAVAILABLE');
      const isQuota = err.message?.includes('429') || err.message?.includes('quota');

      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: is503
          ? `⚠️ **Gemini Server Demand Spike (503 Unavailable):**\n\nThe upstream Gemini model is currently experiencing temporary high traffic volume on Google infrastructure. Spikes in demand are usually short-lived.`
          : isQuota
          ? `⚠️ **Gemini Model Quota Limit (429):**\n\nThe requested Pro tier reached its token quota. You can continue instantly using **Gemini 3.1 Flash Lite**.`
          : `⚠️ **Error communicating with Gemini Model:**\n\n${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        errorType: is503 ? '503' : isQuota ? 'quota' : 'generic',
        originalPrompt: textToSend,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (prompt: string, modelOverride?: string, errorId?: string) => {
    if (errorId) {
      setMessages((prev) => prev.filter((m) => m.id !== errorId));
    }
    if (modelOverride) {
      setSelectedModel(modelOverride);
    }
    handleSend(prompt, modelOverride);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    audioService.playBeep(400, 0.03);
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
          modelUsed: 'DevPulse AI',
        },
      ]);
      audioService.playBeep(450, 0.05);
    }
  };

  // Basic markdown renderer for code blocks and bold text
  const renderMarkdown = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0]?.trim() || 'code';
        const code = (lines.length > 1 ? lines.slice(1).join('\n') : lines[0]) || '';

        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
              <span className="uppercase text-[11px] font-semibold text-cyan-400">{lang}</span>
              <button
                onClick={() => handleCopy(code, `code-${index}`)}
                className="flex items-center gap-1 hover:text-white transition-colors"
                title="Copy code to clipboard"
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

  const currentModelObj = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header Banner with AI Core Visual Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-4">
          {/* AI Core Image Avatar */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-xl shadow-cyan-500/20">
              <img
                src="/assets/ai_copilot.svg"
                alt="DevPulse AI Neural Reasoning Core"
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-2xl object-cover bg-slate-950"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
              <span className="font-semibold tracking-wide">DEVPULSE ARCHITECT AI</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 text-[10px] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Auto-Failover Active
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Senior Staff Architect & Copilot
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
              Intelligent engineering assistant specialized in Spring Boot 3, Angular 18, PostgreSQL 16, and cloud infrastructure with high-availability model cascading.
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-700/60 transition-colors text-xs font-medium cursor-pointer"
            title="Clear all chat messages"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Model Selector & Resilience Bar */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1 mr-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Model:</span>
          </span>

          {AVAILABLE_MODELS.map((m) => {
            const isSelected = selectedModel === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedModel(m.id);
                  audioService.playBeep(950, 0.03);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
                  isSelected
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={m.desc}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{m.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-cyan-900/80 text-cyan-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {m.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Thinking Mode Toggle */}
        <div className="flex items-center gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={thinkingMode}
              onChange={(e) => setThinkingMode(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-950"
            />
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Thinking Mode {thinkingMode ? '(Active)' : '(Off)'}
            </span>
          </label>
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
              className={`flex gap-3 group ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border overflow-hidden ${
                  msg.isError
                    ? 'bg-rose-950/80 border-rose-800 text-rose-400 p-1.5'
                    : 'bg-slate-950 border-cyan-800/80 shadow-md'
                }`}>
                  {msg.isError ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <img
                      src="/assets/ai_copilot.svg"
                      alt="DevPulse AI"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-4 text-xs relative ${
                  msg.isError
                    ? 'bg-rose-950/30 border border-rose-800/60 text-rose-200 shadow-md'
                    : isAssistant
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
                    : 'bg-cyan-600 text-white shadow-md'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-white/10 text-[10px] font-mono opacity-80">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {isAssistant
                        ? (msg.modelUsed ? `DevPulse AI • ${msg.modelUsed}` : 'DevPulse AI')
                        : 'You'}
                    </span>
                    {msg.isError && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-900 text-rose-200 font-semibold uppercase text-[9px]">
                        {msg.errorType === '503' ? 'High Demand Spike' : 'Service Notice'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>

                    {/* Copy action */}
                    {isAssistant && !msg.isError && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:text-white p-0.5 rounded transition-colors"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}

                    {/* Delete action for any message */}
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Fallback Notice (if auto failover happened) */}
                {msg.fallbackNotice && (
                  <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-300 font-mono flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Seamless Auto-Failover: </span>
                      <span>{msg.fallbackNotice}</span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="leading-relaxed">
                  {renderMarkdown(msg.content)}
                </div>

                {/* Error Interactive Recovery Options */}
                {msg.isError && msg.originalPrompt && (
                  <div className="mt-4 pt-3 border-t border-rose-800/40 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleRetry(msg.originalPrompt!, 'gemini-3.1-flash-lite', msg.id)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-1.5 shadow-sm text-[11px] transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Retry with Gemini 3.1 Flash Lite (Zero Downtime)</span>
                    </button>

                    <button
                      onClick={() => handleRetry(msg.originalPrompt!, undefined, msg.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 text-[11px] border border-slate-700 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Current Model</span>
                    </button>

                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="px-2.5 py-1.5 rounded-lg text-rose-300 hover:bg-rose-950/60 text-[11px] transition-colors ml-auto"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 flex-shrink-0 mt-0.5 font-mono text-xs font-bold">
                  IT
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator with Dynamic Model Feedback */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 animate-pulse">
              <Brain className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-xl bg-slate-900 border border-cyan-800/60 text-xs text-cyan-300 font-mono flex items-center gap-3 shadow-md">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>
                {currentModelObj.name} reasoning with failover cascade enabled...
              </span>
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

        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 px-1 gap-2">
          <span>Shift + Enter for new line • Delete buttons appear on hover</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Model: <strong className="text-cyan-300">{currentModelObj.name}</strong></span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Thinking: <strong className="text-purple-300">{thinkingMode ? 'HIGH' : 'OFF'}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
