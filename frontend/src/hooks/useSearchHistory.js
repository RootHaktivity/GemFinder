import { useState, useEffect } from 'react';

const STORAGE_KEY = 'hgs_search_history';
const MAX_HISTORY = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, [history]);

  const addToHistory = (query) => {
    if (!query || !query.trim()) return;
    const trimmed = query.trim();
    setHistory((prev) => {
      const filtered = prev.filter((q) => q !== trimmed);
      return [trimmed, ...filtered].slice(0, MAX_HISTORY);
    });
  };

  const removeFromHistory = (query) => {
    setHistory((prev) => prev.filter((q) => q !== query));
  };

  const clearHistory = () => setHistory([]);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
