
export type ScreenName = 
  | 'home' 
  | 'learn'
  | 'practice'
  | 'chat_history' 
  | 'history_detail' 
  | 'chat_checkin' 
  | 'module_detail' 
  | 'module_content' 
  | 'module_reflection'
  | 'settings';

export type CategoryId = 'understanding' | 'triggers' | 'coping';

export interface ModuleStep {
  title: string;
  content: string; // Supports template literals with line breaks
  imageUrl: string;
  videoUrl?: string; // YouTube URL, local path (/assets/video.mp4), or cloud URL
  videoThumbnailUrl?: string; // Optional cover image before video plays
  videoPosition?: 'above-text' | 'below-text'; // Defaults to 'below-text'
  audioUrl?: string; // Local path (e.g., /assets/audio.mp3)
  audioScript?: string; // Text for Text-to-Speech engine if audioUrl is missing
  customWidget?: string; // Identifier for custom widgets like 'elevenlabs-mindfulness-coach'
}

export interface SubModule {
  id: string;
  title: string;
  type: 'knowledge' | 'practice' | 'technique';
  step: ModuleStep;
  reflectionPrompt?: string; // Optional prompt specific to this sub-module
  duration?: string; // e.g. "5 min", "self-paced"
  botId?: string; // Optional: Specific agent ID for this sub-module
  spaceId?: string; // Optional: Specific space ID for this sub-module
}

export interface Module {
  id: string;
  categoryId: CategoryId;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration?: string; // e.g. "5 min", "10 min"
  steps: ModuleStep[]; // Educational pages (standard linear flow)
  subModules?: SubModule[]; // Optional: For modules that act as a container for sub-topics
  reflectionPrompt: string; // Initial prompt for the AI chat
  botId?: string; // Optional: Specific agent ID for this module
  spaceId?: string; // Optional: Specific space ID for this module
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  audio?: string; // Base64 string or URL
}

export interface HistoryRecord {
  id: string;
  date: string;
  title: string;
  summary: string;
  themes: string[];
  emotions: string[];
  actions: string[];
  transcript: ChatMessage[];
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  isCustom: boolean;
  subModuleId?: string;
  moduleId?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  days?: string[]; // e.g. ['Mon', 'Wed', 'Fri']
  timeOfDay?: string; // e.g. "08:00"
  notificationEnabled?: boolean;
  completedDates?: string[]; // ISO date strings YYYY-MM-DD
  duration?: string; // e.g. "15 min"
}

export interface NavigationState {
  current: ScreenName;
  params?: any;
}
