import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

interface UseMarkdownOptions {
  fileUri: string | null;
}

export function useMarkdown({ fileUri }: UseMarkdownOptions) {
  const [content, setContent] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [initialScrollY, setInitialScrollY] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollKey = fileUri
    ? `${STORAGE_KEYS.SCROLL_PREFIX}${fileUri}`
    : null;

  // Restore saved scroll position when file changes
  useEffect(() => {
    if (!scrollKey) {
      setInitialScrollY(0);
      return;
    }
    AsyncStorage.getItem(scrollKey).then((saved) => {
      setInitialScrollY(saved ? parseInt(saved, 10) || 0 : 0);
    });
  }, [scrollKey]);

  // Debounced save of scroll position (500ms)
  const handleScroll = useCallback(
    (y: number) => {
      setScrollY(y);

      if (!scrollKey) return;

      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      saveTimer.current = setTimeout(() => {
        AsyncStorage.setItem(scrollKey, String(Math.round(y)));
      }, 500);
    },
    [scrollKey],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, []);

  return {
    content,
    setContent,
    scrollY,
    initialScrollY,
    handleScroll,
  };
}
