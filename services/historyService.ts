import { HistoryItem } from '../types';

const STORAGE_KEY = 'lingyun_naming_history';

export const getHistory = (): HistoryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveHistoryItem = (item: HistoryItem): HistoryItem[] => {
  try {
    const current = getHistory();
    // Prepend new item, keep max 20 items to avoid storage bloat
    const updated = [item, ...current].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save history", e);
    return getHistory();
  }
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const deleteHistoryItem = (id: string): HistoryItem[] => {
  const current = getHistory();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
