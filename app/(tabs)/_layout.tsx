import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/use-app-theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

function TabIcon({
  name,
  color,
  prominent,
}: {
  name: FeatherName;
  color: ColorValue;
  prominent?: boolean;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.icon,
        prominent && {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radii.pill,
          width: 48,
          height: 48,
        },
      ]}>
      <Feather color={prominent ? theme.colors.white : color} name={name} size={prominent ? 29 : 27} />
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: theme.typography.small,
          fontWeight: '700',
          lineHeight: theme.typography.smallLineHeight,
        },
        tabBarItemStyle: styles.item,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1.5,
          height: theme.textSize === 'extraLarge' ? 104 : theme.textSize === 'large' ? 94 : 88,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarAccessibilityLabel: t('tabs.home'),
          tabBarIcon: ({ color }) => <TabIcon color={color} name="home" />,
          title: t('tabs.home'),
        }}
      />
      <Tabs.Screen
        name="crops"
        options={{
          tabBarAccessibilityLabel: t('tabs.crops'),
          tabBarIcon: ({ color }) => <TabIcon color={color} name="sun" />,
          title: t('tabs.crops'),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarAccessibilityLabel: t('tabs.add'),
          tabBarIcon: ({ color }) => <TabIcon color={color} name="plus" prominent />,
          title: t('tabs.add'),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarAccessibilityLabel: t('tabs.history'),
          tabBarIcon: ({ color }) => <TabIcon color={color} name="book-open" />,
          title: t('tabs.history'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 72,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
