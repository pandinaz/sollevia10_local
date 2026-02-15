
import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from '../config';

let currentAudio: HTMLAudioElement | null = null;
let currentBlobUrl: string | null = null;
let aborted = false;

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

/**
 * Speaks text using the ElevenLabs TTS API (streaming endpoint + flash model for speed).
 */
export async function speakText(text: string, options?: SpeakOptions): Promise<void> {
  if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
    console.warn('ElevenLabs API key or voice ID not configured');
    options?.onError?.('Missing API key');
    return;
  }

  stopSpeaking();
  aborted = false;

  // Truncate very long text to avoid API limits
  const truncatedText = text.length > 5000 ? text.slice(0, 5000) : text;

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
          text: truncatedText,
          model_id: 'eleven_flash_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    if (aborted) return;

    const blob = await response.blob();
    if (aborted) return;

    currentBlobUrl = URL.createObjectURL(blob);
    currentAudio = new Audio(currentBlobUrl);

    options?.onStart?.();

    return new Promise<void>((resolve) => {
      if (!currentAudio) { resolve(); return; }

      currentAudio.onended = () => {
        cleanup();
        options?.onEnd?.();
        resolve();
      };

      currentAudio.onerror = () => {
        cleanup();
        options?.onError?.('Playback failed');
        resolve();
      };

      currentAudio.play().catch((err) => {
        console.warn('Audio playback failed:', err);
        cleanup();
        options?.onError?.('Playback blocked');
        resolve();
      });
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('ElevenLabs TTS failed:', msg);
    options?.onError?.(msg);
  }
}

/** Stops any currently playing TTS audio. */
export function stopSpeaking(): void {
  aborted = true;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.onended = null;
    currentAudio.onerror = null;
  }
  cleanup();
}

function cleanup(): void {
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }
  currentAudio = null;
}
