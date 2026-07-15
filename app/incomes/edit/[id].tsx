import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { ErrorState } from '@/components/error-state';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { cropRepository } from '@/database/repositories/crop-repository';
import { incomeRepository } from '@/database/repositories/income-repository';
import { IncomeForm } from '@/features/incomes/income-form';
import { useScreenData } from '@/hooks/use-screen-data';

export default function EditIncomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const incomeId = Number(useLocalSearchParams<{ id?: string }>().id);
  const loadData = useCallback(async () => {
    const [income, crops] = await Promise.all([incomeRepository.getIncomeById(incomeId), cropRepository.getAllCrops()]);
    if (!income) throw new Error('Income not found.');
    return { income, crops };
  }, [incomeId]);
  const { data, loading, error, reload } = useScreenData(loadData);
  if (loading && !data) return <LoadingScreen message={t('incomes.loading')} />;
  if (error || !data) return <ErrorState message={t('incomes.notFound')} onRetry={() => void reload()} />;
  const { income, crops } = data;
  return (
    <ScreenContainer keyboardSafe>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('incomes.editTitle')} />
      <IncomeForm
        crops={crops}
        initialValues={{
          cropId: income.cropId === null ? '' : String(income.cropId),
          buyerName: income.buyerName ?? '',
          totalAmount: String(income.totalAmount),
          amountReceived: String(income.amountReceived),
          quantity: income.quantity === null ? '' : String(income.quantity),
          unit: income.unit ?? '',
          rate: income.rate === null ? '' : String(income.rate),
          date: income.date,
          notes: income.notes ?? '',
        }}
        onSubmit={async (input) => {
          await incomeRepository.updateIncome(incomeId, input);
          Alert.alert(t('common.saved'), t('incomes.updated'), [
            { text: t('common.view'), onPress: () => router.replace(`/incomes/${incomeId}`) },
          ]);
        }}
        submitLabel={t('common.saveChanges')}
      />
    </ScreenContainer>
  );
}
