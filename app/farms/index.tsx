import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { FarmCard } from '@/components/farm-card';
import { LargeButton } from '@/components/large-button';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { farmRepository } from '@/database/repositories/farm-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';

export default function FarmsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const loadFarms = useCallback(async () => {
    const farms = await farmRepository.getAllFarms();
    return Promise.all(
      farms.map(async (farm) => ({
        farm,
        cropCount: await farmRepository.getFarmCropCount(farm.id),
      })),
    );
  }, []);
  const { data, loading, error, reload } = useScreenData(loadFarms);

  if (loading && !data) {
    return <LoadingScreen message={t('farms.loading')} />;
  }
  if (error && !data) {
    return <ErrorState message={t('farms.loadError')} onRetry={() => void reload()} />;
  }

  return (
    <ScreenContainer>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('farms.title')} />
      <LargeButton icon="plus" onPress={() => router.push('/farms/add')} title={t('farms.addFarm')} />
      {data?.length ? (
        <View style={[styles.list, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}>
          {data.map(({ farm, cropCount }) => (
            <FarmCard
              cropCount={cropCount}
              farm={farm}
              key={farm.id}
              onView={() => router.push(`/farms/${farm.id}`)}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          actionLabel={t('farms.addFarm')}
          description={t('farms.emptyDescription')}
          icon="map"
          onAction={() => router.push('/farms/add')}
          title={t('farms.emptyTitle')}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
});
