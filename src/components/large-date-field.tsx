import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Feather from '@expo/vector-icons/Feather';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppStore } from '@/store/app-store';
import { formatDate, parseIsoDate, toIsoDate } from '@/utils/format';

export interface LargeDateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optionalLabel?: string;
  error?: string;
}

export function LargeDateField({
  label,
  value,
  onChange,
  optionalLabel,
  error,
}: LargeDateFieldProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const [showIosPicker, setShowIosPicker] = useState(false);
  const displayValue = formatDate(value || null, language) ?? t('common.chooseDate');

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'set' && date) {
      onChange(toIsoDate(date));
    }
  };

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: parseIsoDate(value),
        mode: 'date',
        onChange: handleChange,
      });
      return;
    }
    setShowIosPicker((current) => !current);
  };

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
        onPress={openPicker}
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
        <Feather color={theme.colors.primary} name="calendar" size={27} />
        <AppText color={value ? 'text' : 'secondary'} weight="semibold" style={styles.value}>
          {displayValue}
        </AppText>
        {value ? (
          <Pressable
            accessibilityLabel={t('common.clearDate', { label })}
            accessibilityRole="button"
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onChange('');
            }}
            style={styles.clear}>
            <Feather color={theme.colors.danger} name="x-circle" size={28} />
            <AppText color="danger" variant="small" weight="bold">
              {t('common.clear')}
            </AppText>
          </Pressable>
        ) : null}
      </Pressable>
      {Platform.OS === 'ios' && showIosPicker ? (
        <DateTimePicker
          display="spinner"
          mode="date"
          onChange={handleChange}
          value={parseIsoDate(value)}
        />
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
  clear: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pressed: {
    opacity: 0.7,
  },
});
