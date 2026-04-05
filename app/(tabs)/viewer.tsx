import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { SPACING } from '../../constants/config';

export default function ViewerScreen() {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.onBackground }]}>
        Viewer
      </Text>
      <Text style={[styles.subtitle, { color: colors.tabBarInactive }]}>
        No file selected
      </Text>
    </View>
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
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 26,
    marginTop: SPACING.sm,
  },
});
