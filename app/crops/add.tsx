import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { ErrorState } from '@/components/error-state';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { cropRepository } from '@/database/repositories/crop-repository';
import { farmRepository } from '@/database/repositories/farm-repository';
import { CropForm } from '@/features/crops/crop-form';
import { useScreenData } from '@/hooks/use-screen-data';
import { useAppStore } from '@/store/app-store';

export default function AddCropScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ farmId?: string }>();
  const defaultAreaUnit = useAppStore((state) => state.defaultAreaUnit);
  const loadFarms = useCallback(() => farmRepository.getAllFarms(), []);
  const { data: farms, loading, error, reload } = useScreenData(loadFarms);

  if (loading && !farms) {
    return <LoadingScreen message={t('farms.loading')} />;
  }
  if (error || !farms) {
    return <ErrorState message={t('farms.loadError')} onRetry={() => void reload()} />;
  }

  const requestedFarmId = Number(params.farmId);
  const initialFarmId = farms.some((farm) => farm.id === requestedFarmId)
    ? String(requestedFarmId)
    : '';

  return (
    <ScreenContainer keyboardSafe>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('crops.addTitle')} />
      <CropForm
        farms={farms}
        initialValues={{
          cropName: '',
          farmId: initialFarmId,
          area: '',
          areaUnit: defaultAreaUnit,
          season: '',
          plantingDate: '',
          expectedHarvestDate: '',
          notes: '',
        }}
        onAddFarm={() => router.push('/farms/add')}
        onSubmit={async (input) => {
          const crop = await cropRepository.createCrop(input);
          Alert.alert(t('common.saved'), t('crops.created'), [
            { text: t('common.view'), onPress: () => router.replace(`/crops/${crop.id}`) },
          ]);
        }}
        submitLabel={t('crops.addCrop')}
      />
    </ScreenContainer>
  );
}
