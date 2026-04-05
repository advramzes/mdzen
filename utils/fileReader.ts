import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Read file content as string, with web fallback using fetch/FileReader.
 */
export async function readFileContent(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    return readFileWeb(uri);
  }

  // Native: use expo-file-system
  return FileSystem.readAsStringAsync(uri);
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
