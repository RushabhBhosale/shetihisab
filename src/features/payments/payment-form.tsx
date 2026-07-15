import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LargeButton } from '@/components/large-button';
import { LargeDateField } from '@/components/large-date-field';
import { LargeTextInput } from '@/components/large-text-input';
import { createPaymentSchema, type PaymentFormValues } from '@/features/payments/payment-schema';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { PaymentInput } from '@/types/app';

interface PaymentFormProps {
  incomeId: number;
  maximumAmount: number;
  initialValues: PaymentFormValues;
  submitLabel: string;
  onSubmit: (input: PaymentInput) => Promise<void>;
}

export function PaymentForm({
  incomeId,
  maximumAmount,
  initialValues,
  submitLabel,
  onSubmit,
}: PaymentFormProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(createPaymentSchema(maximumAmount)),
    defaultValues: initialValues,
  });
  const save = handleSubmit(async (values) => {
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit({
        incomeId,
        amount: Number(values.amount),
        date: values.date,
        notes: values.notes || null,
      });
    } catch {
      Alert.alert(t('common.somethingWrong'), t('payments.saveError'));
    } finally {
      setSaving(false);
    }
  });

  return (
    <View style={[styles.form, { gap: theme.spacing.lg }]}> 
      <Controller
        control={control}
        name="amount"
        render={({ field: { onBlur, onChange, value } }) => (
          <LargeTextInput
            error={errors.amount?.message ? t(errors.amount.message) : undefined}
            keyboardType="decimal-pad"
            label={t('payments.amount')}
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
          <LargeDateField label={t('common.date')} onChange={onChange} value={value} />
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
  notes: { minHeight: 120 },
});
