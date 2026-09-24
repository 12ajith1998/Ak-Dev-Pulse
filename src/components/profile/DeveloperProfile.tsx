import React, { useState } from 'react';
import { 
  ExternalLink, 
  Globe, 
  Mail, 
  User, 
  Code2, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight,
  Shield,
  Terminal,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { audioService } from '../../services/audioService';

export const DeveloperProfile: React.FC = () => {
  const portfolioUrl = 'https://ajith-kumar-dev.netlify.app/';
  const email = '12ajith1998@gmail.com';
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);

  const handleOpenPortfolio = () => {
    audioService.playSuccessTone();
    window.open(portfolioUrl, '_blank', 'noopener,noreferrer');
  };

  const handleReloadIframe = () => {
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
    audioService.playBeep(750, 0.04);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. HERO PROFILE CARD */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-800/40 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar / Profile Badge */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/20">
                <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center font-mono font-bold text-2xl text-cyan-400 border border-cyan-500/30">
                  AK
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center" title="Available for Development">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </span>
            </div>

            {/* Profile Bio Details */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold block">
                Developed By
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Ajith Kumar
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                  Full Stack Java Developer
                </span>
              </div>
              <p className="text-sm text-slate-300 max-w-xl">
                Passionate full-stack Java developer crafting high-performance enterprise applications, resilient backend architectures, and modern digital interfaces.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{email}</span>
                </a>
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors text-cyan-300"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>ajith-kumar-dev.netlify.app</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleOpenPortfolio}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-xl shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <span>Visit Portfolio Site</span>
              <ArrowUpRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. LIVE INTERACTIVE EMBEDDED PORTFOLIO VIEWER */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
        {/* Iframe Top Toolbar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Window Traffic Dots */}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* URL Browser Bar */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 min-w-[280px]">
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{portfolioUrl}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReloadIframe}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Reload Frame"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleOpenPortfolio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 hover:text-white text-xs font-mono transition-colors"
              title="Open full page in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open External</span>
            </button>
          </div>
        </div>

        {/* Embedded Iframe Container */}
        <div className="relative w-full h-[700px] bg-slate-950 flex flex-col">
          {iframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm gap-3">
              <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-xs font-mono text-slate-400">Loading Ajith Kumar's Portfolio...</p>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={portfolioUrl}
            title="Ajith Kumar Developer Portfolio"
            className="w-full h-full border-0 bg-white"
            onLoad={() => setIframeLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
};
