import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { ErrorState } from '@/components/error-state';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { cropRepository } from '@/database/repositories/crop-repository';
import { expenseRepository } from '@/database/repositories/expense-repository';
import { ExpenseForm } from '@/features/expenses/expense-form';
import { useScreenData } from '@/hooks/use-screen-data';
import { todayIsoDate } from '@/utils/format';

export default function AddExpenseScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ cropId?: string }>();
  const loadCrops = useCallback(() => cropRepository.getAllCrops(), []);
  const { data: crops, loading, error, reload } = useScreenData(loadCrops);
  if (loading && !crops) return <LoadingScreen message={t('crops.loading')} />;
  if (error || !crops) return <ErrorState message={t('crops.loadError')} onRetry={() => void reload()} />;
  const requestedCropId = Number(params.cropId);
  const cropId = crops.some((crop) => crop.id === requestedCropId) ? String(requestedCropId) : '';
  return (
    <ScreenContainer keyboardSafe>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('expenses.addTitle')} />
      <ExpenseForm
        crops={crops}
        initialValues={{ category: 'seeds', amount: '', cropId, date: todayIsoDate(), notes: '' }}
        onSubmit={async (input) => {
          const expense = await expenseRepository.createExpense(input);
          Alert.alert(t('common.saved'), t('expenses.created'), [
            { text: t('common.view'), onPress: () => router.replace(`/expenses/${expense.id}`) },
          ]);
        }}
        submitLabel={t('expenses.addExpense')}
      />
    </ScreenContainer>
  );
}
