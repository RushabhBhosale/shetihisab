import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { LargeButton } from '@/components/large-button';
import { SimpleCard } from '@/components/simple-card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppStore } from '@/store/app-store';
import type { Expense } from '@/types/app';
import { formatCurrency, formatDate } from '@/utils/format';

export function ExpenseCard({ expense, onView }: { expense: Expense; onView: () => void }) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  return (
    <SimpleCard style={[styles.card, { gap: theme.spacing.md }]}> 
      <View style={styles.top}>
        <View style={styles.title}>
          <AppText variant="heading" weight="bold">
            {t(`expenseCategories.${expense.category}`)}
          </AppText>
          {expense.cropName ? <AppText color="secondary">{expense.cropName}</AppText> : null}
        </View>
        <AppText color="danger" variant="heading" weight="bold">
          {formatCurrency(expense.amount, language)}
        </AppText>
      </View>
      <AppText color="secondary">{formatDate(expense.date, language)}</AppText>
      <LargeButton icon="eye" onPress={onView} title={t('expenses.viewDetails')} variant="secondary" />
    </SimpleCard>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%' },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { flex: 1 },
});
