
import React, { useState, useEffect } from 'react';
import { Settings, Mic, Wrench, Clock, Heart, Plus, Trash2, Check, X, Calendar, Bell, Edit3, BookOpen, ChevronRight, ArrowLeft, MoreVertical, CheckCircle, Search } from 'lucide-react';
import { MODULES } from '../constants';
import { Module, ScreenName, Habit, SubModule } from '../types';
import { 
  getFavorites, 
  toggleFavorite as toggleFavService, 
  getHabits, 
  saveHabit as saveHabitService, 
  deleteHabit as deleteHabitService,
  toggleHabitCompletion as toggleHabitCompletionService,
  getProgress,
  Progress
} from '../services/userData';

interface HomeScreenProps {
  onNavigate: (screen: ScreenName, params?: any) => void;
  viewMode?: 'home' | 'learn' | 'practice';
  initialParams?: any;
}

type HabitWizardStep = 'menu' | 'custom_details' | 'library_select' | 'schedule';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, viewMode = 'home', initialParams }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [progress, setProgress] = useState<Progress>({});
  
  // Habit Creation/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<HabitWizardStep>('menu');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  
  // Menu State
  const [activeMenuHabitId, setActiveMenuHabitId] = useState<string | null>(null);

  // Draft Habit Data
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftDuration, setDraftDuration] = useState('');
  const [draftSubModule, setDraftSubModule] = useState<{modId: string, subId: string} | null>(null);
  
  // Schedule Data
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<string[]>(DAYS_OF_WEEK);
  const [timeOfDay, setTimeOfDay] = useState<string>('');
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // Load data
  useEffect(() => {
    setFavorites(getFavorites());
    setHabits(getHabits());
    setProgress(getProgress());
  }, [viewMode]);

  // Handle Initial Params (e.g. adding habit from module content)
  useEffect(() => {
    if (initialParams && initialParams.action === 'add_habit') {
        // Reset wizard first
        resetWizard();
        
        // Pre-fill with data passed from params
        setDraftTitle(initialParams.title || '');
        setDraftDescription('Technique from library');
        if (initialParams.moduleId && initialParams.subModuleId) {
            setDraftSubModule({ modId: initialParams.moduleId, subId: initialParams.subModuleId });
        }
        
        // Open modal at schedule step
        setWizardStep('schedule');
        setIsModalOpen(true);
    }
  }, [initialParams]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = toggleFavService(id);
    setFavorites(updated);
  };

  const resetWizard = () => {
      setWizardStep('menu');
      setDraftTitle('');
      setDraftDescription('');
      setDraftDuration('');
      setDraftSubModule(null);
      setFrequency('daily');
      setSelectedDays(DAYS_OF_WEEK);
      setTimeOfDay('');
      setNotificationEnabled(false);
      setEditingHabitId(null);
  };

  const openAddHabitModal = () => {
      resetWizard();
      setIsModalOpen(true);
  };

  const openEditHabitModal = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setDraftTitle(habit.title);
    setDraftDescription(habit.description || '');
    setDraftDuration(habit.duration || '');
    setDraftSubModule(habit.subModuleId && habit.moduleId ? { modId: habit.moduleId, subId: habit.subModuleId } : null);
    setFrequency(habit.frequency);
    setSelectedDays(habit.days || DAYS_OF_WEEK);
    setTimeOfDay(habit.timeOfDay || '');
    setNotificationEnabled(habit.notificationEnabled || false);
    
    setActiveMenuHabitId(null); // Close menu if open
    setIsModalOpen(true);
    
    // Jump to appropriate step
    if (habit.isCustom) {
        setWizardStep('custom_details');
    } else {
        setWizardStep('schedule');
    }
  };

  const handleSaveHabit = () => {
    if (!draftTitle.trim()) return;

    const currentHabit = editingHabitId ? habits.find(h => h.id === editingHabitId) : null;

    const habitData: Habit = {
        id: editingHabitId || Date.now().toString(),
        title: draftTitle,
        description: draftDescription,
        duration: draftDuration,
        isCustom: !draftSubModule,
        subModuleId: draftSubModule?.subId,
        moduleId: draftSubModule?.modId,
        frequency,
        days: frequency === 'daily' ? DAYS_OF_WEEK : selectedDays,
        timeOfDay,
        notificationEnabled,
        completedDates: currentHabit?.completedDates || []
    };

    const updatedHabits = saveHabitService(habitData);
    setHabits(updatedHabits);
    setIsModalOpen(false);
    setEditingHabitId(null);
  };

  const deleteHabit = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Remove this habit?')) {
        const updatedHabits = deleteHabitService(id);
        setHabits(updatedHabits);
        setIsModalOpen(false);
    }
    setActiveMenuHabitId(null);
  };

  const toggleHabitCompletion = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedHabits = toggleHabitCompletionService(habitId, today);
    setHabits(updatedHabits);
  };

  const handleHabitClick = (habit: Habit) => {
    if (!habit.isCustom && habit.moduleId && habit.subModuleId) {
        const module = MODULES.find(m => m.id === habit.moduleId);
        const subModule = module?.subModules?.find(s => s.id === habit.subModuleId);
        
        if (module && subModule) {
            onNavigate('module_content', { module, subModule, from: 'practice' });
        }
    } else if (habit.isCustom) {
        // Allow editing custom habits by clicking on them
        openEditHabitModal(habit);
    }
  };

  // Helper to find original duration for library items
  const getHabitDuration = (habit: Habit) => {
    if (habit.isCustom) return habit.duration;
    const module = MODULES.find(m => m.id === habit.moduleId);
    const sub = module?.subModules?.find(s => s.id === habit.subModuleId);
    return sub?.duration; 
  };

  // Helper to calculate module progress percentage
  const getModulePercentage = (module: Module) => {
    const moduleProgress = progress[module.id];
    let percentage = 0;
    
    if (module.subModules && module.subModules.length > 0) {
        // Submodule based
        const total = module.subModules.length;
        const completed = moduleProgress?.subModules?.length || 0;
        percentage = Math.round((completed / total) * 100);
    } else if (module.steps && module.steps.length > 0) {
        // Step based
        const total = module.steps.length;
        const completed = moduleProgress?.steps?.length || 0;
        percentage = Math.round((completed / total) * 100);
    }
    return percentage;
  };

  // Helper to sort habits: Timed (chrono) -> Untimed (bottom)
  const sortHabits = (list: Habit[]) => {
    return [...list].sort((a, b) => {
      // Use '99:99' to push items without time to the end
      const tA = a.timeOfDay ? a.timeOfDay : '99:99';
      const tB = b.timeOfDay ? b.timeOfDay : '99:99';
      if (tA === tB) return a.title.localeCompare(b.title);
      return tA.localeCompare(tB);
    });
  };

  // Helper for rendering modules
  const renderModuleCard = (module: Module) => {
    const percentage = getModulePercentage(module);
    const isCompleted = percentage === 100;
    const isStarted = percentage > 0;

    return (
      <div 
        key={module.id} 
        onClick={() => onNavigate('module_detail', { module, from: viewMode })}
        className="group flex bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-32 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
      >
        <div className="w-2/5 relative overflow-hidden bg-slate-100">
          <div className="absolute inset-0 bg-slate-200/20 z-0" />
          <img 
              src={module.thumbnailUrl} 
              alt={module.title} 
              className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          
          {/* Progress Badge */}
          {isCompleted ? (
             <div className="absolute top-2 left-2 z-20 bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md ring-2 ring-white">
                <Check size={14} strokeWidth={3} />
            </div>
          ) : isStarted ? (
             <div className="absolute top-2 left-2 z-20 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                 <div 
                    className="w-4 h-4 rounded-full"
                    style={{ 
                        background: `conic-gradient(#10b981 ${percentage}%, #e2e8f0 0)` 
                    }} 
                 />
            </div>
          ) : null}

        </div>
        <div className="w-3/5 p-4 flex flex-col justify-center relative">
          <h3 className="font-bold text-slate-900 text-[15px] leading-snug mb-1.5 line-clamp-2">
              {module.title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              {module.description}
          </p>
        </div>
      </div>
    );
  };

  const renderScheduleStep = () => (
    <div className="animate-fade-in">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Schedule Habit</h3>
        
        {/* Frequency */}
        <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Frequency</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
                {(['daily', 'weekly', 'custom'] as const).map((opt) => (
                    <button
                        key={opt}
                        onClick={() => {
                            setFrequency(opt);
                            if (opt === 'daily') setSelectedDays(DAYS_OF_WEEK);
                            if (opt === 'weekly') setSelectedDays([DAYS_OF_WEEK[0]]); // Default to Monday
                            if (opt === 'custom') setSelectedDays([]); 
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                            frequency === opt 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>

        {/* Days Selector (Hidden if Daily) */}
        {frequency !== 'daily' && (
            <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    {frequency === 'weekly' ? 'Pick a Day' : 'Select Days'}
                </label>
                <div className="flex justify-between gap-1">
                    {DAYS_OF_WEEK.map(day => {
                        const isSelected = selectedDays.includes(day);
                        return (
                            <button
                                key={day}
                                onClick={() => {
                                    if (frequency === 'weekly') {
                                        setSelectedDays([day]);
                                    } else {
                                        if (isSelected) {
                                            setSelectedDays(prev => prev.filter(d => d !== day));
                                        } else {
                                            setSelectedDays(prev => [...prev, day]);
                                        }
                                    }
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    isSelected 
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                            >
                                {day.charAt(0)}
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Time */}
        <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Time of Day <span className="text-slate-400 font-normal">(Optional)</span></label>
            <div className="flex items-center bg-slate-100 rounded-xl px-4 py-3 border border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <Clock size={18} className="text-slate-400 mr-3" />
                <input 
                    type="time" 
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="bg-transparent outline-none text-slate-800 flex-1 font-medium"
                />
            </div>
        </div>

        {/* Notifications */}
        <div className="mb-8 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${notificationEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Bell size={20} />
                </div>
                <span className="font-medium text-slate-700">Reminders</span>
            </div>
            <button 
                onClick={() => setNotificationEnabled(!notificationEnabled)}
                className={`w-12 h-7 rounded-full transition-colors relative ${notificationEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${notificationEnabled ? 'left-6' : 'left-1'}`} />
            </button>
        </div>

        <button 
            onClick={handleSaveHabit}
            disabled={!draftTitle}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Save Habit
        </button>

        {editingHabitId && (
            <button 
                onClick={(e) => deleteHabit(e, editingHabitId)}
                className="w-full mt-3 py-3.5 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-xl font-bold text-lg transition-all"
            >
                Delete Habit
            </button>
        )}
    </div>
  );

  // Special rendering for 'Learn' mode
  if (viewMode === 'learn') {
    const understandingModules = MODULES.filter(m => m.categoryId === 'understanding');
    const triggerModules = MODULES.filter(m => m.categoryId === 'triggers');
    const copingModules = MODULES.filter(m => m.categoryId === 'coping');

    return (
      <div className="pt-8 pb-6 min-h-screen bg-slate-50">
        <div className="px-6 mb-6">
           <h1 className="text-3xl font-bold text-slate-900">Learning Journeys</h1>
        </div>
        <div className="flex flex-col gap-8">
          <div>
            <div className="px-6 mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-800">Pain Understanding</h2></div>
            <div className="flex flex-col gap-4 px-6">{understandingModules.map(m => renderModuleCard(m))}</div>
          </div>
          <div>
            <div className="px-6 mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-800">Pain Factors</h2></div>
            <div className="flex flex-col gap-4 px-6">{triggerModules.map(m => renderModuleCard(m))}</div>
          </div>
          <div>
            <div className="px-6 mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-800">Coping Strategies</h2></div>
            <div className="flex flex-col gap-4 px-6">{copingModules.map(m => renderModuleCard(m))}</div>
          </div>
        </div>
      </div>
    );
  }

  // Practice View
  if (viewMode === 'practice') {
    const allTechniques = MODULES.flatMap(module => 
      (module.subModules || [])
        .filter(sub => sub.type === 'technique')
        .map(sub => ({ ...sub, parentModule: module }))
    ).sort((a, b) => a.title.localeCompare(b.title));
    
    // Filter techniques based on favorites and search
    const displayedTechniques = allTechniques.filter(t => {
        const matchesFav = showFavoritesOnly ? favorites.includes(t.id) : true;
        const matchesSearch = searchQuery 
            ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) 
            : true;
        return matchesFav && matchesSearch;
    });

    const todayStr = new Date().toISOString().split('T')[0];

    return (
      <div className="px-6 pt-8 bg-slate-50 min-h-screen pb-24 relative">
         <div className="flex justify-between items-end mb-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Practice</h1>
            </div>
         </div>

         {/* --- SECTION 1: HABITS --- */}
         <div className="mb-10">
             <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-bold text-slate-800">Daily Habits</h2>
             </div>
             
             <div className="flex flex-col gap-3">
                 {sortHabits(habits).map(habit => {
                     const duration = getHabitDuration(habit);
                     const isCompleted = (habit.completedDates || []).includes(todayStr);

                     return (
                         <div 
                            key={habit.id}
                            onClick={() => handleHabitClick(habit)}
                            className={`relative flex items-center bg-white rounded-xl p-4 shadow-sm border border-slate-100 transition-all group cursor-pointer active:scale-[0.98] hover:shadow-md`}
                         >
                            {/* Icon */}
                            <div className={`h-12 w-12 rounded-lg flex items-center justify-center mr-4 shrink-0 ${
                                !habit.isCustom ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'
                            }`}>
                                {habit.isCustom ? <Edit3 size={20} /> : <Wrench size={20} />}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-2">
                                <h3 className={`font-semibold truncate mb-1 transition-colors ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{habit.title}</h3>
                                
                                {/* Info Row: Duration | Frequency | Time */}
                                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                    {duration && (
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            <span>{duration}</span>
                                        </div>
                                    )}
                                    
                                    <span className="capitalize px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                                        {habit.frequency === 'daily' ? 'Daily' : habit.frequency === 'weekly' ? 'Weekly' : 'Custom'}
                                    </span>
                                    
                                    {habit.timeOfDay && (
                                        <span>@ {habit.timeOfDay}</span>
                                    )}
                                </div>

                                {/* Custom Habit Description */}
                                {habit.isCustom && habit.description && (
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{habit.description}</p>
                                )}
                            </div>
                            
                            {/* Actions Group */}
                            <div className="flex items-center gap-1">
                                {/* Mark Done Button */}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleHabitCompletion(habit.id);
                                    }}
                                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 border ${
                                        isCompleted 
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200 transform scale-105' 
                                        : 'bg-transparent border-slate-200 text-slate-300 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <Check size={16} strokeWidth={3} />
                                </button>

                                {/* Menu Button */}
                                <div className="relative">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuHabitId(activeMenuHabitId === habit.id ? null : habit.id);
                                        }}
                                        className="p-2 text-slate-300 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                    
                                    {/* Popup Menu */}
                                    {activeMenuHabitId === habit.id && (
                                        <>
                                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveMenuHabitId(null); }} />
                                        <div className="absolute right-0 top-10 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 overflow-hidden animate-fade-in origin-top-right">
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    openEditHabitModal(habit);
                                                }} 
                                                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                            >
                                                <Edit3 size={14} /> Edit
                                            </button>
                                            <div className="h-px bg-slate-100 mx-2" />
                                            <button 
                                                onClick={(e) => { 
                                                    e.preventDefault();
                                                    e.stopPropagation(); 
                                                    deleteHabit(e, habit.id); 
                                                }} 
                                                className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                        </>
                                    )}
                                </div>
                            </div>
                         </div>
                     );
                 })}

                 <button 
                    onClick={openAddHabitModal}
                    className="flex items-center justify-center gap-2 py-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                 >
                     <Plus size={18} strokeWidth={2.5} />
                     Add Habit
                 </button>
             </div>
         </div>

         {/* --- SECTION 2: TECHNIQUES LIBRARY --- */}
         <div>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Techniques Library</h2>
            </div>

            {/* Search Bar */}
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search techniques..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors text-slate-800 placeholder-slate-400 font-medium text-sm"
                />
            </div>

            <div className="flex gap-3 mb-4 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setShowFavoritesOnly(false)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${!showFavoritesOnly ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >All</button>
                <button 
                    onClick={() => setShowFavoritesOnly(true)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border flex items-center gap-2 ${showFavoritesOnly ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                ><Heart size={14} fill={showFavoritesOnly ? "currentColor" : "none"} /> Favorites</button>
            </div>
            <div className="flex flex-col gap-3">
                {displayedTechniques.length > 0 ? (
                displayedTechniques.map(tech => (
                    <div 
                        key={tech.id}
                        onClick={() => onNavigate('module_content', { module: tech.parentModule, subModule: tech, from: 'practice' })}
                        className="flex items-center bg-white rounded-xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-all cursor-pointer hover:shadow-md group"
                    >
                        <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4 shrink-0"><Wrench size={20} /></div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate mb-1">{tech.title}</h3>
                            {tech.duration && <div className="flex items-center gap-1 text-slate-400 text-xs font-medium"><Clock size={12} /><span>{tech.duration}</span></div>}
                        </div>
                        <button onClick={(e) => toggleFavorite(e, tech.id)} className={`ml-2 p-2 rounded-full transition-colors ${favorites.includes(tech.id) ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-500'}`}><Heart size={20} fill={favorites.includes(tech.id) ? "currentColor" : "none"} /></button>
                    </div>
                ))
                ) : (
                    <div className="text-center py-12 text-slate-400">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            {searchQuery ? <Search size={20} className="text-slate-300" /> : <Heart size={20} className="text-slate-300" />}
                        </div>
                        <p className="text-sm">
                            {searchQuery 
                             ? "No techniques found matching your search." 
                             : (showFavoritesOnly ? "No favorite practices yet." : "No practices available.")}
                        </p>
                    </div>
                )}
            </div>
         </div>

        {/* --- HABIT WIZARD MODAL --- */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
                <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative z-10 flex flex-col max-h-[85vh]">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between mb-6">
                        {wizardStep !== 'menu' && !initialParams ? (
                            <button onClick={() => setWizardStep('menu')} className="text-slate-400 hover:text-slate-700"><ArrowLeft size={24} /></button>
                        ) : (
                            <div className="w-6" /> // Spacer
                        )}
                        <h2 className="text-lg font-bold text-slate-800">{editingHabitId ? 'Edit Habit' : 'Add Habit'}</h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={24} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {/* STEP 1: MENU */}
                        {wizardStep === 'menu' && (
                            <div className="flex flex-col gap-4 animate-fade-in">
                                <button 
                                    onClick={() => setWizardStep('library_select')}
                                    className="flex items-center p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group text-left"
                                >
                                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm mr-4 group-hover:scale-110 transition-transform">
                                        <BookOpen size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">Pick from Library</h3>
                                        <p className="text-xs text-slate-500 mt-1">Choose an existing technique</p>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-400" />
                                </button>

                                <button 
                                    onClick={() => setWizardStep('custom_details')}
                                    className="flex items-center p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition-all group text-left"
                                >
                                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm mr-4 group-hover:scale-110 transition-transform">
                                        <Edit3 size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">Create Custom</h3>
                                        <p className="text-xs text-slate-500 mt-1">Add your own activity</p>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-300 group-hover:text-purple-400" />
                                </button>
                            </div>
                        )}

                        {/* STEP 2: CUSTOM DETAILS */}
                        {wizardStep === 'custom_details' && (
                            <div className="animate-fade-in">
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                                        placeholder="e.g., Morning Stretch"
                                        value={draftTitle}
                                        onChange={(e) => setDraftTitle(e.target.value)}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Duration <span className="text-slate-400 font-normal">(Optional)</span></label>
                                    <div className="flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                                        <Clock size={18} className="text-slate-400 mr-3" />
                                        <input 
                                            type="text" 
                                            className="bg-transparent outline-none text-slate-800 flex-1 font-medium"
                                            placeholder="e.g. 15 min"
                                            value={draftDuration}
                                            onChange={(e) => setDraftDuration(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                                    <textarea 
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 resize-none"
                                        placeholder="Add a note or instruction..."
                                        value={draftDescription}
                                        onChange={(e) => setDraftDescription(e.target.value)}
                                    />
                                </div>
                                <button 
                                    onClick={() => setWizardStep('schedule')}
                                    disabled={!draftTitle}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next: Schedule
                                </button>
                            </div>
                        )}

                        {/* STEP 2: LIBRARY SELECT */}
                        {wizardStep === 'library_select' && (
                            <div className="flex flex-col gap-3 animate-fade-in pb-2">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Select a Technique</h3>
                                {allTechniques.map(tech => (
                                    <button 
                                        key={tech.id}
                                        onClick={() => {
                                            setDraftTitle(tech.title);
                                            setDraftDescription('Technique from library');
                                            setDraftSubModule({ modId: tech.parentModule.id, subId: tech.id });
                                            setWizardStep('schedule');
                                        }}
                                        className="flex items-center p-3 rounded-xl border border-slate-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-left"
                                    >
                                        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3 shrink-0">
                                            <Wrench size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-slate-900 truncate">{tech.title}</div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* STEP 3: SCHEDULE */}
                        {wizardStep === 'schedule' && renderScheduleStep()}
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  }

  // Default Home View
  const todayDateObj = new Date();
  const todayDayName = todayDateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const todayStr = todayDateObj.toISOString().split('T')[0];
  const todaysHabits = sortHabits(habits.filter(h => h.days?.includes(todayDayName)));

  // Logic for "Continue My Journey"
  const learningJourneyOrder = [
      ...MODULES.filter(m => m.categoryId === 'understanding'),
      ...MODULES.filter(m => m.categoryId === 'triggers'),
      ...MODULES.filter(m => m.categoryId === 'coping')
  ];

  const inProgressModules = learningJourneyOrder.filter(m => {
      const p = getModulePercentage(m);
      return p > 0 && p < 100;
  });

  const notStartedModules = learningJourneyOrder.filter(m => {
      const p = getModulePercentage(m);
      return p === 0;
  });
  
  const continueJourneyModules = [...inProgressModules, ...notStartedModules].slice(0, 3);

  return (
    <div className="px-6 pt-6 pb-12 bg-slate-50 min-h-screen">
      <div className="relative flex items-center justify-center mb-8">
         <h1 className="text-xl font-bold text-slate-900">Sollevia</h1>
         <button onClick={() => onNavigate('settings')} className="absolute right-0 text-slate-400 hover:text-slate-900 transition-colors p-2"><Settings size={24} strokeWidth={2} /></button>
      </div>
      
      {/* Check-in Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Check-in</h2>
        <div onClick={() => onNavigate('chat_checkin')} className="bg-white rounded-2xl p-6 mb-6 cursor-pointer active:scale-[0.98] transition-transform border border-grey-100 shadow-sm">
          <p className="text-slate-700 leading-relaxed text-[15px] font-medium">Take a quiet moment to check-in with yourself. How are you feeling today - physically and emotionally? What's top on your mind?</p>
        </div>
        <div className="flex justify-center"><button onClick={() => onNavigate('chat_checkin')} className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center text-indigo-600 bg-white hover:bg-slate-50 hover:border-indigo-200 transition-all shadow-md active:scale-95"><Mic size={24} /></button></div>
      </div>

      {/* Today's Habits Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Today</h2>
        {todaysHabits.length > 0 ? (
          <div className="flex flex-col gap-3">
            {todaysHabits.map(habit => {
                const isCompleted = (habit.completedDates || []).includes(todayStr);
                const duration = getHabitDuration(habit);
                
                return (
                     <div 
                        key={habit.id}
                        onClick={() => handleHabitClick(habit)}
                        className={`relative flex items-center bg-white rounded-xl p-4 shadow-sm border border-slate-100 transition-all cursor-pointer active:scale-[0.98] hover:shadow-sm`}
                     >
                        {/* Icon */}
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 shrink-0 ${
                            !habit.isCustom ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                            {habit.isCustom ? <Edit3 size={18} /> : <Wrench size={18} />}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-2">
                            <h3 className={`font-semibold text-sm truncate mb-0.5 transition-colors ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{habit.title}</h3>
                             <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                {duration && (
                                    <span>{duration}</span>
                                )}
                                {habit.timeOfDay && (
                                    <span>@ {habit.timeOfDay}</span>
                                )}
                            </div>
                        </div>
                        
                        {/* Checkbox Action */}
                         <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleHabitCompletion(habit.id);
                            }}
                            className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 border ${
                                isCompleted 
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200' 
                                : 'bg-transparent border-slate-200 text-slate-300 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <Check size={16} strokeWidth={3} />
                        </button>
                     </div>
                );
            })}
          </div>
        ) : (
             <div className="bg-white rounded-xl p-6 border border-slate-100 text-center shadow-sm">
                <p className="text-slate-500 text-sm mb-3">No habits scheduled for today.</p>
                <button 
                    onClick={() => onNavigate('practice')}
                    className="text-indigo-600 text-sm font-semibold hover:text-indigo-700"
                >
                    Manage Habits
                </button>
            </div>
        )}
      </div>

      {continueJourneyModules.length > 0 && (
        <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-5 tracking-tight">Continue My Journey</h2>
            <div className="flex flex-col gap-4">
                {continueJourneyModules.map(m => renderModuleCard(m))}
            </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
