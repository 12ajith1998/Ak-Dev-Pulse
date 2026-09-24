import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Type, 
  Sliders, 
  Palette, 
  Grid, 
  Tv, 
  Sun, 
  Check, 
  RotateCcw,
  Monitor,
  Flame,
  Zap,
  Star,
  Eye,
  Minimize2,
  Maximize2,
  Layers,
  Wand2,
  Compass
} from 'lucide-react';
import { audioService } from '../../services/audioService';

export type FontFamilyChoice = 
  | 'jakarta' 
  | 'space' 
  | 'mono' 
  | 'fira' 
  | 'outfit' 
  | 'inter' 
  | 'orbitron' 
  | 'syne';

export type AccentColorChoice = 
  | 'cyan' 
  | 'emerald' 
  | 'purple' 
  | 'amber' 
  | 'rose' 
  | 'blue' 
  | 'orange' 
  | 'crimson';

export type BgToneChoice = 'slate' | 'zinc' | 'pitch' | 'cybernavy';

export type UIScaleChoice = 'compact' | 'balanced' | 'comfortable';

export interface UIStyleConfig {
  fontFamily: FontFamilyChoice;
  accentColor: AccentColorChoice;
  bgTone: BgToneChoice;
  uiScale: UIScaleChoice;
  enableCyberGrid: boolean;
  enableAmbientSpotlight: boolean;
  enableCrtScanlines: boolean;
  enableGlassCards: boolean;
  enableNeonGlow: boolean;
  enableAnimatedStars: boolean;
}

export const ACCENT_COLOR_MAP: Record<AccentColorChoice, { hex: string; rgb: string; name: string; bgClass: string }> = {
  cyan: { hex: '#06b6d4', rgb: '6, 182, 212', name: 'Electric Cyan', bgClass: 'bg-cyan-500' },
  emerald: { hex: '#10b981', rgb: '16, 185, 129', name: 'Matrix Emerald', bgClass: 'bg-emerald-500' },
  purple: { hex: '#a855f7', rgb: '168, 85, 247', name: 'Synthwave Violet', bgClass: 'bg-purple-500' },
  amber: { hex: '#f59e0b', rgb: '245, 158, 11', name: 'Retro Amber', bgClass: 'bg-amber-500' },
  rose: { hex: '#f43f5e', rgb: '244, 63, 94', name: 'Neon Rose', bgClass: 'bg-rose-500' },
  blue: { hex: '#38bdf8', rgb: '56, 189, 248', name: 'Arctic Blue', bgClass: 'bg-sky-400' },
  orange: { hex: '#ea580c', rgb: '234, 88, 12', name: 'Solar Orange', bgClass: 'bg-orange-500' },
  crimson: { hex: '#ef4444', rgb: '239, 68, 68', name: 'Hyper Crimson', bgClass: 'bg-red-500' },
};

export const FONT_OPTIONS: { id: FontFamilyChoice; name: string; sample: string; desc: string; cssFont: string }[] = [
  {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    sample: 'DevPulse Cockpit 2026',
    desc: 'Crisp, high-legibility developer typeface engineered for modern dashboards',
    cssFont: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  {
    id: 'space',
    name: 'Space Grotesk',
    sample: 'CYBER ARCHITECTURE 01',
    desc: 'Punchy cyberpunk & engineering architectural headlines with distinct character',
    cssFont: "'Space Grotesk', system-ui, sans-serif",
  },
  {
    id: 'mono',
    name: 'JetBrains Mono',
    sample: 'const code = 0xDEADBEEF;',
    desc: 'Developer code font with ligatures and mathematical clarity',
    cssFont: "'JetBrains Mono', monospace",
  },
  {
    id: 'fira',
    name: 'Fira Code',
    sample: 'fn deploy() => result == true',
    desc: 'Mozilla developer monospace with clean spacing and symbols',
    cssFont: "'Fira Code', monospace",
  },
  {
    id: 'outfit',
    name: 'Outfit Geometric',
    sample: 'Clean Swiss Engineering',
    desc: 'Modern rounded geometric Swiss typography with clean curves',
    cssFont: "'Outfit', system-ui, sans-serif",
  },
  {
    id: 'inter',
    name: 'Inter Pro',
    sample: 'Silicon Valley Standard',
    desc: 'Ultra-refined UI font crafted by Rasmus Andersson for digital workspaces',
    cssFont: "'Inter', system-ui, sans-serif",
  },
  {
    id: 'orbitron',
    name: 'Orbitron Sci-Fi',
    sample: 'TACTICAL RADAR HUD',
    desc: 'Futuristic geometric display font for spaceship cockpits and cyber consoles',
    cssFont: "'Orbitron', monospace, sans-serif",
  },
  {
    id: 'syne',
    name: 'Syne Avant-Garde',
    sample: 'Experimental High-Tech',
    desc: 'Bold avant-garde French design typeface with ultra-modern flair',
    cssFont: "'Syne', system-ui, sans-serif",
  },
];

interface StyleStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UIStyleConfig;
  onChangeConfig: (newConfig: UIStyleConfig) => void;
  onResetDefaults: () => void;
}

