import { useState, useEffect } from 'react';

const STORAGE_KEY = 'hgs_bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, [bookmarks]);

  const isBookmarked = (htmlUrl) =>
    bookmarks.some((b) => b.html_url === htmlUrl);

  const toggleBookmark = (repo) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.html_url === repo.html_url)) {
        return prev.filter((b) => b.html_url !== repo.html_url);
      }
      return [repo, ...prev];
    });
  };

  const clearBookmarks = () => setBookmarks([]);

  return { bookmarks, isBookmarked, toggleBookmark, clearBookmarks };
}
