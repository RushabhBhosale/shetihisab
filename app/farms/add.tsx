import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { ScreenContainer } from '@/components/screen-container';
import { farmRepository } from '@/database/repositories/farm-repository';
import { FarmForm } from '@/features/farms/farm-form';
import { useAppStore } from '@/store/app-store';

export default function AddFarmScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const defaultAreaUnit = useAppStore((state) => state.defaultAreaUnit);

  return (
    <ScreenContainer keyboardSafe>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('farms.addTitle')} />
      <FarmForm
        initialValues={{
          name: '',
          village: '',
          totalArea: '',
          areaUnit: defaultAreaUnit,
          notes: '',
        }}
        onSubmit={async (input) => {
          const farm = await farmRepository.createFarm(input);
          Alert.alert(t('common.saved'), t('farms.created'), [
            { text: t('common.view'), onPress: () => router.replace(`/farms/${farm.id}`) },
          ]);
        }}
        submitLabel={t('farms.addFarm')}
      />
    </ScreenContainer>
  );
}
