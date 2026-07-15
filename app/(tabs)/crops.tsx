import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { CropCard } from '@/components/crop-card';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LargeButton } from '@/components/large-button';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { SimpleCard } from '@/components/simple-card';
import { cropRepository } from '@/database/repositories/crop-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';

export default function CropsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const loadCrops = useCallback(async () => {
    const [active, completed] = await Promise.all([
      cropRepository.getActiveCrops(),
      cropRepository.getCompletedCrops(),
    ]);
    return { active, completed };
  }, []);
  const { data, loading, error, reload } = useScreenData(loadCrops);

  if (loading && !data) {
    return <LoadingScreen message={t('crops.loading')} />;
  }
  if (error && !data) {
    return <ErrorState message={t('crops.loadError')} onRetry={() => void reload()} />;
  }

  const active = data?.active ?? [];
  const completed = data?.completed ?? [];
  const hasCrops = active.length + completed.length > 0;

  return (
    <ScreenContainer>
      <AppHeader title={t('crops.title')} />
      <View style={[styles.topActions, { gap: theme.spacing.md }]}>
        <LargeButton icon="plus" onPress={() => router.push('/crops/add')} title={t('crops.addCrop')} />
        <LargeButton icon="map" onPress={() => router.push('/farms')} title={t('home.manageFarms')} variant="secondary" />
      </View>
      {!hasCrops ? (
        <EmptyState
          actionLabel={t('crops.addCrop')}
          description={t('crops.emptyDescription')}
          icon="sun"
          onAction={() => router.push('/crops/add')}
          title={t('crops.emptyTitle')}
        />
      ) : (
        <View style={[styles.sections, { gap: theme.spacing.xl, marginTop: theme.spacing.xl }]}>
          <CropSection
            crops={active}
            emptyMessage={t('crops.noActive')}
            onView={(id) => router.push(`/crops/${id}`)}
            title={t('crops.activeTitle')}
          />
          <CropSection
            crops={completed}
            emptyMessage={t('crops.noCompleted')}
            onView={(id) => router.push(`/crops/${id}`)}
            title={t('crops.completedTitle')}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

function CropSection({ crops, title, emptyMessage, onView }: { crops: Awaited<ReturnType<typeof cropRepository.getAllCrops>>; title: string; emptyMessage: string; onView: (id: number) => void }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.section, { gap: theme.spacing.md }]}>
      <AppText accessibilityRole="header" variant="heading" weight="bold">{title}</AppText>
      {crops.length ? crops.map((crop) => <CropCard crop={crop} key={crop.id} onView={() => onView(crop.id)} />) : (
        <SimpleCard><AppText color="secondary" style={styles.center}>{emptyMessage}</AppText></SimpleCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topActions: { width: '100%' },
  sections: { width: '100%' },
  section: { width: '100%' },
  center: { textAlign: 'center' },
});