export const StyleStudioModal: React.FC<StyleStudioModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'fonts' | 'accents' | 'shaders' | 'presets'>('presets');

  if (!isOpen) return null;

  const currentAccent = ACCENT_COLOR_MAP[config.accentColor] || ACCENT_COLOR_MAP.cyan;
  const currentFont = FONT_OPTIONS.find((f) => f.id === config.fontFamily) || FONT_OPTIONS[0];

  // 1-Click Aesthetic Presets
  const applyPreset = (preset: {
    name: string;
    config: Partial<UIStyleConfig>;
  }) => {
    onChangeConfig({
      ...config,
      ...preset.config,
    });
    audioService.playSuccessTone();
  };

  const PRESETS = [
    {
      id: 'cyberpunk',
      name: 'Cyberpunk 2077',
      tag: 'Neon High-Tech',
      config: {
        fontFamily: 'space' as FontFamilyChoice,
        accentColor: 'rose' as AccentColorChoice,
        bgTone: 'pitch' as BgToneChoice,
        enableCyberGrid: true,
        enableAmbientSpotlight: true,
        enableCrtScanlines: true,
        enableGlassCards: true,
        enableNeonGlow: true,
        enableAnimatedStars: false,
      },
    },
    {
      id: 'matrix',
      name: 'Matrix Terminal',
      tag: 'Hacker Phosphor',
      config: {
        fontFamily: 'mono' as FontFamilyChoice,
        accentColor: 'emerald' as AccentColorChoice,
        bgTone: 'slate' as BgToneChoice,
        enableCyberGrid: true,
        enableAmbientSpotlight: false,
        enableCrtScanlines: true,
        enableGlassCards: false,
        enableNeonGlow: true,
        enableAnimatedStars: false,
      },
    },
    {
      id: 'synthwave',
      name: 'Synthwave Sunset',
      tag: 'Retro 80s',
      config: {
        fontFamily: 'orbitron' as FontFamilyChoice,
        accentColor: 'purple' as AccentColorChoice,
        bgTone: 'cybernavy' as BgToneChoice,
        enableCyberGrid: true,
        enableAmbientSpotlight: true,
        enableCrtScanlines: false,
        enableGlassCards: true,
        enableNeonGlow: true,
        enableAnimatedStars: true,
      },
    },
    {
      id: 'silicon',
      name: 'Silicon Valley Pro',
      tag: 'Clean Minimal',
      config: {
        fontFamily: 'jakarta' as FontFamilyChoice,
        accentColor: 'cyan' as AccentColorChoice,
        bgTone: 'slate' as BgToneChoice,
        enableCyberGrid: false,
        enableAmbientSpotlight: true,
        enableCrtScanlines: false,
        enableGlassCards: true,
        enableNeonGlow: false,
        enableAnimatedStars: false,
      },
    },
    {
      id: 'deepspace',
      name: 'Deep Space Cosmic',
      tag: 'Zero Gravity',
      config: {
        fontFamily: 'outfit' as FontFamilyChoice,
        accentColor: 'blue' as AccentColorChoice,
        bgTone: 'pitch' as BgToneChoice,
        enableCyberGrid: false,
        enableAmbientSpotlight: true,
        enableCrtScanlines: false,
        enableGlassCards: true,
        enableNeonGlow: true,
        enableAnimatedStars: true,
      },
    },
    {
      id: 'amber_crt',
      name: 'Amber Monochrome',
      tag: 'Vintage VT100',
      config: {
        fontFamily: 'fira' as FontFamilyChoice,
        accentColor: 'amber' as AccentColorChoice,
        bgTone: 'zinc' as BgToneChoice,
        enableCyberGrid: true,
        enableAmbientSpotlight: true,
        enableCrtScanlines: true,
        enableGlassCards: false,
        enableNeonGlow: true,
        enableAnimatedStars: false,
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-3xl p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl border transition-all duration-300 shadow-md"
              style={{
                backgroundColor: `rgba(${currentAccent.rgb}, 0.15)`,
                borderColor: `rgba(${currentAccent.rgb}, 0.4)`,
                color: currentAccent.hex,
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">UI Style & Atmosphere Studio</h3>
                <span 
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase"
                  style={{
                    backgroundColor: `rgba(${currentAccent.rgb}, 0.15)`,
                    color: currentAccent.hex,
                    border: `1px solid rgba(${currentAccent.rgb}, 0.3)`,
                  }}
                >
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">Customize typography, accent glow, shaders, and visual density</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Interactive Preview Card */}
        <div 
          className="p-4 rounded-xl border transition-all duration-300 relative overflow-hidden"
          style={{
            backgroundColor: config.bgTone === 'pitch' ? '#000000' : config.bgTone === 'zinc' ? '#09090b' : config.bgTone === 'cybernavy' ? '#020c1b' : '#020617',
            borderColor: `rgba(${currentAccent.rgb}, 0.35)`,
            boxShadow: config.enableNeonGlow ? `0 0 25px rgba(${currentAccent.rgb}, 0.2)` : 'none',
          }}
        >
          {config.enableCyberGrid && (
            <div className="absolute inset-0 bg-cyber-grid opacity-50 pointer-events-none" />
          )}

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ backgroundColor: currentAccent.hex }}
                />
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Live Preview: {currentFont.name} • {currentAccent.name}
                </span>
              </div>
              <h2 
                className="text-lg sm:text-xl font-bold text-white tracking-tight"
                style={{ fontFamily: currentFont.cssFont }}
              >
                AK DevPulse Cockpit 2026
              </h2>
              <p className="text-xs text-slate-400">
                Active density: <span className="text-slate-200 capitalize font-mono">{config.uiScale}</span> • Atmosphere: <span className="text-slate-200 capitalize font-mono">{config.bgTone}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                style={{
                  backgroundColor: currentAccent.hex,
                  boxShadow: `0 0 15px rgba(${currentAccent.rgb}, 0.4)`,
                }}
                className="px-3.5 py-1.5 rounded-lg text-slate-950 font-bold text-xs font-mono shadow-md transition-transform active:scale-95"
              >
                Execute Sync
              </button>
              <div 
                className="px-2.5 py-1.5 rounded-lg border text-xs font-mono"
                style={{
                  borderColor: `rgba(${currentAccent.rgb}, 0.4)`,
                  color: currentAccent.hex,
                  backgroundColor: `rgba(${currentAccent.rgb}, 0.1)`,
                }}
              >
                200 OK
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
          {[
            { id: 'presets', label: '1-Click Presets', icon: Wand2 },
            { id: 'fonts', label: 'Typography (8 Fonts)', icon: Type },
            { id: 'accents', label: 'Accent Aura (8 Colors)', icon: Palette },
            { id: 'shaders', label: 'Atmosphere & Density', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  audioService.playBeep(700, 0.03);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
                style={isCurrent ? { borderColor: `rgba(${currentAccent.rgb}, 0.4)`, color: currentAccent.hex } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: 1-Click Aesthetic Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Instant curated themes designed for IT workflows:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PRESETS.map((p) => {
                const presetAccent = ACCENT_COLOR_MAP[p.config.accentColor as AccentColorChoice];
                const presetFont = FONT_OPTIONS.find((f) => f.id === p.config.fontFamily);
                const isCurrent = config.fontFamily === p.config.fontFamily && config.accentColor === p.config.accentColor;

                return (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isCurrent
                        ? 'bg-slate-800/90 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                    style={isCurrent ? { borderColor: presetAccent.hex, boxShadow: `0 0 15px rgba(${presetAccent.rgb}, 0.25)` } : {}}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="text-xs font-bold text-white">{p.name}</span>
                      <span 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: presetAccent.hex }}
                      />
                    </div>
                    <span 
                      className="text-sm font-bold mb-1 truncate"
                      style={{ fontFamily: presetFont?.cssFont, color: presetAccent.hex }}
                    >
                      {presetFont?.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Typography (8 Fonts) */}
        {activeTab === 'fonts' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Select UI Typeface (Reflects instantly across titles, cards, and body):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FONT_OPTIONS.map((f) => {
                const isSelected = config.fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      onChangeConfig({ ...config, fontFamily: f.id });
                      audioService.playBeep(750, 0.03);
                    }}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-800/90 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                    style={isSelected ? { borderColor: currentAccent.hex, boxShadow: `0 0 15px rgba(${currentAccent.rgb}, 0.25)` } : {}}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-semibold text-white">{f.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" style={{ color: currentAccent.hex }} />}
                    </div>
                    <div 
                      className="text-base font-bold mb-1 text-white truncate"
                      style={{ fontFamily: f.cssFont }}
                    >
                      {f.sample}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{f.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Accent Aura (8 Colors) */}
        {activeTab === 'accents' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="text-xs font-mono text-slate-400">
              Select primary radiant accent glow for badges, buttons, borders, and active indicators:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Object.keys(ACCENT_COLOR_MAP) as AccentColorChoice[]).map((key) => {
                const c = ACCENT_COLOR_MAP[key];
                const isSelected = config.accentColor === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onChangeConfig({ ...config, accentColor: key });
                      audioService.playBeep(850, 0.03);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
                    }`}
                    style={isSelected ? { borderColor: c.hex, boxShadow: `0 0 12px rgba(${c.rgb}, 0.3)` } : {}}
                  >
                    <span 
                      className="w-4 h-4 rounded-full shadow-md shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="text-left overflow-hidden">
                      <div className="text-xs font-semibold text-white truncate">{c.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{c.hex}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Background Tone Selection */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                Workspace Dark Tone Mode
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'slate', name: 'Deep Slate', hex: '#020617', desc: 'Midnight Blue' },
                  { id: 'zinc', name: 'Onyx Zinc', hex: '#09090b', desc: 'Neutral Studio' },
                  { id: 'pitch', name: 'Pitch Black', hex: '#000000', desc: 'OLED Zero Emission' },
                  { id: 'cybernavy', name: 'Cyber Navy', hex: '#020c1b', desc: 'Oceanic Void' },
                ].map((bg) => {
                  const isSelected = config.bgTone === bg.id;
                  return (
                    <button
                      key={bg.id}
                      onClick={() => {
                        onChangeConfig({ ...config, bgTone: bg.id as BgToneChoice });
                        audioService.playBeep(700, 0.03);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-white/50 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-3 h-3 rounded-full border border-slate-600" style={{ backgroundColor: bg.hex }} />
                        <span className="text-xs font-bold text-white">{bg.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{bg.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Atmosphere Shaders & UI Scaling */}
        {activeTab === 'shaders' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* UI Scaling / Density */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                Information Density & Scaling
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'compact', label: 'Compact', desc: 'High data density' },
                  { id: 'balanced', label: 'Balanced', desc: 'Optimal default' },
                  { id: 'comfortable', label: 'Comfortable', desc: 'Spacious & relaxed' },
                ].map((s) => {
                  const isSelected = config.uiScale === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        onChangeConfig({ ...config, uiScale: s.id as UIScaleChoice });
                        audioService.playBeep(750, 0.03);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-400 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      style={isSelected ? { borderColor: currentAccent.hex, color: currentAccent.hex } : {}}
                    >
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className="text-[10px] text-slate-400">{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Shader Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                Shaders & Visual Atmosphere
              </span>

              {[
                {
                  key: 'enableCyberGrid' as keyof UIStyleConfig,
                  label: 'Cyber Coordinate Grid',
                  desc: 'Subtle engineering coordinate matrix for background depth',
                  icon: Grid,
                },
                {
                  key: 'enableAmbientSpotlight' as keyof UIStyleConfig,
                  label: 'Top Ambient Radial Spotlight',
                  desc: 'Soft radiant glow tailored to your chosen accent color',
                  icon: Sun,
                },
                {
                  key: 'enableCrtScanlines' as keyof UIStyleConfig,
                  label: 'Terminal CRT Phosphor Scanlines',
                  desc: 'Delicate retro cathode-ray scanline overlay texture',
                  icon: Tv,
                },
                {
                  key: 'enableGlassCards' as keyof UIStyleConfig,
                  label: 'Glassmorphism Frosted Blur',
                  desc: 'Translucent frosted backdrop blur on panels and modal surfaces',
                  icon: Layers,
                },
                {
                  key: 'enableNeonGlow' as keyof UIStyleConfig,
                  label: 'Neon Aura Edge Glow',
                  desc: 'Pulsing luminescence on active tabs, buttons, and focused cards',
                  icon: Zap,
                },
                {
                  key: 'enableAnimatedStars' as keyof UIStyleConfig,
                  label: 'Cosmic Twinkling Starfield',
                  desc: 'Floating ambient star particles shimmering in the workspace background',
                  icon: Star,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isEnabled = !!config[item.key];
                return (
                  <div 
                    key={item.key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs font-semibold text-white">{item.label}</div>
                        <div className="text-[11px] text-slate-400">{item.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onChangeConfig({ ...config, [item.key]: !config[item.key] });
                        audioService.playBeep(650, 0.03);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                        isEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                      }`}
                      style={isEnabled ? { backgroundColor: currentAccent.hex } : {}}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                          isEnabled ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              onResetDefaults();
              audioService.playSuccessTone();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => {
              audioService.playSuccessTone();
              onClose();
            }}
            style={{
              backgroundColor: currentAccent.hex,
              boxShadow: `0 0 15px rgba(${currentAccent.rgb}, 0.35)`,
            }}
            className="px-4 py-2 rounded-xl text-slate-950 font-bold text-xs font-mono transition-all active:scale-95 cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
