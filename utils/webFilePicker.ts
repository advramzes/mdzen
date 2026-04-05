/**
 * Web-only file picker using native HTML <input type="file">.
 * More reliable than expo-document-picker on mobile browsers (Samsung, Safari).
 */

export interface WebFileResult {
  name: string;
  size: number;
  content: string;
}

function readFileAsText(file: File): Promise<string> {
  // Try modern File.text() first, fallback to FileReader
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('FileReader failed to read file'));
    reader.readAsText(file);
  });
}

export function pickFileWeb(): Promise<WebFileResult | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt,text/markdown,text/plain,text/x-markdown';
    input.style.display = 'none';

    const cleanup = () => {
      document.body.removeChild(input);
    };

    input.addEventListener('change', async () => {
      try {
        const file = input.files?.[0];
        if (!file) {
          cleanup();
          resolve(null);
          return;
        }

        const content = await readFileAsText(file);
        cleanup();
        resolve({
          name: file.name,
          size: file.size,
          content,
        });
      } catch (err) {
        cleanup();
        reject(err);
      }
    });

    // Handle cancel (user closes picker without selecting)
    input.addEventListener('cancel', () => {
      cleanup();
      resolve(null);
    });

    document.body.appendChild(input);
    input.click();
  });
}
