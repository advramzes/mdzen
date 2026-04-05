import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { SPACING, RADIUS, ICON_SIZE, FONT, MIN_TOUCH } from '../constants/config';
import { s } from '../utils/scale';

const DEBOUNCE_MS = 300;

interface SearchMatch {
  index: number;
  position: number; // character position in content
}

interface ViewerSearchBarProps {
  content: string;
  visible: boolean;
  onClose: () => void;
  onMatchChange?: (matches: SearchMatch[], currentIndex: number) => void;
}

export function ViewerSearchBar({
  content,
  visible,
  onClose,
  onMatchChange,
}: ViewerSearchBarProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Slide animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : s(-60),
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (visible) {
        inputRef.current?.focus();
      }
    });

    if (!visible) {
      setQuery('');
      setMatches([]);
      setCurrentIndex(0);
    }
  }, [visible, slideAnim]);

  // Debounced search
  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setMatches([]);
        setCurrentIndex(0);
        onMatchChange?.([], 0);
        return;
      }

      const lowerContent = content.toLowerCase();
      const lowerQuery = searchQuery.toLowerCase();
      const found: SearchMatch[] = [];
      let pos = 0;

      while (true) {
        const idx = lowerContent.indexOf(lowerQuery, pos);
        if (idx === -1) break;
        found.push({ index: found.length, position: idx });
        pos = idx + 1;
      }

      setMatches(found);
      setCurrentIndex(found.length > 0 ? 0 : 0);
      onMatchChange?.(found, 0);
    },
    [content, onMatchChange],
  );

  const handleTextChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        performSearch(text);
      }, DEBOUNCE_MS);
    },
    [performSearch],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const goNext = useCallback(() => {
    if (matches.length === 0) return;
    const next = (currentIndex + 1) % matches.length;
    setCurrentIndex(next);
    onMatchChange?.(matches, next);
  }, [matches, currentIndex, onMatchChange]);

  const goPrev = useCallback(() => {
    if (matches.length === 0) return;
    const prev = (currentIndex - 1 + matches.length) % matches.length;
    setCurrentIndex(prev);
    onMatchChange?.(matches, prev);
  }, [matches, currentIndex, onMatchChange]);

  const handleClose = useCallback(() => {
    setQuery('');
    setMatches([]);
    setCurrentIndex(0);
    onMatchChange?.([], 0);
    onClose();
  }, [onClose, onMatchChange]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.inputRow}>
        <Search
          size={ICON_SIZE.inline}
          color={colors.tabBarInactive}
          strokeWidth={1.5}
        />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.onBackground }]}
          value={query}
          onChangeText={handleTextChange}
          placeholder="Search in document..."
          placeholderTextColor={colors.tabBarInactive}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search in document"
        />

        {/* Match counter */}
        {query.length > 0 && (
          <Text style={[styles.counter, { color: colors.tabBarInactive }]}>
            {matches.length > 0
              ? `${currentIndex + 1} of ${matches.length}`
              : 'No matches'}
          </Text>
        )}

        {/* Prev/Next arrows */}
        {matches.length > 1 && (
          <>
            <Pressable
              onPress={goPrev}
              style={styles.navButton}
              accessibilityRole="button"
              accessibilityLabel="Previous match"
            >
              <ChevronUp
                size={ICON_SIZE.inline}
                color={colors.onBackground}
                strokeWidth={1.5}
              />
            </Pressable>
            <Pressable
              onPress={goNext}
              style={styles.navButton}
              accessibilityRole="button"
              accessibilityLabel="Next match"
            >
              <ChevronDown
                size={ICON_SIZE.inline}
                color={colors.onBackground}
                strokeWidth={1.5}
              />
            </Pressable>
          </>
        )}

        {/* Close button */}
        <Pressable
          onPress={handleClose}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Close search"
        >
          <X
            size={ICON_SIZE.inline}
            color={colors.onBackground}
            strokeWidth={1.5}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT.body,
    paddingVertical: 0,
    minHeight: s(36),
  },
  counter: {
    fontSize: FONT.caption,
    minWidth: s(60),
    textAlign: 'center',
  },
  navButton: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
