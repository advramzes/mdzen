import { LINE_HEIGHT } from '../constants/config';

export interface HeadingEntry {
  key: string;
  level: number;
  text: string;
  y: number;
}

export function extractHeadings(markdown: string): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  const lines = markdown.split('\n');
  let estimatedY = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        key: `h-${i}`,
        level: match[1].length,
        text: match[2].replace(/[*_`~\[\]]/g, ''),
        y: estimatedY,
      });
    }
    estimatedY += LINE_HEIGHT.body + 2;
  }

  return headings;
}
