import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LargeButton } from '@/components/large-button';
import { LargeDateField } from '@/components/large-date-field';
import { LargeSelect } from '@/components/large-select';
import { LargeTextInput } from '@/components/large-text-input';
import { expenseCategories, expenseSchema, type ExpenseFormValues } from '@/features/expenses/expense-schema';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { Crop, ExpenseInput } from '@/types/app';

interface ExpenseFormProps {
  crops: Crop[];
  initialValues: ExpenseFormValues;
  submitLabel: string;
  onSubmit: (input: ExpenseInput) => Promise<void>;
}

export function ExpenseForm({ crops, initialValues, submitLabel, onSubmit }: ExpenseFormProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialValues,
  });

  const save = handleSubmit(async (values) => {
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit({
        category: values.category,
        amount: Number(values.amount),
        cropId: values.cropId ? Number(values.cropId) : null,
        date: values.date,
        notes: values.notes || null,
      });
    } catch {
      Alert.alert(t('common.somethingWrong'), t('expenses.saveError'));
    } finally {
      setSaving(false);
    }
  });

  const categoryOptions = expenseCategories.map((category) => ({
    value: category,
    label: t(`expenseCategories.${category}`),
  }));
  const cropOptions = [
    { value: '', label: t('crops.noCrop') },
    ...crops.map((crop) => ({ value: String(crop.id), label: crop.cropName })),
  ];

  return (
    <View style={[styles.form, { gap: theme.spacing.lg }]}> 
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <LargeSelect
            label={t('expenses.category')}
            onChange={onChange}
            options={categoryOptions}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="amount"
        render={({ field: { onBlur, onChange, value } }) => (
          <LargeTextInput
            error={errors.amount?.message ? t(errors.amount.message) : undefined}
            keyboardType="decimal-pad"
            label={t('expenses.amount')}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t('expenses.amountPlaceholder')}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="cropId"
        render={({ field: { onChange, value } }) => (
          <LargeSelect
            label={t('expenses.crop')}
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
            placeholder={t('common.notesPlaceholder')}
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
  notes: { minHeight: 120 },
});
