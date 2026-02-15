
import { HistoryRecord, ChatMessage } from '../types';
import { generateMiaSummary } from './miaService';

const DB_NAME = 'SolleviaDB';
const STORE_NAME = 'chat_history';
// Bumped version to 2 to ensure onupgradeneeded fires for existing v1 DBs that might be missing the store
const DB_VERSION = 2;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Error opening database");
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
  });
};

export const getHistory = async (): Promise<HistoryRecord[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
          const results = request.result as HistoryRecord[];
          // Sort by date descending (using ID which is timestamp)
          if (results && Array.isArray(results)) {
             results.sort((a, b) => Number(b.id) - Number(a.id)); 
             resolve(results);
          } else {
             resolve([]);
          }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Failed to get history:", e);
    return [];
  }
};

export const deleteHistoryRecord = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Local Analysis Logic (Fallback)
const analyzeSessionLocally = (transcript: ChatMessage[]) => {
    const text = transcript.map(t => t.text).join(' ').toLowerCase();
    
    const themes = new Set<string>();
    if (text.includes('pain') || text.includes('hurt') || text.includes('flare')) themes.add('Pain Management');
    if (text.includes('stress') || text.includes('worr') || text.includes('anxiety') || text.includes('panic')) themes.add('Stress & Anxiety');
    if (text.includes('sleep') || text.includes('tired') || text.includes('insomnia') || text.includes('rest')) themes.add('Sleep');
    if (text.includes('work') || text.includes('job') || text.includes('career') || text.includes('busy')) themes.add('Work Balance');
    if (text.includes('family') || text.includes('partner') || text.includes('friend') || text.includes('lonely')) themes.add('Relationships');
    if (text.includes('breath') || text.includes('meditat') || text.includes('relax')) themes.add('Mindfulness');
    
    // Fallback theme if empty
    if (themes.size === 0) themes.add('General Well-being');

    const emotions = new Set<string>();
    if (text.includes('sad') || text.includes('cry') || text.includes('depress') || text.includes('down')) emotions.add('Sadness');
    if (text.includes('happy') || text.includes('good') || text.includes('great') || text.includes('better')) emotions.add('Hope');
    if (text.includes('angry') || text.includes('mad') || text.includes('frustrat') || text.includes('annoy')) emotions.add('Frustration');
    if (text.includes('calm') || text.includes('peace') || text.includes('relax')) emotions.add('Calmness');
    if (text.includes('scared') || text.includes('fear') || text.includes('afraid')) emotions.add('Fear');
    if (text.includes('guilt') || text.includes('sorry')) emotions.add('Guilt');
    if (text.includes('gratitude') || text.includes('thank')) emotions.add('Gratitude');

    return { 
      themes: Array.from(themes), 
      emotions: Array.from(emotions) 
    };
}

const generateFallbackRecord = (transcript: ChatMessage[], title: string, now: Date) => {
    const { themes, emotions } = analyzeSessionLocally(transcript);
    
    let recordTitle = title;
    
    // Intelligent title generation based on local analysis
    if (title === 'Check-in' || title.includes('Reflection')) {
        if (themes.length > 0 && !themes.includes('General Well-being')) {
            recordTitle = `${themes[0]} Reflection`; 
        } else if (emotions.length > 0) {
            recordTitle = `Navigating ${emotions[0]}`;
        } else {
            const hour = now.getHours();
            if (hour < 12) recordTitle = "Morning Check-in";
            else if (hour < 18) recordTitle = "Afternoon Check-in";
            else recordTitle = "Evening Check-in";
        }
    }

    let summary = "During this session, we checked in on your overall well-being.";
    
    if (themes.length > 0) {
        const lowerThemes = themes.map(t => t.toLowerCase());
        const themesText = lowerThemes.length > 1 
            ? lowerThemes.slice(0, -1).join(', ') + ' and ' + lowerThemes.slice(-1)
            : lowerThemes[0];
            
        summary = `During this session, we explored the connection between your physical sensations and current emotional state. We identified key themes around ${themesText}.`;
    }
    
    if (emotions.length > 0) {
        const lowerEmotions = emotions.map(e => e.toLowerCase());
        const emotionsText = lowerEmotions.length > 1 
            ? lowerEmotions.slice(0, -1).join(', ') + ' and ' + lowerEmotions.slice(-1)
            : lowerEmotions[0];
        
        summary += ` You acknowledged feelings of ${emotionsText}.`;
    } else {
        summary += ` We focused on mindfulness and listening to your body's signals.`;
    }

    return {
        title: recordTitle,
        summary,
        themes,
        emotions,
        actions: ['Practice self-compassion', 'Review the suggested techniques']
    };
};

export const saveChatSession = async (
  transcript: ChatMessage[], 
  title: string
): Promise<void> => {
  // Only save if the user has actually sent a message
  const userMessages = transcript.filter(m => m.sender === 'user');
  if (userMessages.length === 0) return;

  const db = await initDB();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
                  ' • ' + 
                  now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // 1. Attempt to generate AI Summary using Mia21
  let summaryData;
  try {
      summaryData = await generateMiaSummary(transcript);
  } catch (e) {
      console.warn("Mia summary generation failed, falling back to local analysis", e);
  }

  // 2. Fallback if AI failed
  if (!summaryData) {
      summaryData = generateFallbackRecord(transcript, title, now);
  } else {
      // Ensure we have a title if Mia returned empty (unlikely but safe)
      if (!summaryData.title) summaryData.title = title;
  }

  const record: HistoryRecord = {
    id: Date.now().toString(),
    date: dateStr,
    title: summaryData.title,
    summary: summaryData.summary,
    themes: summaryData.themes,
    emotions: summaryData.emotions,
    actions: summaryData.actions, 
    transcript: transcript
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
