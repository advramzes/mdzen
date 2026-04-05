import { useCallback, useContext, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { FilePlus, FileText } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useRecentFiles, type RecentFile } from '../../hooks/useRecentFiles';
import { FileContext } from '../../components/FileProvider';
import { FileCard } from '../../components/FileCard';
import { SearchBar } from '../../components/SearchBar';
import { SPACING, RADIUS, ICON_SIZE } from '../../constants/config';

export default function FilesScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const router = useRouter();
  const { recents, addRecent, removeRecent } = useRecentFiles();
  const { setOpenFile } = useContext(FileContext);
  const [search, setSearch] = useState('');

  const filtered = search
    ? recents.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()),
      )
    : recents;

  const openFile = useCallback(
    async (uri: string, name: string, path: string, size: number) => {
      try {
        const content = await FileSystem.readAsStringAsync(uri);
        addRecent({ name, path, uri, size });
        setOpenFile({ name, uri, content });
        router.navigate('/(tabs)/viewer');
      } catch {
        Alert.alert('Error', 'Could not read the file. It may have been moved or deleted.');
      }
    },
    [addRecent, setOpenFile, router],
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

      // Only accept .md / .markdown files
      const ext = name.split('.').pop()?.toLowerCase();
      if (ext !== 'md' && ext !== 'markdown') {
        Alert.alert('Unsupported file', 'Please select a Markdown file (.md or .markdown).');
        return;
      }

      await openFile(
        asset.uri,
        name,
        asset.uri,
        asset.size ?? 0,
      );
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar value={search} onChangeText={setSearch} />

      <Pressable
        onPress={pickFile}
        style={[styles.openButton, { backgroundColor: colors.primary }]}
        accessibilityRole="button"
        accessibilityLabel="Open Markdown file"
      >
        <FilePlus
          size={ICON_SIZE.nav}
          color={colors.background}
          strokeWidth={1.5}
        />
        <Text style={[styles.openButtonText, { color: colors.background }]}>
          Open File
        </Text>
      </Pressable>

      {recents.length > 0 && (
        <Text
          style={[styles.sectionTitle, { color: colors.onBackground }]}
        >
          Recent Files
        </Text>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <FileCard
            file={item}
            onPress={handleRecentPress}
            onRemove={removeRecent}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          recents.length === 0 ? (
            <View style={styles.empty}>
              <FileText
                size={48}
                color={colors.tabBarInactive}
                strokeWidth={1}
              />
              <Text
                style={[styles.emptyTitle, { color: colors.onBackground }]}
              >
                No recent files
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.tabBarInactive }]}
              >
                Open a Markdown file to start reading
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text
                style={[styles.emptySubtitle, { color: colors.tabBarInactive }]}
              >
                No files match your search
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
    height: 52,
    borderRadius: RADIUS.button,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  openButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
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
    fontSize: 20,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
