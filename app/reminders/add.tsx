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
import { todayIsoDate } from '@/utils/format';

export default function AddReminderScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ cropId?: string }>();
  const loadCrops = useCallback(() => cropRepository.getAllCrops(), []);
  const { data: crops, loading, error, reload } = useScreenData(loadCrops);
  if (loading && !crops) return <LoadingScreen message={t('crops.loading')} />;
  if (error || !crops) return <ErrorState message={t('crops.loadError')} onRetry={() => void reload()} />;
  const requested = Number(params.cropId);
  const cropId = crops.some((crop) => crop.id === requested) ? String(requested) : '';
  return (
    <ScreenContainer keyboardSafe>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('reminders.addTitle')} />
      <ReminderForm
        crops={crops}
        initialValues={{ title: '', cropId, date: todayIsoDate(), notes: '' }}
        onSubmit={async (input) => {
          const notificationId = await scheduleReminderNotification(input.title, input.date, t('reminders.notificationBody'));
          try {
            const reminder = await reminderRepository.createReminder({ ...input, notificationId });
            Alert.alert(t('common.saved'), t('reminders.created'), [
              { text: t('common.view'), onPress: () => router.replace(`/reminders/${reminder.id}`) },
            ]);
          } catch (error) {
            await cancelReminderNotification(notificationId);
            throw error;
          }
        }}
        submitLabel={t('reminders.addReminder')}
      />
    </ScreenContainer>
  );
}
