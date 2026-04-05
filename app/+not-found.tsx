import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { SPACING, FONT } from '../constants/config';

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.onBackground }]}>
          Page not found
        </Text>
        <Link href="/" style={[styles.link, { color: colors.primary }]}>
          Go to Files
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT.sectionTitle,
    fontWeight: '600',
  },
  link: {
    marginTop: SPACING.md,
    fontSize: FONT.body,
  },
});
