import React, { useEffect, useRef, useState } from 'react';
import { audioService } from '../../services/audioService';
import { Sparkles, Radio, Activity, Eye, Zap, Disc3 } from 'lucide-react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  trackTitle?: string;
  trackCategory?: string;
  bpm?: number;
}

export type VisualizerMode = 'spectrum' | 'waveform' | 'radial' | 'cassette' | 'particles';

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  trackTitle,
  trackCategory,
  bpm = 80,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('spectrum');
  const animationFrameRef = useRef<number | null>(null);
  const [audioEnergy, setAudioEnergy] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const numParticles = 45;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 260,
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: (Math.random() - 0.5) * 1.5,
      hue: Math.random() * 60 + 170, // cyan to violet range
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const render = () => {
      // Resize canvas to client dimensions
      const width = canvas.width = canvas.parentElement?.clientWidth || 800;
      const height = canvas.height = 220;

      ctx.clearRect(0, 0, width, height);

      // Fetch live frequency data from Web Audio Analyser
      const freqData = audioService.getFrequencyData();
      let energy = 0;

      if (isPlaying && freqData && freqData.length > 0) {
        let sum = 0;
        for (let i = 0; i < freqData.length; i++) {
          sum += freqData[i];
        }
        energy = sum / (freqData.length * 255);
      } else if (isPlaying) {
        // Procedural simulation if analyzer still warming up
        phase += 0.05;
        energy = 0.4 + Math.sin(phase) * 0.25;
      }

      setAudioEnergy(Math.round(energy * 100));
      phase += 0.04;

      // Draw dark high-tech background grid
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Subtle cyber grid lines
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (!isPlaying) {
        // Idle state: gentle resting sine wave
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 2;
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.02 + phase * 0.5) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = '12px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT OR PLAY ANY TRACK TO ACTIVATE REAL-TIME VISUALIZER', width / 2, height / 2 - 16);

        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // ACTIVE VISUALIZER MODES

      if (mode === 'spectrum') {
        // 1. NEON SPECTRUM EQUALIZER BARS
        const barCount = 36;
        const barWidth = Math.max(4, (width - (barCount * 4)) / barCount);
        const startX = (width - (barCount * (barWidth + 4))) / 2;

        for (let i = 0; i < barCount; i++) {
          let value = 0;
          if (freqData && freqData.length > 0) {
            const dataIdx = Math.floor((i / barCount) * freqData.length);
            value = (freqData[dataIdx] || 0) / 255;
          } else {
            value = 0.3 + Math.sin(i * 0.4 + phase) * 0.35 + Math.random() * 0.15;
          }

          const barHeight = Math.max(8, value * (height * 0.75));
          const x = startX + i * (barWidth + 4);
          const y = height - barHeight - 20;

          // Gradient bar
          const grad = ctx.createLinearGradient(0, y, 0, height - 20);
          grad.addColorStop(0, '#38bdf8'); // cyan
          grad.addColorStop(0.5, '#818cf8'); // indigo
          grad.addColorStop(1, '#c084fc'); // purple

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          // Floating peak cap dot
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, y - 4, Math.max(1.5, barWidth * 0.25), 0, Math.PI * 2);
          ctx.fill();

          // Reflective floor glow
          ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.fillRect(x, height - 16, barWidth, barHeight * 0.2);
        }
      } else if (mode === 'waveform') {
        // 2. COSMIC SMOOTH OSCILLOSCOPE WAVEFORM
        ctx.beginPath();
        ctx.lineWidth = 3;
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(0.5, '#3b82f6');
        grad.addColorStop(1, '#ec4899');
        ctx.strokeStyle = grad;

        const points = 120;
        const step = width / points;

        for (let i = 0; i <= points; i++) {
          const x = i * step;
          let amp = 0;
          if (freqData && freqData.length > 0) {
            const fIdx = Math.floor((i / points) * (freqData.length / 2));
            amp = ((freqData[fIdx] || 128) - 128) / 128;
          } else {
            amp = Math.sin(i * 0.15 + phase * 2) * Math.cos(i * 0.05);
          }

          const y = height / 2 + amp * (60 + energy * 40);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Second harmonic line
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';
        for (let i = 0; i <= points; i++) {
          const x = i * step;
          const y = height / 2 - Math.sin(i * 0.12 + phase * 1.5) * (30 + energy * 30);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (mode === 'radial') {
        // 3. CYBER RADIAL ORB
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = 40 + energy * 25;

        // Radial spikes
        const spikes = 48;
        for (let i = 0; i < spikes; i++) {
          const angle = (i / spikes) * Math.PI * 2 + phase * 0.2;
          let val = 0;
          if (freqData && freqData.length > 0) {
            val = (freqData[i % freqData.length] || 0) / 255;
          } else {
            val = 0.3 + Math.sin(i * 0.6 + phase) * 0.35;
          }

          const r1 = baseRadius;
          const r2 = baseRadius + val * 45;

          const x1 = centerX + Math.cos(angle) * r1;
          const y1 = centerY + Math.sin(angle) * r1;
          const x2 = centerX + Math.cos(angle) * r2;
          const y2 = centerY + Math.sin(angle) * r2;

          ctx.beginPath();
          ctx.strokeStyle = `hsl(${(i / spikes) * 120 + 180}, 95%, 65%)`;
          ctx.lineWidth = 2.5;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Inner glowing core
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, baseRadius);
        coreGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
        coreGrad.addColorStop(0.7, 'rgba(129, 140, 248, 0.4)');
        coreGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        ctx.fill();
      } else if (mode === 'cassette') {
        // 4. RETRO CASSETTE TAPE WITH SPINNING SPOOLS
        const centerX = width / 2;
        const centerY = height / 2;
        const boxWidth = Math.min(320, width - 40);
        const boxHeight = 120;

        // Cassette outer shell
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(centerX - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight, 8);
        ctx.fill();
        ctx.stroke();

        // Label center window
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(centerX - boxWidth * 0.35, centerY - boxHeight * 0.3, boxWidth * 0.7, boxHeight * 0.6, 6);
        ctx.fill();

        // Left & Right Spools
        const spoolRadius = 22;
        const spoolDistance = boxWidth * 0.22;
        const spoolAngle = phase * 2;

        [centerX - spoolDistance, centerX + spoolDistance].forEach((spoolX) => {
          // White spool ring
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(spoolX, centerY, spoolRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(spoolX, centerY, spoolRadius - 5, 0, Math.PI * 2);
          ctx.fill();

          // Spool gear teeth spinning
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          for (let g = 0; g < 6; g++) {
            const a = spoolAngle + (g / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(spoolX + Math.cos(a) * 6, centerY + Math.sin(a) * 6);
            ctx.lineTo(spoolX + Math.cos(a) * 16, centerY + Math.sin(a) * 16);
            ctx.stroke();
          }
        });

        // Tape ribbon connecting spools
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX - spoolDistance, centerY + 18);
        ctx.lineTo(centerX + spoolDistance, centerY + 18);
        ctx.stroke();
      } else if (mode === 'particles') {
        // 5. AUDIO-REACTIVE NEON PARTICLES
        particles.forEach((p) => {
          p.x += p.speedX * (1 + energy * 3);
          p.y += p.speedY * (1 + energy * 3);

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const size = p.size * (1 + energy * 1.8);
          ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, mode, bpm]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-2xl">
      {/* Top Overlay Bar */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="font-bold text-white tracking-wide">
              {isPlaying ? 'AUDIO SPECTRUM ENGINE ACTIVE' : 'VISUALIZER STANDBY'}
            </span>
          </div>

          {isPlaying && (
            <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] truncate max-w-[200px]">
              {trackTitle || 'Playing Track'}
            </span>
          )}
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(
            [
              { id: 'spectrum', label: 'Spectrum' },
              { id: 'waveform', label: 'Waveform' },
              { id: 'radial', label: 'Radial Orb' },
              { id: 'cassette', label: 'Cassette' },
              { id: 'particles', label: 'Particles' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                mode === item.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative w-full h-[220px]">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Live Audio Energy & Pulse Readout */}
        {isPlaying && (
          <div className="absolute bottom-3 right-3 flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Energy:</span>
              <span className="text-cyan-300 font-bold">{audioEnergy}%</span>
            </div>
            <div className="w-1 h-3 bg-slate-800 rounded-full" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Mode:</span>
              <span className="capitalize text-white font-semibold">{mode}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
