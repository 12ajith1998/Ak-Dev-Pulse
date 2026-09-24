import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Clock, 
  Zap, 
  Terminal, 
  Orbit, 
  Activity, 
  Moon,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Sliders,
  Monitor,
  Sunset,
  CloudRain,
  Dna,
  Flame,
  Disc3,
  Waves,
  Droplets,
  Wind,
  Layers
} from 'lucide-react';
import { audioService } from '../../services/audioService';

export type ScreensaverTheme = 
  | 'matrix' 
  | 'warp' 
  | 'cyberclock' 
  | 'neural'
  | 'synthwave'
  | 'rainwindow'
  | 'dna'
  | 'fireworks'
  | 'blackhole'
  | 'quantum'
  | 'plasma'
  | 'ripples'
  | 'aurora'
  | 'tunnel';

export interface ScreensaverThemeItem {
  id: ScreensaverTheme;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const SCREENSAVER_THEMES: ScreensaverThemeItem[] = [
  { id: 'matrix', label: 'Matrix Rain', category: 'Cyber', icon: Terminal, description: 'Classic emerald digital phosphor code fall' },
  { id: 'warp', label: 'Warp Speed', category: 'Cosmic', icon: Orbit, description: 'Hyperspace starfield relativistic acceleration' },
  { id: 'synthwave', label: 'Retro Synthwave', category: 'Retro 80s', icon: Sunset, description: 'Outrun neon wireframe horizon with glowing sun' },
  { id: 'cyberclock', label: 'Wave Clock', category: 'Clock HUD', icon: Activity, description: 'Futuristic digital telemetry with live spectrum' },
  { id: 'neural', label: 'Neural Mesh', category: 'AI Network', icon: Sparkles, description: 'Bioluminescent synaptic nodes & axons' },
  { id: 'rainwindow', label: 'Rainy Window', category: 'Atmosphere', icon: CloudRain, description: 'Steamy glass condensation with neon bokeh' },
  { id: 'dna', label: 'DNA Helix', category: 'Biotech', icon: Dna, description: '3D rotating nucleotide molecular double helix' },
  { id: 'fireworks', label: 'Neon Fireworks', category: 'Celebration', icon: Flame, description: 'High-energy gravity spark particle bursts' },
  { id: 'blackhole', label: 'Black Hole', category: 'Cosmic', icon: Disc3, description: 'Singularity with relativistic accretion disk' },
  { id: 'quantum', label: 'Quantum Wave', category: 'Physics', icon: Waves, description: 'Undulating 3D mathematical isometric grid' },
  { id: 'plasma', label: 'Tesla Plasma', category: 'Energy', icon: Zap, description: 'High-voltage electric lightning filaments' },
  { id: 'ripples', label: 'Zen Ripples', category: 'Nature', icon: Droplets, description: 'Expanding harmonic water droplet wavefronts' },
  { id: 'aurora', label: 'Aurora Borealis', category: 'Nature', icon: Wind, description: 'Ethereal ribbons of northern polar lights' },
  { id: 'tunnel', label: 'Cyber Tunnel', category: 'Cyber', icon: Layers, description: 'Infinite hexagonal 3D vortex warp speed' },
];

interface ScreenSaverProps {
  isActive: boolean;
  onClose: () => void;
  initialTheme?: ScreensaverTheme;
}

const DEV_QUOTES = [
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra" },
  { text: "Premature optimization is the root of all evil.", author: "Donald Knuth" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "It's not a bug – it's an undocumented feature.", author: "Anonymous" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
];

export const ScreenSaver: React.FC<ScreenSaverProps> = ({ isActive, onClose, initialTheme = 'matrix' }) => {
  const [theme, setTheme] = useState<ScreensaverTheme>(initialTheme);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [isHudHovered, setIsHudHovered] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const hideControlsTimer = useRef<any>(null);

  // Time ticker
  useEffect(() => {
    if (!isActive) return;
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Quote rotator
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setCurrentQuoteIdx((prev) => (prev + 1) % DEV_QUOTES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        // Next theme
        const currentIdx = SCREENSAVER_THEMES.findIndex((t) => t.id === theme);
        const nextIdx = (currentIdx + 1) % SCREENSAVER_THEMES.length;
        setTheme(SCREENSAVER_THEMES[nextIdx].id);
        audioService.playBeep(700, 0.03);
      } else if (e.key === 'ArrowLeft') {
        // Previous theme
        const currentIdx = SCREENSAVER_THEMES.findIndex((t) => t.id === theme);
        const prevIdx = (currentIdx - 1 + SCREENSAVER_THEMES.length) % SCREENSAVER_THEMES.length;
        setTheme(SCREENSAVER_THEMES[prevIdx].id);
        audioService.playBeep(600, 0.03);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, theme, onClose]);

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (!isHudHovered) {
      hideControlsTimer.current = setTimeout(() => {
        if (!isHudHovered) {
          setShowControls(false);
        }
      }, 2500);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Canvas visual rendering engine
  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let phase = 0;

    // ==========================================
    // 1. MATRIX DIGITAL RAIN
    // ==========================================
    if (theme === 'matrix') {
      const fontSize = 16;
      const columns = Math.floor(width / fontSize);
      const drops: number[] = Array.from({ length: columns }).fill(1) as number[];
      const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEF';

      const renderMatrix = () => {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.07)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = characters.charAt(Math.floor(Math.random() * characters.length));
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Leading bright glyph
          ctx.fillStyle = '#ffffff';
          ctx.fillText(char, x, y);

          // Body green glyph
          ctx.fillStyle = i % 3 === 0 ? '#4ade80' : '#22c55e';
          ctx.fillText(char, x, y - fontSize);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }

        animationFrameId.current = requestAnimationFrame(renderMatrix);
      };

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);
      renderMatrix();
    }

    // ==========================================
    // 2. WARP SPEED STARFIELD
    // ==========================================
    else if (theme === 'warp') {
      const numStars = 800;
      const stars: { x: number; y: number; z: number; oZ: number; color: string }[] = [];
      const colors = ['#38bdf8', '#818cf8', '#c084fc', '#ffffff', '#22d3ee'];

      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: (Math.random() - 0.5) * width * 2,
          y: (Math.random() - 0.5) * height * 2,
          z: Math.random() * width,
          oZ: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      const cx = width / 2;
      const cy = height / 2;

      const renderWarp = () => {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          star.oZ = star.z;
          star.z -= 18;

          if (star.z <= 0) {
            star.z = width;
            star.oZ = width;
            star.x = (Math.random() - 0.5) * width * 2;
            star.y = (Math.random() - 0.5) * height * 2;
          }

          const k = 250 / star.z;
          const px = star.x * k + cx;
          const py = star.y * k + cy;

          const oldK = 250 / star.oZ;
          const ox = star.x * oldK + cx;
          const oy = star.y * oldK + cy;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            const size = Math.max(1, (1 - star.z / width) * 3.5);
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(px, py);
            ctx.strokeStyle = star.color;
            ctx.lineWidth = size;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(px, py, size / 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          }
        }

        animationFrameId.current = requestAnimationFrame(renderWarp);
      };

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);
      renderWarp();
    }

    // ==========================================
    // 3. RETRO SYNTHWAVE OUTRUN HORIZON
    // ==========================================
    else if (theme === 'synthwave') {
      let gridOffset = 0;

      const renderSynthwave = () => {
        ctx.fillStyle = '#090514';
        ctx.fillRect(0, 0, width, height);

        const horizon = height * 0.55;
        const cx = width / 2;

        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
        skyGrad.addColorStop(0, '#05010e');
        skyGrad.addColorStop(0.6, '#280c44');
        skyGrad.addColorStop(1, '#831843');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, horizon);

        // Glowing Neon Synth Sun
        const sunRadius = Math.min(100, width * 0.12);
        const sunY = horizon - 20;
        const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
        sunGrad.addColorStop(0, '#fde047');
        sunGrad.addColorStop(0.5, '#f43f5e');
        sunGrad.addColorStop(1, '#a21caf');

        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(cx, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // Sun horizontal blinds cutouts
        for (let i = 0; i < 7; i++) {
          const cutY = sunY + (i * 14);
          const cutHeight = 3 + i * 1.5;
          ctx.fillStyle = '#280c44';
          ctx.fillRect(cx - sunRadius, cutY, sunRadius * 2, cutHeight);
        }

        // Ground perspective grid
        gridOffset = (gridOffset + 0.02) % 1;
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.5;

        // Longitudinal vanishing lines
        const numLines = 28;
        for (let i = -numLines / 2; i <= numLines / 2; i++) {
          const bottomX = cx + i * (width / 14);
          ctx.beginPath();
          ctx.moveTo(cx, horizon);
          ctx.lineTo(bottomX, height);
          ctx.stroke();
        }

        // Horizontal crossbars with exponential perspective
        for (let i = 0; i < 18; i++) {
          const progress = (i + gridOffset) / 18;
          const y = horizon + Math.pow(progress, 2.5) * (height - horizon);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.strokeStyle = `rgba(236, 72, 153, ${Math.min(1, progress * 1.5)})`;
          ctx.stroke();
        }

        animationFrameId.current = requestAnimationFrame(renderSynthwave);
      };

      renderSynthwave();
    }

    // ==========================================
    // 4. CYBERCLOCK & WAVE SPECTRUM
    // ==========================================
    else if (theme === 'cyberclock') {
      let waveAngle = 0;
      const barsCount = 64;

      const renderClockTheme = () => {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
        ctx.fillRect(0, 0, width, height);

        // Subtle background grid
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.25)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Animated audio wave
        waveAngle += 0.04;
        const barWidth = width / barsCount;
        const baseY = height - 120;

        for (let i = 0; i < barsCount; i++) {
          const freq = Math.sin(waveAngle + i * 0.2) * 0.5 + 0.5;
          const noise = Math.sin(waveAngle * 2 + i * 0.5) * 0.3;
          const barHeight = (freq + noise) * 80 + 10;

          const gradient = ctx.createLinearGradient(0, baseY, 0, baseY - barHeight);
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(1, '#a855f7');

          ctx.fillStyle = gradient;
          ctx.fillRect(i * barWidth + 2, baseY - barHeight, barWidth - 4, barHeight);
        }

        animationFrameId.current = requestAnimationFrame(renderClockTheme);
      };

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);
      renderClockTheme();
    }

    // ==========================================
    // 5. BIOLUMINESCENT NEURAL FLOW
    // ==========================================
    else if (theme === 'neural') {
      const nodeCount = 90;
      const nodes: { x: number; y: number; vx: number; vy: number; radius: number; color: string }[] = [];
      const colors = ['#22d3ee', '#38bdf8', '#818cf8', '#a855f7', '#34d399'];

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          radius: Math.random() * 2.5 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      const maxDistance = 140;

      const renderNeural = () => {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.25)';
        ctx.fillRect(0, 0, width, height);

        // Move nodes
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;

          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.fill();
        }

        // Connect nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDistance) {
              const alpha = (1 - dist / maxDistance) * 0.5;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        animationFrameId.current = requestAnimationFrame(renderNeural);
      };

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);
      renderNeural();
    }

    // ==========================================
    // 6. RAINY WINDOW & NEON BOKEH
    // ==========================================
    else if (theme === 'rainwindow') {
      const bokehs = Array.from({ length: 45 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 60 + 20,
        color: ['#06b6d4', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 5)],
        speed: (Math.random() - 0.5) * 0.4,
      }));

      const drops = Array.from({ length: 70 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 20 + 8,
        speed: Math.random() * 6 + 4,
        size: Math.random() * 2 + 1,
      }));

      const renderRainWindow = () => {
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, width, height);

        // Draw soft blurred background city bokeh
        bokehs.forEach((b) => {
          b.y += b.speed;
          if (b.y < -100) b.y = height + 100;
          if (b.y > height + 100) b.y = -100;

          const grad = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, b.radius);
          grad.addColorStop(0, b.color + '40');
          grad.addColorStop(1, b.color + '00');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Steamy glass haze
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.fillRect(0, 0, width, height);

        // Rain droplets sliding on glass
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        drops.forEach((d) => {
          d.y += d.speed;
          if (d.y > height) {
            d.y = -20;
            d.x = Math.random() * width;
          }

          ctx.lineWidth = d.size;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 1, d.y + d.length);
          ctx.stroke();

          // Droplet highlight dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(d.x, d.y + d.length, d.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
        });

        animationFrameId.current = requestAnimationFrame(renderRainWindow);
      };

      renderRainWindow();
    }

    // ==========================================
    // 7. 3D CYBER DNA DOUBLE HELIX
    // ==========================================
    else if (theme === 'dna') {
      let angle = 0;
      const rungs = 32;

      const renderDNA = () => {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.25)';
        ctx.fillRect(0, 0, width, height);

        angle += 0.03;
        const cx = width / 2;
        const cy = height / 2;
        const spacing = height / (rungs + 2);
        const radius = Math.min(180, width * 0.22);

        for (let i = 0; i < rungs; i++) {
          const y = (i + 1) * spacing;
          const a = angle + i * 0.25;

          const x1 = cx + Math.cos(a) * radius;
          const z1 = Math.sin(a) * radius;
          const x2 = cx - Math.cos(a) * radius;
          const z2 = -Math.sin(a) * radius;

          const scale1 = (z1 + radius * 2) / (radius * 3);
          const scale2 = (z2 + radius * 2) / (radius * 3);

          // Connecting rungs
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = `rgba(148, 163, 184, ${(scale1 + scale2) * 0.2})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Strand 1 node (Cyan)
          ctx.beginPath();
          ctx.arc(x1, y, Math.max(2, 5 * scale1), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(6, 182, 212, ${scale1})`;
          ctx.fill();

          // Strand 2 node (Magenta)
          ctx.beginPath();
          ctx.arc(x2, y, Math.max(2, 5 * scale2), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(236, 72, 153, ${scale2})`;
          ctx.fill();
        }

        animationFrameId.current = requestAnimationFrame(renderDNA);
      };

      renderDNA();
    }

    // ==========================================
    // 8. NEON GRAVITY FIREWORKS
    // ==========================================
    else if (theme === 'fireworks') {
      interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        alpha: number;
        color: string;
      }

      let sparks: Particle[] = [];

      const createExplosion = (ex: number, ey: number) => {
        const color = ['#38bdf8', '#f43f5e', '#a855f7', '#22c55e', '#facc15'][Math.floor(Math.random() * 5)];
        const count = 75;
        for (let i = 0; i < count; i++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = Math.random() * 6 + 1.5;
          sparks.push({
            x: ex,
            y: ey,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            alpha: 1,
            color,
          });
        }
      };

      let timer = 0;

      const renderFireworks = () => {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
        ctx.fillRect(0, 0, width, height);

        timer++;
        if (timer % 40 === 0) {
          createExplosion(Math.random() * (width - 200) + 100, Math.random() * (height * 0.6) + 50);
        }

        sparks.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08; // gravity
          p.vx *= 0.98;
          p.alpha -= 0.012;

          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalAlpha = 1;
        sparks = sparks.filter((p) => p.alpha > 0);

        animationFrameId.current = requestAnimationFrame(renderFireworks);
      };

      renderFireworks();
    }

    // ==========================================
    // 9. COSMIC BLACK HOLE & ACCRETION DISK
    // ==========================================
    else if (theme === 'blackhole') {
      let rot = 0;
      const numRays = 160;

      const renderBlackHole = () => {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.25)';
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        const r = Math.min(80, width * 0.1);

        rot += 0.02;

        // Swirling accretion disk
        for (let i = 0; i < numRays; i++) {
          const a = rot + (i / numRays) * Math.PI * 2;
          const dist = r + Math.sin(a * 4 + rot) * 30 + (i % 60) * 2;

          const x = cx + Math.cos(a) * dist * 1.8;
          const y = cy + Math.sin(a) * dist * 0.7;

          // Relativistic Doppler beaming
          const isApproaching = Math.sin(a) > 0;
          ctx.fillStyle = isApproaching ? '#38bdf8' : '#f97316';
          ctx.beginPath();
          ctx.arc(x, y, Math.random() * 2 + 1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Luminous photon ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.stroke();

        // Dark singularity event horizon
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        animationFrameId.current = requestAnimationFrame(renderBlackHole);
      };

      renderBlackHole();
    }

    // ==========================================
    // 10. QUANTUM WAVE UNDULATION
    // ==========================================
    else if (theme === 'quantum') {
      let t = 0;

      const renderQuantum = () => {
        ctx.fillStyle = '#050816';
        ctx.fillRect(0, 0, width, height);

        t += 0.03;
        const rows = 24;
        const cols = 32;
        const cellW = width / (cols + 4);
        const cellH = height / (rows + 4);

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.lineWidth = 1.2;

        for (let r = 0; r < rows; r++) {
          ctx.beginPath();
          for (let c = 0; c < cols; c++) {
            const x = (c + 2) * cellW;
            const wave = Math.sin(c * 0.3 + t) * Math.cos(r * 0.3 + t) * 40;
            const y = (r + 2) * cellH + wave;

            if (c === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        animationFrameId.current = requestAnimationFrame(renderQuantum);
      };

      renderQuantum();
    }

    // ==========================================
    // 11. TESLA ELECTRIC PLASMA BALL
    // ==========================================
    else if (theme === 'plasma') {
      const renderPlasma = () => {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        const outerR = Math.min(220, width * 0.3);

        // Glass sphere outline
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.stroke();

        // Central core
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.fill();

        // 8 Electrical discharge lightning filaments
        for (let f = 0; f < 8; f++) {
          const targetAngle = Math.random() * Math.PI * 2;
          const targetX = cx + Math.cos(targetAngle) * outerR;
          const targetY = cy + Math.sin(targetAngle) * outerR;

          ctx.strokeStyle = f % 2 === 0 ? '#38bdf8' : '#e879f9';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);

          let curX = cx;
          let curY = cy;
          const segments = 12;
          for (let s = 1; s <= segments; s++) {
            const frac = s / segments;
            const nextX = cx + (targetX - cx) * frac + (Math.random() - 0.5) * 35;
            const nextY = cy + (targetY - cy) * frac + (Math.random() - 0.5) * 35;
            ctx.lineTo(nextX, nextY);
            curX = nextX;
            curY = nextY;
          }
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
        }

        animationFrameId.current = requestAnimationFrame(renderPlasma);
      };

      renderPlasma();
    }

    // ==========================================
    // 12. ZEN LIQUID RIPPLES
    // ==========================================
    else if (theme === 'ripples') {
      interface WaveRing {
        x: number;
        y: number;
        r: number;
        maxR: number;
        alpha: number;
      }

      let rings: WaveRing[] = [];
      let counter = 0;

      const renderRipples = () => {
        ctx.fillStyle = '#050c1a';
        ctx.fillRect(0, 0, width, height);

        counter++;
        if (counter % 30 === 0) {
          rings.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: 5,
            maxR: Math.random() * 180 + 120,
            alpha: 1,
          });
        }

        rings.forEach((ring) => {
          ring.r += 2.5;
          ring.alpha = 1 - ring.r / ring.maxR;

          ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, ring.alpha * 0.8)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
          ctx.stroke();
        });

        rings = rings.filter((r) => r.alpha > 0);

        animationFrameId.current = requestAnimationFrame(renderRipples);
      };

      renderRipples();
    }

    // ==========================================
    // 13. AURORA BOREALIS POLAR LIGHTS
    // ==========================================
    else if (theme === 'aurora') {
      let auroraT = 0;

      const renderAurora = () => {
        ctx.fillStyle = '#040714';
        ctx.fillRect(0, 0, width, height);

        auroraT += 0.02;

        // 3 Layered shimmering curtains
        for (let l = 0; l < 3; l++) {
          const grad = ctx.createLinearGradient(0, height * 0.2, 0, height * 0.8);
          if (l === 0) {
            grad.addColorStop(0, 'rgba(16, 185, 129, 0)');
            grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.35)');
            grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
          } else if (l === 1) {
            grad.addColorStop(0, 'rgba(6, 182, 212, 0)');
            grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.3)');
            grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
          } else {
            grad.addColorStop(0, 'rgba(168, 85, 247, 0)');
            grad.addColorStop(0.5, 'rgba(236, 72, 153, 0.25)');
            grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, height);

          for (let x = 0; x <= width; x += 20) {
            const wave = Math.sin(x * 0.003 + auroraT + l) * 90 + Math.cos(x * 0.007 - auroraT) * 45;
            const y = height * 0.45 + wave + (l * 40);
            ctx.lineTo(x, y);
          }

          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();
        }

        animationFrameId.current = requestAnimationFrame(renderAurora);
      };

      renderAurora();
    }

    // ==========================================
    // 14. CYBER HEXAGONAL TUNNEL
    // ==========================================
    else if (theme === 'tunnel') {
      let tunnelRot = 0;

      const renderTunnel = () => {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
        ctx.fillRect(0, 0, width, height);

        tunnelRot += 0.02;
        const cx = width / 2;
        const cy = height / 2;
        const ringsCount = 18;

        for (let i = 0; i < ringsCount; i++) {
          const progress = (i + (tunnelRot * 3) % 1) / ringsCount;
          const radius = Math.pow(progress, 2.5) * (width * 0.65);
          const currentAngle = tunnelRot * 0.5 + i * 0.15;

          ctx.strokeStyle = `rgba(6, 182, 212, ${progress})`;
          ctx.lineWidth = 2;

          ctx.beginPath();
          for (let v = 0; v < 6; v++) {
            const a = currentAngle + (v / 6) * Math.PI * 2;
            const x = cx + Math.cos(a) * radius;
            const y = cy + Math.sin(a) * radius;
            if (v === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        }

        animationFrameId.current = requestAnimationFrame(renderTunnel);
      };

      renderTunnel();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive, theme]);

  if (!isActive) return null;

  const currentQuote = DEV_QUOTES[currentQuoteIdx];
  const activeThemeItem = SCREENSAVER_THEMES.find((t) => t.id === theme) || SCREENSAVER_THEMES[0];

  return (
    <div 
      onMouseMove={handleMouseMove}
      onClick={handleMouseMove}
      className="fixed inset-0 z-50 bg-slate-950 select-none overflow-hidden"
      style={{ cursor: (showControls || isHudHovered) ? 'default' : 'none' }}
    >
      {/* Full-screen Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Floating Center Cockpit Clock & Quote HUD */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="space-y-2 backdrop-blur-xs py-4 px-8 rounded-3xl">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950/85 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>DEVPULSE COCKPIT ACTIVE</span>
            <span className="text-slate-500">|</span>
            <span className="uppercase font-bold text-white">{activeThemeItem.label}</span>
          </div>

          {/* Time digits with glow */}
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-extrabold font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
            {currentTime}
          </h1>

          {/* Date */}
          <p className="text-base sm:text-xl font-mono text-slate-400 tracking-wide">
            {currentDate}
          </p>
        </div>

        {/* Floating Developer Quote */}
        <div className="max-w-xl p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-md shadow-2xl transition-all duration-700">
          <p className="text-sm sm:text-base font-serif italic text-slate-200">
            "{currentQuote.text}"
          </p>
          <span className="text-xs font-mono text-cyan-400 mt-2 block font-semibold">
            — {currentQuote.author}
          </span>
        </div>
      </div>

      {/* Control HUD Container: Auto-hide and Hover to Display */}
      <div 
        onMouseEnter={() => {
          setIsHudHovered(true);
          setShowControls(true);
          if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
        }}
        onMouseLeave={() => {
          setIsHudHovered(false);
          hideControlsTimer.current = setTimeout(() => {
            setShowControls(false);
          }, 1200);
        }}
        className="absolute bottom-0 left-0 right-0 pt-12 pb-6 px-4 flex flex-col items-center justify-end z-40 pointer-events-auto group/screensaver-hud"
      >
        {/* Subtle trigger tab when hidden: displayed at bottom center */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setShowControls(true);
          }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400 backdrop-blur-md shadow-lg transition-all duration-300 cursor-pointer ${
            showControls || isHudHovered 
              ? 'opacity-0 translate-y-4 pointer-events-none h-0 p-0 overflow-hidden m-0 border-0' 
              : 'opacity-60 hover:opacity-100 hover:border-cyan-500/50 hover:text-cyan-300 group-hover/screensaver-hud:opacity-100 translate-y-0 mb-1'
          }`}
          title="Hover or click to display screensaver controls"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hover to display controls & themes (14 effects)</span>
          <ChevronUp className="w-3 h-3 text-slate-500" />
        </div>

        {/* Control HUD (appears on hover or mouse move) */}
        <div 
          className={`w-full max-w-4xl transition-all duration-300 ease-out transform ${
            showControls || isHudHovered 
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
              : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
          }`}
        >
          <div className="p-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl flex flex-col gap-2.5">
          {/* Top Bar with Description and Actions */}
          <div className="flex items-center justify-between px-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{activeThemeItem.label}</span>
              <span className="text-slate-400">• {activeThemeItem.description}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Fullscreen Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Exit Screensaver Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  audioService.playBeep(450, 0.05);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Exit (ESC)</span>
              </button>
            </div>
          </div>

          {/* Theme Selector Pills Bar (14 Themes) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SCREENSAVER_THEMES.map((t, idx) => {
              const Icon = t.icon;
              const isCurrent = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTheme(t.id);
                    audioService.playBeep(850, 0.04);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                  title={`${t.label} (${t.category})`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>

      {/* Subtle Hint on top right */}
      <div className={`absolute top-4 right-4 transition-opacity duration-300 ${(showControls || isHudHovered) ? 'opacity-80' : 'opacity-0 pointer-events-none'}`}>
        <div className="text-[11px] font-mono text-slate-400 bg-slate-950/85 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md flex items-center gap-2">
          <span>Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">→</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">Space</kbd> to cycle • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
};
