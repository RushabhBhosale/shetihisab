import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

interface LargeButtonProps {
  title: string;
  onPress: () => void;
  icon?: FeatherName;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

export function LargeButton({
  title,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
}: LargeButtonProps) {
  const theme = useAppTheme();
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const backgroundColor = isPrimary
    ? theme.colors.primary
    : isDanger
      ? theme.colors.dangerSoft
      : theme.colors.surface;
  const foregroundColor = isPrimary
    ? theme.colors.white
    : isDanger
      ? theme.colors.danger
      : theme.colors.primary;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor: isPrimary ? theme.colors.primary : foregroundColor,
          borderRadius: theme.radii.md,
          minHeight: 60,
          opacity: disabled ? 0.55 : 1,
        },
        pressed && !disabled && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={foregroundColor} size="large" />
      ) : (
        <View style={styles.content}>
          {icon ? <Feather color={foregroundColor} name={icon} size={27} /> : null}
          <AppText
            color={isPrimary ? 'onPrimary' : isDanger ? 'danger' : 'primary'}
            variant="label"
            weight="bold"
            style={styles.label}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.78,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    flexShrink: 1,
    textAlign: 'center',
  },
});
