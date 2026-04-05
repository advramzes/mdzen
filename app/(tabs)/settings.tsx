import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { themeNames, themes } from '../../constants/themes';
import {
  APP_NAME,
  APP_VERSION,
  COPYRIGHT,
  FONT,
  ICON_SIZE,
  LINE_HEIGHT,
  MIN_TOUCH,
  RADIUS,
  SPACING,
  WEBSITE,
} from '../../constants/config';
import { s } from '../../utils/scale';

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
    fontSize: FONT.sectionTitle,
    fontWeight: '600',
    lineHeight: LINE_HEIGHT.h3,
    marginBottom: SPACING.md,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.card,
    borderWidth: 2,
    marginBottom: SPACING.sm,
    minHeight: MIN_TOUCH + s(12),
  },
  swatch: {
    width: s(24),
    height: s(24),
    borderRadius: s(12),
    marginRight: SPACING.md,
  },
  themeLabel: {
    fontSize: FONT.body,
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
    fontSize: FONT.sectionTitle,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  aboutText: {
    fontSize: FONT.code,
    lineHeight: LINE_HEIGHT.caption + s(3),
    marginBottom: SPACING.xs,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    minHeight: MIN_TOUCH,
  },
  linkText: {
    fontSize: FONT.body,
    fontWeight: '500',
    marginRight: SPACING.sm,
    textDecorationLine: 'underline',
  },
});
