import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../components/ThemeProvider';
import { FileProvider } from '../components/FileProvider';
import { useTheme } from '../hooks/useTheme';

function RootInner() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar style={theme.colors.statusBarStyle} />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <FileProvider>
        <RootInner />
      </FileProvider>
    </ThemeProvider>
  );
}
