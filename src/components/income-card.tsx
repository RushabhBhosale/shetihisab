import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { LargeButton } from '@/components/large-button';
import { PaymentStatusLabel } from '@/components/payment-status-label';
import { SimpleCard } from '@/components/simple-card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppStore } from '@/store/app-store';
import type { Income } from '@/types/app';
import { formatCurrency, formatDate } from '@/utils/format';

export function IncomeCard({ income, onView }: { income: Income; onView: () => void }) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  return (
    <SimpleCard style={[styles.card, { gap: theme.spacing.md }]}> 
      <View style={styles.top}>
        <View style={styles.title}>
          <AppText variant="heading" weight="bold">
            {income.cropName ?? t('incomes.income')}
          </AppText>
          {income.buyerName ? <AppText color="secondary">{income.buyerName}</AppText> : null}
        </View>
        <AppText color="primary" variant="heading" weight="bold">
          {formatCurrency(income.totalAmount, language)}
        </AppText>
      </View>
      <PaymentStatusLabel
        label={t(`paymentStatus.${income.paymentStatus}`)}
        status={income.paymentStatus}
      />
      <AppText color="secondary">{formatDate(income.date, language)}</AppText>
      <LargeButton icon="eye" onPress={onView} title={t('incomes.viewDetails')} variant="secondary" />
    </SimpleCard>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%' },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { flex: 1 },
});
