import React from 'react';
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
  Monitor
} from 'lucide-react';
import { audioService } from '../../services/audioService';

export type FontFamilyChoice = 'jakarta' | 'outfit' | 'space' | 'mono';
export type AccentColorChoice = 'cyan' | 'emerald' | 'purple' | 'amber';

export interface UIStyleConfig {
  fontFamily: FontFamilyChoice;
  accentColor: AccentColorChoice;
  enableCyberGrid: boolean;
  enableAmbientSpotlight: boolean;
  enableCrtScanlines: boolean;
  enableGlassCards: boolean;
}

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
  if (!isOpen) return null;

  const fontOptions: { id: FontFamilyChoice; name: string; sample: string; desc: string; previewClass: string }[] = [
    {
      id: 'jakarta',
      name: 'Plus Jakarta Sans',
      sample: 'Aa Bb Gg 123',
      desc: 'Modern, ultra-crisp, high-legibility developer typeface (Recommended)',
      previewClass: 'font-[family-name:var(--font-primary)]',
    },
    {
      id: 'outfit',
      name: 'Outfit Geometric',
      sample: 'Aa Bb Gg 123',
      desc: 'Sleek, rounded modern geometric Swiss-style typography',
      previewClass: 'font-sans',
    },
    {
      id: 'space',
      name: 'Space Grotesk',
      sample: 'Aa Bb Gg 123',
      desc: 'Punchy cyberpunk & engineering architectural headlines',
      previewClass: 'font-heading',
    },
    {
      id: 'mono',
      name: 'JetBrains Mono',
      sample: '0xFA fn() => 42',
      desc: 'Pure programmer terminal code font with ligatures',
      previewClass: 'font-mono',
    },
  ];

  const accentColors: { id: AccentColorChoice; name: string; bgClass: string; ringClass: string }[] = [
    { id: 'cyan', name: 'Electric Cyan', bgClass: 'bg-cyan-500', ringClass: 'ring-cyan-400' },
    { id: 'emerald', name: 'Matrix Emerald', bgClass: 'bg-emerald-500', ringClass: 'ring-emerald-400' },
    { id: 'purple', name: 'Synthwave Violet', bgClass: 'bg-purple-500', ringClass: 'ring-purple-400' },
    { id: 'amber', name: 'Retro Amber', bgClass: 'bg-amber-500', ringClass: 'ring-amber-400' },
  ];

  const handleFontSelect = (font: FontFamilyChoice) => {
    onChangeConfig({ ...config, fontFamily: font });
    audioService.playBeep(750, 0.03);
  };

  const handleAccentSelect = (accent: AccentColorChoice) => {
    onChangeConfig({ ...config, accentColor: accent });
    audioService.playBeep(850, 0.03);
  };

  const toggleSetting = (key: keyof UIStyleConfig) => {
    onChangeConfig({ ...config, [key]: !config[key] });
    audioService.playBeep(650, 0.03);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl p-6 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-300">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">UI Style & Effects Studio</h3>
              <p className="text-xs text-slate-400">Customize typography, accent glow, and visual shaders</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Typography Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Type className="w-3.5 h-3.5" />
            <span>Select Typography Family</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {fontOptions.map((f) => {
              const isSelected = config.fontFamily === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleFontSelect(f.id)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all relative ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-semibold text-white">{f.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className={`text-base font-bold text-cyan-300/90 mb-1 ${f.previewClass}`}>
                    {f.sample}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{f.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Accent Aura Glow */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Palette className="w-3.5 h-3.5" />
            <span>Accent Glow Color</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {accentColors.map((c) => {
              const isSelected = config.accentColor === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleAccentSelect(c.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-white/40 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${c.bgClass} shadow-md`}></span>
                  <span className="text-xs font-medium truncate">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Visual Shader Effects Toggles */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            <span>Visual Atmosphere Effects</span>
          </div>

          <div className="space-y-2">
            {/* Cyber Grid */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <Grid className="w-4 h-4 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Cyber Coordinate Grid</h4>
                  <p className="text-[11px] text-slate-400">Subtle background coordinate matrix for engineering depth</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('enableCyberGrid')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                  config.enableCyberGrid ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                    config.enableCyberGrid ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Ambient Radial Spotlight */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Top Ambient Spotlight</h4>
                  <p className="text-[11px] text-slate-400">Soft radiating glow illuminating the active workspace</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('enableAmbientSpotlight')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                  config.enableAmbientSpotlight ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                    config.enableAmbientSpotlight ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Subtle CRT Scanlines */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <Tv className="w-4 h-4 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Terminal CRT Scanlines</h4>
                  <p className="text-[11px] text-slate-400">Delicate retro terminal phosphor scanline texture</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('enableCrtScanlines')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                  config.enableCrtScanlines ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                    config.enableCrtScanlines ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Glassmorphism Cards */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Glassmorphism Frosted Depth</h4>
                  <p className="text-[11px] text-slate-400">Backdrop blur and hairline borders across cards and modals</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('enableGlassCards')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                  config.enableGlassCards ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                    config.enableGlassCards ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              onResetDefaults();
              audioService.playSuccessTone();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
