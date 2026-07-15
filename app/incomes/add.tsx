import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { cropRepository } from '@/database/repositories/crop-repository';
import { incomeRepository } from '@/database/repositories/income-repository';
import { IncomeForm } from '@/features/incomes/income-form';
import { useScreenData } from '@/hooks/use-screen-data';
import { todayIsoDate } from '@/utils/format';

export default function AddIncomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ cropId?: string }>();
  const loadCrops = useCallback(() => cropRepository.getAllCrops(), []);
  const { data: crops, loading, error, reload } = useScreenData(loadCrops);
  if (loading && !crops) return <LoadingScreen message={t('crops.loading')} />;
  if (error || !crops) return <ErrorState message={t('crops.loadError')} onRetry={() => void reload()} />;
  if (!crops.length) {
    return <ScreenContainer><AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('incomes.addTitle')} /><EmptyState actionLabel={t('crops.addCrop')} description={t('incomes.cropNeeded')} icon="sun" onAction={() => router.push('/crops/add')} title={t('incomes.noCrops')} /></ScreenContainer>;
  }
  const requested = Number(params.cropId);
  const cropId = crops.some((crop) => crop.id === requested) ? String(requested) : '';
  return (
    <ScreenContainer keyboardSafe>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('incomes.addTitle')} />
      <IncomeForm
        crops={crops}
        initialValues={{ cropId, buyerName: '', totalAmount: '', amountReceived: '0', quantity: '', unit: '', rate: '', date: todayIsoDate(), notes: '' }}
        onSubmit={async (input) => {
          const income = await incomeRepository.createIncome(input);
          Alert.alert(t('common.saved'), t('incomes.created'), [
            { text: t('common.view'), onPress: () => router.replace(`/incomes/${income.id}`) },
          ]);
        }}
        submitLabel={t('incomes.addIncome')}
      />
    </ScreenContainer>
  );
}
