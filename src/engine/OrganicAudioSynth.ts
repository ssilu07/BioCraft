/**
 * OrganicAudioSynth.ts
 * Procedural Web Audio API synthesizer for MicroCraft.
 * Generates 100% organic, procedural audio:
 * - Cytoplasmic binaural hum & rhythmic cellular pulse
 * - Squishy membrane elasticity & collision audio
 * - Enzymatic ATP Synthase crystalline bell chimes
 * - Deep phagocytosis suction pops
 * - Catastrophic viral lysis explosions
 * - Crisp tactile nucleotide / codon clicks
 * - Celebratory mitotic division chords
 */

class OrganicAudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private heartbeatOsc: OscillatorNode | null = null;
  private heartbeatGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isAmbientRunning: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Starts ambient cytoplasmic drone and rhythmic biological pulse
   */
  public startAmbientHum(): void {
    if (this.isAmbientRunning) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.12, ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // Binaural low-frequency cytoplasmic hum (55 Hz & 57.5 Hz)
      this.droneOsc1 = ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(55, ctx.currentTime);

      this.droneOsc2 = ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(57.5, ctx.currentTime);

      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(140, ctx.currentTime);

      this.droneOsc1.connect(droneFilter);
      this.droneOsc2.connect(droneFilter);
      droneFilter.connect(this.ambientGain);

      this.droneOsc1.start();
      this.droneOsc2.start();

      // Rhythmic cellular heartbeat pulse
      this.heartbeatOsc = ctx.createOscillator();
      this.heartbeatOsc.type = 'sine';
      this.heartbeatOsc.frequency.setValueAtTime(42, ctx.currentTime);

      this.heartbeatGain = ctx.createGain();
      this.heartbeatGain.gain.setValueAtTime(0.001, ctx.currentTime);

      const pulseLFO = ctx.createOscillator();
      pulseLFO.frequency.setValueAtTime(0.85, ctx.currentTime); // ~51 BPM metabolic rhythm
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.08, ctx.currentTime);

      pulseLFO.connect(lfoGain);
      lfoGain.connect(this.heartbeatGain.gain);

      this.heartbeatOsc.connect(this.heartbeatGain);
      this.heartbeatGain.connect(this.ambientGain);

      this.heartbeatOsc.start();
      pulseLFO.start();

      this.isAmbientRunning = true;
    } catch {
      // Audio setup fallback
    }
  }

  public stopAmbientHum(): void {
    if (!this.isAmbientRunning) return;
    try {
      this.droneOsc1?.stop();
      this.droneOsc2?.stop();
      this.heartbeatOsc?.stop();
      this.droneOsc1?.disconnect();
      this.droneOsc2?.disconnect();
      this.heartbeatOsc?.disconnect();
      this.ambientGain?.disconnect();
    } catch {
      // Audio cleanup fallback
    }
    this.isAmbientRunning = false;
  }

  /**
   * Squishy membrane stretch / deformation sound
   */
  public playMembraneStretch(intensity: number = 0.5): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    const baseFreq = 110 + intensity * 180;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, baseFreq * 0.4), t + 0.18);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, t);
    filter.Q.setValueAtTime(3.5, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25 * Math.min(1, intensity), t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  /**
   * High-frequency enzymatic chime for ATP phosphorylation
   */
  public playAtpChime(pitchMultiplier: number = 1.0): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const freqs = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7 crystal chord
    const selectedFreq = freqs[Math.floor(Math.random() * freqs.length)] * pitchMultiplier;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(selectedFreq, t);
    osc.frequency.exponentialRampToValueAtTime(selectedFreq * 1.05, t + 0.05);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  /**
   * Phagocytosis suction pop when macrophage or lysosome engulfs an antigen
   */
  public playPhagocytosisPop(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.16);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.16);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.21);
  }

  /**
   * Catastrophic viral lysis or hypotonic burst sound
   */
  public playLysisExplosion(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;

    // Sub bass impact
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, t);
    subOsc.frequency.exponentialRampToValueAtTime(28, t + 0.6);

    subGain.gain.setValueAtTime(0.5, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.7);

    // Noise burst for bursting fluid
    const bufferSize = ctx.sampleRate * 0.45;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(450, t);
    noiseFilter.Q.setValueAtTime(1.2, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(t);
  }

  /**
   * Tactile organic click for nucleotide addition or codon step
   */
  public playNucleotideClick(base: 'A' | 'T' | 'G' | 'C' | 'U'): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const baseFreqs: Record<string, number> = {
      A: 523.25, // C5
      T: 659.25, // E5
      U: 659.25, // E5 (RNA equivalent of T)
      G: 783.99, // G5
      C: 880.00  // A5
    };
    const freq = baseFreqs[base] || 600;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.06);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Mitosis victory celebration arpeggio
   */
  public playMitosisCelebration(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5]; // C major scale up to C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const noteTime = now + idx * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.52);
    });
  }
}

export const audioSynth = new OrganicAudioSynth();
