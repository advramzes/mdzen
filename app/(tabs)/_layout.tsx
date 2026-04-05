import { Tabs } from 'expo-router';
import { FileText, BookOpen, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { ICON_SIZE } from '../../constants/config';
import { lightHaptic } from '../../utils/haptics';

export default function TabLayout() {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.onBackground,
        headerShadowVisible: false,
      }}
      screenListeners={{
        tabPress: () => {
          lightHaptic();
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Files',
          tabBarIcon: ({ color }) => (
            <FileText size={ICON_SIZE.nav} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="viewer"
        options={{
          title: 'Viewer',
          tabBarIcon: ({ color }) => (
            <BookOpen size={ICON_SIZE.nav} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <SlidersHorizontal size={ICON_SIZE.nav} color={color} strokeWidth={1.5} />
          ),
        }}
      />
    </Tabs>
  );
}
