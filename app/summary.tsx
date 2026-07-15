import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { FinancialSummaryCard } from '@/components/financial-summary-card';
import { LargeButton } from '@/components/large-button';
import { LargeSelect } from '@/components/large-select';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { SimpleCard } from '@/components/simple-card';
import { summaryRepository } from '@/database/repositories/summary-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';
import { useAppStore } from '@/store/app-store';
import type { SummaryRange } from '@/types/app';
import { formatCurrency } from '@/utils/format';

export default function SummaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const [range, setRange] = useState<SummaryRange>('month');
  const loadSummary = useCallback(async () => {
    const [totals, crops] = await Promise.all([
      summaryRepository.getFinancialTotals(range),
      summaryRepository.getCropSummaries(range),
    ]);
    return { totals, crops };
  }, [range]);
  const { data, loading, error, reload } = useScreenData(loadSummary);
  if (loading && !data) return <LoadingScreen message={t('summary.loading')} />;
  if (error && !data) return <ErrorState message={t('summary.loadError')} onRetry={() => void reload()} />;
  return (
    <ScreenContainer>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('summary.title')} />
      <LargeSelect
        label={t('summary.period')}
        onChange={(value) => setRange(value as SummaryRange)}
        options={[
          { value: 'month', label: t('summary.thisMonth') },
          { value: 'year', label: t('summary.thisYear') },
          { value: 'all', label: t('summary.allTime') },
        ]}
        value={range}
      />
      {loading ? <AppText color="secondary" style={styles.loading}>{t('summary.refreshing')}</AppText> : null}
      <View style={{ marginTop: theme.spacing.lg }}><FinancialSummaryCard totals={data?.totals ?? { totalExpense: 0, totalIncome: 0, pendingAmount: 0, profit: 0 }} /></View>
      <View style={[styles.crops, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}> 
        <AppText variant="heading" weight="bold">{t('summary.cropSummary')}</AppText>
        {data?.crops.length ? data.crops.map((crop) => (
          <SimpleCard key={crop.cropId} style={[styles.cropCard, { gap: theme.spacing.sm }]}> 
            <AppText variant="heading" weight="bold">{crop.cropName}</AppText>
            <SummaryRow label={t('home.totalExpense')} value={formatCurrency(crop.totalExpense, language)} />
            <SummaryRow label={t('home.totalIncome')} value={formatCurrency(crop.totalIncome, language)} />
            <SummaryRow label={t('home.profit')} value={formatCurrency(crop.profit, language)} />
            <LargeButton icon="eye" onPress={() => router.push(`/crops/${crop.cropId}`)} title={t('common.view')} variant="secondary" />
          </SimpleCard>
        )) : <EmptyState description={t('summary.emptyDescription')} icon="pie-chart" title={t('summary.emptyTitle')} />}
      </View>
    </ScreenContainer>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.row}><AppText color="secondary">{label}</AppText><AppText weight="bold">{value}</AppText></View>;
}

const styles = StyleSheet.create({
  loading: { textAlign: 'center', marginTop: 8 },
  crops: { width: '100%' },
  cropCard: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
});
