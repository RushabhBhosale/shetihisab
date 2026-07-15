import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { SimpleCard } from '@/components/simple-card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppStore } from '@/store/app-store';
import type { FinancialTotals } from '@/types/app';
import { formatCurrency } from '@/utils/format';

export function FinancialSummaryCard({
  totals,
  showPending = true,
}: {
  totals: FinancialTotals;
  showPending?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const rows = [
    { label: t('home.totalExpense'), value: totals.totalExpense },
    { label: t('home.totalIncome'), value: totals.totalIncome },
    ...(showPending ? [{ label: t('home.pendingPayment'), value: totals.pendingAmount }] : []),
    { label: t('home.profit'), value: totals.profit, highlight: true },
  ];
  return (
    <SimpleCard style={[styles.card, { gap: theme.spacing.md }]}> 
      {rows.map((row, index) => (
        <View key={row.label} style={[styles.group, { gap: theme.spacing.md }]}> 
          {index ? <View style={[styles.divider, { backgroundColor: theme.colors.border }]} /> : null}
          <View style={styles.row}>
            <AppText variant="label" weight="semibold">
              {row.label}
            </AppText>
            <AppText color={row.highlight ? 'primary' : 'text'} variant="heading" weight="bold">
              {formatCurrency(row.value, language)}
            </AppText>
          </View>
        </View>
      ))}
    </SimpleCard>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%' },
  group: { width: '100%' },
  divider: { width: '100%', height: 1 },
  row: { width: '100%', gap: 4 },
});
