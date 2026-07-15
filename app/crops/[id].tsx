import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { DetailRow } from '@/components/detail-row';
import { ErrorState } from '@/components/error-state';
import { ExpenseCard } from '@/components/expense-card';
import { FinancialSummaryCard } from '@/components/financial-summary-card';
import { IncomeCard } from '@/components/income-card';
import { LargeButton } from '@/components/large-button';
import { LoadingScreen } from '@/components/loading-screen';
import { ReminderCard } from '@/components/reminder-card';
import { ScreenContainer } from '@/components/screen-container';
import { SimpleCard } from '@/components/simple-card';
import { StatusLabel } from '@/components/status-label';
import { cropRepository } from '@/database/repositories/crop-repository';
import { expenseRepository } from '@/database/repositories/expense-repository';
import { incomeRepository } from '@/database/repositories/income-repository';
import { reminderRepository } from '@/database/repositories/reminder-repository';
import { summaryRepository } from '@/database/repositories/summary-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';
import { useAppStore } from '@/store/app-store';
import { formatArea, formatDate } from '@/utils/format';

export default function CropDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const cropId = Number(useLocalSearchParams<{ id?: string }>().id);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [working, setWorking] = useState(false);
  const loadCrop = useCallback(async () => {
    const [crop, totals, expenses, incomes, reminders] = await Promise.all([
      cropRepository.getCropById(cropId),
      summaryRepository.getCropFinancialTotals(cropId),
      expenseRepository.getExpensesByCropId(cropId),
      incomeRepository.getIncomesByCropId(cropId),
      reminderRepository.getRemindersByCropId(cropId),
    ]);
    if (!crop) throw new Error('Crop not found.');
    return { crop, totals, expenses, incomes, reminders };
  }, [cropId]);
  const { data, loading, error, reload } = useScreenData(loadCrop);
  if (loading && !data) return <LoadingScreen message={t('crops.loading')} />;
  if (error || !data) return <ErrorState message={t('crops.notFound')} onRetry={() => void reload()} />;
  const { crop, totals, expenses, incomes, reminders } = data;
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
        <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('crops.detailsTitle')} />
        <AppText accessibilityRole="header" variant="title" weight="bold">{crop.cropName}</AppText>
        <View style={{ marginTop: theme.spacing.md }}><StatusLabel label={t(crop.status === 'active' ? 'crops.statusActive' : 'crops.statusCompleted')} status={crop.status} /></View>
        <SimpleCard style={[styles.full, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
          {crop.farmName ? <DetailRow icon="map" label={t('crops.farm')} value={crop.farmName} /> : null}
          {area ? <DetailRow icon="maximize" label={t('crops.area')} value={area} /> : null}
          {crop.season ? <DetailRow icon="cloud" label={t('crops.season')} value={crop.season} /> : null}
          {plantingDate ? <DetailRow icon="calendar" label={t('crops.plantingDate')} value={plantingDate} /> : null}
          {harvestDate ? <DetailRow icon="calendar" label={t('crops.expectedHarvestDate')} value={harvestDate} /> : null}
          {crop.notes ? <DetailRow icon="file-text" label={t('common.notes')} value={crop.notes} /> : null}
        </SimpleCard>
        <View style={{ marginTop: theme.spacing.lg }}><FinancialSummaryCard totals={totals} showPending={false} /></View>
        <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
          <LargeButton icon="arrow-up-circle" onPress={() => router.push({ pathname: '/expenses/add', params: { cropId: String(crop.id) } })} title={t('expenses.addExpense')} />
          <LargeButton icon="arrow-down-circle" onPress={() => router.push({ pathname: '/incomes/add', params: { cropId: String(crop.id) } })} title={t('incomes.addIncome')} />
          <LargeButton icon="bell" onPress={() => router.push({ pathname: '/reminders/add', params: { cropId: String(crop.id) } })} title={t('reminders.addReminder')} />
        </View>
        <DataSection title={t('expenses.title')} empty={t('expenses.cropEmpty')}>{expenses.map((expense) => <ExpenseCard expense={expense} key={expense.id} onView={() => router.push(`/expenses/${expense.id}`)} />)}</DataSection>
        <DataSection title={t('incomes.title')} empty={t('incomes.cropEmpty')}>{incomes.map((income) => <IncomeCard income={income} key={income.id} onView={() => router.push(`/incomes/${income.id}`)} />)}</DataSection>
        <DataSection title={t('reminders.title')} empty={t('reminders.cropEmpty')}>{reminders.map((reminder) => <ReminderCard reminder={reminder} key={reminder.id} onView={() => router.push(`/reminders/${reminder.id}`)} />)}</DataSection>
        <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}> 
          <LargeButton icon="edit-2" onPress={() => router.push(`/crops/edit/${crop.id}`)} title={t('crops.editCrop')} variant="secondary" />
          <LargeButton icon={crop.status === 'active' ? 'check-circle' : 'play-circle'} loading={working} onPress={() => void changeStatus()} title={t(crop.status === 'active' ? 'crops.markCompleted' : 'crops.markActive')} variant="secondary" />
          <LargeButton icon="trash-2" onPress={() => setConfirmingDelete(true)} title={t('crops.deleteCrop')} variant="danger" />
        </View>
      </ScreenContainer>
      <ConfirmationDialog cancelLabel={t('common.cancel')} confirmLabel={t('crops.deleteCrop')} destructive loading={working} message={t('crops.deleteMessage')} onCancel={() => setConfirmingDelete(false)} onConfirm={() => void deleteCrop()} title={t('crops.deleteTitle', { name: crop.cropName })} visible={confirmingDelete} />
    </>
  );
}

function DataSection({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  const theme = useAppTheme();
  return <View style={[styles.section, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}><AppText variant="heading" weight="bold">{title}</AppText>{children.length ? children : <SimpleCard><AppText color="secondary" style={styles.center}>{empty}</AppText></SimpleCard>}</View>;
}

const styles = StyleSheet.create({
  full: { width: '100%' },
  actions: { width: '100%' },
  section: { width: '100%' },
  center: { textAlign: 'center' },
});
