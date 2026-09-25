import React, { useState, useEffect, useRef } from 'react';
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
  Maximize2,
  Camera,
  Upload,
  Link,
  Trash2,
  Check,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { audioService } from '../../services/audioService';

const PRESET_AVATARS = [
  { id: 'fullstack', name: 'Full-Stack Lead', url: '/assets/developer_avatar.svg', role: 'Full Stack Java & Cloud' },
  { id: 'architect', name: 'System Architect', url: '/assets/avatar_architect.svg', role: 'Enterprise Architect' },
  { id: 'hacker', name: 'Cyberpunk Engineer', url: '/assets/avatar_hacker.svg', role: 'DevOps & Security' },
  { id: 'ai-core', name: 'AI Core Mind', url: '/assets/ai_copilot.svg', role: 'AI & ML Engineer' },
];

export const DeveloperProfile: React.FC = () => {
  const portfolioUrl = 'https://ajith-kumar-dev.netlify.app/';
  const email = '12ajith1998@gmail.com';
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);

  // Avatar state with LocalStorage persistence
  const [currentAvatar, setCurrentAvatar] = useState<string>(() => {
    return localStorage.getItem('devpulse_custom_avatar') || '/assets/developer_avatar.svg';
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('devpulse_custom_avatar', currentAvatar);
    } catch (e) {
      console.warn('Could not save avatar to localStorage', e);
    }
  }, [currentAvatar]);

  const handleOpenPortfolio = () => {
    audioService.playSuccessTone();
    window.open(portfolioUrl, '_blank', 'noopener,noreferrer');
  };

  const handleReloadIframe = () => {
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
    audioService.playBeep(750, 0.04);
  };

  const handleSelectPreset = (url: string) => {
    setCurrentAvatar(url);
    audioService.playSuccessTone();
    setUploadError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCurrentAvatar(dataUrl);
        audioService.playSuccessTone();
        setUploadError(null);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) return;
    setCurrentAvatar(customUrlInput.trim());
    setCustomUrlInput('');
    setUploadError(null);
    audioService.playSuccessTone();
  };

  const handleResetAvatar = () => {
    setCurrentAvatar('/assets/developer_avatar.svg');
    localStorage.removeItem('devpulse_custom_avatar');
    setUploadError(null);
    audioService.playBeep(550, 0.05);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. HERO PROFILE CARD */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-800/40 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar / Profile Badge with Image */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/20 overflow-hidden relative">
                <img
                  src={currentAvatar}
                  alt="Ajith Kumar Developer Avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-2xl bg-slate-950 transition-transform group-hover:scale-105 duration-200"
                  onError={() => {
                    // Fallback to default if custom url breaks
                    setCurrentAvatar('/assets/developer_avatar.svg');
                  }}
                />
                
                {/* On-Hover Quick Change Overlay */}
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity text-white text-[10px] font-mono cursor-pointer rounded-2xl"
                  title="Change or upload avatar image"
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Change</span>
                </button>
              </div>

              {/* Online Pulse Indicator */}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center" title="Available for Development">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </span>
            </div>

            {/* Profile Bio Details */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold block">
                  Developed By
                </span>
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-[10px] font-mono border border-slate-700 transition-colors cursor-pointer"
                  title="Customize Avatar / Upload Image"
                >
                  <Camera className="w-3 h-3 text-cyan-400" />
                  <span>Customize Image</span>
                </button>
              </div>

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

      {/* AVATAR & IMAGE CUSTOMIZER MODAL */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-slate-900 border border-cyan-800/60 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-wide">Developer Avatar & Image Hub</h3>
              </div>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active Preview */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <img
                src={currentAvatar}
                alt="Active Avatar Preview"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-cyan-500/40 shadow-lg"
              />
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">Active Profile Image</span>
                <p className="text-xs text-slate-300">
                  {currentAvatar.startsWith('data:') ? 'Custom image uploaded from your device' : currentAvatar}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleResetAvatar}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-xs font-mono border border-slate-700 hover:border-rose-700/60 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Reset / Delete Custom Image</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Preset Avatars Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Choose Preset Developer Persona
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = currentAvatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{preset.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{preset.role}</div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload Your Own Image Option */}
            <div className="space-y-2 border-t border-slate-800/80 pt-4">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload From Your Computer</span>
              </label>
              
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Choose Image File (PNG, JPG, SVG)</span>
                </button>
                <span className="text-xs text-slate-500 font-mono">Max 5MB • Instant preview</span>
              </div>
            </div>

            {/* Paste Custom Image URL Option */}
            <div className="space-y-2 border-t border-slate-800/80 pt-4">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-cyan-400" />
                <span>Or Paste Image Web URL</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/my-photo.jpg"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleApplyUrl}
                  disabled={!customUrlInput.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-400 font-mono bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/60">
                {uploadError}
              </p>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Reload Frame"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleOpenPortfolio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
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

