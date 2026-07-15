import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import type { LargeDateFieldProps } from '@/components/large-date-field';
import { useAppTheme } from '@/hooks/use-app-theme';

export function LargeDateField({
  label,
  value,
  onChange,
  optionalLabel,
  error,
}: LargeDateFieldProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.wrapper, { gap: theme.spacing.sm }]}>
      <AppText variant="label" weight="bold">
        {label}
        {optionalLabel ? (
          <AppText color="secondary" variant="small">
            {' '}
            ({optionalLabel})
          </AppText>
        ) : null}
      </AppText>
      <input
        aria-label={label}
        onChange={(event) => onChange(event.currentTarget.value)}
        type="date"
        value={value}
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: error ? theme.colors.danger : theme.colors.border,
          borderRadius: theme.radii.md,
          borderStyle: 'solid',
          borderWidth: 2,
          boxSizing: 'border-box',
          color: theme.colors.text,
          fontFamily: 'system-ui',
          fontSize: theme.typography.body,
          fontWeight: 600,
          minHeight: 60,
          padding: '10px 16px',
          width: '100%',
        }}
      />
      {error ? (
        <AppText accessibilityLiveRegion="polite" color="danger" variant="small" weight="semibold">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
});
