import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { ErrorState } from '@/components/error-state';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { incomeRepository } from '@/database/repositories/income-repository';
import { paymentRepository } from '@/database/repositories/payment-repository';
import { PaymentForm } from '@/features/payments/payment-form';
import { useScreenData } from '@/hooks/use-screen-data';

export default function EditPaymentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const paymentId = Number(useLocalSearchParams<{ id?: string }>().id);
  const loadData = useCallback(async () => {
    const payment = await paymentRepository.getPaymentById(paymentId);
    if (!payment) throw new Error('Payment not found.');
    const income = await incomeRepository.getIncomeById(payment.incomeId);
    if (!income) throw new Error('Income not found.');
    return { payment, income };
  }, [paymentId]);
  const { data, loading, error, reload } = useScreenData(loadData);
  if (loading && !data) return <LoadingScreen message={t('payments.loading')} />;
  if (error || !data) return <ErrorState message={t('payments.notFound')} onRetry={() => void reload()} />;
  return (
    <ScreenContainer keyboardSafe>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('payments.editTitle')} />
      <PaymentForm
        incomeId={data.income.id}
        initialValues={{ amount: String(data.payment.amount), date: data.payment.date, notes: data.payment.notes ?? '' }}
        maximumAmount={data.income.pendingAmount + data.payment.amount}
        onSubmit={async (input) => {
          await paymentRepository.updatePayment(paymentId, input);
          Alert.alert(t('common.saved'), t('payments.updated'), [
            { text: t('common.view'), onPress: () => router.replace(`/incomes/${data.income.id}`) },
          ]);
        }}
        submitLabel={t('common.saveChanges')}
      />
    </ScreenContainer>
  );
}
