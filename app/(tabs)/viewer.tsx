import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useMarkdown } from '../../hooks/useMarkdown';
import { FileContext } from '../../components/FileProvider';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';
import { SPACING } from '../../constants/config';

export default function ViewerScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { openFile } = useContext(FileContext);
  const { initialScrollY, handleScroll } = useMarkdown({
    fileUri: openFile?.uri ?? null,
  });

  if (!openFile) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <BookOpen size={48} color={colors.tabBarInactive} strokeWidth={1} />
        <Text style={[styles.emptyTitle, { color: colors.onBackground }]}>
          No file open
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.tabBarInactive }]}>
          Open a Markdown file from the Files tab
        </Text>
      </View>
    );
  }

  return (
    <MarkdownRenderer
      content={openFile.content}
      onScroll={handleScroll}
      initialScrollY={initialScrollY}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
