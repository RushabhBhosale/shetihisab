import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { IncomeCard } from '@/components/income-card';
import { LargeButton } from '@/components/large-button';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { SimpleCard } from '@/components/simple-card';
import { incomeRepository } from '@/database/repositories/income-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';
import { useAppStore } from '@/store/app-store';
import { formatCurrency } from '@/utils/format';

export default function IncomesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const loadIncomes = useCallback(async () => {
    const [incomes, totals] = await Promise.all([
      incomeRepository.getAllIncomes(),
      incomeRepository.getIncomeTotals(),
    ]);
    return { incomes, totals };
  }, []);
  const { data, loading, error, reload } = useScreenData(loadIncomes);
  if (loading && !data) return <LoadingScreen message={t('incomes.loading')} />;
  if (error && !data) return <ErrorState message={t('incomes.loadError')} onRetry={() => void reload()} />;
  return (
    <ScreenContainer>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('incomes.title')} />
      <LargeButton icon="plus" onPress={() => router.push('/incomes/add')} title={t('incomes.addIncome')} />
      <SimpleCard style={[styles.total, { gap: theme.spacing.sm, marginTop: theme.spacing.lg }]}> 
        <AppText color="secondary" weight="semibold">{t('home.totalIncome')}</AppText>
        <AppText variant="heading" weight="bold">{formatCurrency(data?.totals.totalIncome ?? 0, language)}</AppText>
        <AppText color="secondary">{t('home.pendingPayment')}: {formatCurrency(data?.totals.pendingAmount ?? 0, language)}</AppText>
      </SimpleCard>
      {data?.incomes.length ? (
        <View style={[styles.list, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}> 
          {data.incomes.map((income) => (
            <IncomeCard income={income} key={income.id} onView={() => router.push(`/incomes/${income.id}`)} />
          ))}
        </View>
      ) : (
        <EmptyState actionLabel={t('incomes.addIncome')} description={t('incomes.emptyDescription')} icon="arrow-down-circle" onAction={() => router.push('/incomes/add')} title={t('incomes.emptyTitle')} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ total: { width: '100%' }, list: { width: '100%' } });
