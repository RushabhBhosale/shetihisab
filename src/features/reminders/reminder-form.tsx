import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { LargeButton } from '@/components/large-button';
import { LargeDateField } from '@/components/large-date-field';
import { LargeSelect } from '@/components/large-select';
import { LargeTextInput } from '@/components/large-text-input';
import { SimpleFormSection } from '@/components/simple-form-section';
import { reminderSchema, type ReminderFormValues } from '@/features/reminders/reminder-schema';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { Crop, ReminderInput } from '@/types/app';

const quickReminderKeys = [
  'waterCrop',
  'addFertilizer',
  'sprayPesticide',
  'harvestCrop',
  'collectPayment',
  'payLabour',
] as const;

interface ReminderFormProps {
  crops: Crop[];
  initialValues: ReminderFormValues;
  submitLabel: string;
  onSubmit: (input: ReminderInput) => Promise<void>;
}

export function ReminderForm({ crops, initialValues, submitLabel, onSubmit }: ReminderFormProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: initialValues,
  });
  const save = handleSubmit(async (values) => {
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit({
        title: values.title,
        cropId: values.cropId ? Number(values.cropId) : null,
        date: values.date,
        notes: values.notes || null,
      });
    } catch {
      Alert.alert(t('common.somethingWrong'), t('reminders.saveError'));
    } finally {
      setSaving(false);
    }
  });
  const cropOptions = [
    { value: '', label: t('crops.noCrop') },
    ...crops.map((crop) => ({ value: String(crop.id), label: crop.cropName })),
  ];

  return (
    <View style={[styles.form, { gap: theme.spacing.lg }]}> 
      <SimpleFormSection title={t('reminders.quickOptions')}>
        <View style={styles.quickOptions}>
          {quickReminderKeys.map((key) => (
            <Pressable
              accessibilityRole="button"
              key={key}
              onPress={() =>
                setValue('title', t(`reminderOptions.${key}`), { shouldValidate: true })
              }
              style={({ pressed }) => [
                styles.quickButton,
                {
                  backgroundColor: theme.colors.primarySoft,
                  borderColor: theme.colors.primary,
                  borderRadius: theme.radii.md,
                },
                pressed && styles.pressed,
              ]}>
              <AppText color="primary" variant="small" weight="bold" style={styles.center}>
                {t(`reminderOptions.${key}`)}
              </AppText>
            </Pressable>
          ))}
        </View>
      </SimpleFormSection>
      <Controller
        control={control}
        name="title"
        render={({ field: { onBlur, onChange, value } }) => (
          <LargeTextInput
            error={errors.title?.message ? t(errors.title.message) : undefined}
            label={t('reminders.reminderTitle')}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t('reminders.titlePlaceholder')}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="cropId"
        render={({ field: { onChange, value } }) => (
          <LargeSelect
            label={t('reminders.crop')}
            onChange={onChange}
            optionalLabel={t('setup.profile.optional')}
            options={cropOptions}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, value } }) => (
          <LargeDateField
            error={errors.date?.message ? t(errors.date.message) : undefined}
            label={t('common.date')}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field: { onBlur, onChange, value } }) => (
          <LargeTextInput
            label={t('common.notes')}
            multiline
            numberOfLines={4}
            onBlur={onBlur}
            onChangeText={onChange}
            optionalLabel={t('setup.profile.optional')}
            style={styles.notes}
            textAlignVertical="top"
            value={value}
          />
        )}
      />
      <LargeButton icon="check" loading={saving} onPress={() => void save()} title={submitLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { width: '100%' },
  quickOptions: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickButton: {
    minWidth: '46%',
    minHeight: 52,
    flexGrow: 1,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  center: { textAlign: 'center' },
  notes: { minHeight: 120 },
  pressed: { opacity: 0.7 },
});
