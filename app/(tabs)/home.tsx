import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ActivityCard } from '@/components/activity-card';
import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { CropCard } from '@/components/crop-card';
import { ErrorState } from '@/components/error-state';
import { FinancialSummaryCard } from '@/components/financial-summary-card';
import { LargeButton } from '@/components/large-button';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { SimpleCard } from '@/components/simple-card';
import { activityRepository } from '@/database/repositories/activity-repository';
import { cropRepository } from '@/database/repositories/crop-repository';
import { farmRepository } from '@/database/repositories/farm-repository';
import { reminderRepository } from '@/database/repositories/reminder-repository';
import { summaryRepository } from '@/database/repositories/summary-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';
import { useAppStore } from '@/store/app-store';
import { getActivityRoute } from '@/utils/activity-route';
import { formatDate, todayIsoDate } from '@/utils/format';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const profile = useAppStore((state) => state.profile);
  const loadHome = useCallback(async () => {
    const [totals, nextReminder, activity, farms, activeCrops] = await Promise.all([
      summaryRepository.getFinancialTotals('all'),
      reminderRepository.getNextReminder(todayIsoDate()),
      activityRepository.getRecentActivity(5),
      farmRepository.getAllFarms(),
      cropRepository.getActiveCrops(),
    ]);
    return { totals, nextReminder, activity, farmCount: farms.length, activeCrops };
  }, []);
  const { data, loading, error, reload } = useScreenData(loadHome);
  if (loading && !data) return <LoadingScreen />;
  if (error && !data) return <ErrorState message={t('home.loadError')} onRetry={() => void reload()} />;
  const totals = data?.totals ?? { totalExpense: 0, totalIncome: 0, pendingAmount: 0, profit: 0 };
  return (
    <ScreenContainer>
      <AppHeader action={{ icon: 'settings', label: t('common.settings'), onPress: () => router.push('/settings') }} title={t('common.appName')} />
      <AppText accessibilityRole="header" variant="heading" weight="bold">{t('home.greeting', { name: profile?.name ?? '' })}</AppText>
      <SimpleCard style={[styles.counts, { gap: theme.spacing.lg, marginTop: theme.spacing.lg }]}> 
        <CountRow label={t('home.totalFarms')} value={data?.farmCount ?? 0} />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <CountRow label={t('home.activeCrops')} value={data?.activeCrops.length ?? 0} />
      </SimpleCard>
      <View style={{ marginTop: theme.spacing.lg }}><FinancialSummaryCard totals={totals} /></View>
      <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
        <LargeButton icon="plus-circle" onPress={() => router.push('/(tabs)/add')} title={t('home.addNewEntry')} />
        <LargeButton icon="list" onPress={() => router.push('/summary')} title={t('summary.viewSummary')} variant="secondary" />
      </View>
      <View style={[styles.section, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}> 
        <AppText variant="heading" weight="bold">{t('home.nextReminder')}</AppText>
        {data?.nextReminder ? (
          <SimpleCard style={[styles.card, { gap: theme.spacing.sm }]}> 
            <AppText variant="heading" weight="bold">{data.nextReminder.title}</AppText>
            {data.nextReminder.cropName ? <AppText color="secondary">{data.nextReminder.cropName}</AppText> : null}
            <AppText color="primary" weight="semibold">{formatDate(data.nextReminder.date, language)}</AppText>
            <LargeButton icon="eye" onPress={() => router.push(`/reminders/${data.nextReminder?.id}`)} title={t('common.view')} variant="secondary" />
          </SimpleCard>
        ) : (
          <SimpleCard style={[styles.card, { gap: theme.spacing.md }]}> 
            <AppText color="secondary">{t('home.noReminder')}</AppText>
            <LargeButton icon="plus" onPress={() => router.push('/reminders/add')} title={t('reminders.addReminder')} variant="secondary" />
          </SimpleCard>
        )}
      </View>
      <View style={[styles.section, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}> 
        <AppText variant="heading" weight="bold">{t('home.activeCropsTitle')}</AppText>
        {data?.activeCrops.length ? data.activeCrops.slice(0, 3).map((crop) => (
          <CropCard compact crop={crop} key={crop.id} onView={() => router.push(`/crops/${crop.id}`)} />
        )) : (
          <SimpleCard style={[styles.card, { gap: theme.spacing.md }]}> 
            <AppText color="secondary" style={styles.center}>{t('home.noActiveCrops')}</AppText>
            <LargeButton icon="plus" onPress={() => router.push('/crops/add')} title={t('crops.addCrop')} variant="secondary" />
          </SimpleCard>
        )}
      </View>
      <View style={[styles.section, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}> 
        <AppText variant="heading" weight="bold">{t('home.recentActivity')}</AppText>
        {data?.activity.length ? data.activity.map((activity) => (
          <ActivityCard activity={activity} key={activity.id} onPress={() => router.push(getActivityRoute(activity))} />
        )) : <SimpleCard><AppText color="secondary" style={styles.center}>{t('home.noActivity')}</AppText></SimpleCard>}
      </View>
      <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}> 
        <LargeButton icon="arrow-up-circle" onPress={() => router.push('/expenses')} title={t('expenses.title')} variant="secondary" />
        <LargeButton icon="arrow-down-circle" onPress={() => router.push('/incomes')} title={t('incomes.title')} variant="secondary" />
        <LargeButton icon="bell" onPress={() => router.push('/reminders')} title={t('reminders.title')} variant="secondary" />
        <LargeButton icon="map" onPress={() => router.push('/farms')} title={t('home.manageFarms')} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}

function CountRow({ label, value }: { label: string; value: number }) {
  return <View><AppText variant="label" weight="semibold">{label}</AppText><AppText variant="heading" weight="bold">{value}</AppText></View>;
}

const styles = StyleSheet.create({
  actions: { width: '100%' },
  counts: { width: '100%' },
  divider: { width: '100%', height: 1 },
  section: { width: '100%' },
  card: { width: '100%' },
  center: { textAlign: 'center' },
});
