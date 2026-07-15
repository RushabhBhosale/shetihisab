import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { ErrorState } from '@/components/error-state';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { farmRepository } from '@/database/repositories/farm-repository';
import { FarmForm } from '@/features/farms/farm-form';
import { useScreenData } from '@/hooks/use-screen-data';

export default function EditFarmScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const farmId = Number(params.id);
  const loadFarm = useCallback(async () => {
    const farm = await farmRepository.getFarmById(farmId);
    if (!farm) {
      throw new Error('Farm not found.');
    }
    return farm;
  }, [farmId]);
  const { data: farm, loading, error, reload } = useScreenData(loadFarm);

  if (loading && !farm) {
    return <LoadingScreen message={t('farms.loading')} />;
  }
  if (error || !farm) {
    return <ErrorState message={t('farms.notFound')} onRetry={() => void reload()} />;
  }

  return (
    <ScreenContainer keyboardSafe>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('farms.editTitle')} />
      <FarmForm
        initialValues={{
          name: farm.name,
          village: farm.village ?? '',
          totalArea: farm.totalArea === null ? '' : String(farm.totalArea),
          areaUnit: farm.areaUnit,
          notes: farm.notes ?? '',
        }}
        onSubmit={async (input) => {
          await farmRepository.updateFarm(farm.id, input);
          Alert.alert(t('common.saved'), t('farms.updated'), [
            { text: t('common.view'), onPress: () => router.replace(`/farms/${farm.id}`) },
          ]);
        }}
        submitLabel={t('common.saveChanges')}
      />
    </ScreenContainer>
  );
}
