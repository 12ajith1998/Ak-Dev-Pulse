import React, { useState, useEffect } from 'react';
import { audioService } from '../../services/audioService';
import { 
  Send, 
  Terminal, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  Clock, 
  Zap, 
  Code2, 
  Globe, 
  FileText, 
  Layers, 
  RefreshCw, 
  Download, 
  Sliders,
  ShieldAlert,
  ArrowRight,
  Database,
  X,
  RotateCcw,
  Edit2
} from 'lucide-react';

interface KeyValueRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestHistoryItem {
  id: string;
  method: string;
  url: string;
  status?: number;
  timeMs?: number;
  timestamp: string;
}

const DEFAULT_PRESET_REQUESTS = [
  {
    id: 'preset-1',
    name: 'DevPulse Internal Health',
    method: 'GET',
    url: '/api/health',
    description: 'Queries backend server uptime, memory usage, and node telemetry',
  },
  {
    id: 'preset-2',
    name: 'JSONPlaceholder Users',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/users',
    description: 'Fetch sample engineer profiles for testing frontend mappings',
  },
  {
    id: 'preset-3',
    name: 'JSONPlaceholder Create Post',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    body: JSON.stringify({ title: 'Spring Boot 3 Migration', body: 'Implemented Virtual Threads and JPA EntityGraph', userId: 1 }, null, 2),
    description: 'Simulate REST POST entity creation with JSON payload',
  },
  {
    id: 'preset-4',
    name: 'HttpBin GET & Headers Echo',
    method: 'GET',
    url: 'https://httpbin.org/get',
    description: 'Echoes back client headers, IP, and query parameters',
  },
  {
    id: 'preset-5',
    name: 'GitHub Octocat API',
    method: 'GET',
    url: 'https://api.github.com/users/octocat',
    description: 'Public GitHub developer user profile endpoint',
  },
];

