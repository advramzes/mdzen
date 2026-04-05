import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '../components/ThemeProvider';
import { FileProvider } from '../components/FileProvider';
import { AppLogo } from '../components/AppLogo';
import { useTheme } from '../hooks/useTheme';
import { APP_NAME, COPYRIGHT, FONT, SPACING } from '../constants/config';

SplashScreen.preventAutoHideAsync();

function AppSplash({ onFinish }: { onFinish: () => void }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 1500);

    return () => clearTimeout(timer);
  }, [fadeAnim, onFinish]);

  return (
    <Animated.View
      style={[
        styles.splash,
        { backgroundColor: colors.background, opacity: fadeAnim },
      ]}
    >
      <AppLogo
        primaryColor={colors.primary}
        backgroundColor={colors.background}
      />
      <Text style={[styles.splashTitle, { color: colors.primary }]}>
        {APP_NAME}
      </Text>
      <Text style={[styles.splashCopyright, { color: colors.tabBarInactive }]}>
        {COPYRIGHT}
      </Text>
    </Animated.View>
  );
}

function RootInner() {
  const { theme, isLoaded } = useTheme();
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) return null;

  return (
    <View style={styles.root}>
      <StatusBar style={theme.colors.statusBarStyle} />
      <Slot />
      {!splashDone && <AppSplash onFinish={handleSplashFinish} />}
    </View>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splash: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  splashTitle: {
    fontSize: FONT.h1,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  splashCopyright: {
    fontSize: FONT.caption,
    marginTop: SPACING.lg,
  },
});
