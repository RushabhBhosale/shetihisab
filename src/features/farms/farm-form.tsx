import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LargeButton } from '@/components/large-button';
import { LargeSelect } from '@/components/large-select';
import { LargeTextInput } from '@/components/large-text-input';
import { SimpleFormSection } from '@/components/simple-form-section';
import { farmSchema, type FarmFormValues } from '@/features/farms/farm-schema';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { FarmInput } from '@/types/app';

interface FarmFormProps {
  initialValues: FarmFormValues;
  submitLabel: string;
  onSubmit: (input: FarmInput) => Promise<void>;
}

export function FarmForm({ initialValues, submitLabel, onSubmit }: FarmFormProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    defaultValues: initialValues,
  });

  const save = handleSubmit(async (values) => {
    if (saving) {
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        name: values.name,
        village: values.village || null,
        totalArea: values.totalArea ? Number(values.totalArea) : null,
        areaUnit: values.areaUnit,
        notes: values.notes || null,
      });
    } catch {
      Alert.alert(t('common.somethingWrong'), t('farms.saveError'));
    } finally {
      setSaving(false);
    }
  });

  const unitOptions = [
    { value: 'guntha', label: t('units.guntha') },
    { value: 'acre', label: t('units.acre') },
    { value: 'hectare', label: t('units.hectare') },
  ];

  return (
    <View style={[styles.form, { gap: theme.spacing.lg }]}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value } }) => (
          <LargeTextInput
            autoCapitalize="words"
            error={errors.name?.message ? t(errors.name.message) : undefined}
            label={t('farms.farmName')}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t('farms.farmNamePlaceholder')}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="village"
        render={({ field: { onBlur, onChange, value } }) => (
          <LargeTextInput
            autoCapitalize="words"
            label={t('setup.profile.village')}
            onBlur={onBlur}
            onChangeText={onChange}
            optionalLabel={t('setup.profile.optional')}
            placeholder={t('setup.profile.villagePlaceholder')}
            value={value}
          />
        )}
      />
      <SimpleFormSection>
        <Controller
          control={control}
          name="totalArea"
          render={({ field: { onBlur, onChange, value } }) => (
            <LargeTextInput
              error={errors.totalArea?.message ? t(errors.totalArea.message) : undefined}
              keyboardType="decimal-pad"
              label={t('farms.totalArea')}
              onBlur={onBlur}
              onChangeText={onChange}
              optionalLabel={t('setup.profile.optional')}
              placeholder={t('farms.areaPlaceholder')}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="areaUnit"
          render={({ field: { onChange, value } }) => (
            <LargeSelect
              label={t('farms.areaUnit')}
              onChange={onChange}
              options={unitOptions}
              value={value}
            />
          )}
        />
      </SimpleFormSection>
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
            placeholder={t('common.notesPlaceholder')}
            style={styles.notes}
            textAlignVertical="top"
            value={value}
          />
        )}
      />
      <LargeButton
        icon="check"
        loading={saving}
        onPress={() => void save()}
        title={submitLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  notes: {
    minHeight: 120,
  },
});
