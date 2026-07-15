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

export default function EditCropScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const cropId = Number(params.id);
  const loadData = useCallback(async () => {
    const [crop, farms] = await Promise.all([
      cropRepository.getCropById(cropId),
      farmRepository.getAllFarms(),
    ]);
    if (!crop) {
      throw new Error('Crop not found.');
    }
    return { crop, farms };
  }, [cropId]);
  const { data, loading, error, reload } = useScreenData(loadData);

  if (loading && !data) {
    return <LoadingScreen message={t('crops.loading')} />;
  }
  if (error || !data) {
    return <ErrorState message={t('crops.notFound')} onRetry={() => void reload()} />;
  }

  const { crop, farms } = data;
  return (
    <ScreenContainer keyboardSafe>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('crops.editTitle')} />
      <CropForm
        farms={farms}
        initialValues={{
          cropName: crop.cropName,
          farmId: crop.farmId === null ? '' : String(crop.farmId),
          area: crop.area === null ? '' : String(crop.area),
          areaUnit: crop.areaUnit,
          season: crop.season ?? '',
          plantingDate: crop.plantingDate ?? '',
          expectedHarvestDate: crop.expectedHarvestDate ?? '',
          notes: crop.notes ?? '',
        }}
        onAddFarm={() => router.push('/farms/add')}
        onSubmit={async (input) => {
          await cropRepository.updateCrop(crop.id, input);
          Alert.alert(t('common.saved'), t('crops.updated'), [
            { text: t('common.view'), onPress: () => router.replace(`/crops/${crop.id}`) },
          ]);
        }}
        submitLabel={t('common.saveChanges')}
      />
    </ScreenContainer>
  );
}
