
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, Mic, AudioLines, X, Loader, Volume2, VolumeX } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToMia } from '../services/miaService';
import { saveChatSession } from '../services/db';
import { getTtsEnabled, setTtsEnabled as setTtsEnabledPref } from '../services/userData';
import { SentenceChunker } from '../services/sentenceChunker';
import { TtsQueue } from '../services/ttsQueue';
import { transcribeAudio } from '../services/sttService';
import VoiceRecordingOverlay from './VoiceRecordingOverlay';

interface ChatInterfaceProps {
  initialMessage?: string;
  onClose: () => void;
  title: string;
  botId?: string;
  spaceId?: string;
  ttsOn?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialMessage, onClose, title, botId, spaceId, ttsOn }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => getTtsEnabled());
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceMessageIds] = useState<Set<string>>(() => new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ttsQueueRef = useRef<TtsQueue>(new TtsQueue());
  const chunkerRef = useRef<SentenceChunker | null>(null);
  const ttsEnabledRef = useRef<boolean>(ttsEnabled);

  useEffect(() => {
    ttsEnabledRef.current = ttsEnabled;
  }, [ttsEnabled]);

  useEffect(() => {
    if (ttsOn) {
      setTtsEnabled(true);
      setTtsEnabledPref(true);
    }
  }, [ttsOn]);

  useEffect(() => {
    if (initialMessage) {
      setMessages([{
        id: 'init',
        sender: 'bot',
        text: initialMessage,
        timestamp: new Date()
      }]);
    }
  }, [initialMessage]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      ttsQueueRef.current.stopAll();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleToggleTts = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    setTtsEnabledPref(next);
    if (!next) {
      ttsQueueRef.current.stopAll();
      if (chunkerRef.current) {
        chunkerRef.current.reset();
        chunkerRef.current = null;
      }
    }
  };

  // Send a text message to the bot (reused by both typed and voice messages)
  const sendTextToBot = async (text: string, userMsgId?: string) => {
    // Stop any in-progress TTS from previous bot message
    ttsQueueRef.current.stopAll();
    if (chunkerRef.current) {
      chunkerRef.current.reset();
      chunkerRef.current = null;
    }

    setIsTyping(true);

    // Create a placeholder for the bot message
    const botMsgId = (Date.now() + 1).toString();
    const initialBotMsg: ChatMessage = {
        id: botMsgId,
        sender: 'bot',
        text: '',
        timestamp: new Date()
    };
    setMessages(prev => [...prev, initialBotMsg]);

    let fullText = "";
    let lastUpdateTime = 0;

    // Create sentence chunker if TTS is enabled
    if (ttsEnabledRef.current) {
      chunkerRef.current = new SentenceChunker((sentence) => {
        ttsQueueRef.current.enqueue(sentence);
      });
    }

    try {
      await sendMessageToMia(
        text,
        false,
        (textDelta, _) => {
          if (textDelta) fullText += textDelta;

          // Feed delta to sentence chunker for TTS
          if (ttsEnabledRef.current && chunkerRef.current && textDelta) {
            chunkerRef.current.addDelta(textDelta);
          }

          const now = Date.now();
          if (now - lastUpdateTime > 50) {
              setMessages(prev => prev.map(msg =>
                  msg.id === botMsgId
                  ? { ...msg, text: fullText }
                  : msg
              ));
              lastUpdateTime = now;
          }
        },
        { botId, spaceId }
      );

      setIsTyping(false);

      // Flush remaining buffered text to TTS
      if (ttsEnabledRef.current && chunkerRef.current) {
        chunkerRef.current.flush();
        chunkerRef.current = null;
      }

      setMessages(prev => prev.map(msg =>
          msg.id === botMsgId
          ? { ...msg, text: fullText }
          : msg
      ));

    } catch (error) {
      setIsTyping(false);
      ttsQueueRef.current.stopAll();
      if (chunkerRef.current) {
        chunkerRef.current.reset();
        chunkerRef.current = null;
      }
      const errorMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        sender: 'bot',
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    await sendTextToBot(userText);
  };

  // Voice recording handlers
  const startRecording = () => {
    setIsRecording(true);
  };

  const handleVoiceSend = async (blob: Blob, duration: number) => {
    setIsRecording(false);
    setIsTranscribing(true);

    try {
      const transcribedText = await transcribeAudio(blob);

      if (!transcribedText.trim()) {
        setIsTranscribing(false);
        return;
      }

      // Add voice message
      const msgId = Date.now().toString();
      voiceMessageIds.add(msgId);

      const voiceMsg: ChatMessage = {
        id: msgId,
        sender: 'user',
        text: transcribedText,
        timestamp: new Date(),
        audio: `voice:${duration}`,
      };

      setMessages(prev => [...prev, voiceMsg]);
      setIsTranscribing(false);

      // Send to bot
      await sendTextToBot(transcribedText, msgId);
    } catch (error) {
      setIsTranscribing(false);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        sender: 'bot',
        text: "Could not transcribe audio. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleVoiceCancel = () => {
    setIsRecording(false);
  };

  const handleClose = async () => {
    ttsQueueRef.current.stopAll();

    const hasUserMessages = messages.some(m => m.sender === 'user');

    if (hasUserMessages) {
        setIsSaving(true);
        try {
          await saveChatSession(messages, title);
        } catch (e) {
          console.error("Failed to save chat:", e);
        }
    }
    onClose();
  };

  const hasInput = input.trim().length > 0;

  // Helper to parse voice duration from audio field
  const getVoiceDuration = (msg: ChatMessage): string | null => {
    if (!msg.audio?.startsWith('voice:')) return null;
    const secs = parseInt(msg.audio.split(':')[1], 10);
    const mins = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${mins}:${s}`;
  };

  if (isSaving) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-900 animate-fade-in">
          <div className="bg-white p-4 rounded-full shadow-elevated mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-50"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              <Loader className="text-indigo-600 relative z-10" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Generating Summary</h2>
          <p className="text-slate-500 text-sm">Reflecting on your session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 max-w-md mx-auto">
      {/* Chat Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-100 bg-white relative z-10">
        <div className="w-16">
            {/* Spacer */}
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center text-lg font-bold text-slate-800 line-clamp-1 max-w-[60%]">
            {title}
        </div>
        <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleToggleTts}
              className={`p-1.5 rounded-full transition-colors ${
                ttsEnabled
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              aria-label={ttsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
            >
              {ttsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button onClick={handleClose} className="p-1 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100">
              <X size={24} />
            </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
        {messages.map((msg) => {
          const voiceDuration = getVoiceDuration(msg);

          return (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div
                  className={`px-4 py-3 leading-relaxed rounded-2xl ${
                      msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  }`}
                  >
                  {msg.text === '' && msg.sender === 'bot' && isTyping ? (
                      <span className="animate-pulse text-slate-400">...</span>
                  ) : voiceDuration ? (
                      <>
                        <span className="italic">"{msg.text}"</span>
                        <div className="flex items-center gap-1.5 mt-2 opacity-70 text-xs">
                          <Mic size={12} />
                          <span>{voiceDuration}</span>
                        </div>
                      </>
                  ) : (
                      msg.text
                  )}
                  </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ChatGPT-style Input Area */}
      <div className="p-3 pb-6 bg-white">
        <div className="bg-[#f4f4f5] rounded-[26px] flex items-end p-1.5 pl-4 transition-all duration-200">
            {/* Input Field */}
            <textarea
                rows={1}
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Ask anything"
                className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-[16px] focus:outline-none py-3 max-h-32 resize-none"
                style={{ minHeight: '44px', lineHeight: '1.2' }}
            />

            <div className="flex items-center gap-2 mb-1 ml-2 mr-1">
                {/* Mic Button */}
                <button
                  onClick={startRecording}
                  disabled={isTranscribing}
                  className={`p-2 transition-colors ${
                    isTranscribing
                      ? 'text-indigo-400 cursor-wait'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  aria-label="Voice input"
                >
                    {isTranscribing ? <Loader size={24} className="animate-spin" /> : <Mic size={24} />}
                </button>

                {/* Send / Live Button */}
                {hasInput ? (
                    <button
                        onClick={handleSend}
                        className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90 transition-all shadow-card"
                    >
                        <ArrowUp size={18} strokeWidth={3} />
                    </button>
                ) : (
                    <button
                        disabled
                        className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center opacity-30 cursor-not-allowed"
                    >
                        <AudioLines size={18} />
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Voice Recording Overlay */}
      <VoiceRecordingOverlay
        isActive={isRecording}
        onSend={handleVoiceSend}
        onCancel={handleVoiceCancel}
      />
    </div>
  );
};

export default ChatInterface;
