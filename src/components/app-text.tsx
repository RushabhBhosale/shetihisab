import type { ComponentProps } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

type TextVariant = 'small' | 'body' | 'label' | 'heading' | 'title' | 'amount';

interface AppTextProps extends ComponentProps<typeof Text> {
  variant?: TextVariant;
  color?: 'text' | 'secondary' | 'primary' | 'danger' | 'onPrimary';
  weight?: 'regular' | 'semibold' | 'bold';
}

export function AppText({
  variant = 'body',
  color = 'text',
  weight = 'regular',
  style,
  ...props
}: AppTextProps) {
  const theme = useAppTheme();
  const lineHeightKey = `${variant}LineHeight` as const;
  const textColor = {
    text: theme.colors.text,
    secondary: theme.colors.textSecondary,
    primary: theme.colors.primary,
    danger: theme.colors.danger,
    onPrimary: theme.colors.white,
  }[color];

  return (
    <Text
      maxFontSizeMultiplier={1.35}
      style={[
        styles.base,
        {
          color: textColor,
          fontSize: theme.typography[variant],
          lineHeight: theme.typography[lineHeightKey],
          fontWeight: weight === 'bold' ? '700' : weight === 'semibold' ? '600' : '400',
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
