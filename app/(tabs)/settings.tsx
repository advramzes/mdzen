import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { themeNames, themes } from '../../constants/themes';
import { SPACING, RADIUS } from '../../constants/config';

export default function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
        Theme
      </Text>
      {themeNames.map((name) => {
        const t = themes[name];
        const isActive = name === theme.name;
        return (
          <Pressable
            key={name}
            onPress={() => setTheme(name)}
            style={[
              styles.themeOption,
              {
                backgroundColor: isActive ? colors.surface : colors.surfaceVariant,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ checked: isActive }}
            accessibilityLabel={`${t.label} theme`}
          >
            <View
              style={[styles.swatch, { backgroundColor: t.colors.primary }]}
            />
            <Text style={[styles.themeLabel, { color: colors.onBackground }]}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: SPACING.md,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.card,
    borderWidth: 2,
    marginBottom: SPACING.sm,
    minHeight: 56,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SPACING.md,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});
