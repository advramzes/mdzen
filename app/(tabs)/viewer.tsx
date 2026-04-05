import { useCallback, useContext, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from 'expo-router';
import { BookOpen, Search } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useMarkdown } from '../../hooks/useMarkdown';
import { FileContext } from '../../components/FileProvider';
import {
  MarkdownRenderer,
  type MarkdownRendererHandle,
  type HeadingEntry,
} from '../../components/MarkdownRenderer';
import { TOCSheet } from '../../components/TOCSheet';
import { ViewerSearchBar } from '../../components/ViewerSearchBar';
import { SPACING, FONT, ICON_SIZE, MIN_TOUCH } from '../../constants/config';
import { ms } from '../../utils/scale';
import { useEffect } from 'react';

export default function ViewerScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { openFile } = useContext(FileContext);
  const { initialScrollY, handleScroll } = useMarkdown({
    fileUri: openFile?.uri ?? null,
  });
  const mdRef = useRef<MarkdownRendererHandle>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const navigation = useNavigation();

  // Add search button to header
  useEffect(() => {
    if (openFile) {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            onPress={() => setSearchVisible((v) => !v)}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Search in document"
          >
            <Search
              size={ICON_SIZE.nav}
              color={colors.onBackground}
              strokeWidth={1.5}
            />
          </Pressable>
        ),
      });
    } else {
      navigation.setOptions({ headerRight: undefined });
    }
  }, [openFile, navigation, colors.onBackground]);

  const handleTOCSelect = useCallback((heading: HeadingEntry) => {
    mdRef.current?.scrollTo(heading.y, true);
  }, []);

  if (!openFile) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <BookOpen size={ms(48)} color={colors.tabBarInactive} strokeWidth={1} />
        <Text style={[styles.emptyTitle, { color: colors.onBackground }]}>
          No file open
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.tabBarInactive }]}>
          Select a file from the Files tab
        </Text>
      </View>
    );
  }

  const headings = mdRef.current?.getHeadings() ?? [];

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ViewerSearchBar
        content={openFile.content}
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />

      <MarkdownRenderer
        ref={mdRef}
        content={openFile.content}
        onScroll={handleScroll}
        initialScrollY={initialScrollY}
      />

      <TOCSheet headings={headings} onSelect={handleTOCSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONT.sectionTitle,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT.body,
    textAlign: 'center',
  },
  headerButton: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
});
