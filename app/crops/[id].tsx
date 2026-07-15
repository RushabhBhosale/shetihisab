import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { ErrorState } from '@/components/error-state';
import { LargeButton } from '@/components/large-button';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { SimpleCard } from '@/components/simple-card';
import { StatusLabel } from '@/components/status-label';
import { cropRepository } from '@/database/repositories/crop-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';
import { useAppStore } from '@/store/app-store';
import { formatArea, formatDate } from '@/utils/format';

export default function CropDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const params = useLocalSearchParams<{ id?: string }>();
  const cropId = Number(params.id);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [working, setWorking] = useState(false);
  const loadCrop = useCallback(async () => {
    const crop = await cropRepository.getCropById(cropId);
    if (!crop) {
      throw new Error('Crop not found.');
    }
    return crop;
  }, [cropId]);
  const { data: crop, loading, error, reload } = useScreenData(loadCrop);

  if (loading && !crop) {
    return <LoadingScreen message={t('crops.loading')} />;
  }
  if (error || !crop) {
    return <ErrorState message={t('crops.notFound')} onRetry={() => void reload()} />;
  }

  const area = formatArea(crop.area, crop.areaUnit, t(`units.${crop.areaUnit}`), language);
  const plantingDate = formatDate(crop.plantingDate, language);
  const harvestDate = formatDate(crop.expectedHarvestDate, language);

  const changeStatus = async () => {
    setWorking(true);
    try {
      if (crop.status === 'active') {
        await cropRepository.markCropCompleted(crop.id);
        Alert.alert(t('common.saved'), t('crops.completed'));
      } else {
        await cropRepository.markCropActive(crop.id);
        Alert.alert(t('common.saved'), t('crops.activated'));
      }
      await reload();
    } catch {
      Alert.alert(t('common.somethingWrong'), t('common.pleaseTryAgain'));
    } finally {
      setWorking(false);
    }
  };

  const deleteCrop = async () => {
    setWorking(true);
    try {
      await cropRepository.deleteCrop(crop.id);
      setConfirmingDelete(false);
      Alert.alert(t('common.saved'), t('crops.deleted'), [
        { text: t('common.continue'), onPress: () => router.replace('/(tabs)/crops') },
      ]);
    } catch {
      Alert.alert(t('common.somethingWrong'), t('common.pleaseTryAgain'));
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <ScreenContainer>
        <AppHeader
          backLabel={t('common.back')}
          onBack={() => router.back()}
          title={t('crops.detailsTitle')}
        />
        <AppText accessibilityRole="header" variant="title" weight="bold">
          {crop.cropName}
        </AppText>
        <View style={{ marginTop: theme.spacing.md }}>
          <StatusLabel
            label={t(crop.status === 'active' ? 'crops.statusActive' : 'crops.statusCompleted')}
            status={crop.status}
          />
        </View>
        <SimpleCard style={[styles.details, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}>
          {crop.farmName ? <DetailRow icon="map" label={t('crops.farm')} value={crop.farmName} /> : null}
          {area ? <DetailRow icon="maximize" label={t('crops.area')} value={area} /> : null}
          {crop.season ? <DetailRow icon="cloud" label={t('crops.season')} value={crop.season} /> : null}
          {plantingDate ? <DetailRow icon="calendar" label={t('crops.plantingDate')} value={plantingDate} /> : null}
          {harvestDate ? <DetailRow icon="calendar" label={t('crops.expectedHarvestDate')} value={harvestDate} /> : null}
          {crop.notes ? <DetailRow icon="file-text" label={t('common.notes')} value={crop.notes} /> : null}
        </SimpleCard>
        <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}>
          <LargeButton
            icon="edit-2"
            onPress={() => router.push(`/crops/edit/${crop.id}`)}
            title={t('crops.editCrop')}
          />
          <LargeButton
            icon={crop.status === 'active' ? 'check-circle' : 'play-circle'}
            loading={working}
            onPress={() => void changeStatus()}
            title={t(crop.status === 'active' ? 'crops.markCompleted' : 'crops.markActive')}
            variant="secondary"
          />
          <LargeButton
            icon="trash-2"
            onPress={() => setConfirmingDelete(true)}
            title={t('crops.deleteCrop')}
            variant="danger"
          />
        </View>
      </ScreenContainer>
      <ConfirmationDialog
        cancelLabel={t('common.cancel')}
        confirmLabel={t('crops.deleteCrop')}
        destructive
        loading={working}
        message={t('crops.deleteMessage')}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => void deleteCrop()}
        title={t('crops.deleteTitle', { name: crop.cropName })}
        visible={confirmingDelete}
      />
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: 'map' | 'maximize' | 'cloud' | 'calendar' | 'file-text';
  label: string;
  value: string;
}) {
  const theme = useAppTheme();
  return (
    <View style={styles.detailRow}>
      <Feather color={theme.colors.primary} name={icon} size={27} />
      <View style={styles.detailText}>
        <AppText color="secondary" variant="small" weight="semibold">{label}</AppText>
        <AppText>{value}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  details: { width: '100%' },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailText: { flex: 1 },
  actions: { width: '100%' },
});
