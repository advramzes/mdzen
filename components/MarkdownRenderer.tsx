import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { ArrowUp } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { SPACING, RADIUS, ICON_SIZE } from '../constants/config';
import type { ThemeColors } from '../constants/themes';

const FAB_SCROLL_THRESHOLD = 500;

function buildMarkdownStyles(colors: ThemeColors) {
  return StyleSheet.create({
    body: {
      color: colors.onBackground,
      fontSize: 16,
      lineHeight: 26,
    },
    heading1: {
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 36,
      color: colors.onBackground,
      marginTop: SPACING.lg,
      marginBottom: SPACING.sm,
    },
    heading2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 31,
      color: colors.onBackground,
      marginTop: SPACING.lg,
      marginBottom: SPACING.sm,
    },
    heading3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
      color: colors.onBackground,
      marginTop: SPACING.md,
      marginBottom: SPACING.sm,
    },
    heading4: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 25,
      color: colors.onBackground,
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },
    heading5: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
      color: colors.onBackground,
      marginTop: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    heading6: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 22,
      color: colors.onBackground,
      marginTop: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    strong: {
      fontWeight: '700',
    },
    em: {
      fontStyle: 'italic',
    },
    s: {
      textDecorationLine: 'line-through',
    },
    link: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    blockquote: {
      backgroundColor: colors.surface,
      borderLeftColor: colors.primary,
      borderLeftWidth: 4,
      paddingLeft: SPACING.md,
      paddingVertical: SPACING.sm,
      marginVertical: SPACING.sm,
    },
    code_inline: {
      backgroundColor: colors.codeBg,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      fontFamily: 'monospace',
      fontSize: 14,
      color: colors.onBackground,
    },
    code_block: {
      backgroundColor: colors.codeBg,
      padding: SPACING.md,
      borderRadius: RADIUS.button,
      fontFamily: 'monospace',
      fontSize: 14,
      lineHeight: 21,
      color: colors.onBackground,
      marginVertical: SPACING.sm,
    },
    fence: {
      backgroundColor: colors.codeBg,
      padding: SPACING.md,
      borderRadius: RADIUS.button,
      fontFamily: 'monospace',
      fontSize: 14,
      lineHeight: 21,
      color: colors.onBackground,
      marginVertical: SPACING.sm,
    },
    table: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.button,
      marginVertical: SPACING.sm,
    },
    thead: {
      backgroundColor: colors.surface,
    },
    th: {
      padding: SPACING.sm,
      fontWeight: '600',
      color: colors.onBackground,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    td: {
      padding: SPACING.sm,
      color: colors.onBackground,
    },
    bullet_list: {
      marginVertical: SPACING.xs,
    },
    ordered_list: {
      marginVertical: SPACING.xs,
    },
    bullet_list_icon: {
      color: colors.primary,
      fontSize: 8,
      lineHeight: 26,
      marginRight: SPACING.sm,
    },
    ordered_list_icon: {
      color: colors.primary,
      fontSize: 14,
      lineHeight: 26,
      marginRight: SPACING.sm,
    },
    list_item: {
      flexDirection: 'row',
      marginVertical: 2,
    },
    hr: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: SPACING.md,
    },
    image: {
      borderRadius: RADIUS.button,
      marginVertical: SPACING.sm,
    },
    paragraph: {
      marginVertical: SPACING.xs,
    },
  });
}

interface MarkdownRendererProps {
  content: string;
  onScroll?: (y: number) => void;
  initialScrollY?: number;
}

export function MarkdownRenderer({
  content,
  onScroll,
  initialScrollY = 0,
}: MarkdownRendererProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const scrollRef = useRef<ScrollView>(null);
  const [showFab, setShowFab] = useState(false);
  const fabOpacity = useRef(new Animated.Value(0)).current;
  const mdStyles = buildMarkdownStyles(colors);
  const didInitialScroll = useRef(false);

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = e.nativeEvent.contentOffset.y;
      const shouldShow = y > FAB_SCROLL_THRESHOLD;

      if (shouldShow !== showFab) {
        setShowFab(shouldShow);
        Animated.timing(fabOpacity, {
          toValue: shouldShow ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }

      onScroll?.(y);
    },
    [showFab, fabOpacity, onScroll],
  );

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const handleContentSizeChange = useCallback(() => {
    if (!didInitialScroll.current && initialScrollY > 0) {
      didInitialScroll.current = true;
      scrollRef.current?.scrollTo({ y: initialScrollY, animated: false });
    }
  }, [initialScrollY]);

  const handleLinkPress = useCallback((url: string) => {
    Linking.openURL(url);
    return false;
  }, []);

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        showsVerticalScrollIndicator={true}
      >
        <Markdown
          style={mdStyles}
          mergeStyle={false}
          onLinkPress={handleLinkPress}
        >
          {content}
        </Markdown>
      </ScrollView>

      <Animated.View
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            opacity: fabOpacity,
          },
        ]}
        pointerEvents={showFab ? 'auto' : 'none'}
      >
        <Pressable
          onPress={scrollToTop}
          style={styles.fabInner}
          accessibilityRole="button"
          accessibilityLabel="Scroll to top"
        >
          <ArrowUp
            size={ICON_SIZE.nav}
            color={colors.background}
            strokeWidth={1.5}
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 48,
    height: 48,
    borderRadius: RADIUS.fab,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