export const ApiWorkbench: React.FC = () => {
  const [method, setMethod] = useState<string>('GET');
  const [url, setUrl] = useState<string>('/api/health');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params');
  const [useProxy, setUseProxy] = useState<boolean>(true);

  // Editable & Deletable Presets with LocalStorage persistence
  const [presets, setPresets] = useState<typeof DEFAULT_PRESET_REQUESTS>(() => {
    try {
      const saved = localStorage.getItem('devpulse_api_presets_v3');
      if (saved) return JSON.parse(saved);
      return DEFAULT_PRESET_REQUESTS;
    } catch {
      return DEFAULT_PRESET_REQUESTS;
    }
  });

  const [isSavePresetModalOpen, setIsSavePresetModalOpen] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newPresetDesc, setNewPresetDesc] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('devpulse_api_presets_v3', JSON.stringify(presets));
    } catch (e) {
      console.warn('Failed to save presets', e);
    }
  }, [presets]);

  // Key-value builders
  const [queryParams, setQueryParams] = useState<KeyValueRow[]>([
    { id: '1', key: '', value: '', enabled: true },
  ]);
  const [headers, setHeaders] = useState<KeyValueRow[]>([
    { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
    { id: '2', key: 'Accept', value: 'application/json', enabled: true },
  ]);
  const [bodyText, setBodyText] = useState<string>('{\n  "status": "testing",\n  "framework": "Spring Boot 3"\n}');

  // Execution state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState<string>('');
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [responseSize, setResponseSize] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tools & History
  const [history, setHistory] = useState<RequestHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('devpulse_api_history_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [curlModalOpen, setCurlModalOpen] = useState<boolean>(false);
  const [importCurlText, setImportCurlText] = useState<string>('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('devpulse_api_history_v1', JSON.stringify(history));
  }, [history]);

  // Handle URL updates when query parameters change
  const buildFullUrl = () => {
    try {
      const activeRows = queryParams.filter((p) => p.enabled && p.key.trim() !== '');
      if (activeRows.length === 0) return url;

      const [base] = url.split('?');
      const searchParams = new URLSearchParams();
      activeRows.forEach((row) => {
        searchParams.append(row.key.trim(), row.value);
      });
      return `${base}?${searchParams.toString()}`;
    } catch {
      return url;
    }
  };

  const handleSend = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setResponseData(null);
    setResponseStatus(null);
    setResponseHeaders(null);
    audioService.playBeep(900, 0.04);

    const fullUrl = buildFullUrl();
    const startTime = Date.now();

    // Prepare headers
    const reqHeaders: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.enabled && h.key.trim()) {
        reqHeaders[h.key.trim()] = h.value;
      }
    });

    try {
      if (useProxy) {
        // Send through DevPulse server-side proxy
        const res = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: fullUrl,
            method,
            headers: reqHeaders,
            body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? bodyText : undefined,
          }),
        });

        const data = await res.json();
        const duration = data.latencyMs || (Date.now() - startTime);

        if (!res.ok) {
          throw new Error(data.error || `Proxy error: HTTP ${res.status}`);
        }

        setResponseStatus(data.status);
        setResponseStatusText(data.statusText || '');
        setResponseLatency(duration);
        setResponseHeaders(data.headers || {});
        setResponseData(data.data);
        
        const bytes = data.sizeBytes || 0;
        setResponseSize(bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`);

        // Add to history
        addHistoryItem(method, fullUrl, data.status, duration);
        audioService.playSuccessTone();
      } else {
        // Direct browser fetch
        const fetchOptions: RequestInit = {
          method,
          headers: reqHeaders,
        };

        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && bodyText.trim()) {
          fetchOptions.body = bodyText;
        }

        const res = await fetch(fullUrl, fetchOptions);
        const duration = Date.now() - startTime;
        const contentType = res.headers.get('content-type') || '';

        let data: any;
        if (contentType.includes('application/json')) {
          data = await res.json();
        } else {
          data = await res.text();
        }

        const resHeaders: Record<string, string> = {};
        res.headers.forEach((v, k) => {
          resHeaders[k] = v;
        });

        setResponseStatus(res.status);
        setResponseStatusText(res.statusText);
        setResponseLatency(duration);
        setResponseHeaders(resHeaders);
        setResponseData(data);

        const bytes = typeof data === 'string' ? data.length : JSON.stringify(data).length;
        setResponseSize(bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`);

        addHistoryItem(method, fullUrl, res.status, duration);
        audioService.playSuccessTone();
      }
    } catch (err: any) {
      const duration = Date.now() - startTime;
      setErrorMessage(err.message || 'Network request failed. Try enabling "DevPulse Proxy" to bypass CORS.');
      setResponseLatency(duration);
      addHistoryItem(method, fullUrl, 0, duration);
      audioService.playBeep(350, 0.08);
    } finally {
      setIsLoading(false);
    }
  };

  const addHistoryItem = (m: string, u: string, s?: number, t?: number) => {
    const item: RequestHistoryItem = {
      id: 'req-' + Date.now(),
      method: m,
      url: u,
      status: s,
      timeMs: t,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setHistory((prev) => [item, ...prev.slice(0, 19)]);
  };

  // Preset Selection
  const applyPreset = (preset: typeof DEFAULT_PRESET_REQUESTS[0]) => {
    setMethod(preset.method);
    setUrl(preset.url);
    if (preset.body) {
      setBodyText(preset.body);
      setActiveTab('body');
    }
    audioService.playBeep(750, 0.03);
  };

  // cURL Generator
  const generateCurl = (): string => {
    const fullUrl = buildFullUrl();
    let curl = `curl -X ${method} "${fullUrl}"`;

    headers.filter((h) => h.enabled && h.key.trim()).forEach((h) => {
      curl += ` \\\n  -H "${h.key.trim()}: ${h.value}"`;
    });

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && bodyText.trim()) {
      const escaped = bodyText.replace(/"/g, '\\"');
      curl += ` \\\n  -d "${escaped}"`;
    }

    return curl;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurl());
    setCopyFeedback(true);
    audioService.playBeep(1100, 0.05);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Import cURL
  const handleImportCurl = () => {
    if (!importCurlText.trim()) return;

    try {
      const text = importCurlText.trim();
      // Parse method
      const methodMatch = text.match(/-X\s+([A-Z]+)/i);
      if (methodMatch) {
        setMethod(methodMatch[1].toUpperCase());
      } else if (text.includes('-d ') || text.includes('--data')) {
        setMethod('POST');
      } else {
        setMethod('GET');
      }

      // Parse URL
      const urlMatch = text.match(/https?:\/\/[^\s"']+/);
      if (urlMatch) {
        setUrl(urlMatch[0]);
      }

      // Parse Headers
      const headerMatches = [...text.matchAll(/-H\s+["']([^"']+)["']/g)];
      if (headerMatches.length > 0) {
        const newHeaders: KeyValueRow[] = headerMatches.map((m, idx) => {
          const parts = m[1].split(':');
          return {
            id: String(idx + 1),
            key: parts[0]?.trim() || '',
            value: parts.slice(1).join(':').trim(),
            enabled: true,
          };
        });
        setHeaders(newHeaders);
      }

      // Parse Data Body
      const bodyMatch = text.match(/(-d|--data|--data-raw)\s+["'](.+?)["'](\s|$)/s);
      if (bodyMatch) {
        setBodyText(bodyMatch[2]);
        setActiveTab('body');
      }

      setImportFeedback('cURL imported successfully!');
      audioService.playSuccessTone();
      setTimeout(() => {
        setImportFeedback(null);
        setCurlModalOpen(false);
      }, 1000);
    } catch {
      setImportFeedback('Failed to parse cURL string. Please check the syntax.');
    }
  };

  // Pretty format JSON body
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(bodyText);
      setBodyText(JSON.stringify(parsed, null, 2));
      audioService.playBeep(850, 0.03);
    } catch {
      alert('Invalid JSON syntax. Cannot format.');
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-400 bg-emerald-950/70 border-emerald-700/60';
    if (status >= 300 && status < 400) return 'text-cyan-400 bg-cyan-950/70 border-cyan-700/60';
    if (status >= 400 && status < 500) return 'text-amber-400 bg-amber-950/70 border-amber-700/60';
    return 'text-rose-400 bg-rose-950/70 border-rose-700/60';
  };

  const handleClearResponse = () => {
    setResponseData(null);
    setResponseStatus(null);
    setResponseStatusText('');
    setResponseLatency(null);
    setResponseHeaders(null);
    setErrorMessage(null);
    audioService.playBeep(450, 0.04);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
    audioService.playBeep(450, 0.04);
  };

  const handleDeletePreset = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete preset "${name}"?`)) {
      setPresets((prev) => prev.filter((p) => p.id !== id));
      audioService.playBeep(450, 0.04);
    }
  };

  const handleSaveCurrentPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const newPreset = {
      id: 'preset-' + Date.now(),
      name: newPresetName.trim(),
      method,
      url,
      body: ['POST', 'PUT', 'PATCH'].includes(method) ? bodyText : undefined,
      description: newPresetDesc.trim() || `${method} ${url}`,
    };

    setPresets([newPreset, ...presets]);
    setIsSavePresetModalOpen(false);
    setNewPresetName('');
    setNewPresetDesc('');
    audioService.playSuccessTone();
  };

  const handleResetPresets = () => {
    if (confirm('Reset quick presets back to default test endpoints?')) {
      setPresets(DEFAULT_PRESET_REQUESTS);
      audioService.playSuccessTone();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. TOP HEADER RIBBON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
            <Globe className="w-3.5 h-3.5" />
            <span className="font-semibold tracking-wider uppercase">REST & WEBHOOK WORKBENCH</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] text-cyan-300 font-mono">
              In-Browser HTTP Client
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            API Playground & Webhook Dispatcher
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
            Test backend microservices, inspect headers, inspect round-trip latency, and convert requests to cURL with server-side proxy failover.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CORS Proxy Toggle */}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 cursor-pointer hover:border-cyan-500/40 transition-colors">
            <input
              type="checkbox"
              checked={useProxy}
              onChange={(e) => setUseProxy(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
            />
            <span title="Proxies request through server to bypass browser CORS headers">CORS Proxy</span>
            {useProxy && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          </label>

          <button
            onClick={() => setCurlModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import cURL</span>
          </button>

          <button
            onClick={handleCopyCurl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-mono transition-colors cursor-pointer"
            title="Generate & copy equivalent cURL command"
          >
            {copyFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copyFeedback ? 'cURL Copied!' : 'Copy cURL'}</span>
          </button>
        </div>
      </div>

      {/* QUICK PRESETS ROW (EDITABLE & DELETABLE) */}
      <div className="flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin flex-1">
          <span className="text-slate-500 flex items-center gap-1 shrink-0 pl-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Presets:</span>
          </span>
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center rounded-lg bg-slate-900/80 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-500/50 transition-colors whitespace-nowrap shrink-0 group"
            >
              <button
                onClick={() => applyPreset(preset)}
                className="px-2.5 py-1 text-slate-300 hover:text-cyan-300 cursor-pointer flex items-center gap-1.5"
                title={preset.description}
              >
                <span className="font-bold text-cyan-400">{preset.method}</span>
                <span>{preset.name}</span>
              </button>
              <button
                onClick={(e) => handleDeletePreset(preset.id, preset.name, e)}
                className="px-1.5 py-1 text-slate-600 hover:text-rose-400 transition-colors cursor-pointer border-l border-slate-800"
                title="Delete preset"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <button
            onClick={() => setIsSavePresetModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors shrink-0 cursor-pointer"
            title="Save current URL, method & body as preset"
          >
            <Plus className="w-3 h-3" />
            <span>Save Preset</span>
          </button>
        </div>

        <button
          onClick={handleResetPresets}
          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer shrink-0"
          title="Reset default presets"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* 2. REQUEST BAR (METHOD + URL + SEND) */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center gap-2.5 shadow-lg">
        {/* Method Picker */}
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className={`px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-950 border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer ${
            method === 'GET' ? 'text-cyan-400' :
            method === 'POST' ? 'text-emerald-400' :
            method === 'PUT' ? 'text-amber-400' :
            method === 'DELETE' ? 'text-rose-400' : 'text-purple-400'
          }`}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
          <option value="HEAD">HEAD</option>
          <option value="OPTIONS">OPTIONS</option>
        </select>

        {/* URL Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="https://api.example.com/v1/resource or /api/health"
            className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isLoading || !url.trim()}
          className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow-md shadow-cyan-600/20 active:scale-95 cursor-pointer shrink-0"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </>
          )}
        </button>
      </div>

      {/* 3. WORKBENCH TABS & RESPONSE CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Parameters, Headers, Body (7 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-lg">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('params')}
                  className={`px-4 py-2.5 text-xs font-mono font-medium transition-colors border-b-2 cursor-pointer ${
                    activeTab === 'params'
                      ? 'border-cyan-500 text-cyan-400 bg-slate-900/50'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Params ({queryParams.filter((p) => p.key.trim()).length})
                </button>
                <button
                  onClick={() => setActiveTab('headers')}
                  className={`px-4 py-2.5 text-xs font-mono font-medium transition-colors border-b-2 cursor-pointer ${
                    activeTab === 'headers'
                      ? 'border-cyan-500 text-cyan-400 bg-slate-900/50'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Headers ({headers.filter((h) => h.key.trim()).length})
                </button>
                <button
                  onClick={() => setActiveTab('body')}
                  className={`px-4 py-2.5 text-xs font-mono font-medium transition-colors border-b-2 cursor-pointer ${
                    activeTab === 'body'
                      ? 'border-cyan-500 text-cyan-400 bg-slate-900/50'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Body {['POST', 'PUT', 'PATCH'].includes(method) && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block ml-1" />}
                </button>
              </div>

              {activeTab === 'body' && (
                <button
                  onClick={handleFormatJson}
                  className="px-2.5 py-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Format JSON payload"
                >
                  Pretty JSON
                </button>
              )}
            </div>

            {/* Tab Contents */}
            <div className="p-4 min-h-[280px]">
              {/* Params Tab */}
              {activeTab === 'params' && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pb-1">
                    <span>Query Key & Value</span>
                    <span>Action</span>
                  </div>
                  {queryParams.map((row, idx) => (
                    <div key={row.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.enabled}
                        onChange={(e) => {
                          const updated = [...queryParams];
                          updated[idx].enabled = e.target.checked;
                          setQueryParams(updated);
                        }}
                        className="w-3.5 h-3.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                      />
                      <input
                        type="text"
                        value={row.key}
                        onChange={(e) => {
                          const updated = [...queryParams];
                          updated[idx].key = e.target.value;
                          setQueryParams(updated);
                        }}
                        placeholder="Parameter Key"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => {
                          const updated = [...queryParams];
                          updated[idx].value = e.target.value;
                          setQueryParams(updated);
                        }}
                        placeholder="Value"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={() => {
                          setQueryParams(queryParams.filter((_, i) => i !== idx));
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                        title="Remove param row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setQueryParams([...queryParams, { id: 'param-' + Date.now(), key: '', value: '', enabled: true }]);
                    }}
                    className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Add Parameter</span>
                  </button>
                </div>
              )}

              {/* Headers Tab */}
              {activeTab === 'headers' && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pb-1">
                    <span>Header Name & Value</span>
                    <span>Action</span>
                  </div>
                  {headers.map((row, idx) => (
                    <div key={row.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.enabled}
                        onChange={(e) => {
                          const updated = [...headers];
                          updated[idx].enabled = e.target.checked;
                          setHeaders(updated);
                        }}
                        className="w-3.5 h-3.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                      />
                      <input
                        type="text"
                        value={row.key}
                        onChange={(e) => {
                          const updated = [...headers];
                          updated[idx].key = e.target.value;
                          setHeaders(updated);
                        }}
                        placeholder="Header Key (e.g. Authorization)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => {
                          const updated = [...headers];
                          updated[idx].value = e.target.value;
                          setHeaders(updated);
                        }}
                        placeholder="Header Value"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={() => {
                          setHeaders(headers.filter((_, i) => i !== idx));
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                        title="Remove header row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setHeaders([...headers, { id: 'hdr-' + Date.now(), key: '', value: '', enabled: true }]);
                    }}
                    className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Add Header</span>
                  </button>
                </div>
              )}

              {/* Body Tab */}
              {activeTab === 'body' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1">
                    <span>Raw JSON / Body Payload</span>
                    <span>application/json</span>
                  </div>
                  <textarea
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    rows={10}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed resize-y scrollbar-thin"
                    placeholder='{\n  "key": "value"\n}'
                  />
                </div>
              )}
            </div>
          </div>

          {/* Request History Drawer */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recent Request Activity ({history.length})</span>
              </h4>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([]);
                    audioService.playBeep(450, 0.04);
                  }}
                  className="text-[10px] font-mono text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No API requests executed yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                {history.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => {
                      setMethod(h.method);
                      setUrl(h.url);
                      audioService.playBeep(800, 0.03);
                    }}
                    className="p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={`font-bold ${
                        h.method === 'GET' ? 'text-cyan-400' :
                        h.method === 'POST' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {h.method}
                      </span>
                      <span className="truncate text-slate-300 max-w-[220px]">{h.url}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {h.status !== undefined && (
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${getStatusColor(h.status)}`}>
                          {h.status === 0 ? 'FAIL' : h.status}
                        </span>
                      )}
                      {h.timeMs !== undefined && (
                        <span className="text-[10px] text-slate-500">{h.timeMs}ms</span>
                      )}
                      <button
                        onClick={(e) => handleDeleteHistoryItem(h.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer"
                        title="Delete this history entry"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Response Inspector (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full min-h-[460px]">
            {/* Response Status Bar */}
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Response:</span>
                {responseStatus !== null ? (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getStatusColor(responseStatus)}`}>
                    {responseStatus} {responseStatusText}
                  </span>
                ) : (
                  <span className="text-xs font-mono text-slate-500">Idle / Awaiting Request</span>
                )}
              </div>

              {responseLatency !== null && (
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{responseLatency} ms</span>
                  </span>
                  {responseSize && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-emerald-400" />
                      <span>{responseSize}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Response Body Inspector */}
            <div className="p-4 flex-1 flex flex-col space-y-3">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                  <p className="text-xs font-mono text-slate-400">Dispatching HTTP request...</p>
                </div>
              ) : errorMessage ? (
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800 text-rose-300 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-rose-400">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Request Dispatched with Errors</span>
                    </div>
                    <button
                      onClick={handleClearResponse}
                      className="text-xs font-mono text-slate-400 hover:text-rose-300 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear Error</span>
                    </button>
                  </div>
                  <p>{errorMessage}</p>
                  <p className="text-slate-400 text-[11px] pt-1">
                    Tip: Ensure CORS headers are enabled on the target server, or make sure the <strong>CORS Proxy</strong> checkbox is enabled above.
                  </p>
                </div>
              ) : responseData !== null ? (
                <div className="flex-1 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Parsed Body</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleClearResponse}
                        className="flex items-center gap-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Clear and delete response data"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            typeof responseData === 'string' ? responseData : JSON.stringify(responseData, null, 2)
                          );
                          audioService.playBeep(1100, 0.05);
                        }}
                        className="flex items-center gap-1 text-cyan-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Body</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-auto max-h-[380px] leading-relaxed scrollbar-thin">
                    {typeof responseData === 'string'
                      ? responseData
                      : JSON.stringify(responseData, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-slate-500 space-y-2">
                  <Globe className="w-10 h-10 opacity-30 mx-auto text-cyan-400" />
                  <p className="text-xs font-mono">Send a request above or select a preset to inspect response payloads.</p>
                </div>
              )}

              {/* Response Headers Collapsible */}
              {responseHeaders && Object.keys(responseHeaders).length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <details className="text-xs font-mono text-slate-400 group">
                    <summary className="cursor-pointer hover:text-cyan-300 select-none pb-2 flex items-center justify-between">
                      <span>Response Headers ({Object.keys(responseHeaders).length})</span>
                      <span className="text-[10px] text-slate-500">Click to expand</span>
                    </summary>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 max-h-36 overflow-y-auto space-y-1 scrollbar-thin">
                      {Object.entries(responseHeaders).map(([k, v]) => (
                        <div key={k} className="flex items-start justify-between gap-4 text-[11px]">
                          <span className="text-slate-400 font-bold shrink-0">{k}:</span>
                          <span className="text-cyan-400 truncate">{v}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* IMPORT cURL MODAL */}
      {curlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-slate-900 border border-cyan-800/60 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Import cURL Command</h3>
              </div>
              <button
                onClick={() => setCurlModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste any cURL request string below. The method, endpoint URL, request headers, and payload will be automatically parsed into the workbench:
            </p>

            <textarea
              value={importCurlText}
              onChange={(e) => setImportCurlText(e.target.value)}
              rows={6}
              placeholder="curl -X POST https://api.example.com -H 'Content-Type: application/json' -d '{...}'"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none"
            />

            {importFeedback && (
              <p className={`text-xs font-mono p-2 rounded-lg ${importFeedback.includes('successfully') ? 'text-emerald-300 bg-emerald-950/60' : 'text-rose-300 bg-rose-950/60'}`}>
                {importFeedback}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setCurlModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCurl}
                disabled={!importCurlText.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                Import to Workbench
              </button>
            </div>
          </div>
        </div>
      )}
      {/* SAVE PRESET MODAL */}
      {isSavePresetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveCurrentPreset}
            className="w-full max-w-md bg-slate-900 border border-cyan-800/60 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Save Quick Preset</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSavePresetModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Preset Name</label>
                <input
                  type="text"
                  required
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g. Auth Token Refresh"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  placeholder="e.g. Tests OAuth refresh token exchange"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Method:</span>
                  <span className="text-cyan-400 font-bold">{method}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Endpoint:</span>
                  <span className="text-slate-300 truncate">{url}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSavePresetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                Save Preset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
