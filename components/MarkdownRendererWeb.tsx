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
import { ArrowUp, Copy, Check } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { SPACING, RADIUS, ICON_SIZE, FONT, LINE_HEIGHT, MIN_TOUCH } from '../constants/config';
import { s, ms } from '../utils/scale';
import type { ThemeColors } from '../constants/themes';
import type { MarkdownRendererHandle, MarkdownRendererProps } from './MarkdownRenderer';
import { extractHeadings } from './markdownUtils';

const FAB_SCROLL_THRESHOLD = 500;

function CopyButton({ text, colors }: { text: string; colors: ThemeColors }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  }, [text]);

  return (
    <Pressable
      onPress={handleCopy}
      style={[
        webStyles.copyButton,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      accessibilityRole="button"
      accessibilityLabel={copied ? 'Copied' : 'Copy code'}
    >
      {copied ? (
        <>
          <Check size={ms(14)} color={colors.primary} strokeWidth={1.5} />
          <Text style={[webStyles.copyText, { color: colors.primary }]}>Copied!</Text>
        </>
      ) : (
        <Copy size={ms(14)} color={colors.tabBarInactive} strokeWidth={1.5} />
      )}
    </Pressable>
  );
}

function buildWebStyles(colors: ThemeColors) {
  return StyleSheet.create({
    body: {
      color: colors.onBackground,
      fontSize: FONT.body,
      lineHeight: LINE_HEIGHT.body,
      flexWrap: 'wrap',
      flexShrink: 1,
    },
    heading1: {
      fontSize: FONT.h1,
      fontWeight: '600',
      lineHeight: LINE_HEIGHT.h1,
      color: colors.onBackground,
      marginTop: SPACING.lg,
      marginBottom: s(12),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: SPACING.sm,
    },
    heading2: {
      fontSize: FONT.h2,
      fontWeight: '600',
      lineHeight: LINE_HEIGHT.h2,
      color: colors.onBackground,
      marginTop: SPACING.lg,
      marginBottom: s(10),
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
      backgroundColor: colors.primary + '14',
      borderLeftColor: colors.primary,
      borderLeftWidth: s(4),
      paddingLeft: SPACING.md,
      paddingVertical: SPACING.sm,
      marginVertical: SPACING.sm,
      borderRadius: s(4),
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
      fontWeight: '600',
    },
    th: {
      padding: SPACING.sm,
      fontWeight: '600',
      color: colors.onBackground,
      borderBottomWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.border,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    td: {
      padding: SPACING.sm,
      color: colors.onBackground,
      borderRightWidth: 1,
      borderColor: colors.border,
    },
    bullet_list: {
      marginVertical: SPACING.xs,
      marginLeft: SPACING.lg,
    },
    ordered_list: {
      marginVertical: SPACING.xs,
      marginLeft: SPACING.lg,
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
      flexWrap: 'wrap',
      flexShrink: 1,
    },
    hr: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: SPACING.lg,
    },
    image: {
      borderRadius: SPACING.sm,
      marginVertical: SPACING.sm,
    },
    paragraph: {
      marginVertical: SPACING.xs,
      flexWrap: 'wrap',
      flexShrink: 1,
    },
    textgroup: {
      flexWrap: 'wrap',
      flexShrink: 1,
      width: '100%' as any,
    },
  });
}

export const MarkdownRendererWeb = forwardRef<MarkdownRendererHandle, MarkdownRendererProps>(
  function MarkdownRendererWeb({ content, onScroll, initialScrollY = 0 }, ref) {
    const { theme } = useTheme();
    const { colors } = theme;
    const scrollRef = useRef<ScrollView>(null);
    const [showFab, setShowFab] = useState(false);
    const fabOpacity = useRef(new Animated.Value(0)).current;
    const mdStyles = buildWebStyles(colors);
    const didInitialScroll = useRef(false);
    const headingsRef = useRef(extractHeadings(content));

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

    // Custom render rules for code blocks with copy button
    const rules = {
      fence: (
        node: any,
        _children: any,
        _parent: any,
        _fenceStyles: any,
      ) => {
        const code = node.content?.replace(/\n$/, '') ?? '';
        return (
          <View key={node.key} style={webStyles.codeBlockWrapper}>
            <CopyButton text={code} colors={colors} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={[
                webStyles.codeScrollView,
                { backgroundColor: colors.codeBg },
              ]}
            >
              <Text
                style={{
                  color: colors.onBackground,
                  padding: SPACING.md,
                  fontFamily: 'monospace',
                  fontSize: FONT.code,
                  lineHeight: LINE_HEIGHT.code,
                }}
              >
                {code}
              </Text>
            </ScrollView>
          </View>
        );
      },
    };

    const fabSize = Math.max(s(48), MIN_TOUCH);

    return (
      <View style={[localStyles.wrapper, { backgroundColor: colors.background }]}>
        <ScrollView
          ref={scrollRef}
          style={localStyles.scroll}
          contentContainerStyle={localStyles.content}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          showsVerticalScrollIndicator={true}
        >
          <Markdown
            style={mdStyles}
            mergeStyle={false}
            onLinkPress={handleLinkPress}
            rules={rules}
          >
            {content}
          </Markdown>
        </ScrollView>

        <Animated.View
          style={[
            localStyles.fabRight,
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
            style={localStyles.fabInner}
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

const webStyles = StyleSheet.create({
  codeBlockWrapper: {
    position: 'relative',
    marginVertical: SPACING.sm,
  },
  codeScrollView: {
    borderRadius: RADIUS.button,
  },
  copyButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: s(6),
    borderWidth: 1,
    gap: SPACING.xs,
  },
  copyText: {
    fontSize: FONT.caption,
    fontWeight: '500',
  },
});

const localStyles = StyleSheet.create({
  wrapper: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    maxWidth: 900,
    width: '100%' as any,
    alignSelf: 'center' as any,
  },
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
