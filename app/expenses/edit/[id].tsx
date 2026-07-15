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

export default function EditExpenseScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const expenseId = Number(useLocalSearchParams<{ id?: string }>().id);
  const loadData = useCallback(async () => {
    const [expense, crops] = await Promise.all([
      expenseRepository.getExpenseById(expenseId),
      cropRepository.getAllCrops(),
    ]);
    if (!expense) throw new Error('Expense not found.');
    return { expense, crops };
  }, [expenseId]);
  const { data, loading, error, reload } = useScreenData(loadData);
  if (loading && !data) return <LoadingScreen message={t('expenses.loading')} />;
  if (error || !data) return <ErrorState message={t('expenses.notFound')} onRetry={() => void reload()} />;
  return (
    <ScreenContainer keyboardSafe>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('expenses.editTitle')} />
      <ExpenseForm
        crops={data.crops}
        initialValues={{
          category: data.expense.category,
          amount: String(data.expense.amount),
          cropId: data.expense.cropId === null ? '' : String(data.expense.cropId),
          date: data.expense.date,
          notes: data.expense.notes ?? '',
        }}
        onSubmit={async (input) => {
          await expenseRepository.updateExpense(expenseId, input);
          Alert.alert(t('common.saved'), t('expenses.updated'), [
            { text: t('common.view'), onPress: () => router.replace(`/expenses/${expenseId}`) },
          ]);
        }}
        submitLabel={t('common.saveChanges')}
      />
    </ScreenContainer>
  );
}
