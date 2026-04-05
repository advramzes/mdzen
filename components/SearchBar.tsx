import { Platform, StyleSheet, TextInput, View, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { SPACING, RADIUS, ICON_SIZE, FONT, MIN_TOUCH } from '../constants/config';
import { s } from '../utils/scale';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search files...',
}: SearchBarProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Search
        size={ICON_SIZE.inline}
        color={colors.tabBarInactive}
        strokeWidth={1.5}
        accessibilityLabel="Search icon"
      />
      <TextInput
        style={[
          styles.input,
          { color: colors.onBackground },
          // Web fix: ensure the input is interactive
          Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {},
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.tabBarInactive}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        editable={true}
        selectTextOnFocus={false}
        accessibilityLabel="Search files"
        accessibilityRole="search"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={styles.clearButton}
        >
          <X
            size={ICON_SIZE.inline}
            color={colors.tabBarInactive}
            strokeWidth={1.5}
            accessibilityLabel="Clear icon"
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.input,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    height: s(48),
    marginBottom: SPACING.md,
    zIndex: 10,
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: FONT.body,
    marginLeft: SPACING.sm,
    paddingVertical: SPACING.sm,
    height: '100%',
    zIndex: 11,
  },
  clearButton: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
});
