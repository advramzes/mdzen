import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Read file content from a native URI (file:// or content://).
 * Only used on iOS/Android — web reads via asset.file.text() directly.
 */
export async function readFileFromUri(uri: string): Promise<string> {
  try {
    return await FileSystem.readAsStringAsync(uri);
  } catch (err) {
    // Android content:// URI fallback: copy to cache, read, cleanup
    if (Platform.OS === 'android' && uri.startsWith('content://')) {
      let cacheDir: string | null = null;
      try {
        const legacy = require('expo-file-system/legacy');
        cacheDir = legacy.cacheDirectory ?? null;
      } catch {
        // legacy import not available
      }

      if (cacheDir) {
        const cacheUri = cacheDir + 'temp_md_' + Date.now() + '.md';
        await FileSystem.copyAsync({ from: uri, to: cacheUri });
        const content = await FileSystem.readAsStringAsync(cacheUri);
        FileSystem.deleteAsync(cacheUri, { idempotent: true });
        return content;
      }
    }
    throw err;
  }
}

/**
 * Read a web File object as text.
 * Uses the modern File.text() API.
 */
export async function readWebFile(file: File): Promise<string> {
  return file.text();
}
