
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, Mic, AudioLines, X, Loader } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToMia } from '../services/miaService';
import { saveChatSession } from '../services/db';

interface ChatInterfaceProps {
  initialMessage?: string;
  onClose: () => void;
  title: string;
  botId?: string;
  spaceId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialMessage, onClose, title, botId, spaceId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
    setIsTyping(true);

    // Create a placeholder for the bot message immediately
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

    try {
      await sendMessageToMia(
        userText, 
        false, // Voice disabled
        (textDelta, _) => {
          if (textDelta) fullText += textDelta;

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
      
      setMessages(prev => prev.map(msg => 
          msg.id === botMsgId 
          ? { ...msg, text: fullText }
          : msg
      ));

    } catch (error) {
      setIsTyping(false);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        sender: 'bot',
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleClose = async () => {
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

  if (isSaving) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-900 animate-fade-in">
          <div className="bg-white p-4 rounded-full shadow-lg mb-6 relative">
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
        <div className="w-8">
            {/* Spacer */}
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center text-lg font-bold text-slate-800 line-clamp-1 max-w-[70%]">
            {title}
        </div>
        <div className="flex items-center gap-3 w-8 justify-end">
            <button onClick={handleClose} className="p-1 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100">
              <X size={24} />
            </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
        {messages.map((msg) => (
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
                ) : (
                    msg.text
                )}
                </div>
            </div>
          </div>
        ))}
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
                {/* Mic Button (Inactive) */}
                <button 
                  disabled 
                  className="p-2 text-slate-400 opacity-50 cursor-not-allowed"
                >
                    <Mic size={24} />
                </button>

                {/* Send / Live Button */}
                {hasInput ? (
                    <button 
                        onClick={handleSend}
                        className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm"
                    >
                        <ArrowUp size={18} strokeWidth={3} />
                    </button>
                ) : (
                    <button 
                        disabled 
                        className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center opacity-30 cursor-not-allowed"
                    >
                         {/* Using AudioLines as the audio waves icon */}
                        <AudioLines size={18} />
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
