import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

export interface LargeSelectOption {
  label: string;
  value: string;
}

interface LargeSelectProps {
  label: string;
  value: string;
  options: LargeSelectOption[];
  onChange: (value: string) => void;
  optionalLabel?: string;
  error?: string;
}

export function LargeSelect({
  label,
  value,
  options,
  onChange,
  optionalLabel,
  error,
}: LargeSelectProps) {
  const theme = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const selected = options.find((option) => option.value === value);

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
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [
          styles.control,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radii.md,
            minHeight: 60,
          },
          pressed && styles.pressed,
        ]}>
        <AppText variant="body" weight="semibold" style={styles.value}>
          {selected?.label ?? ''}
        </AppText>
        <Feather
          color={theme.colors.primary}
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={28}
        />
      </Pressable>
      {expanded ? (
        <View accessibilityRole="radiogroup" style={[styles.options, { gap: theme.spacing.sm }]}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setExpanded(false);
                }}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primarySoft
                      : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    borderRadius: theme.radii.md,
                    minHeight: 56,
                  },
                  pressed && styles.pressed,
                ]}>
                <AppText color={isSelected ? 'primary' : 'text'} weight="semibold">
                  {option.label}
                </AppText>
                {isSelected ? (
                  <Feather color={theme.colors.primary} name="check-circle" size={27} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
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
  control: {
    width: '100%',
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  value: {
    flex: 1,
  },
  options: {
    width: '100%',
  },
  option: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
