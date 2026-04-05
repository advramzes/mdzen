import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { List, X } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { SPACING, RADIUS, ICON_SIZE, FONT, LINE_HEIGHT, MIN_TOUCH } from '../constants/config';
import { s } from '../utils/scale';
import { lightHaptic } from '../utils/haptics';
import type { HeadingEntry } from './MarkdownRenderer';

const SHEET_HEIGHT_RATIO = 0.6;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * SHEET_HEIGHT_RATIO;

// Indentation per heading level (H1=0, H2=16, H3=32, scaled)
const INDENT_PER_LEVEL = s(16);

interface TOCSheetProps {
  headings: HeadingEntry[];
  onSelect: (heading: HeadingEntry) => void;
}

export function TOCSheet({ headings, onSelect }: TOCSheetProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [visible, setVisible] = React.useState(false);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const open = () => {
    setVisible(true);
  };

  const close = () => {
    Animated.spring(slideAnim, {
      toValue: SHEET_HEIGHT,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start(() => setVisible(false));
  };

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SHEET_HEIGHT);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleSelect = (heading: HeadingEntry) => {
    lightHaptic();
    close();
    // Delay to let sheet animate out
    setTimeout(() => onSelect(heading), 150);
  };

  const fabSize = Math.max(s(48), MIN_TOUCH);

  return (
    <>
      {/* FAB trigger — bottom-left */}
      <Pressable
        onPress={open}
        style={[
          styles.fab,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            width: fabSize,
            height: fabSize,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open table of contents"
      >
        <List size={ICON_SIZE.nav} color={colors.onBackground} strokeWidth={1.5} />
      </Pressable>

      {/* Bottom sheet modal */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close}>
          <View />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              height: SHEET_HEIGHT,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Sheet header */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sheetTitle, { color: colors.onBackground }]}>
              Table of Contents
            </Text>
            <Pressable
              onPress={close}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close table of contents"
            >
              <X size={ICON_SIZE.nav} color={colors.onBackground} strokeWidth={1.5} />
            </Pressable>
          </View>

          {/* Heading list */}
          {headings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.tabBarInactive }]}>
                No headings found
              </Text>
            </View>
          ) : (
            <FlatList
              data={headings}
              keyExtractor={(item) => item.key}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const indent = (item.level - 1) * INDENT_PER_LEVEL;
                const isH1 = item.level === 1;
                return (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    style={[
                      styles.headingItem,
                      {
                        paddingLeft: SPACING.md + indent,
                        borderBottomColor: colors.border,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Go to heading: ${item.text}`}
                  >
                    <Text
                      style={[
                        styles.headingText,
                        {
                          color: colors.onBackground,
                          fontWeight: isH1 ? '600' : '400',
                          fontSize: isH1 ? FONT.body : FONT.code,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {item.text}
                    </Text>
                  </Pressable>
                );
              }}
            />
          )}
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    borderRadius: RADIUS.fab,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: FONT.sectionTitle,
    fontWeight: '600',
    lineHeight: LINE_HEIGHT.h3,
  },
  closeButton: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  headingItem: {
    paddingVertical: SPACING.sm + s(4),
    paddingRight: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
  },
  headingText: {
    lineHeight: LINE_HEIGHT.body,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT.body,
  },
});
