import React, { useCallback, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';
import {
  Animated,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  EnrichedMarkdownText,
  type MarkdownStyle,
  type LinkPressEvent,
} from 'react-native-enriched-markdown';
import { ArrowUp } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { SPACING, RADIUS, ICON_SIZE, MIN_TOUCH } from '../constants/config';
import { s, ms } from '../utils/scale';
import type { ThemeColors } from '../constants/themes';
import type { MarkdownRendererHandle, MarkdownRendererProps } from './MarkdownRenderer';
import { extractHeadings } from './markdownUtils';

const FAB_SCROLL_THRESHOLD = 500;

function buildNativeStyles(colors: ThemeColors): MarkdownStyle {
  return {
    paragraph: {
      fontSize: ms(16),
      color: colors.onBackground,
      lineHeight: ms(24),
      marginBottom: s(16),
    },
    h1: {
      fontSize: ms(28),
      fontWeight: '600',
      color: colors.onBackground,
      marginBottom: s(12),
    },
    h2: {
      fontSize: ms(24),
      fontWeight: '600',
      color: colors.onBackground,
      marginBottom: s(10),
    },
    h3: {
      fontSize: ms(20),
      fontWeight: '600',
      color: colors.onBackground,
      marginBottom: s(8),
    },
    h4: {
      fontSize: ms(18),
      fontWeight: '600',
      color: colors.onBackground,
      marginBottom: s(6),
    },
    h5: {
      fontSize: ms(16),
      fontWeight: '600',
      color: colors.onBackground,
      marginBottom: s(4),
    },
    h6: {
      fontSize: ms(14),
      fontWeight: '600',
      color: colors.onBackground,
      marginBottom: s(4),
    },
    strong: {
      color: colors.onBackground,
    },
    em: {
      color: colors.onBackground,
    },
    link: {
      color: colors.primary,
      underline: true,
    },
    code: {
      color: colors.primary,
      backgroundColor: colors.codeBg,
      borderColor: colors.border,
    },
    codeBlock: {
      fontSize: ms(14),
      backgroundColor: colors.codeBg,
      color: colors.onBackground,
      borderRadius: s(12),
      padding: s(16),
    },
    blockquote: {
      borderColor: colors.primary,
      borderWidth: s(4),
      backgroundColor: colors.primary + '14',
      gapWidth: s(16),
    },
    list: {
      bulletColor: colors.primary,
      markerColor: colors.primary,
      gapWidth: s(12),
      marginLeft: s(24),
    },
    image: {
      height: s(200),
      borderRadius: s(8),
      marginBottom: s(16),
    },
    thematicBreak: {
      color: colors.border,
      height: 1,
      marginTop: s(24),
      marginBottom: s(24),
    },
  };
}

export const MarkdownRendererNative = forwardRef<MarkdownRendererHandle, MarkdownRendererProps>(
  function MarkdownRendererNative({ content, onScroll, initialScrollY = 0 }, ref) {
    const { theme } = useTheme();
    const { colors } = theme;
    const scrollRef = useRef<ScrollView>(null);
    const [showFab, setShowFab] = useState(false);
    const fabOpacity = useRef(new Animated.Value(0)).current;
    const didInitialScroll = useRef(false);
    const headingsRef = useRef(extractHeadings(content));

    const mdStyle = useMemo(() => buildNativeStyles(colors), [colors]);

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

    const handleLinkPress = useCallback((event: LinkPressEvent) => {
      Linking.openURL(event.url);
    }, []);

    const fabSize = Math.max(s(48), MIN_TOUCH);

    return (
      <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={{ padding: s(16), paddingBottom: s(48) }}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          showsVerticalScrollIndicator={true}
        >
          <EnrichedMarkdownText
            markdown={content}
            markdownStyle={mdStyle}
            onLinkPress={handleLinkPress}
            selectable={true}
            allowFontScaling={true}
            maxFontSizeMultiplier={1.5}
          />
        </ScrollView>

        <Animated.View
          style={[
            styles.fabRight,
            {
              backgroundColor: colors.primary,
              opacity: fabOpacity,
              width: fabSize,
              height: fabSize,
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
            <ArrowUp size={ICON_SIZE.nav} color={colors.background} strokeWidth={1.5} />
          </Pressable>
        </Animated.View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scroll: { flex: 1 },
  fabRight: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    borderRadius: RADIUS.fab,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
