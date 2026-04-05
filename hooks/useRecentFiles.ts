import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

const MAX_RECENTS = 20;
const MAX_STORED_CONTENT_SIZE = 2 * 1024 * 1024; // 2MB

export interface RecentFile {
  name: string;
  path: string;
  uri: string;
  lastOpened: string; // ISO date
  size: number; // bytes
  content?: string; // stored content for web (blob URIs expire)
}

export function useRecentFiles() {
  const [recents, setRecents] = useState<RecentFile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
    (file: Omit<RecentFile, 'lastOpened'> & { lastOpened?: string; content?: string }) => {
      setRecents((prev) => {
        // Only store content if under 2MB
        const storedContent =
          file.content && file.size <= MAX_STORED_CONTENT_SIZE
            ? file.content
            : undefined;

        const entry: RecentFile = {
          name: file.name,
          path: file.path,
          uri: file.uri,
          size: file.size,
          lastOpened: file.lastOpened ?? new Date().toISOString(),
          content: storedContent,
        };

        const filtered = prev.filter((f) => f.uri !== entry.uri && f.name !== entry.name);
        const updated = [entry, ...filtered].slice(0, MAX_RECENTS);
        persist(updated);
        return updated;
      });
    },
    [persist],
  );

  const updateLastOpened = useCallback(
    (uri: string) => {
      setRecents((prev) => {
        const updated = prev.map((f) =>
          f.uri === uri || f.name === uri
            ? { ...f, lastOpened: new Date().toISOString() }
            : f,
        );
        // Re-sort: move the updated one to front
        const target = updated.find((f) => f.uri === uri || f.name === uri);
        if (target) {
          const rest = updated.filter((f) => f !== target);
          const sorted = [target, ...rest];
          persist(sorted);
          return sorted;
        }
        return prev;
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

  return { recents, isLoaded, addRecent, updateLastOpened, removeRecent, clearRecents };
}
