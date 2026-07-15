import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { CropCard } from '@/components/crop-card';
import { ErrorState } from '@/components/error-state';
import { LargeButton } from '@/components/large-button';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { SimpleCard } from '@/components/simple-card';
import { cropRepository } from '@/database/repositories/crop-repository';
import { farmRepository } from '@/database/repositories/farm-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';
import { useAppStore } from '@/store/app-store';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const profile = useAppStore((state) => state.profile);
  const loadHome = useCallback(async () => {
    const [farms, activeCrops] = await Promise.all([
      farmRepository.getAllFarms(),
      cropRepository.getActiveCrops(),
    ]);
    return { farmCount: farms.length, activeCrops };
  }, []);
  const { data, loading, error, reload } = useScreenData(loadHome);

  if (loading && !data) {
    return <LoadingScreen />;
  }
  if (error && !data) {
    return <ErrorState message={t('home.loadError')} onRetry={() => void reload()} />;
  }

  const activeCrops = data?.activeCrops ?? [];
  return (
    <ScreenContainer>
      <AppHeader
        action={{ icon: 'settings', label: t('common.settings'), onPress: () => router.push('/settings') }}
        title={t('common.appName')}
      />
      <AppText accessibilityRole="header" variant="heading" weight="bold">
        {t('home.greeting', { name: profile?.name ?? '' })}
      </AppText>
      <SimpleCard style={[styles.summary, { gap: theme.spacing.lg, marginTop: theme.spacing.lg }]}>
        <AmountRow label={t('home.totalFarms')} value={String(data?.farmCount ?? 0)} />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <AmountRow label={t('home.activeCrops')} value={String(activeCrops.length)} />
      </SimpleCard>
      <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}>
        <LargeButton icon="map" onPress={() => router.push('/farms')} title={t('home.manageFarms')} variant="secondary" />
      </View>
      <SimpleCard style={[styles.summary, { gap: theme.spacing.lg, marginTop: theme.spacing.lg }]}>
        <AmountRow label={t('home.totalExpense')} value={t('home.zeroAmount')} />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <AmountRow label={t('home.totalIncome')} value={t('home.zeroAmount')} />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <AmountRow highlight label={t('home.profit')} value={t('home.zeroAmount')} />
      </SimpleCard>
      <View style={{ marginTop: theme.spacing.lg }}>
        <LargeButton icon="plus-circle" onPress={() => router.push('/(tabs)/add')} title={t('home.addNewEntry')} />
      </View>
      <View style={[styles.active, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}>
        <AppText accessibilityRole="header" variant="heading" weight="bold">{t('home.activeCropsTitle')}</AppText>
        {activeCrops.length ? activeCrops.slice(0, 3).map((crop) => (
          <CropCard compact crop={crop} key={crop.id} onView={() => router.push(`/crops/${crop.id}`)} />
        )) : (
          <SimpleCard style={[styles.empty, { gap: theme.spacing.md }]}>
            <AppText variant="heading" weight="bold" style={styles.center}>{t('home.noActiveCrops')}</AppText>
            <AppText color="secondary" style={styles.center}>{t('home.addFirstCrop')}</AppText>
            <LargeButton icon="plus" onPress={() => router.push('/crops/add')} title={t('crops.addCrop')} />
          </SimpleCard>
        )}
      </View>
    </ScreenContainer>
  );
}

function AmountRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <View style={styles.amountRow}><AppText variant="label" weight="semibold">{label}</AppText><AppText color={highlight ? 'primary' : 'text'} variant="amount" weight="bold">{value}</AppText></View>;
}

const styles = StyleSheet.create({
  summary: { width: '100%' },
  amountRow: { gap: 4 },
  divider: { width: '100%', height: 1 },
  actions: { width: '100%' },
  active: { width: '100%' },
  empty: { width: '100%' },
  center: { textAlign: 'center' },
});
