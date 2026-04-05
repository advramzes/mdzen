import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Import cacheDirectory from legacy subpath (SDK 54+)
let cacheDir: string | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const legacy = require('expo-file-system/legacy');
  cacheDir = legacy.cacheDirectory ?? null;
} catch {
  // legacy import not available
}

/**
 * Read file content as string, with web fallback using fetch/FileReader.
 * On Android, handles content:// URIs via expo-file-system.
 */
export async function readFileContent(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    return readFileWeb(uri);
  }

  // Native (iOS/Android): use expo-file-system
  // expo-file-system handles both file:// and content:// URIs on Android
  try {
    return await FileSystem.readAsStringAsync(uri);
  } catch (err) {
    // On Android, if the URI is a content:// URI that can't be read directly,
    // try copying to cache first then reading
    if (Platform.OS === 'android' && uri.startsWith('content://') && cacheDir) {
      const cacheUri = cacheDir + 'temp_md_' + Date.now() + '.md';
      await FileSystem.copyAsync({ from: uri, to: cacheUri });
      const content = await FileSystem.readAsStringAsync(cacheUri);
      // Clean up temp file
      FileSystem.deleteAsync(cacheUri, { idempotent: true });
      return content;
    }
    throw err;
  }
}

async function readFileWeb(uri: string): Promise<string> {
  // On web, DocumentPicker returns a blob URI or object URL
  // Try fetch first, then FileReader fallback
  try {
    const response = await fetch(uri);
    if (response.ok) {
      return await response.text();
    }
  } catch {
    // fetch failed, try FileReader approach below
  }

  // FileReader fallback for blob URIs
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', uri, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsText(xhr.response);
    };
    xhr.onerror = () => reject(new Error('XHR failed'));
    xhr.send();
  });
}
