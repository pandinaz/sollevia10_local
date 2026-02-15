
import { DEFAULT_MIA_API_KEY, DEFAULT_MIA_SPACE_ID, DEFAULT_MIA_BOT_ID } from './secrets';

// Configuration
export const APP_VERSION = '1.0.0';

// Helper to safely get env vars in both Vite and standard node environments
const getEnvVar = (key: string, viteKey: string): string => {
  try {
    // Check Vite specific env vars first
    const meta = import.meta as any;
    if (typeof meta !== 'undefined' && meta.env) {
      if (meta.env[viteKey]) return meta.env[viteKey];
      if (meta.env[key]) return meta.env[key];
    }
  } catch (e) {
    // Ignore errors accessing import.meta
  }

  try {
    // Check process.env (Node/CRA/Webpack)
    if (typeof process !== 'undefined' && process.env) {
      if (process.env[viteKey]) return process.env[viteKey];
      if (process.env[key]) return process.env[key];
      if (process.env[`REACT_APP_${key}`]) return process.env[`REACT_APP_${key}`];
    }
  } catch (e) {
    // Ignore errors
  }

  return '';
};

// Mia21 Configuration
// Priorities: 1. Environment Variables, 2. secrets.ts file
export const MIA_API_KEY = getEnvVar('MIA_API_KEY', 'VITE_MIA_API_KEY') || DEFAULT_MIA_API_KEY;
export const MIA_SPACE_ID = getEnvVar('MIA_SPACE_ID', 'VITE_MIA_SPACE_ID') || DEFAULT_MIA_SPACE_ID;
export const MIA_BOT_ID = getEnvVar('MIA_BOT_ID', 'VITE_MIA_BOT_ID') || DEFAULT_MIA_BOT_ID;

export const MIA_API_URL = getEnvVar('MIA_API_URL', 'VITE_MIA_API_URL') || 'https://api.mia21.com/api/v1/chat';
export const MIA_INIT_URL = getEnvVar('MIA_INIT_URL', 'VITE_MIA_INIT_URL') || 'https://api.mia21.com/api/v1/initialize_chat';
