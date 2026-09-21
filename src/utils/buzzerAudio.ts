class BuzzerAudioEngine {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private pulseTimer: number | null = null;
  private isMuted: boolean = true; // Start muted by default to avoid auto-play blocking

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public updateSound(mode: "OFF" | "INTERMITTENT" | "CONTINUOUS") {
    if (this.isMuted) {
      this.stop();
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    if (mode === "OFF") {
      this.stop();
    } else if (mode === "INTERMITTENT") {
      this.startIntermittent();
    } else if (mode === "CONTINUOUS") {
      this.startContinuous();
    }
  }

  private startContinuous() {
    this.clearPulse();
    if (!this.ctx) return;

    if (!this.osc) {
      this.osc = this.ctx.createOscillator();
      this.gain = this.ctx.createGain();
      this.osc.type = "sawtooth";
      this.osc.frequency.setValueAtTime(1050, this.ctx.currentTime);
      this.gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.osc.connect(this.gain);
      this.gain.connect(this.ctx.destination);
      this.osc.start();
    } else if (this.gain) {
      this.gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.osc.frequency.setValueAtTime(1100, this.ctx.currentTime);
    }
  }

  private startIntermittent() {
    if (this.pulseTimer) return; // already pulsing
    this.stopOsc();

    const beep = () => {
      if (this.isMuted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(900, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      } catch (e) {
        // ignore audio quirks
      }
    };

    beep();
    this.pulseTimer = window.setInterval(beep, 600);
  }

  private clearPulse() {
    if (this.pulseTimer) {
      clearInterval(this.pulseTimer);
      this.pulseTimer = null;
    }
  }

  private stopOsc() {
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch (e) {}
      this.osc = null;
      this.gain = null;
    }
  }

  public stop() {
    this.clearPulse();
    this.stopOsc();
  }
}

export const buzzerAudio = new BuzzerAudioEngine();
