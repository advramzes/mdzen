import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { themeNames, themes } from '../../constants/themes';
import {
  APP_NAME,
  APP_VERSION,
  COPYRIGHT,
  ICON_SIZE,
  RADIUS,
  SPACING,
  WEBSITE,
} from '../../constants/config';

export default function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  const { colors } = theme;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
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

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
        About
      </Text>
      <View
        style={[
          styles.aboutCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.appName, { color: colors.onBackground }]}>
          {APP_NAME}
        </Text>
        <Text style={[styles.aboutText, { color: colors.tabBarInactive }]}>
          Version {APP_VERSION}
        </Text>
        <Text style={[styles.aboutText, { color: colors.tabBarInactive }]}>
          {COPYRIGHT}
        </Text>
        <Pressable
          onPress={() => Linking.openURL(WEBSITE)}
          style={styles.linkRow}
          accessibilityRole="link"
          accessibilityLabel="Open developer website"
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>
            ramzes-it.ru
          </Text>
          <ExternalLink
            size={ICON_SIZE.inline}
            color={colors.primary}
            strokeWidth={1.5}
          />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
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
  divider: {
    height: 1,
    marginVertical: SPACING.lg,
  },
  aboutCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    minHeight: 44,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: SPACING.sm,
    textDecorationLine: 'underline',
  },
});
