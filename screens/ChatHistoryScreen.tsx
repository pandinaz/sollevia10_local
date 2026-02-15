
import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { HistoryRecord, ScreenName } from '../types';

interface ChatHistoryScreenProps {
  history: HistoryRecord[];
  onBack: () => void;
  onNavigate?: (screen: ScreenName, params?: any) => void;
  onDelete: (id: string) => void;
}

const ChatHistoryScreen: React.FC<ChatHistoryScreenProps> = ({ history, onBack, onNavigate, onDelete }) => {
  
  const handleRecordClick = (record: HistoryRecord) => {
    if (onNavigate) {
      onNavigate('history_detail', { record });
    }
  };

  // Helper to format date from ID (timestamp)
  const getDateInfo = (id: string) => {
    const date = new Date(parseInt(id));
    return {
      monthYear: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      day: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) + '.',
      time: date.toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
  };

  // Explicitly sort history by ID (timestamp) descending to ensure newest are first
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
        // Handle potential string vs number ID issues safely
        const timeA = parseInt(a.id.toString());
        const timeB = parseInt(b.id.toString());
        return timeB - timeA;
    });
  }, [history]);

  // Group history by Month Year
  const groupedHistory = sortedHistory.reduce((acc, record) => {
    const { monthYear } = getDateInfo(record.id);
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(record);
    return acc;
  }, {} as Record<string, HistoryRecord[]>);

  // Get unique months from the sorted data to preserve chronological order of months
  const uniqueMonths: string[] = Array.from(new Set(sortedHistory.map(r => getDateInfo(r.id).monthYear)));

  return (
    <div className="px-6 py-8 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
         <h1 className="text-3xl font-bold text-slate-900">Insights</h1>
      </div>

      {/* Journal List */}
      <div className="space-y-8">
        {uniqueMonths.length > 0 ? uniqueMonths.map((month) => (
          <div key={month}>
            <h3 className="text-lg text-slate-500 font-medium mb-4 pl-1">{month}</h3>
            
            <div className="space-y-4">
              {groupedHistory[month].map((record) => {
                const { day, time } = getDateInfo(record.id);
                // Fallback for old records
                const title = record.title || "Journal Entry";
                
                // Use summary for teaser, fallback to transcript if summary is missing
                const teaser = record.summary || record.transcript.find(t => t.sender === 'user')?.text || "No preview available...";

                return (
                  <div 
                    key={record.id} 
                    onClick={() => handleRecordClick(record)}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 cursor-pointer active:scale-[0.98] transition-all hover:shadow-md group"
                  >
                    {/* Top Row: Date | Time > */}
                    <div className="flex justify-between items-center mb-3 text-xs font-semibold text-slate-900">
                       <span className="text-slate-500">{day}</span>
                       <div className="flex items-center gap-1">
                          <span>{time}</span>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                       </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-slate-900 mb-2 leading-tight pr-4">
                       {title.length > 50 ? title.substring(0,50) + '...' : title}
                    </h4>

                    {/* Description Teaser */}
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
                       {teaser}
                    </p>

                    {/* Pills */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                        {record.themes[0] || 'Reflection'}
                      </span>
                      <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                        {record.emotions[0] || 'Check-in'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )) : (
          <div className="text-center py-10 text-slate-400 italic">
            No journal entries yet. Start a check-in to begin your journey.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistoryScreen;
