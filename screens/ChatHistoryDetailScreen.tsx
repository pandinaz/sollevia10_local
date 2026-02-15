
import React, { useState } from 'react';
import { X, ArrowRightCircle, Trash2, ChevronDown } from 'lucide-react';
import { HistoryRecord } from '../types';

interface ChatHistoryDetailScreenProps {
  record: HistoryRecord;
  onBack: () => void;
  onDelete: (id: string) => void;
}

const ChatHistoryDetailScreen: React.FC<ChatHistoryDetailScreenProps> = ({ record, onBack, onDelete }) => {
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false); 
  
  // Fallback for old records that might not have a title property
  const displayTitle = record.title || "Check-in Reflection";

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 flex flex-col max-w-md mx-auto relative">
       
       {/* Header */}
       <header className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm flex justify-between items-center px-6 py-5 border-b border-slate-200/50">
         <h1 className="text-xl font-bold text-slate-800">Chat Reflection</h1>
         <button 
          onClick={onBack} 
          className="text-slate-400 hover:text-slate-900 transition-colors p-1"
        >
           <X size={28} />
         </button>
       </header>

       {/* Scrollable Content */}
       <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 pb-24 space-y-8">
         
         {/* Title & Tags */}
         <div>
           <h2 className="text-2xl font-bold mb-4 leading-tight text-slate-900">{displayTitle}</h2>
           
           <div className="flex flex-wrap gap-2">
             {record.themes.map(theme => (
               <span key={theme} className="px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-sm font-medium">
                 {theme}
               </span>
             ))}
             {record.emotions.map(emotion => (
               <span key={emotion} className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium">
                 {emotion}
               </span>
             ))}
           </div>
         </div>

         {/* Summary */}
         <section>
           <h3 className="text-xl font-bold mb-3 text-slate-800">Summary</h3>
           <p className="text-slate-600 leading-relaxed text-[15px]">
             {record.summary}
           </p>
         </section>

         {/* Actionable Steps */}
         <section>
           <h3 className="text-xl font-bold mb-3 text-slate-800">Actionable Steps</h3>
           <div className="space-y-3">
             {record.actions.map((action, index) => (
               <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all shadow-sm">
                 <span className="text-slate-700 font-medium pr-4">{action}</span>
                 <ArrowRightCircle className="text-slate-300 group-hover:text-indigo-600 shrink-0 transition-colors" size={24} strokeWidth={1.5} />
               </div>
             ))}
             {record.actions.length === 0 && (
                 <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-400 italic text-center">
                    Review your reflection notes.
                 </div>
             )}
           </div>
         </section>

         {/* Transcript (Collapsible) */}
         <section>
           <button 
             onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
             className="w-full flex items-center justify-between mb-3 group"
           >
             <h3 className="text-xl font-bold text-slate-800">Transcript</h3>
             <div className={`transition-transform duration-300 ${isTranscriptExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown size={24} className="text-slate-400 group-hover:text-slate-600" />
             </div>
           </button>
           
           {isTranscriptExpanded && (
             <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 pt-1">
                {record.transcript.length > 0 ? (
                  record.transcript.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                              msg.sender === 'user' 
                              ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-100' 
                              : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                          }`}>
                              {msg.text}
                          </div>
                      </div>
                  ))
                ) : (
                  <div className="text-slate-400 italic text-center py-4 bg-slate-100/50 rounded-xl">
                    No transcript available.
                  </div>
                )}
             </div>
           )}
         </section>

         {/* Delete Action */}
         <div className="pt-4">
            <button 
              onClick={() => {
                if(window.confirm('Are you sure you want to delete this record?')) {
                  onDelete(record.id);
                }
              }}
              className="w-full py-3.5 flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 font-medium transition-all rounded-xl border border-transparent hover:border-red-100"
            >
              <Trash2 size={18} />
              Delete Entry
            </button>
         </div>
       </div>
    </div>
  );
};

export default ChatHistoryDetailScreen;
