
import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from '../config';

interface QueueItem {
  audioPromise: Promise<Blob | null>;
}

export class TtsQueue {
  private queue: QueueItem[] = [];
  private isPlaying = false;
  private abortController: AbortController | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentBlobUrl: string | null = null;

  enqueue(text: string): void {
    if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) return;

    const controller = this.getOrCreateAbortController();
    const audioPromise = this.fetchAudio(text, controller.signal);
    this.queue.push({ audioPromise });

    if (!this.isPlaying) {
      this.playNext();
    }
  }

  stopAll(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.onended = null;
      this.currentAudio.onerror = null;
    }

    this.cleanupCurrent();
    this.queue = [];
    this.isPlaying = false;
  }

  private getOrCreateAbortController(): AbortController {
    if (!this.abortController || this.abortController.signal.aborted) {
      this.abortController = new AbortController();
    }
    return this.abortController;
  }

  private async fetchAudio(text: string, signal: AbortSignal): Promise<Blob | null> {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_flash_v2_5',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
          signal,
        }
      );

      if (!response.ok) return null;
      return await response.blob();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return null;
      console.warn('[TtsQueue] Fetch failed:', err);
      return null;
    }
  }

  private async playNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const item = this.queue.shift()!;

    try {
      const blob = await item.audioPromise;

      if (!this.isPlaying || !blob) {
        this.playNext();
        return;
      }

      this.currentBlobUrl = URL.createObjectURL(blob);
      this.currentAudio = new Audio(this.currentBlobUrl);

      await new Promise<void>((resolve) => {
        if (!this.currentAudio) { resolve(); return; }

        this.currentAudio.onended = () => {
          this.cleanupCurrent();
          resolve();
        };

        this.currentAudio.onerror = () => {
          this.cleanupCurrent();
          resolve();
        };

        this.currentAudio.play().catch(() => {
          this.cleanupCurrent();
          resolve();
        });
      });

      this.playNext();
    } catch {
      this.cleanupCurrent();
      this.playNext();
    }
  }

  private cleanupCurrent(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
    this.currentAudio = null;
  }
}
