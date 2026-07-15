import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LargeButton } from '@/components/large-button';
import { LoadingScreen } from '@/components/loading-screen';
import { ReminderCard } from '@/components/reminder-card';
import { ScreenContainer } from '@/components/screen-container';
import { reminderRepository } from '@/database/repositories/reminder-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';

export default function RemindersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const loadReminders = useCallback(() => reminderRepository.getAllReminders(), []);
  const { data, loading, error, reload } = useScreenData(loadReminders);
  if (loading && !data) return <LoadingScreen message={t('reminders.loading')} />;
  if (error && !data) return <ErrorState message={t('reminders.loadError')} onRetry={() => void reload()} />;
  const pending = data?.filter((reminder) => !reminder.isCompleted) ?? [];
  const completed = data?.filter((reminder) => reminder.isCompleted) ?? [];
  return (
    <ScreenContainer>
      <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('reminders.title')} />
      <LargeButton icon="plus" onPress={() => router.push('/reminders/add')} title={t('reminders.addReminder')} />
      {data?.length ? (
        <View style={[styles.sections, { gap: theme.spacing.xl, marginTop: theme.spacing.xl }]}> 
          <ReminderSection reminders={pending} title={t('reminders.upcoming')} onView={(id) => router.push(`/reminders/${id}`)} />
          <ReminderSection reminders={completed} title={t('reminders.completed')} onView={(id) => router.push(`/reminders/${id}`)} />
        </View>
      ) : (
        <EmptyState actionLabel={t('reminders.addReminder')} description={t('reminders.emptyDescription')} icon="bell" onAction={() => router.push('/reminders/add')} title={t('reminders.emptyTitle')} />
      )}
    </ScreenContainer>
  );
}

function ReminderSection({ reminders, title, onView }: { reminders: Awaited<ReturnType<typeof reminderRepository.getAllReminders>>; title: string; onView: (id: number) => void }) {
  const theme = useAppTheme();
  if (!reminders.length) return null;
  return <View style={[styles.section, { gap: theme.spacing.md }]}><AppText variant="heading" weight="bold">{title}</AppText>{reminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} onView={() => onView(reminder.id)} />)}</View>;
}

const styles = StyleSheet.create({ sections: { width: '100%' }, section: { width: '100%' } });
