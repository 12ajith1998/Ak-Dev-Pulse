/**
 * Procedural Web Audio Synthesizer
 * Provides 100% reliable, offline-capable soundscapes and alert chimes
 * without external audio assets or network dependencies.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private currentSoundscapeId: string | null = null;
  private soundscapeNodes: { [key: string]: any } = {};
  private soundscapeInterval: any = null;
  private masterGain: GainNode | null = null;
  private soundscapeGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private soundscapeIntervals: any[] = [];
  private isMuted: boolean = false;
  private volume: number = 0.6; // 0 to 1

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.soundscapeGain = this.ctx.createGain();
      this.soundscapeGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      this.dataArray = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));

      this.soundscapeGain.connect(this.analyser);
      this.analyser.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getFrequencyData(): Uint8Array | null {
    if (!this.analyser && this.ctx) {
      this.getContext();
    }
    if (this.analyser && this.dataArray && this.currentSoundscapeId) {
      (this.analyser as any).getByteFrequencyData(this.dataArray);
      return this.dataArray;
    }
    return null;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.soundscapeGain && this.ctx) {
      this.soundscapeGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects / Alarms ---

  public playBeep(frequency = 800, duration = 0.15, type: OscillatorType = 'sine') {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  public playSuccessTone() {
    try {
      const ctx = this.getContext();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  public playAlarmSound(type: 'chime' | 'digital' | 'radar' | 'synth' = 'chime') {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      if (type === 'digital') {
        // Classic watch beeps: beep-beep, beep-beep
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(2048, now + i * 0.18);
          gain.gain.setValueAtTime(0.2, now + i * 0.18);
          gain.gain.setValueAtTime(0, now + i * 0.18 + 0.09);
          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(now + i * 0.18);
          osc.stop(now + i * 0.18 + 0.1);
        }
      } else if (type === 'radar') {
        // Frequency sweep radar ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.3);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.65);
      } else if (type === 'synth') {
        // Bright arpeggio
        const freqs = [440, 554.37, 659.25, 880];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, now + idx * 0.09);

          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          gain.gain.setValueAtTime(0.18, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.4);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain!);

          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.45);
        });
      } else {
        // 'chime': Rich harmonic tubular bells
        const freqs = [523.25, 783.99, 1046.5, 1318.5];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);

          gain.gain.setValueAtTime(0.25, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 1.2);

          osc.connect(gain);
          gain.connect(this.masterGain!);

          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 1.3);
        });
      }
    } catch (e) {
      console.warn('Alarm sound error:', e);
    }
  }

  public playWaterDropTone() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Audio water drop error:', e);
    }
  }

  public playGongTone() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const freqs = [196, 392, 587.33, 880];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2 / (i + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + 2.3);
      });
    } catch (e) {
      console.warn('Audio gong error:', e);
    }
  }

  public playReminderSound(sound: 'water' | 'gong' | 'chime' | 'pip' = 'water') {
    if (sound === 'water') {
      this.playWaterDropTone();
    } else if (sound === 'gong') {
      this.playGongTone();
    } else if (sound === 'chime') {
      this.playAlarmSound('chime');
    } else {
      this.playBeep(980, 0.15, 'sine');
    }
  }

  // --- Procedural Relaxing Soundscapes ---

  public isPlayingSoundscape(id?: string): boolean {
    if (!id) return this.currentSoundscapeId !== null;
    return this.currentSoundscapeId === id;
  }

  public getCurrentSoundscape(): string | null {
    return this.currentSoundscapeId;
  }

  public stopSoundscape() {
    if (this.soundscapeInterval) {
      clearInterval(this.soundscapeInterval);
      this.soundscapeInterval = null;
    }
    if (this.soundscapeIntervals && this.soundscapeIntervals.length > 0) {
      this.soundscapeIntervals.forEach((t) => clearInterval(t));
      this.soundscapeIntervals = [];
    }

    try {
      Object.keys(this.soundscapeNodes).forEach((k) => {
        const node = this.soundscapeNodes[k];
        if (node && typeof node.stop === 'function') {
          node.stop();
        }
        if (node && typeof node.disconnect === 'function') {
          node.disconnect();
        }
      });
    } catch (e) {
      console.warn('Error stopping soundscape nodes', e);
    }

    this.soundscapeNodes = {};
    this.currentSoundscapeId = null;
  }

  public playSoundscape(id: string) {
    if (this.currentSoundscapeId === id) {
      return;
    }

    this.stopSoundscape();
    const ctx = this.getContext();
    this.currentSoundscapeId = id;

    switch (id) {
      case 'brown-noise':
        this.startBrownNoise(ctx);
        break;
      case 'rain':
        this.startRainSound(ctx);
        break;
      case 'gamma-40hz':
        this.startBinaural40Hz(ctx);
        break;
      case 'lofi':
        this.startLofiRhodes(ctx);
        break;
      case 'cyberpunk':
        this.startCyberpunkArp(ctx);
        break;
      case 'ambient-drone':
        this.startAmbientDrone(ctx);
        break;
      case 'lofi-beats':
        this.startLofiBeats(ctx);
        break;
      case 'synthwave-drive':
        this.startSynthwaveDrive(ctx);
        break;
      case 'alpha-waves':
        this.startBinaural(ctx, 210, 220, 'alpha');
        break;
      case 'theta-deep':
        this.startBinaural(ctx, 180, 186, 'theta');
        break;
      case 'coffee-shop':
        this.startCoffeeShop(ctx);
        break;
      case 'forest-birds':
        this.startForestBirds(ctx);
        break;
      case 'deep-ocean':
        this.startDeepOcean(ctx);
        break;
      case 'fireplace':
        this.startFireplace(ctx);
        break;
      case 'piano-solitude':
        this.startPianoSolitude(ctx);
        break;
      case 'zen-garden':
        this.startZenGarden(ctx);
        break;
      case 'space-voyager':
        this.startSpaceVoyager(ctx);
        break;
      case 'coding-pulse':
        this.startCodingPulse(ctx);
        break;
      case 'white-noise':
        this.startNoise(ctx, 'white', 8000, 0.22);
        break;
      case 'pink-noise':
        this.startNoise(ctx, 'pink', 3200, 0.38);
        break;
      case 'chiptune-8bit':
        this.startChiptune(ctx);
        break;
      case 'solfeggio-528':
        this.startPureTone(ctx, 528);
        break;
      case 'tibetan-bowls':
        this.startTibetanBowls(ctx);
        break;
      case 'wind-pines':
        this.startWindPines(ctx);
        break;
      case 'night-crickets':
        this.startNightCrickets(ctx);
        break;
      case 'thunderstorm':
        this.startThunderstorm(ctx);
        break;
      case 'delta-sleep':
        this.startBinaural(ctx, 100, 102, 'delta');
        break;
      case 'jazz-cafe':
        this.startJazzCafe(ctx);
        break;
      case 'ambient-pads':
        this.startAmbientPads(ctx);
        break;
      case 'cyber-matrix':
        this.startCyberMatrix(ctx);
        break;
      case 'waterfall':
        this.startWaterfall(ctx);
        break;
      default:
        this.startLofiRhodes(ctx);
    }
  }

  // 1. Warm Brown Noise (Deep focus low-frequency masking)
  private startBrownNoise(ctx: AudioContext) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // boost gain
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.soundscapeGain!);

    noiseSource.start();
    this.soundscapeNodes['brown'] = noiseSource;
  }

  // 2. Midnight Rain on Glass
  private startRainSound(ctx: AudioContext) {
    // Pink noise base
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const rainNoise = ctx.createBufferSource();
    rainNoise.buffer = buffer;
    rainNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);
    filter.Q.setValueAtTime(0.9, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);

    rainNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.soundscapeGain!);

    rainNoise.start();
    this.soundscapeNodes['rain'] = rainNoise;

    // Random raindrops
    this.soundscapeInterval = setInterval(() => {
      if (this.currentSoundscapeId !== 'rain') return;
      try {
        const drop = ctx.createOscillator();
        const dropGain = ctx.createGain();
        drop.type = 'sine';
        const dropFreq = 3000 + Math.random() * 2500;
        drop.frequency.setValueAtTime(dropFreq, ctx.currentTime);
        drop.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.04);

        dropGain.gain.setValueAtTime(0.04 + Math.random() * 0.05, ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

        drop.connect(dropGain);
        dropGain.connect(this.soundscapeGain!);
        drop.start();
        drop.stop(ctx.currentTime + 0.06);
      } catch (e) {
        // ignore
      }
    }, 180);
  }

  // 3. 40Hz Gamma Focus Beats (Binaural carrier)
  private startBinaural40Hz(ctx: AudioContext) {
    const merger = ctx.createChannelMerger(2);

    // Left channel: 200 Hz
    const oscL = ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(200, ctx.currentTime);

    const gainL = ctx.createGain();
    gainL.gain.setValueAtTime(0.3, ctx.currentTime);
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);

    // Right channel: 240 Hz (producing 40 Hz difference)
    const oscR = ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(240, ctx.currentTime);

    const gainR = ctx.createGain();
    gainR.gain.setValueAtTime(0.3, ctx.currentTime);
    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);

    merger.connect(this.soundscapeGain!);

    oscL.start();
    oscR.start();

    this.soundscapeNodes['binauralL'] = oscL;
    this.soundscapeNodes['binauralR'] = oscR;
  }

  // 4. Lo-Fi Chill Rhodes Chords
  private startLofiRhodes(ctx: AudioContext) {
    // Chord progression: Dm9 -> G13 -> Cmaj9 -> Am7
    const chords = [
      [293.66, 349.23, 440.0, 523.25, 659.25], // Dm9: D4, F4, A4, C5, E5
      [246.94, 329.63, 392.0, 493.88, 587.33], // G13: B3, E4, G4, B4, D5
      [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9: C4, E4, G4, B4, D5
      [220.0, 329.63, 392.0, 440.0, 523.25],   // Am7: A3, E4, G4, A4, C5
    ];

    let chordIdx = 0;

    const playNextChord = () => {
      if (this.currentSoundscapeId !== 'lofi') return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      notes.forEach((freq, idx) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'triangle';
          // subtle detune for vintage Rhodes flutter
          const detune = (Math.random() - 0.5) * 6;
          osc.detune.setValueAtTime(detune, ctx.currentTime);
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(850, ctx.currentTime);

          const strumDelay = idx * 0.025;
          const noteTime = ctx.currentTime + strumDelay;

          gain.gain.setValueAtTime(0, noteTime);
          gain.gain.linearRampToValueAtTime(0.09, noteTime + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 3.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.soundscapeGain!);

          osc.start(noteTime);
          osc.stop(noteTime + 4.0);
        } catch (e) {
          // ignore
        }
      });
    };

    playNextChord();
    this.soundscapeInterval = setInterval(playNextChord, 4000);
  }

  // 5. Cyberpunk Neon Arpeggio
  private startCyberpunkArp(ctx: AudioContext) {
    const scale = [220, 261.63, 329.63, 392.0, 440, 523.25, 659.25, 783.99]; // Am scale
    const pattern = [0, 2, 4, 7, 5, 3, 2, 1];
    let step = 0;

    this.soundscapeInterval = setInterval(() => {
      if (this.currentSoundscapeId !== 'cyberpunk') return;
      try {
        const noteIdx = pattern[step % pattern.length];
        const freq = scale[noteIdx];
        step++;

        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.18);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.soundscapeGain!);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (e) {
        // ignore
      }
    }, 180);
  }

  // 6. Deep Ambient Drone
  private startAmbientDrone(ctx: AudioContext) {
    const freqs = [110, 164.81, 220, 329.63]; // A2, E3, A3, E4
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);

      gain.gain.setValueAtTime(0.07 / (idx + 1), ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.soundscapeGain!);

      osc.start();
      this.soundscapeNodes[`drone_${idx}`] = osc;
    });
  }

  // 7. Lo-Fi Beats (Chords + Kick + Snare + Vinyl)
  private startLofiBeats(ctx: AudioContext) {
    this.startLofiRhodes(ctx);
    // Add rhythmic lo-fi kick & soft brush snare
    let beat = 0;
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'lofi-beats') return;
      try {
        const now = ctx.currentTime;
        if (beat % 4 === 0) {
          // Soft sub kick
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(110, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain);
          gain.connect(this.soundscapeGain!);
          osc.start(now);
          osc.stop(now + 0.22);
        } else if (beat % 4 === 2) {
          // Lo-fi filtered snare
          const bufferSize = ctx.sampleRate * 0.1;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.2;
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1200, now);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.soundscapeGain!);
          noise.start(now);
        }
        beat = (beat + 1) % 8;
      } catch (e) {
        // ignore
      }
    }, 450); // ~67 BPM
    this.soundscapeIntervals.push(interval);
  }

  // 8. Retro Synthwave Drive
  private startSynthwaveDrive(ctx: AudioContext) {
    const bassline = [110, 110, 130.81, 110, 98, 98, 110, 123.47]; // A2, C3, G2, B2
    let step = 0;
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'synthwave-drive') return;
      try {
        const freq = bassline[step % bassline.length];
        step++;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.15);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.soundscapeGain!);
        osc.start(now);
        osc.stop(now + 0.18);
      } catch (e) {
        // ignore
      }
    }, 140); // 16th notes ~107 BPM
    this.soundscapeIntervals.push(interval);
  }

  // Generic Binaural Beat Generator
  private startBinaural(ctx: AudioContext, freqL: number, freqR: number, key: string) {
    const merger = ctx.createChannelMerger(2);

    const oscL = ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(freqL, ctx.currentTime);
    const gainL = ctx.createGain();
    gainL.gain.setValueAtTime(0.25, ctx.currentTime);
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);

    const oscR = ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(freqR, ctx.currentTime);
    const gainR = ctx.createGain();
    gainR.gain.setValueAtTime(0.25, ctx.currentTime);
    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);

    merger.connect(this.soundscapeGain!);
    oscL.start();
    oscR.start();

    this.soundscapeNodes[`${key}_L`] = oscL;
    this.soundscapeNodes[`${key}_R`] = oscR;
  }

  // 9. Cozy Coffee Shop Ambience
  private startCoffeeShop(ctx: AudioContext) {
    this.startNoise(ctx, 'pink', 800, 0.25);
    // Random gentle ceramic cup clink
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'coffee-shop') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400 + Math.random() * 800, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.soundscapeGain!);
        osc.start(now);
        osc.stop(now + 0.1);
      } catch (e) {
        // ignore
      }
    }, 2800);
    this.soundscapeIntervals.push(interval);
  }

  // 10. Forest Birds & Gentle Breeze
  private startForestBirds(ctx: AudioContext) {
    this.startNoise(ctx, 'pink', 550, 0.2);
    // Random melodious bird chirps
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'forest-birds') return;
      try {
        const now = ctx.currentTime;
        const chirpCount = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < chirpCount; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const startF = 2800 + Math.random() * 1200;
          osc.frequency.setValueAtTime(startF, now + i * 0.08);
          osc.frequency.exponentialRampToValueAtTime(startF + 800, now + i * 0.08 + 0.04);
          osc.frequency.exponentialRampToValueAtTime(startF - 300, now + i * 0.08 + 0.07);

          gain.gain.setValueAtTime(0.05, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.08);

          osc.connect(gain);
          gain.connect(this.soundscapeGain!);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.09);
        }
      } catch (e) {
        // ignore
      }
    }, 1800);
    this.soundscapeIntervals.push(interval);
  }

  // 11. Deep Ocean Submarine Surge & Sonar
  private startDeepOcean(ctx: AudioContext) {
    this.startNoise(ctx, 'brown', 250, 0.5);
    // Soft deep sonar ping
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'deep-ocean') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1150, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.soundscapeGain!);
        osc.start(now);
        osc.stop(now + 1.3);
      } catch (e) {
        // ignore
      }
    }, 6000);
    this.soundscapeIntervals.push(interval);
  }

  // 12. Fireplace Crackle & Warm Hearth
  private startFireplace(ctx: AudioContext) {
    this.startNoise(ctx, 'brown', 320, 0.35);
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'fireplace') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120 + Math.random() * 400, now);
        gain.gain.setValueAtTime(0.08 + Math.random() * 0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        osc.connect(gain);
        gain.connect(this.soundscapeGain!);
        osc.start(now);
        osc.stop(now + 0.04);
      } catch (e) {
        // ignore
      }
    }, 240);
    this.soundscapeIntervals.push(interval);
  }

  // 13. Minimalist Neo-Classical Piano
  private startPianoSolitude(ctx: AudioContext) {
    const notes = [261.63, 329.63, 392.0, 493.88, 523.25, 659.25]; // C, E, G, B, C5, E5
    let step = 0;
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'piano-solitude') return;
      try {
        const freq = notes[step % notes.length];
        step++;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.soundscapeGain!);
        osc.start(now);
        osc.stop(now + 2.5);
      } catch (e) {
        // ignore
      }
    }, 900);
    this.soundscapeIntervals.push(interval);
  }

  // 14. Zen Temple Garden & Koto
  private startZenGarden(ctx: AudioContext) {
    const kotoScale = [220, 246.94, 261.63, 329.63, 349.23, 440]; // Japanese Hirajoshi
    let step = 0;
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'zen-garden') return;
      try {
        const freq = kotoScale[step % kotoScale.length];
        step += Math.floor(Math.random() * 2) + 1;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.soundscapeGain!);
        osc.start(now);
        osc.stop(now + 1.9);
      } catch (e) {
        // ignore
      }
    }, 1200);
    this.soundscapeIntervals.push(interval);
  }

  // 15. Interstellar Space Voyager
  private startSpaceVoyager(ctx: AudioContext) {
    const freqs = [65.41, 130.81, 196.0]; // C2, C3, G3
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.08 / (idx + 1), ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.soundscapeGain!);
      osc.start();
      this.soundscapeNodes[`space_${idx}`] = osc;
    });
  }

  // 16. Coding Pulse Techno (128 BPM)
  private startCodingPulse(ctx: AudioContext) {
    let step = 0;
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'coding-pulse') return;
      try {
        const now = ctx.currentTime;
        // Kick on every beat
        if (step % 2 === 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(this.soundscapeGain!);
          osc.start(now);
          osc.stop(now + 0.16);
        }
        // Crisp hi-hat
        const bufferSize = ctx.sampleRate * 0.04;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.soundscapeGain!);
        noise.start(now);

        step++;
      } catch (e) {
        // ignore
      }
    }, 234); // ~128 BPM eighth-note grid
    this.soundscapeIntervals.push(interval);
  }

  // Generic Filtered Noise Generator
  private startNoise(ctx: AudioContext, type: 'white' | 'pink' | 'brown', filterFreq: number, gainVal: number) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'white') {
        data[i] = white * 0.2;
      } else if (type === 'pink') {
        last = (last + 0.05 * white) / 1.05;
        data[i] = last * 1.5;
      } else {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.2;
      }
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.soundscapeGain!);

    noise.start();
    this.soundscapeNodes[`noise_${type}`] = noise;
  }

  // 17. 8-Bit Chiptune Retro Melody
  private startChiptune(ctx: AudioContext) {
    const arp = [440, 554.37, 659.25, 880, 659.25, 554.37];
    let step = 0;
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'chiptune-8bit') return;
      try {
        const freq = arp[step % arp.length];
        step++;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(this.soundscapeGain!);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch (e) {
        // ignore
      }
    }, 130);
    this.soundscapeIntervals.push(interval);
  }

  // 18. Pure Tone Frequency (e.g. 528Hz Solfeggio)
  private startPureTone(ctx: AudioContext, frequency: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.soundscapeGain!);
    osc.start();
    this.soundscapeNodes['pure_tone'] = osc;
  }

  // 19. Tibetan Singing Bowls
  private startTibetanBowls(ctx: AudioContext) {
    const freqs = [216, 432, 648];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.12 / (i + 1), ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.soundscapeGain!);
      osc.start();
      this.soundscapeNodes[`bowl_${i}`] = osc;
    });
  }

  // 20. Alpine Wind in Pines
  private startWindPines(ctx: AudioContext) {
    this.startNoise(ctx, 'pink', 400, 0.4);
  }

  // 21. Night Crickets
  private startNightCrickets(ctx: AudioContext) {
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'night-crickets') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(4500, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.soundscapeGain!);
        osc.start(now);
        osc.stop(now + 0.06);
      } catch (e) {
        // ignore
      }
    }, 180);
    this.soundscapeIntervals.push(interval);
  }

  // 22. Thunderstorm Deluge
  private startThunderstorm(ctx: AudioContext) {
    this.startRainSound(ctx);
    // Occasional rolling thunder
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'thunderstorm') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 1.8);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
        osc.connect(gain);
        gain.connect(this.soundscapeGain!);
        osc.start(now);
        osc.stop(now + 2.6);
      } catch (e) {
        // ignore
      }
    }, 5500);
    this.soundscapeIntervals.push(interval);
  }

  // 23. Jazz Cafe Velvet Chords
  private startJazzCafe(ctx: AudioContext) {
    const chords = [
      [311.13, 392.0, 466.16, 587.33], // Ebmaj7
      [261.63, 311.13, 392.0, 466.16], // Cm7
      [349.23, 415.3, 523.25, 622.25], // Fm7
      [233.08, 293.66, 349.23, 415.3], // Bb7
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'jazz-cafe') return;
      try {
        const notes = chords[idx % chords.length];
        idx++;
        const now = ctx.currentTime;
        notes.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);
          osc.connect(gain);
          gain.connect(this.soundscapeGain!);
          osc.start(now);
          osc.stop(now + 3.5);
        });
      } catch (e) {
        // ignore
      }
    }, 3600);
    this.soundscapeIntervals.push(interval);
  }

  // 24. Ethereal Cloud Ambient Pads
  private startAmbientPads(ctx: AudioContext) {
    const padFreqs = [174.61, 220, 261.63, 329.63]; // F3, A3, C4, E4
    padFreqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.06 / (i + 1), ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.soundscapeGain!);
      osc.start();
      this.soundscapeNodes[`pad_${i}`] = osc;
    });
  }

  // 25. Cyber Matrix Data Stream
  private startCyberMatrix(ctx: AudioContext) {
    this.startAmbientDrone(ctx);
    const interval = setInterval(() => {
      if (this.currentSoundscapeId !== 'cyber-matrix') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800 + Math.random() * 1600, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.soundscapeGain!);
        osc.start(now);
        osc.stop(now + 0.06);
      } catch (e) {
        // ignore
      }
    }, 280);
    this.soundscapeIntervals.push(interval);
  }

  // 26. Mountain Waterfall Deluge
  private startWaterfall(ctx: AudioContext) {
    this.startNoise(ctx, 'pink', 1800, 0.45);
  }
}

export const audioService = new AudioService();
