import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { DetailRow } from '@/components/detail-row';
import { ErrorState } from '@/components/error-state';
import { LargeButton } from '@/components/large-button';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { SimpleCard } from '@/components/simple-card';
import { reminderRepository } from '@/database/repositories/reminder-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';
import { cancelReminderNotification } from '@/services/notification-service';
import { useAppStore } from '@/store/app-store';
import { formatDate } from '@/utils/format';

export default function ReminderDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const reminderId = Number(useLocalSearchParams<{ id?: string }>().id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [working, setWorking] = useState(false);
  const loadReminder = useCallback(async () => {
    const reminder = await reminderRepository.getReminderById(reminderId);
    if (!reminder) throw new Error('Reminder not found.');
    return reminder;
  }, [reminderId]);
  const { data: reminder, loading, error, reload } = useScreenData(loadReminder);
  if (loading && !reminder) return <LoadingScreen message={t('reminders.loading')} />;
  if (error || !reminder) return <ErrorState message={t('reminders.notFound')} onRetry={() => void reload()} />;
  const complete = async () => {
    setWorking(true);
    try {
      await reminderRepository.markReminderComplete(reminder.id);
      await cancelReminderNotification(reminder.notificationId);
      Alert.alert(t('common.saved'), t('reminders.markedComplete'));
      await reload();
    } catch {
      Alert.alert(t('common.somethingWrong'), t('common.pleaseTryAgain'));
    } finally {
      setWorking(false);
    }
  };
  const remove = async () => {
    setWorking(true);
    try {
      await reminderRepository.deleteReminder(reminder.id);
      await cancelReminderNotification(reminder.notificationId);
      setConfirmDelete(false);
      Alert.alert(t('common.saved'), t('reminders.deleted'), [
        { text: t('common.continue'), onPress: () => router.replace('/reminders') },
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
        <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('reminders.detailsTitle')} />
        <AppText variant="title" weight="bold">{reminder.title}</AppText>
        <SimpleCard style={[styles.details, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
          <DetailRow icon={reminder.isCompleted ? 'check-circle' : 'clock'} label={t('reminders.status')} value={reminder.isCompleted ? t('reminders.completedStatus') : t('reminders.upcomingStatus')} />
          <DetailRow icon="calendar" label={t('common.date')} value={formatDate(reminder.date, language) ?? reminder.date} />
          {reminder.cropName ? <DetailRow icon="sun" label={t('reminders.crop')} value={reminder.cropName} /> : null}
          {reminder.notes ? <DetailRow icon="file-text" label={t('common.notes')} value={reminder.notes} /> : null}
        </SimpleCard>
        <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
          {!reminder.isCompleted ? <LargeButton icon="check-circle" loading={working} onPress={() => void complete()} title={t('reminders.markComplete')} /> : null}
          <LargeButton icon="edit-2" onPress={() => router.push(`/reminders/edit/${reminder.id}`)} title={t('common.edit')} variant="secondary" />
          <LargeButton icon="trash-2" onPress={() => setConfirmDelete(true)} title={t('common.delete')} variant="danger" />
        </View>
      </ScreenContainer>
      <ConfirmationDialog cancelLabel={t('common.cancel')} confirmLabel={t('common.delete')} destructive loading={working} message={t('reminders.deleteMessage')} onCancel={() => setConfirmDelete(false)} onConfirm={() => void remove()} title={t('reminders.deleteTitle')} visible={confirmDelete} />
    </>
  );
}

const styles = StyleSheet.create({ details: { width: '100%' }, actions: { width: '100%' } });
