import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { LargeButton } from '@/components/large-button';
import { LargeDateField } from '@/components/large-date-field';
import { LargeSelect } from '@/components/large-select';
import { LargeTextInput } from '@/components/large-text-input';
import { SimpleFormSection } from '@/components/simple-form-section';
import { incomeSchema, type IncomeFormValues } from '@/features/incomes/income-schema';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { Crop, IncomeInput } from '@/types/app';
import { roundMoney } from '@/utils/finance';

interface IncomeFormProps {
  crops: Crop[];
  initialValues: IncomeFormValues;
  submitLabel: string;
  onSubmit: (input: IncomeInput) => Promise<void>;
}

export function IncomeForm({ crops, initialValues, submitLabel, onSubmit }: IncomeFormProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: initialValues,
  });
  const quantity = useWatch({ control, name: 'quantity' });
  const rate = useWatch({ control, name: 'rate' });

  useEffect(() => {
    const parsedQuantity = Number(quantity);
    const parsedRate = Number(rate);
    if (quantity && rate && parsedQuantity > 0 && parsedRate > 0) {
      setValue('totalAmount', String(roundMoney(parsedQuantity * parsedRate)), {
        shouldValidate: true,
      });
    }
  }, [quantity, rate, setValue]);

  const save = handleSubmit(async (values) => {
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit({
        cropId: Number(values.cropId),
        buyerName: values.buyerName || null,
        totalAmount: Number(values.totalAmount),
        amountReceived: Number(values.amountReceived),
        quantity: values.quantity ? Number(values.quantity) : null,
        unit: values.unit || null,
        rate: values.rate ? Number(values.rate) : null,
        date: values.date,
        notes: values.notes || null,
      });
    } catch {
      Alert.alert(t('common.somethingWrong'), t('incomes.saveError'));
    } finally {
      setSaving(false);
    }
  });

  const cropOptions = [
    { value: '', label: t('incomes.chooseCrop') },
    ...crops.map((crop) => ({ value: String(crop.id), label: crop.cropName })),
  ];

  return (
    <View style={[styles.form, { gap: theme.spacing.lg }]}> 
      <Controller
        control={control}
        name="cropId"
        render={({ field: { onChange, value } }) => (
          <LargeSelect
            error={errors.cropId?.message ? t(errors.cropId.message) : undefined}
            label={t('incomes.crop')}
            onChange={onChange}
            options={cropOptions}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="buyerName"
        render={({ field: { onBlur, onChange, value } }) => (
          <LargeTextInput
            autoCapitalize="words"
            label={t('incomes.buyerName')}
            onBlur={onBlur}
            onChangeText={onChange}
            optionalLabel={t('setup.profile.optional')}
            placeholder={t('incomes.buyerPlaceholder')}
            value={value}
          />
        )}
      />
      <SimpleFormSection title={t('incomes.quantitySection')}>
        <AppText color="secondary" variant="small">
          {t('incomes.quantityHelp')}
        </AppText>
        <Controller
          control={control}
          name="quantity"
          render={({ field: { onBlur, onChange, value } }) => (
            <LargeTextInput
              error={errors.quantity?.message ? t(errors.quantity.message) : undefined}
              keyboardType="decimal-pad"
              label={t('incomes.quantity')}
              onBlur={onBlur}
              onChangeText={onChange}
              optionalLabel={t('setup.profile.optional')}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="unit"
          render={({ field: { onBlur, onChange, value } }) => (
            <LargeTextInput
              label={t('incomes.unit')}
              onBlur={onBlur}
              onChangeText={onChange}
              optionalLabel={t('setup.profile.optional')}
              placeholder={t('incomes.unitPlaceholder')}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="rate"
          render={({ field: { onBlur, onChange, value } }) => (
            <LargeTextInput
              error={errors.rate?.message ? t(errors.rate.message) : undefined}
              keyboardType="decimal-pad"
              label={t('incomes.rate')}
              onBlur={onBlur}
              onChangeText={onChange}
              optionalLabel={t('setup.profile.optional')}
              value={value}
            />
          )}
        />
      </SimpleFormSection>
      <Controller
        control={control}
        name="totalAmount"
        render={({ field: { onBlur, onChange, value } }) => (
          <LargeTextInput
            error={errors.totalAmount?.message ? t(errors.totalAmount.message) : undefined}
            keyboardType="decimal-pad"
            label={t('incomes.totalAmount')}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t('incomes.amountPlaceholder')}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="amountReceived"
        render={({ field: { onBlur, onChange, value } }) => (
          <LargeTextInput
            error={errors.amountReceived?.message ? t(errors.amountReceived.message) : undefined}
            keyboardType="decimal-pad"
            label={t('incomes.amountReceived')}
            onBlur={onBlur}
            onChangeText={onChange}
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
