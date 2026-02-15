
import { Habit } from '../types';

const KEYS = {
  FAVORITES: 'sollevia_favorites',
  HABITS: 'sollevia_habits',
  USER_ID: 'sollevia_user_id',
  PROGRESS: 'sollevia_progress',
  TTS_ENABLED: 'sollevia_tts_enabled'
};

export interface Progress {
  [moduleId: string]: {
    steps: number[];
    subModules: string[];
  };
}

const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
};

/**
 * Gets or creates a persistent User ID.
 */
export const getUserId = (): string => {
  let userId = safeGetItem(KEYS.USER_ID);
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 9);
    safeSetItem(KEYS.USER_ID, userId);
  }
  return userId;
};

/**
 * Favorites Management
 */
export const getFavorites = (): string[] => {
  try {
    const data = safeGetItem(KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('Failed to parse favorites', e);
    return [];
  }
};

export const toggleFavorite = (id: string): string[] => {
  const favorites = getFavorites();
  const index = favorites.indexOf(id);
  let newFavorites;
  if (index === -1) {
    newFavorites = [...favorites, id];
  } else {
    newFavorites = favorites.filter(fId => fId !== id);
  }
  safeSetItem(KEYS.FAVORITES, JSON.stringify(newFavorites));
  return newFavorites;
};

/**
 * Habits Management
 */
export const getHabits = (): Habit[] => {
  try {
    const data = safeGetItem(KEYS.HABITS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('Failed to parse habits', e);
    return [];
  }
};

export const saveHabit = (habit: Habit): Habit[] => {
  const habits = getHabits();
  const index = habits.findIndex(h => h.id === habit.id);
  let newHabits;
  if (index >= 0) {
    // Update existing
    newHabits = [...habits];
    newHabits[index] = habit;
  } else {
    // Add new
    newHabits = [...habits, habit];
  }
  safeSetItem(KEYS.HABITS, JSON.stringify(newHabits));
  return newHabits;
};

export const deleteHabit = (id: string): Habit[] => {
  const habits = getHabits();
  const newHabits = habits.filter(h => h.id !== id);
  safeSetItem(KEYS.HABITS, JSON.stringify(newHabits));
  return newHabits;
};

export const toggleHabitCompletion = (id: string, dateStr: string): Habit[] => {
  const habits = getHabits();
  const newHabits = habits.map(h => {
    if (h.id === id) {
      const completed = h.completedDates || [];
      const isCompleted = completed.includes(dateStr);
      const newCompleted = isCompleted 
        ? completed.filter(d => d !== dateStr) 
        : [...completed, dateStr];
      return { ...h, completedDates: newCompleted };
    }
    return h;
  });
  safeSetItem(KEYS.HABITS, JSON.stringify(newHabits));
  return newHabits;
};

/**
 * TTS Preference
 */
export const getTtsEnabled = (): boolean => {
  return safeGetItem(KEYS.TTS_ENABLED) === 'true';
};

export const setTtsEnabled = (enabled: boolean): void => {
  safeSetItem(KEYS.TTS_ENABLED, enabled.toString());
};

/**
 * Progress Tracking
 */
export const getProgress = (): Progress => {
  try {
    const data = safeGetItem(KEYS.PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.warn('Failed to parse progress', e);
    return {};
  }
};

export const saveProgress = (moduleId: string, stepIndex: number, subModuleId?: string): Progress => {
  const progress = getProgress();
  
  if (!progress[moduleId]) {
    progress[moduleId] = { steps: [], subModules: [] };
  }

  if (subModuleId) {
    // Track Submodule Completion
    if (!progress[moduleId].subModules) progress[moduleId].subModules = []; // Safety check
    if (!progress[moduleId].subModules.includes(subModuleId)) {
      progress[moduleId].subModules.push(subModuleId);
    }
  } else {
    // Track Linear Step Completion
    if (!progress[moduleId].steps) progress[moduleId].steps = []; // Safety check
    if (!progress[moduleId].steps.includes(stepIndex)) {
      progress[moduleId].steps.push(stepIndex);
    }
  }

  safeSetItem(KEYS.PROGRESS, JSON.stringify(progress));
  return progress;
};
