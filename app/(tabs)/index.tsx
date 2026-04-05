import { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { FilePlus, FileText, SearchX } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useRecentFiles, type RecentFile } from '../../hooks/useRecentFiles';
import { FileContext } from '../../components/FileProvider';
import { FileCard } from '../../components/FileCard';
import { SearchBar } from '../../components/SearchBar';
import { SPACING, RADIUS, ICON_SIZE, FONT, MIN_TOUCH } from '../../constants/config';
import { s, ms } from '../../utils/scale';
import { mediumHaptic } from '../../utils/haptics';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function FilesScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const router = useRouter();
  const { recents, addRecent, removeRecent } = useRecentFiles();
  const { setOpenFile } = useContext(FileContext);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = search
    ? recents.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()),
      )
    : recents;

  const openFile = useCallback(
    async (uri: string, name: string, path: string, size: number) => {
      // Large file warning
      if (size > MAX_FILE_SIZE) {
        setLoading(true);
      }

      try {
        const content = await FileSystem.readAsStringAsync(uri);
        mediumHaptic();
        addRecent({ name, path, uri, size });
        setOpenFile({ name, uri, content });
        router.navigate('/(tabs)/viewer');
      } catch {
        Alert.alert(
          'File not found',
          'This file may have been moved or deleted.',
          [
            { text: 'Remove from recents', onPress: () => removeRecent(uri), style: 'destructive' },
            { text: 'OK', style: 'cancel' },
          ],
        );
      } finally {
        setLoading(false);
      }
    },
    [addRecent, setOpenFile, router, removeRecent],
  );

  const pickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/markdown', 'text/plain', 'text/x-markdown', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const name = asset.name ?? 'Untitled.md';

      const ext = name.split('.').pop()?.toLowerCase();
      if (ext !== 'md' && ext !== 'markdown') {
        Alert.alert('Unsupported file', 'Please select a Markdown file (.md or .markdown).');
        return;
      }

      const size = asset.size ?? 0;
      if (size > MAX_FILE_SIZE) {
        Alert.alert(
          'Large file',
          `This file is ${(size / 1024 / 1024).toFixed(1)}MB. It may take a moment to load.`,
          [
            { text: 'Open anyway', onPress: () => openFile(asset.uri, name, asset.uri, size) },
            { text: 'Cancel', style: 'cancel' },
          ],
        );
        return;
      }

      await openFile(asset.uri, name, asset.uri, size);
    } catch {
      Alert.alert('Error', 'Could not open file picker.');
    }
  }, [openFile]);

  const handleRecentPress = useCallback(
    (file: RecentFile) => {
      openFile(file.uri, file.name, file.path, file.size);
    },
    [openFile],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh — recents are already live from state
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
        keyExtractor={(item) => item.uri}
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
            <View style={styles.empty}>
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
                Tap the button above to browse your files
              </Text>
            </View>
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
