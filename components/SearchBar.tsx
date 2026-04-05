import { StyleSheet, TextInput, View, Pressable } from 'react-native';
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
      />
      <TextInput
        style={[styles.input, { color: colors.onBackground }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.tabBarInactive}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Search files"
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
  },
  input: {
    flex: 1,
    fontSize: FONT.body,
    marginLeft: SPACING.sm,
    paddingVertical: 0,
  },
  clearButton: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
