import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { SPACING, RADIUS, ICON_SIZE } from '../constants/config';
import type { RecentFile } from '../hooks/useRecentFiles';

const SWIPE_THRESHOLD = -80;

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function truncatePath(path: string, maxLength = 40): string {
  if (path.length <= maxLength) return path;
  return '...' + path.slice(-(maxLength - 3));
}

interface FileCardProps {
  file: RecentFile;
  onPress: (file: RecentFile) => void;
  onRemove: (uri: string) => void;
}

export function FileCard({ file, onPress, onRemove }: FileCardProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 10 && Math.abs(gesture.dy) < 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          translateX.setValue(gesture.dx);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -120,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const resetSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const isDark = theme.name === 'dark';

  return (
    <View style={styles.wrapper}>
      {/* Delete button behind card */}
      <Pressable
        onPress={() => {
          resetSwipe();
          onRemove(file.uri);
        }}
        style={[styles.deleteButton, { backgroundColor: '#EF4444' }]}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${file.name} from recents`}
      >
        <Trash2 size={ICON_SIZE.nav} color="#FFFFFF" strokeWidth={1.5} />
      </Pressable>

      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [{ translateX }],
            ...(isDark
              ? {}
              : {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }),
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={() => onPress(file)}
          style={styles.cardContent}
          accessibilityRole="button"
          accessibilityLabel={`Open ${file.name}`}
        >
          <Text
            style={[styles.fileName, { color: colors.onBackground }]}
            numberOfLines={1}
          >
            {file.name}
          </Text>
          <Text
            style={[styles.filePath, { color: colors.tabBarInactive }]}
            numberOfLines={1}
          >
            {truncatePath(file.path)}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.tabBarInactive }]}>
              {formatRelativeTime(file.lastOpened)}
            </Text>
            <Text style={[styles.metaText, { color: colors.tabBarInactive }]}>
              {formatFileSize(file.size)}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    borderRadius: RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  cardContent: {
    padding: SPACING.md,
    minHeight: 44,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  filePath: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 17,
  },
});
