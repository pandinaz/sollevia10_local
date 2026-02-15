import { HistoryRecord } from './types';
import { MODULES as DATA_MODULES } from './data/modules';

export const APP_NAME = "Sollevia";

export const MOCK_HISTORY: HistoryRecord[] = [];

// Re-export modules from the dedicated data file
export const MODULES = DATA_MODULES;