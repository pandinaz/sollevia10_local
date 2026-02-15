
import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Mic, PlayCircle, PauseCircle, ExternalLink, AlertCircle, Video, Volume2, Heart, Plus, Trash2 } from 'lucide-react';
import { Module, SubModule, ScreenName, Habit } from '../types';
import { 
  getFavorites, 
  toggleFavorite as toggleFavService, 
  getHabits, 
  saveHabit as saveHabitService,
  deleteHabit as deleteHabitService,
  saveProgress
} from '../services/userData';

interface ModuleContentScreenProps {
  module: Module;
  subModule?: SubModule;
  onNavigate: (screen: ScreenName, params?: any) => void;
  onClose: () => void;
}

const ModuleContentScreen: React.FC<ModuleContentScreenProps> = ({ module, subModule, onNavigate, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Logic: If subModule is provided, we use its single step. Otherwise, use the module's step array.
  const isSubModuleMode = !!subModule;
  const totalSteps = isSubModuleMode ? 1 : (module.steps?.length || 0);
  const step = isSubModuleMode ? subModule?.step : module.steps?.[currentStep];

  // Determine the correct reflection prompt
  const activeReflectionPrompt = isSubModuleMode 
    ? subModule?.reflectionPrompt 
    : module.reflectionPrompt;

  // --- COMPLETION LOGIC ---
  const isLastPage = isSubModuleMode || (currentStep === totalSteps - 1);
  const isReflectiveStep = isLastPage && !!activeReflectionPrompt;
  const isNativeAudioStep = !!step?.audioUrl && !step.audioUrl.includes('drive.google.com') && !step.audioUrl.includes('youtube.com');
  const isScrollCompletionStep = !isReflectiveStep && !isNativeAudioStep;

  const markComplete = () => {
      saveProgress(module.id, currentStep, subModule?.id);
  };

  // Scroll Detection
  const checkScrollCompletion = () => {
    if (!isScrollCompletionStep || !scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    // Check if scrolled near bottom (or if content is short enough to fit)
    if (scrollHeight <= clientHeight || scrollTop + clientHeight >= scrollHeight - 50) {
        markComplete();
    }
  };

  // Attach Scroll Listener
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
        el.addEventListener('scroll', checkScrollCompletion);
        // Initial check for short content
        checkScrollCompletion();
    }
    return () => el?.removeEventListener('scroll', checkScrollCompletion);
  }, [currentStep, subModule]); // Re-attach on step change

  // --- END COMPLETION LOGIC ---

  // Load voices - Chrome loads asynchronously
  useEffect(() => {
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    updateVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Load favorites and habits from centralized service
  useEffect(() => {
    setFavorites(getFavorites());
    setHabits(getHabits());
  }, []);

  // Cleanup speech on unmount or step change
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [currentStep, subModule]);

  // Reset states and scroll when changing steps
  useEffect(() => {
    setAudioError(null);
    setVideoError(null);
    // Reset scroll position to top
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentStep, subModule]);

  // Manually mount the ElevenLabs widget to ensure attributes are set correctly and React doesn't interfere
  useEffect(() => {
    if (step?.customWidget === 'elevenlabs-mindfulness-coach' && widgetContainerRef.current) {
        // Clear previous instances
        widgetContainerRef.current.innerHTML = '';
        
        // Create the custom element
        const widget = document.createElement('elevenlabs-convai');
        widget.setAttribute('agent-id', 'agent_5401keq3j8v8fzhbcsanrfcft1ny');
        
        // Append to container
        widgetContainerRef.current.appendChild(widget);
    }
  }, [step]);

  const handleNext = () => {
    window.speechSynthesis.cancel(); 
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      startReflection();
    }
  };

  const handlePrev = () => {
    window.speechSynthesis.cancel();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const startReflection = () => {
    // If it's a reflection step, we mark complete upon initiating
    markComplete();

    if (!activeReflectionPrompt) return;
    
    window.speechSynthesis.cancel();
    onNavigate('module_reflection', { 
      initialMessage: activeReflectionPrompt,
      title: `Reflection: ${isSubModuleMode ? subModule?.title : module.title}`,
      // Use submodule bot config if available, fallback to module defaults
      botId: (isSubModuleMode && subModule?.botId) ? subModule.botId : module.botId,
      spaceId: (isSubModuleMode && subModule?.spaceId) ? subModule.spaceId : module.spaceId
    });
  };

  const toggleSpeech = () => {
    if (!step) return;
    const textToSpeak = step.audioScript || step.content;
    if (!textToSpeak) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      utterance.lang = 'en-US';

      // Advanced Voice Selection Strategy
      let preferredVoice = availableVoices.find(v => v.name === 'Google US English');
      if (!preferredVoice) preferredVoice = availableVoices.find(v => v.name === 'Samantha');
      if (!preferredVoice) preferredVoice = availableVoices.find(v => v.name.includes('Microsoft Zira'));
      if (!preferredVoice) preferredVoice = availableVoices.find(v => v.lang === 'en-US' && !v.name.includes('Microsoft')); 
      if (!preferredVoice) preferredVoice = availableVoices.find(v => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 0.95; 
      utterance.pitch = 1.0;
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const toggleFavorite = () => {
    if (!subModule) return;
    const updated = toggleFavService(subModule.id);
    setFavorites(updated);
  };

  const isHabitAdded = isSubModuleMode && subModule && habits.some(h => h.subModuleId === subModule.id);

  const handleHabitClick = () => {
    // Show modal for both adding and removing
    setShowAddHabitModal(true);
  };

  const handleConfirmHabitWithService = () => {
      if (!subModule) return;
      
      if (isHabitAdded) {
         const currentHabits = getHabits();
         const habitToDelete = currentHabits.find(h => h.subModuleId === subModule.id);
         
         if (habitToDelete) {
             const newHabits = deleteHabitService(habitToDelete.id);
             setHabits(newHabits);
         }
      } else {
         onNavigate('practice', {
            action: 'add_habit',
            title: subModule.title,
            moduleId: module.id,
            subModuleId: subModule.id
         });
      }
      setShowAddHabitModal(false);
  }

  const isYouTube = (url: string) => {
      if (!url) return false;
      return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&playsinline=1`;
    }
    return url;
  };

  const getGoogleDriveId = (url: string) => {
    if (!url) return null;
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/, // Matches /file/d/ID
      /id=([a-zA-Z0-9_-]+)/          // Matches id=ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  if (!step) return <div className="p-10 text-center">Loading content...</div>;

  const driveId = step.audioUrl ? getGoogleDriveId(step.audioUrl) : null;

  const VideoPlayer = step.videoUrl ? (
    <div className="mb-8 w-full">
        <div className="bg-black rounded-xl overflow-hidden shadow-card relative">
            <div className="aspect-video w-full relative">
                {isYouTube(step.videoUrl) ? (
                    <iframe 
                        key={step.videoUrl}
                        className="w-full h-full absolute inset-0"
                        src={getYouTubeEmbedUrl(step.videoUrl)}
                        title="Module Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                ) : (
                    !videoError ? (
                        <video 
                            key={step.videoUrl}
                            className="w-full h-full absolute inset-0 object-contain bg-black"
                            controls 
                            playsInline
                            poster={step.videoThumbnailUrl || module.thumbnailUrl}
                            onError={() => setVideoError(step.videoUrl || 'error')}
                        >
                            <source src={step.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 p-6 text-center">
                            <Video size={32} className="mb-2 opacity-50" />
                            <p className="text-sm font-medium mb-3">Video format not supported or file missing.</p>
                        </div>
                    )
                )}
            </div>
        </div>
        {isYouTube(step.videoUrl) && (
             <div className="flex justify-center mt-2">
                <a 
                   href={step.videoUrl}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-[10px] text-slate-400 flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                    <ExternalLink size={10} />
                    Watch on YouTube
                </a>
             </div>
        )}
    </div>
  ) : null;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <header className="relative flex justify-end items-center px-6 py-4 bg-slate-50 border-b border-slate-100 z-10 shadow-card">
         <h1 className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-slate-800 line-clamp-1 max-w-[70%] text-center">
            {isSubModuleMode ? subModule?.title : module.title}
         </h1>
         
         <div className="flex items-center gap-2 relative z-20">
             <button 
               onClick={onClose} 
               className="text-slate-400 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100 transition-colors"
             >
               <X size={24} />
             </button>
         </div>
      </header>

      {/* Main Content Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 pb-8"
      >
          
          {/* Media Section */}
          <div className="w-full h-64 bg-slate-200 relative shrink-0">
             <img 
               src={step.imageUrl || module.thumbnailUrl} 
               alt={step.title} 
               className="w-full h-full object-cover" 
             />
             <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
          </div>

          <div className="px-6 relative z-10 mt-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-slate-900 flex-1">{step.title}</h2>
                  
                  <div className="flex gap-2">
                    {/* Technique Submodule Actions: Plus & Favorite */}
                    {isSubModuleMode && subModule?.type === 'technique' && (
                        <>
                            <button 
                                onClick={handleHabitClick}
                                className={`shrink-0 p-2 rounded-full transition-colors ${
                                    isHabitAdded
                                    ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                                aria-label={isHabitAdded ? "Remove from habits" : "Add to habits"}
                            >
                                <Plus size={24} />
                            </button>

                            <button 
                                onClick={toggleFavorite}
                                className={`shrink-0 p-2 rounded-full transition-colors ${
                                    favorites.includes(subModule!.id) 
                                    ? 'bg-indigo-50 text-indigo-600' 
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                                aria-label={favorites.includes(subModule!.id) ? "Remove from favorites" : "Save as favorite"}
                            >
                                <Heart size={24} fill={favorites.includes(subModule!.id) ? "currentColor" : "none"} />
                            </button>
                        </>
                    )}

                    <button
                        onClick={toggleSpeech}
                        className={`shrink-0 p-2 rounded-full transition-colors ${
                          isSpeaking 
                            ? 'bg-indigo-100 text-indigo-600' 
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}
                        aria-label={isSpeaking ? "Stop reading" : "Read aloud"}
                    >
                        {isSpeaking ? <PauseCircle size={24} /> : <Volume2 size={24} />}
                    </button>
                  </div>
              </div>
              
              {step.videoPosition === 'above-text' && VideoPlayer}

              <div className="text-slate-600 text-lg leading-relaxed mb-6 whitespace-pre-line">
                  {step.content}
              </div>

              {/* ElevenLabs Custom Widget */}
              {step.customWidget === 'elevenlabs-mindfulness-coach' && (
                  <div className="mb-8 flex justify-center items-center min-h-[150px] relative">
                      <div className="relative z-10 w-full flex justify-center" ref={widgetContainerRef}>
                          {/* Widget mounted here via Ref */}
                      </div>
                  </div>
              )}

              {step.audioUrl && !isYouTube(step.audioUrl) && (
                <div className="mb-8 w-full bg-white rounded-xl shadow-card border border-slate-200 transition-all overflow-hidden">
                    {driveId ? (
                        // Google Drive Iframe Player (More reliable than native audio for Drive links)
                        <div className="w-full">
                            <div className="flex items-center gap-3 p-4 pb-2 text-slate-800 font-semibold text-sm">
                                <PlayCircle size={20} className="text-indigo-600" />
                                <span>Audio Guide</span>
                            </div>
                            <iframe 
                                src={`https://drive.google.com/file/d/${driveId}/preview`} 
                                width="100%" 
                                height="100" 
                                style={{ border: 'none' }}
                                title="Audio Player"
                                loading="lazy"
                            ></iframe>
                        </div>
                    ) : (
                        // Native Audio Player
                        <div className="p-4">
                            {!audioError ? (
                                <div>
                                     <div className="flex items-center gap-3 mb-3 text-slate-800 font-semibold text-sm">
                                        <PlayCircle size={20} className="text-indigo-600" />
                                        <span>Audio Guide</span>
                                    </div>
                                    <audio 
                                        key={step.audioUrl} 
                                        controls 
                                        className="w-full h-10 outline-none" 
                                        controlsList="nodownload"
                                        preload="metadata"
                                        src={step.audioUrl}
                                        onError={() => setAudioError(step.audioUrl || 'error')}
                                        onEnded={() => markComplete()}
                                    >
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            ) : (
                                 <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                    <div className="flex items-center gap-2 text-amber-600 text-xs font-medium mb-2">
                                        <AlertCircle size={14} />
                                        <span>Stream restricted. Options:</span>
                                    </div>
                                    <a 
                                        href={step.audioUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors mb-2"
                                    >
                                        <ExternalLink size={14} />
                                        Listen in New Tab
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
              )}

              {(step.videoPosition !== 'above-text') && VideoPlayer}

              {/* Show reflection section ONLY if we have a valid prompt */}
              {isLastPage && activeReflectionPrompt && (
                <div className="animate-fade-in mt-8 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Reflection</h3>
                    
                    <div 
                      onClick={startReflection}
                      className="bg-white rounded-2xl p-6 shadow-card border border-slate-200 cursor-pointer active:scale-[0.99] transition-transform hover:shadow-card-hover mb-8"
                    >
                        <p className="text-slate-800 font-medium leading-relaxed">
                            {activeReflectionPrompt}
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <button 
                            onClick={startReflection}
                            className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center text-indigo-600 bg-white hover:bg-slate-50 hover:border-indigo-200 transition-all shadow-md active:scale-95"
                        >
                            <Mic size={28} />
                        </button>
                        <span className="text-xs text-slate-400 font-medium">Tap to reflect</span>
                    </div>
                </div>
              )}
          </div>
      </div>

      {/* Navigation Footer - HIDDEN for SubModule Mode */}
      {!isSubModuleMode && (
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0 relative z-20">
            <button 
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                currentStep === 0 
                ? 'text-slate-300 cursor-not-allowed bg-slate-50' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
            >
            <ChevronLeft size={24} />
            </button>

            <span className="text-sm font-medium text-slate-500 font-mono bg-slate-100 px-3 py-1 rounded-full">
            {currentStep + 1} / {totalSteps}
            </span>

            {/* Hide Forward Arrow on Last Page */}
            {currentStep < totalSteps - 1 ? (
              <button 
              onClick={handleNext}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
              <ChevronRight size={24} />
              </button>
            ) : (
              <div className="w-12 h-12" />
            )}
        </div>
      )}

      {/* Add/Remove Habit Confirmation Modal */}
      {showAddHabitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                onClick={() => setShowAddHabitModal(false)}
            />
            
            {/* Modal Content */}
            <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-modal transform transition-all scale-100 relative z-10 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isHabitAdded ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {isHabitAdded ? <Trash2 size={24} /> : <Plus size={24} strokeWidth={3} />}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">{isHabitAdded ? "Remove from habits" : "Add to my habits"}</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    {isHabitAdded 
                        ? <>Do you want to remove <span className="font-semibold text-slate-800">"{subModule?.title}"</span> from your daily habits?</>
                        : <>Would you like to add <span className="font-semibold text-slate-800">"{subModule?.title}"</span> to your daily practice list?</>
                    }
                </p>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowAddHabitModal(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmHabitWithService}
                        className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors shadow-lg ${
                            isHabitAdded 
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                        }`}
                    >
                        {isHabitAdded ? "Remove" : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ModuleContentScreen;
