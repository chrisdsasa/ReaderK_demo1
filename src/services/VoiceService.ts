export class VoiceService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isPlaying = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Wait for voices to be loaded
    if (speechSynthesis.getVoices().length === 0) {
      await new Promise<void>(resolve => {
        speechSynthesis.addEventListener('voiceschanged', () => resolve(), { once: true });
      });
    }

    // Select default voice
    const voices = speechSynthesis.getVoices();
    this.voice = voices.find(v => v.default) || voices[0];
  }

  public async speak(text: string, language: string = 'en-US'): Promise<void> {
    if (this.isPlaying) {
      this.stop();
    }

    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.voice = this.voice;
    this.utterance.lang = language;
    this.utterance.rate = 1;
    this.utterance.pitch = 1;

    return new Promise((resolve, reject) => {
      if (!this.utterance) return reject(new Error('Speech synthesis not initialized'));

      this.utterance.onend = () => {
        this.isPlaying = false;
        resolve();
      };

      this.utterance.onerror = (event) => {
        this.isPlaying = false;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.isPlaying = true;
      speechSynthesis.speak(this.utterance);
    });
  }

  public stop() {
    if (this.isPlaying) {
      speechSynthesis.cancel();
      this.isPlaying = false;
    }
  }

  public setVoice(voiceName: string) {
    const voices = speechSynthesis.getVoices();
    const newVoice = voices.find(v => v.name === voiceName);
    if (newVoice) {
      this.voice = newVoice;
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices();
  }

  public isReading(): boolean {
    return this.isPlaying;
  }
} 