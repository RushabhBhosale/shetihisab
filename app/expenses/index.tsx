import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ExpenseCard } from '@/components/expense-card';
import { LargeButton } from '@/components/large-button';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { SimpleCard } from '@/components/simple-card';
import { expenseRepository } from '@/database/repositories/expense-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';
import { useAppStore } from '@/store/app-store';
import { formatCurrency, todayIsoDate } from '@/utils/format';

export default function ExpensesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const loadExpenses = useCallback(async () => {
    const [expenses, total, today] = await Promise.all([
      expenseRepository.getAllExpenses(),
      expenseRepository.getExpenseTotal(),
      expenseRepository.getTodayExpenseTotal(todayIsoDate()),
    ]);
    return { expenses, total, today };
  }, []);
  const { data, loading, error, reload } = useScreenData(loadExpenses);

  if (loading && !data) return <LoadingScreen message={t('expenses.loading')} />;
  if (error && !data) return <ErrorState message={t('expenses.loadError')} onRetry={() => void reload()} />;

  return (
    <ScreenContainer>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('expenses.title')} />
      <LargeButton icon="plus" onPress={() => router.push('/expenses/add')} title={t('expenses.addExpense')} />
      <View style={[styles.totals, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
        <TotalCard label={t('expenses.totalExpenses')} value={formatCurrency(data?.total ?? 0, language)} />
        <TotalCard label={t('expenses.todayExpenses')} value={formatCurrency(data?.today ?? 0, language)} />
      </View>
      {data?.expenses.length ? (
        <View style={[styles.list, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}> 
          {data.expenses.map((expense) => (
            <ExpenseCard expense={expense} key={expense.id} onView={() => router.push(`/expenses/${expense.id}`)} />
          ))}
        </View>
      ) : (
        <EmptyState
          actionLabel={t('expenses.addExpense')}
          description={t('expenses.emptyDescription')}
          icon="arrow-up-circle"
          onAction={() => router.push('/expenses/add')}
          title={t('expenses.emptyTitle')}
        />
      )}
    </ScreenContainer>
  );
}

function TotalCard({ label, value }: { label: string; value: string }) {
  return <SimpleCard><AppText color="secondary" weight="semibold">{label}</AppText><AppText variant="heading" weight="bold">{value}</AppText></SimpleCard>;
}

const styles = StyleSheet.create({
  totals: { width: '100%' },
  list: { width: '100%' },
});
