import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { ErrorState } from '@/components/error-state';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { cropRepository } from '@/database/repositories/crop-repository';
import { reminderRepository } from '@/database/repositories/reminder-repository';
import { ReminderForm } from '@/features/reminders/reminder-form';
import { useScreenData } from '@/hooks/use-screen-data';
import { cancelReminderNotification, scheduleReminderNotification } from '@/services/notification-service';

export default function EditReminderScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const reminderId = Number(useLocalSearchParams<{ id?: string }>().id);
  const loadData = useCallback(async () => {
    const [reminder, crops] = await Promise.all([reminderRepository.getReminderById(reminderId), cropRepository.getAllCrops()]);
    if (!reminder) throw new Error('Reminder not found.');
    return { reminder, crops };
  }, [reminderId]);
  const { data, loading, error, reload } = useScreenData(loadData);
  if (loading && !data) return <LoadingScreen message={t('reminders.loading')} />;
  if (error || !data) return <ErrorState message={t('reminders.notFound')} onRetry={() => void reload()} />;
  return (
    <ScreenContainer keyboardSafe>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('reminders.editTitle')} />
      <ReminderForm
        crops={data.crops}
        initialValues={{ title: data.reminder.title, cropId: data.reminder.cropId === null ? '' : String(data.reminder.cropId), date: data.reminder.date, notes: data.reminder.notes ?? '' }}
        onSubmit={async (input) => {
          const nextNotificationId = data.reminder.isCompleted
            ? null
            : await scheduleReminderNotification(input.title, input.date, t('reminders.notificationBody'));
          try {
            await reminderRepository.updateReminder(reminderId, { ...input, isCompleted: data.reminder.isCompleted, notificationId: nextNotificationId });
            await cancelReminderNotification(data.reminder.notificationId);
            Alert.alert(t('common.saved'), t('reminders.updated'), [
              { text: t('common.view'), onPress: () => router.replace(`/reminders/${reminderId}`) },
            ]);
          } catch (error) {
            await cancelReminderNotification(nextNotificationId);
            throw error;
          }
        }}
        submitLabel={t('common.saveChanges')}
      />
    </ScreenContainer>
  );
}
