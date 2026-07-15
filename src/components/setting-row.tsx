import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

interface SettingRowProps {
  icon: FeatherName;
  label: string;
  value?: string;
  danger?: boolean;
  expanded?: boolean;
  onPress: () => void;
}

export function SettingRow({
  icon,
  label,
  value,
  danger = false,
  expanded = false,
  onPress,
}: SettingRowProps) {
  const theme = useAppTheme();
  const color = danger ? theme.colors.danger : theme.colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: expanded ? theme.colors.primarySoft : theme.colors.surface,
          borderColor: danger ? theme.colors.danger : theme.colors.border,
          borderRadius: theme.radii.md,
          minHeight: 68,
          padding: theme.spacing.md,
        },
        pressed && styles.pressed,
      ]}>
      <Feather color={color} name={icon} size={28} />
      <View style={styles.text}>
        <AppText color={danger ? 'danger' : 'text'} variant="label" weight="bold">
          {label}
        </AppText>
        {value ? (
          <AppText color="secondary" variant="small" numberOfLines={1}>
            {value}
          </AppText>
        ) : null}
      </View>
      <Feather color={color} name={expanded ? 'chevron-up' : 'chevron-down'} size={26} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  text: {
    flex: 1,
  },
  pressed: {
    opacity: 0.72,
  },
});
