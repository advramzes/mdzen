import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

const MAX_RECENTS = 20;

export interface RecentFile {
  name: string;
  path: string;
  uri: string;
  lastOpened: string; // ISO date
  size: number; // bytes
}

export function useRecentFiles() {
  const [recents, setRecents] = useState<RecentFile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.RECENT_FILES).then((raw) => {
      if (raw) {
        try {
          const parsed: RecentFile[] = JSON.parse(raw);
          setRecents(parsed);
        } catch {
          // corrupted data — reset
        }
      }
      setIsLoaded(true);
    });
  }, []);

  const persist = useCallback((files: RecentFile[]) => {
    AsyncStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(files));
  }, []);

  const addRecent = useCallback(
    (file: Omit<RecentFile, 'lastOpened'> & { lastOpened?: string }) => {
      setRecents((prev) => {
        const entry: RecentFile = {
          ...file,
          lastOpened: file.lastOpened ?? new Date().toISOString(),
        };

        // Remove existing entry for same URI, add new one at front
        const filtered = prev.filter((f) => f.uri !== entry.uri);
        const updated = [entry, ...filtered].slice(0, MAX_RECENTS);
        persist(updated);
        return updated;
      });
    },
    [persist],
  );

  const removeRecent = useCallback(
    (uri: string) => {
      setRecents((prev) => {
        const updated = prev.filter((f) => f.uri !== uri);
        persist(updated);
        return updated;
      });
    },
    [persist],
  );

  const clearRecents = useCallback(() => {
    setRecents([]);
    AsyncStorage.removeItem(STORAGE_KEYS.RECENT_FILES);
  }, []);

  return { recents, isLoaded, addRecent, removeRecent, clearRecents };
}
