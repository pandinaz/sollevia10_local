
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, BookOpen, Wrench, Heart, CheckCircle } from 'lucide-react';
import { Module, ScreenName } from '../types';
import { getFavorites, getProgress, Progress } from '../services/userData';

interface ModuleDetailScreenProps {
  module: Module;
  onNavigate: (screen: ScreenName, params?: any) => void;
  onBack: () => void;
}

const ModuleDetailScreen: React.FC<ModuleDetailScreenProps> = ({ module, onNavigate, onBack }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [progress, setProgress] = useState<Progress>({});
  const isStandardAvailable = module.steps && module.steps.length > 0;
  const isSubModulesAvailable = module.subModules && module.subModules.length > 0;
  const isAvailable = isStandardAvailable || isSubModulesAvailable;

  // Load data
  useEffect(() => {
    setFavorites(getFavorites());
    setProgress(getProgress());
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 flex flex-col relative max-w-md mx-auto">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-2/3 z-0">
        <img src={module.thumbnailUrl} alt={module.title} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(79, 70, 229, 0.06) 35%, rgba(248, 250, 252, 0.65) 60%, #f8fafc 100%)'
        }} />
      </div>

      {/* Navigation */}
      <div className="relative z-10 p-6 pt-8">
        <button onClick={onBack} className="p-2 bg-white/60 backdrop-blur-md rounded-full text-slate-900 hover:bg-white shadow-sm border border-white/50">
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-10 mt-[35vh]">
        <div className="mb-2 flex items-center gap-4 text-indigo-600 text-sm font-medium uppercase tracking-wider">
          <span className="flex items-center gap-1"><BookOpen size={16} /> Module</span>
          <span className="flex items-center gap-1"><Clock size={16} /> {module.duration || '5 min'}</span>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 leading-tight text-slate-900">{module.title}</h1>
        <p className="text-slate-600 text-lg leading-relaxed mb-8 border-l-2 border-indigo-500 pl-4">
          {module.description}
        </p>

        {isSubModulesAvailable ? (
          <div className="animate-fade-in">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Topics</h2>
             <div className="flex flex-col gap-3 pb-8">
               {module.subModules?.map(subModule => {
                 const isCompleted = progress[module.id]?.subModules?.includes(subModule.id);
                 
                 return (
                 <div 
                    key={subModule.id}
                    onClick={() => onNavigate('module_content', { module, subModule, from: 'module_detail' })}
                    className="flex items-center bg-white rounded-xl p-4 shadow-card border-l-2 border-indigo-200 active:scale-[0.98] transition-all cursor-pointer hover:shadow-card-hover"
                 >
                    <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4 shrink-0">
                        {subModule.type === 'technique' ? <Wrench size={20} /> : <BookOpen size={20} />}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{subModule.title}</h3>
                        {subModule.duration && (
                          <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs font-medium">
                              <Clock size={12} />
                              <span>{subModule.duration}</span>
                          </div>
                        )}
                    </div>
                    
                    {/* Completion Status */}
                    {isCompleted && (
                        <div className="ml-2 text-emerald-500">
                            <CheckCircle size={20} />
                        </div>
                    )}
                    
                    {/* Favorite Icon (Read-only) for Technique Types - Only visible when favorited and not overridden by completion check if we want both, but keeping clean for now */}
                    {!isCompleted && subModule.type === 'technique' && favorites.includes(subModule.id) && (
                      <div className="ml-2 p-2 text-indigo-600">
                        <Heart 
                          size={20} 
                          fill="currentColor" 
                        />
                      </div>
                    )}
                 </div>
               )})}
             </div>
          </div>
        ) : (
          isAvailable ? (
            <button 
              onClick={() => onNavigate('module_content', { module, from: 'module_detail' })}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition-all shadow-elevated"
            >
              Start Module
            </button>
          ) : (
            <div className="w-full py-4 bg-slate-200 text-slate-500 rounded-xl font-medium text-center border border-slate-300">
              Coming Soon
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ModuleDetailScreen;
