import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { DetailRow } from '@/components/detail-row';
import { ErrorState } from '@/components/error-state';
import { LargeButton } from '@/components/large-button';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { SimpleCard } from '@/components/simple-card';
import { expenseRepository } from '@/database/repositories/expense-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';
import { useAppStore } from '@/store/app-store';
import { formatCurrency, formatDate } from '@/utils/format';

export default function ExpenseDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const expenseId = Number(useLocalSearchParams<{ id?: string }>().id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const loadExpense = useCallback(async () => {
    const expense = await expenseRepository.getExpenseById(expenseId);
    if (!expense) throw new Error('Expense not found.');
    return expense;
  }, [expenseId]);
  const { data: expense, loading, error, reload } = useScreenData(loadExpense);
  if (loading && !expense) return <LoadingScreen message={t('expenses.loading')} />;
  if (error || !expense) return <ErrorState message={t('expenses.notFound')} onRetry={() => void reload()} />;
  const remove = async () => {
    setDeleting(true);
    try {
      await expenseRepository.deleteExpense(expense.id);
      setConfirmDelete(false);
      Alert.alert(t('common.saved'), t('expenses.deleted'), [
        { text: t('common.continue'), onPress: () => router.replace('/expenses') },
      ]);
    } catch {
      Alert.alert(t('common.somethingWrong'), t('common.pleaseTryAgain'));
    } finally {
      setDeleting(false);
    }
  };
  return (
    <>
      <ScreenContainer>
        <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('expenses.detailsTitle')} />
        <AppText variant="title" weight="bold">{t(`expenseCategories.${expense.category}`)}</AppText>
        <SimpleCard style={[styles.details, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
          <DetailRow icon="dollar-sign" label={t('expenses.amount')} value={formatCurrency(expense.amount, language)} />
          {expense.cropName ? <DetailRow icon="sun" label={t('expenses.crop')} value={expense.cropName} /> : null}
          <DetailRow icon="calendar" label={t('common.date')} value={formatDate(expense.date, language) ?? expense.date} />
          {expense.notes ? <DetailRow icon="file-text" label={t('common.notes')} value={expense.notes} /> : null}
        </SimpleCard>
        <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
          <LargeButton icon="edit-2" onPress={() => router.push(`/expenses/edit/${expense.id}`)} title={t('expenses.editExpense')} />
          <LargeButton icon="trash-2" onPress={() => setConfirmDelete(true)} title={t('expenses.deleteExpense')} variant="danger" />
        </View>
      </ScreenContainer>
      <ConfirmationDialog
        cancelLabel={t('common.cancel')}
        confirmLabel={t('expenses.deleteExpense')}
        destructive
        loading={deleting}
        message={t('expenses.deleteMessage')}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void remove()}
        title={t('expenses.deleteTitle')}
        visible={confirmDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({ details: { width: '100%' }, actions: { width: '100%' } });
