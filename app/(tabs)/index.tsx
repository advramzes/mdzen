import { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { FilePlus, FileText, SearchX } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useRecentFiles, type RecentFile } from '../../hooks/useRecentFiles';
import { FileContext } from '../../components/FileProvider';
import { FileCard } from '../../components/FileCard';
import { SearchBar } from '../../components/SearchBar';
import { SPACING, RADIUS, ICON_SIZE, FONT, MIN_TOUCH } from '../../constants/config';
import { s, ms } from '../../utils/scale';
import { mediumHaptic } from '../../utils/haptics';
import { readFileFromUri } from '../../utils/fileReader';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function isMarkdownFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase();
  return ext === 'md' || ext === 'markdown' || ext === 'txt';
}

export default function FilesScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const router = useRouter();
  const { recents, addRecent, updateLastOpened, removeRecent } = useRecentFiles();
  const { setOpenFile } = useContext(FileContext);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = search
    ? recents.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()),
      )
    : recents;

  // Navigate to viewer with content
  const openWithContent = useCallback(
    (name: string, uri: string, size: number, content: string) => {
      mediumHaptic();
      addRecent({ name, path: uri, uri, size, content });
      setOpenFile({ name, uri, content });
      router.navigate('/(tabs)/viewer');
    },
    [addRecent, setOpenFile, router],
  );

  // Open a file from recents — use stored content if available
  const openFileFromRecent = useCallback(
    async (file: RecentFile) => {
      // If content is stored, use it directly (no URI re-read needed)
      if (file.content) {
        mediumHaptic();
        updateLastOpened(file.uri);
        setOpenFile({ name: file.name, uri: file.uri, content: file.content });
        router.navigate('/(tabs)/viewer');
        return;
      }

      // On native, try reading from cached URI
      if (Platform.OS !== 'web') {
        try {
          const content = await readFileFromUri(file.uri);
          mediumHaptic();
          addRecent({ ...file, content });
          setOpenFile({ name: file.name, uri: file.uri, content });
          router.navigate('/(tabs)/viewer');
          return;
        } catch {
          Alert.alert(
            'File not found',
            'This file may have been moved or deleted.',
            [
              { text: 'Remove from recents', onPress: () => removeRecent(file.uri), style: 'destructive' },
              { text: 'OK', style: 'cancel' },
            ],
          );
          return;
        }
      }

      // Web: no stored content and blob URL expired — prompt re-open
      Alert.alert(
        'File needs to be re-opened',
        'The cached link to this file has expired. Please select the file again.',
        [
          { text: 'Open File', onPress: () => pickFile() },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    },
    [updateLastOpened, addRecent, setOpenFile, router, removeRecent],
  );

  const pickFile = useCallback(async () => {
    try {
      // Use */* on all platforms — validate by extension after selection
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const name = asset.name ?? 'Untitled.md';

      if (!isMarkdownFile(name)) {
        Alert.alert(
          'Unsupported file',
          'Please select a Markdown file (.md, .markdown, or .txt).',
        );
        return;
      }

      const size = asset.size ?? 0;

      // Read content per platform
      let content: string;
      try {
        setLoading(true);

        if (Platform.OS === 'web' && asset.file) {
          // Web: use File.text() API directly from the File object
          content = await asset.file.text();
        } else {
          // Native (iOS/Android): read from cached URI
          content = await readFileFromUri(asset.uri);
        }
      } catch {
        Alert.alert('Error', 'Could not read the file content.');
        return;
      } finally {
        setLoading(false);
      }

      if (!content && content !== '') {
        Alert.alert('Error', 'File appears to be empty or unreadable.');
        return;
      }

      if (size > MAX_FILE_SIZE) {
        Alert.alert(
          'Large file',
          `This file is ${(size / 1024 / 1024).toFixed(1)}MB. It may take a moment to render.`,
          [
            { text: 'Open anyway', onPress: () => openWithContent(name, asset.uri, size, content) },
            { text: 'Cancel', style: 'cancel' },
          ],
        );
        return;
      }

      openWithContent(name, asset.uri, size, content);
    } catch {
      Alert.alert('Error', 'Could not open file picker. Please try again.');
    }
  }, [openWithContent]);

  const handleRecentPress = useCallback(
    (file: RecentFile) => {
      openFileFromRecent(file);
    },
    [openFileFromRecent],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar value={search} onChangeText={setSearch} />

      <Pressable
        onPress={pickFile}
        style={[styles.openButton, { backgroundColor: colors.primary }]}
        accessibilityRole="button"
        accessibilityLabel="Open Markdown file"
      >
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <>
            <FilePlus
              size={ICON_SIZE.nav}
              color={colors.background}
              strokeWidth={1.5}
              accessibilityLabel="Open file icon"
            />
            <Text style={[styles.openButtonText, { color: colors.background }]}>
              Open File
            </Text>
          </>
        )}
      </Pressable>

      {recents.length > 0 && (
        <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
          Recent Files
        </Text>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.name + item.lastOpened}
        renderItem={({ item, index }) => (
          <FileCard
            file={item}
            index={index}
            onPress={handleRecentPress}
            onRemove={removeRecent}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          recents.length === 0 ? (
            <Pressable
              onPress={pickFile}
              style={styles.empty}
              accessibilityRole="button"
              accessibilityLabel="Open your first Markdown file"
            >
              <FileText
                size={ms(48)}
                color={colors.tabBarInactive}
                strokeWidth={1}
                accessibilityLabel="No files illustration"
              />
              <Text
                style={[styles.emptyTitle, { color: colors.onBackground }]}
              >
                Open your first Markdown file
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.tabBarInactive }]}
              >
                Tap here or the button above to browse
              </Text>
            </Pressable>
          ) : (
            <View style={styles.empty}>
              <SearchX
                size={ms(36)}
                color={colors.tabBarInactive}
                strokeWidth={1}
                accessibilityLabel="No search results"
              />
              <Text
                style={[styles.emptySubtitle, { color: colors.tabBarInactive }]}
              >
                No matches found
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
    paddingTop: SPACING.md,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: Math.max(s(52), MIN_TOUCH),
    borderRadius: RADIUS.button,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  openButtonText: {
    fontSize: FONT.button,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: FONT.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONT.sectionTitle,
    fontWeight: '600',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT.body,
    textAlign: 'center',
  },
});
