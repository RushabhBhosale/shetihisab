import { forwardRef } from 'react';
import type { TextInputProps } from 'react-native';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

interface LargeTextInputProps extends TextInputProps {
  label: string;
  error?: string;
  optionalLabel?: string;
}

export const LargeTextInput = forwardRef<TextInput, LargeTextInputProps>(function LargeTextInput(
  { label, error, optionalLabel, style, ...props },
  ref,
) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" weight="bold">
        {label}
        {optionalLabel ? (
          <AppText variant="small" color="secondary">
            {' '}
            ({optionalLabel})
          </AppText>
        ) : null}
      </AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={error}
        allowFontScaling
        maxFontSizeMultiplier={1.35}
        placeholderTextColor={theme.colors.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radii.md,
            color: theme.colors.text,
            fontSize: theme.typography.body,
            lineHeight: theme.typography.bodyLineHeight,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <AppText accessibilityLiveRegion="polite" color="danger" variant="small" weight="semibold">
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: 8,
  },
  input: {
    minHeight: 60,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontWeight: '500',
  },
});
