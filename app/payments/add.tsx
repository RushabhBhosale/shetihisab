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
import { todayIsoDate } from '@/utils/format';

export default function AddPaymentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const incomeId = Number(useLocalSearchParams<{ incomeId?: string }>().incomeId);
  const loadIncome = useCallback(async () => {
    const income = await incomeRepository.getIncomeById(incomeId);
    if (!income || income.pendingAmount <= 0) throw new Error('Income not payable.');
    return income;
  }, [incomeId]);
  const { data: income, loading, error, reload } = useScreenData(loadIncome);
  if (loading && !income) return <LoadingScreen message={t('payments.loading')} />;
  if (error || !income) return <ErrorState message={t('payments.notAvailable')} onRetry={() => void reload()} />;
  return (
    <ScreenContainer keyboardSafe>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('payments.addTitle')} />
      <PaymentForm
        incomeId={income.id}
        initialValues={{ amount: '', date: todayIsoDate(), notes: '' }}
        maximumAmount={income.pendingAmount}
        onSubmit={async (input) => {
          await paymentRepository.createPayment(input);
          Alert.alert(t('common.saved'), t('payments.created'), [
            { text: t('common.view'), onPress: () => router.replace(`/incomes/${income.id}`) },
          ]);
        }}
        submitLabel={t('payments.addPayment')}
      />
    </ScreenContainer>
  );
}
