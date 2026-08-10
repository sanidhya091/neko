export class SoundManager {
  private static sounds: Map<string, HTMLAudioElement> = new Map();
  private static muted: boolean = false;

  static registerSound(key: string, url: string): void {
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.sounds.set(key, audio);
  }

  static play(key: string): void {
    if (this.muted) return;
    const audio = this.sounds.get(key);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => {
        // Audio play might be blocked by browser policy until user interaction
        console.debug(`Audio play prevented for ${key}:`, err);
      });
    }
  }

  static setMuted(muted: boolean): void {
    this.muted = muted;
  }

  static isMuted(): boolean {
    return this.muted;
  }
}
