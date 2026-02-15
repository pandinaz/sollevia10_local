
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, ArrowUp } from 'lucide-react';

interface VoiceRecordingOverlayProps {
  isActive: boolean;
  onSend: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

const BAR_COUNT = 20;

const VoiceRecordingOverlay: React.FC<VoiceRecordingOverlayProps> = ({ isActive, onSend, onCancel }) => {
  const [barHeights, setBarHeights] = useState<number[]>(new Array(BAR_COUNT).fill(4));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    audioStreamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close().catch(() => {});
    mediaRecorderRef.current = null;
    audioStreamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    audioChunksRef.current = [];
    setBarHeights(new Array(BAR_COUNT).fill(4));
  }, []);

  const animateWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const segmentSize = Math.floor(dataArray.length / BAR_COUNT);
    const heights = [];
    for (let i = 0; i < BAR_COUNT; i++) {
      let sum = 0;
      for (let j = i * segmentSize; j < (i + 1) * segmentSize; j++) {
        sum += dataArray[j];
      }
      const average = sum / segmentSize;
      heights.push(Math.max(4, (average / 255) * 40));
    }
    setBarHeights(heights);
    animationFrameRef.current = requestAnimationFrame(animateWaveform);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        audioStreamRef.current = stream;

        // AudioContext + Analyser for waveform
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioContextRef.current = ctx;
        analyserRef.current = analyser;

        // MediaRecorder
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const recorder = new MediaRecorder(stream, { mimeType });
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current = recorder;
        recorder.start(100);
        startTimeRef.current = Date.now();

        animateWaveform();
      } catch (error: any) {
        if (error.name === 'NotAllowedError') {
          alert('Microphone permission denied.');
        } else if (error.name === 'NotFoundError') {
          alert('No microphone found.');
        } else {
          alert('Could not start recording. Please try again.');
        }
        onCancel();
      }
    };

    start();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [isActive, animateWaveform, cleanup, onCancel]);

  const handleSend = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      onCancel();
      return;
    }

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      cleanup();
      if (blob.size > 0) {
        onSend(blob, duration);
      } else {
        onCancel();
      }
    };

    recorder.stop();
  }, [onSend, onCancel, cleanup]);

  const handleCancel = useCallback(() => {
    cleanup();
    onCancel();
  }, [cleanup, onCancel]);

  if (!isActive) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-50 flex flex-col items-center gap-5 px-5 py-6 bg-neutral-800 rounded-t-3xl"
      style={{ animation: 'slideUp 0.3s ease' }}
    >
      {/* Controls: Cancel | Waveform | Send */}
      <div className="flex items-center justify-between w-full max-w-md">
        {/* Cancel */}
        <button
          onClick={handleCancel}
          className="w-11 h-11 rounded-full bg-neutral-700 flex items-center justify-center hover:bg-neutral-600 transition-colors"
          aria-label="Cancel recording"
        >
          <X size={20} className="text-neutral-400" />
        </button>

        {/* Waveform */}
        <div className="flex items-center justify-center gap-[3px] h-10 flex-1 max-w-[200px]">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-sm transition-[height] duration-100"
              style={{
                height: `${h}px`,
                backgroundColor: h > 6 ? '#fff' : '#666',
              }}
            />
          ))}
        </div>

        {/* Send */}
        <button
          onClick={handleSend}
          className="w-11 h-11 rounded-full bg-white flex items-center justify-center hover:bg-neutral-200 transition-colors"
          aria-label="Send voice message"
        >
          <ArrowUp size={20} className="text-neutral-900" />
        </button>
      </div>
    </div>
  );
};

export default VoiceRecordingOverlay;
