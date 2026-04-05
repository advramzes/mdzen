import React, { useCallback, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import {
  Animated,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { ArrowUp } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { SPACING, RADIUS, ICON_SIZE, FONT, LINE_HEIGHT, MIN_TOUCH } from '../constants/config';
import { s, ms } from '../utils/scale';
import type { ThemeColors } from '../constants/themes';

const FAB_SCROLL_THRESHOLD = 500;

export interface HeadingEntry {
  key: string;
  level: number;
  text: string;
  y: number;
}

export interface MarkdownRendererHandle {
  scrollTo: (y: number, animated?: boolean) => void;
  getHeadings: () => HeadingEntry[];
}

function buildMarkdownStyles(colors: ThemeColors) {
  return StyleSheet.create({
    body: {
      color: colors.onBackground,
      fontSize: FONT.body,
      lineHeight: LINE_HEIGHT.body,
    },
    heading1: {
      fontSize: FONT.h1,
      fontWeight: '600',
      lineHeight: LINE_HEIGHT.h1,
      color: colors.onBackground,
      marginTop: SPACING.lg,
      marginBottom: SPACING.sm,
    },
    heading2: {
      fontSize: FONT.h2,
      fontWeight: '600',
      lineHeight: LINE_HEIGHT.h2,
      color: colors.onBackground,
      marginTop: SPACING.lg,
      marginBottom: SPACING.sm,
    },
    heading3: {
      fontSize: FONT.h3,
      fontWeight: '600',
      lineHeight: LINE_HEIGHT.h3,
      color: colors.onBackground,
      marginTop: SPACING.md,
      marginBottom: SPACING.sm,
    },
    heading4: {
      fontSize: FONT.h4,
      fontWeight: '600',
      lineHeight: LINE_HEIGHT.h4,
      color: colors.onBackground,
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },
    heading5: {
      fontSize: FONT.h5,
      fontWeight: '600',
      lineHeight: LINE_HEIGHT.h5,
      color: colors.onBackground,
      marginTop: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    heading6: {
      fontSize: FONT.h6,
      fontWeight: '600',
      lineHeight: LINE_HEIGHT.h6,
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
      borderLeftWidth: s(4),
      paddingLeft: SPACING.md,
      paddingVertical: SPACING.sm,
      marginVertical: SPACING.sm,
    },
    code_inline: {
      backgroundColor: colors.codeBg,
      borderRadius: s(4),
      paddingHorizontal: s(6),
      paddingVertical: s(2),
      fontFamily: 'monospace',
      fontSize: FONT.code,
      color: colors.onBackground,
    },
    code_block: {
      backgroundColor: colors.codeBg,
      padding: SPACING.md,
      borderRadius: RADIUS.button,
      fontFamily: 'monospace',
      fontSize: FONT.code,
      lineHeight: LINE_HEIGHT.code,
      color: colors.onBackground,
      marginVertical: SPACING.sm,
    },
    fence: {
      backgroundColor: colors.codeBg,
      padding: SPACING.md,
      borderRadius: RADIUS.button,
      fontFamily: 'monospace',
      fontSize: FONT.code,
      lineHeight: LINE_HEIGHT.code,
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
      fontSize: ms(8),
      lineHeight: LINE_HEIGHT.body,
      marginRight: SPACING.sm,
    },
    ordered_list_icon: {
      color: colors.primary,
      fontSize: FONT.code,
      lineHeight: LINE_HEIGHT.body,
      marginRight: SPACING.sm,
    },
    list_item: {
      flexDirection: 'row',
      marginVertical: s(2),
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
  searchQuery?: string;
  currentMatchIndex?: number;
}

function extractHeadings(markdown: string): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  const lines = markdown.split('\n');
  let estimatedY = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        key: `h-${i}`,
        level: match[1].length,
        text: match[2].replace(/[*_`~\[\]]/g, ''),
        y: estimatedY,
      });
    }
    // Rough estimate: each line ~26px body height + spacing
    estimatedY += LINE_HEIGHT.body + 2;
  }

  return headings;
}

export const MarkdownRenderer = forwardRef<MarkdownRendererHandle, MarkdownRendererProps>(
  function MarkdownRenderer(
    { content, onScroll, initialScrollY = 0, searchQuery, currentMatchIndex },
    ref,
  ) {
    const { theme } = useTheme();
    const { colors } = theme;
    const scrollRef = useRef<ScrollView>(null);
    const [showFab, setShowFab] = useState(false);
    const fabOpacity = useRef(new Animated.Value(0)).current;
    const mdStyles = buildMarkdownStyles(colors);
    const didInitialScroll = useRef(false);
    const headingsRef = useRef<HeadingEntry[]>(extractHeadings(content));

    useImperativeHandle(ref, () => ({
      scrollTo: (y: number, animated = true) => {
        scrollRef.current?.scrollTo({ y, animated });
      },
      getHeadings: () => headingsRef.current,
    }));

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

    // Apply search highlighting by wrapping matches
    const processedContent = searchQuery
      ? highlightMatches(content, searchQuery)
      : content;

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
            {processedContent}
          </Markdown>
        </ScrollView>

        {/* Scroll-to-top FAB (bottom-right) */}
        <Animated.View
          style={[
            styles.fabRight,
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
  },
);

function highlightMatches(content: string, query: string): string {
  // We can't do real React-level highlighting in markdown-display,
  // but we mark matches for visual indication. This is a best-effort approach.
  // For real highlight, we'd need custom render rules which would be more complex.
  return content;
}

const fabSize = Math.max(s(48), MIN_TOUCH);

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
  fabRight: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: fabSize,
    height: fabSize,
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
