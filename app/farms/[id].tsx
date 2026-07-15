import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { CropCard } from '@/components/crop-card';
import { DetailRow } from '@/components/detail-row';
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
import { formatArea } from '@/utils/format';

export default function FarmDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const params = useLocalSearchParams<{ id?: string }>();
  const farmId = Number(params.id);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const loadFarm = useCallback(async () => {
    if (!Number.isInteger(farmId) || farmId <= 0) {
      throw new Error('Invalid farm id.');
    }
    const [farm, cropCount, crops] = await Promise.all([
      farmRepository.getFarmById(farmId),
      farmRepository.getFarmCropCount(farmId),
      cropRepository.getCropsByFarmId(farmId),
    ]);
    if (!farm) {
      throw new Error('Farm not found.');
    }
    return { farm, cropCount, crops };
  }, [farmId]);
  const { data, loading, error, reload } = useScreenData(loadFarm);

  if (loading && !data) {
    return <LoadingScreen message={t('farms.loading')} />;
  }
  if (error || !data) {
    return <ErrorState message={t('farms.notFound')} onRetry={() => void reload()} />;
  }

  const { farm, cropCount, crops } = data;
  const area = formatArea(farm.totalArea, farm.areaUnit, t(`units.${farm.areaUnit}`), language);

  const deleteFarm = async () => {
    setDeleting(true);
    try {
      await farmRepository.deleteFarm(farm.id);
      setConfirmingDelete(false);
      Alert.alert(t('common.saved'), t('farms.deleted'), [
        { text: t('common.continue'), onPress: () => router.replace('/farms') },
      ]);
    } catch {
      Alert.alert(t('common.somethingWrong'), t('common.pleaseTryAgain'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <ScreenContainer>
        <AppHeader
          backLabel={t('common.back')}
          onBack={() => router.back()}
          title={t('farms.detailsTitle')}
        />
        <AppText accessibilityRole="header" variant="title" weight="bold">
          {farm.name}
        </AppText>
        <SimpleCard style={[styles.details, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}>
          {farm.village ? <DetailRow icon="map-pin" label={t('setup.profile.village')} value={farm.village} /> : null}
          {area ? <DetailRow icon="maximize" label={t('farms.totalArea')} value={area} /> : null}
          <DetailRow icon="sun" label={t('crops.title')} value={t('farms.cropCount', { count: cropCount })} />
          {farm.notes ? <DetailRow icon="file-text" label={t('common.notes')} value={farm.notes} /> : null}
        </SimpleCard>
        <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}>
          <LargeButton
            icon="plus"
            onPress={() => router.push({ pathname: '/crops/add', params: { farmId: String(farm.id) } })}
            title={t('crops.addCrop')}
          />
          <LargeButton
            icon="edit-2"
            onPress={() => router.push(`/farms/edit/${farm.id}`)}
            title={t('farms.editFarm')}
            variant="secondary"
          />
          <LargeButton
            icon="trash-2"
            onPress={() => setConfirmingDelete(true)}
            title={t('farms.deleteFarm')}
            variant="danger"
          />
        </View>
        <View style={[styles.crops, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}>
          <AppText accessibilityRole="header" variant="heading" weight="bold">
            {t('farms.connectedCrops')}
          </AppText>
          {crops.length ? (
            crops.map((crop) => (
              <CropCard crop={crop} key={crop.id} onView={() => router.push(`/crops/${crop.id}`)} />
            ))
          ) : (
            <SimpleCard>
              <AppText color="secondary" style={styles.center}>{t('farms.noConnectedCrops')}</AppText>
            </SimpleCard>
          )}
        </View>
      </ScreenContainer>
      <ConfirmationDialog
        cancelLabel={t('common.cancel')}
        confirmLabel={t('farms.deleteFarm')}
        destructive
        loading={deleting}
        message={cropCount > 0 ? t('farms.deleteWithCrops') : t('farms.deleteMessage')}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => void deleteFarm()}
        title={t('farms.deleteTitle', { name: farm.name })}
        visible={confirmingDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  details: { width: '100%' },
  actions: { width: '100%' },
  crops: { width: '100%' },
  center: { textAlign: 'center' },
});
