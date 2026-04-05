import { Platform } from 'react-native';
import { forwardRef } from 'react';
import { MarkdownRendererWeb } from './MarkdownRendererWeb';
// Note: MarkdownRendererNative uses react-native-enriched-markdown which
// doesn't support web. We conditionally import to avoid web bundling issues.

export type { HeadingEntry } from './markdownUtils';
export { extractHeadings } from './markdownUtils';

export interface MarkdownRendererHandle {
  scrollTo: (y: number, animated?: boolean) => void;
  getHeadings: () => import('./markdownUtils').HeadingEntry[];
}

export interface MarkdownRendererProps {
  content: string;
  onScroll?: (y: number) => void;
  initialScrollY?: number;
}

// Platform-specific renderer selection
// On web: use react-native-markdown-display (fully styled)
// On native: use react-native-enriched-markdown (Software Mansion)
export const MarkdownRenderer = forwardRef<MarkdownRendererHandle, MarkdownRendererProps>(
  function MarkdownRenderer(props, ref) {
    if (Platform.OS === 'web') {
      return <MarkdownRendererWeb ref={ref} {...props} />;
    }

    // Dynamic require for native to avoid web bundling react-native-enriched-markdown
    const { MarkdownRendererNative } = require('./MarkdownRendererNative');
    return <MarkdownRendererNative ref={ref} {...props} />;
  },
);
