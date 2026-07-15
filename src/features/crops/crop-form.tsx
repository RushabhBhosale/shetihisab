import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { LargeButton } from '@/components/large-button';
import { LargeDateField } from '@/components/large-date-field';
import { LargeSelect } from '@/components/large-select';
import { LargeTextInput } from '@/components/large-text-input';
import { SimpleFormSection } from '@/components/simple-form-section';
import { cropSchema, type CropFormValues } from '@/features/crops/crop-schema';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { CropInput, Farm } from '@/types/app';

interface CropFormProps {
  farms: Farm[];
  initialValues: CropFormValues;
  submitLabel: string;
  onAddFarm: () => void;
  onSubmit: (input: CropInput) => Promise<void>;
}

const quickCropKeys = ['sugarcane', 'wheat', 'rice', 'soybean', 'cotton'] as const;

export function CropForm({
  farms,
  initialValues,
  submitLabel,
  onAddFarm,
  onSubmit,
}: CropFormProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CropFormValues>({
    resolver: zodResolver(cropSchema),
    defaultValues: initialValues,
  });

  const save = handleSubmit(async (values) => {
    if (saving) {
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        farmId: values.farmId ? Number(values.farmId) : null,
        cropName: values.cropName,
        area: values.area ? Number(values.area) : null,
        areaUnit: values.areaUnit,
        season: values.season || null,
        plantingDate: values.plantingDate || null,
        expectedHarvestDate: values.expectedHarvestDate || null,
        notes: values.notes || null,
      });
    } catch {
      Alert.alert(t('common.somethingWrong'), t('crops.saveError'));
    } finally {
      setSaving(false);
    }
  });

  const farmOptions = [
    { value: '', label: t('crops.noFarm') },
    ...farms.map((farm) => ({ value: String(farm.id), label: farm.name })),
  ];
  const unitOptions = [
    { value: 'guntha', label: t('units.guntha') },
    { value: 'acre', label: t('units.acre') },
    { value: 'hectare', label: t('units.hectare') },
  ];

  return (
    <View style={[styles.form, { gap: theme.spacing.lg }]}>
      <SimpleFormSection title={t('crops.quickChoose')}>
        <View style={styles.quickOptions}>
          {quickCropKeys.map((key) => (
            <QuickCropButton
              key={key}
              label={t(`cropNames.${key}`)}
              onPress={() => setValue('cropName', t(`cropNames.${key}`), { shouldValidate: true })}
            />
          ))}
          <QuickCropButton
            label={t('cropNames.other')}
            onPress={() => setValue('cropName', '', { shouldValidate: false })}
          />
        </View>
      </SimpleFormSection>
      <Controller
        control={control}
        name="cropName"
        render={({ field: { onBlur, onChange, value } }) => (
          <LargeTextInput
            autoCapitalize="words"
            error={errors.cropName?.message ? t(errors.cropName.message) : undefined}
            label={t('crops.cropName')}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t('crops.cropNamePlaceholder')}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="farmId"
        render={({ field: { onChange, value } }) => (
          <LargeSelect
            label={t('crops.farm')}
            onChange={onChange}
            optionalLabel={t('setup.profile.optional')}
            options={farmOptions}
            value={value}
          />
        )}
      />
      <LargeButton
        icon="plus"
        onPress={onAddFarm}
        title={t('crops.addFarmFirst')}
        variant="secondary"
      />
      <SimpleFormSection>
        <Controller
          control={control}
          name="area"
          render={({ field: { onBlur, onChange, value } }) => (
            <LargeTextInput
              error={errors.area?.message ? t(errors.area.message) : undefined}
              keyboardType="decimal-pad"
              label={t('crops.area')}
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
        name="season"
        render={({ field: { onBlur, onChange, value } }) => (
          <LargeTextInput
            autoCapitalize="words"
            label={t('crops.season')}
            onBlur={onBlur}
            onChangeText={onChange}
            optionalLabel={t('setup.profile.optional')}
            placeholder={t('crops.seasonPlaceholder')}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="plantingDate"
        render={({ field: { onChange, value } }) => (
          <LargeDateField
            label={t('crops.plantingDate')}
            onChange={onChange}
            optionalLabel={t('setup.profile.optional')}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="expectedHarvestDate"
        render={({ field: { onChange, value } }) => (
          <LargeDateField
            error={
              errors.expectedHarvestDate?.message
                ? t(errors.expectedHarvestDate.message)
                : undefined
            }
            label={t('crops.expectedHarvestDate')}
            onChange={onChange}
            optionalLabel={t('setup.profile.optional')}
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

function QuickCropButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickButton,
        {
          backgroundColor: theme.colors.primarySoft,
          borderColor: theme.colors.primary,
          borderRadius: theme.radii.md,
          minHeight: 52,
        },
        pressed && styles.pressed,
      ]}>
      <AppText color="primary" variant="small" weight="bold" style={styles.quickText}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  quickOptions: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickButton: {
    minWidth: '46%',
    flexGrow: 1,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickText: {
    textAlign: 'center',
  },
  notes: {
    minHeight: 120,
  },
  pressed: {
    opacity: 0.7,
  },
});
