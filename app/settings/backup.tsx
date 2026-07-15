import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { LargeButton } from '@/components/large-button';
import { ScreenContainer } from '@/components/screen-container';
import { SimpleCard } from '@/components/simple-card';
import { backupRepository } from '@/database/repositories/backup-repository';
import { reminderRepository } from '@/database/repositories/reminder-repository';
import type { BackupData } from '@/features/backup/backup-schema';
import { useAppTheme } from '@/hooks/use-app-theme';
import { pickBackupJson, shareBackupJson } from '@/services/backup-file-service';
import { cancelReminderNotification, scheduleReminderNotification } from '@/services/notification-service';
import { useAppStore } from '@/store/app-store';

export default function BackupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const initialize = useAppStore((state) => state.initialize);
  const [working, setWorking] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<BackupData | null>(null);

  const exportBackup = async () => {
    setWorking(true);
    try {
      const backup = await backupRepository.createBackup();
      await shareBackupJson(JSON.stringify(backup, null, 2), t('backup.shareTitle'));
      Alert.alert(t('common.saved'), t('backup.exported'));
    } catch {
      Alert.alert(t('common.somethingWrong'), t('backup.exportError'));
    } finally {
      setWorking(false);
    }
  };

  const chooseBackup = async () => {
    setWorking(true);
    try {
      const json = await pickBackupJson();
      if (json) {
        setPendingBackup(backupRepository.parseBackup(json));
      }
    } catch {
      Alert.alert(t('common.somethingWrong'), t('backup.invalidFile'));
    } finally {
      setWorking(false);
    }
  };

  const restore = async () => {
    if (!pendingBackup) return;
    setWorking(true);
    try {
      const oldReminders = await reminderRepository.getAllReminders();
      await backupRepository.restoreBackup(pendingBackup);
      await Promise.all(
        oldReminders.map((reminder) => cancelReminderNotification(reminder.notificationId)),
      );
      const restoredReminders = await reminderRepository.getAllReminders();
      for (const reminder of restoredReminders) {
        if (!reminder.isCompleted) {
          const notificationId = await scheduleReminderNotification(
            reminder.title,
            reminder.date,
            t('reminders.notificationBody'),
          );
          try {
            await reminderRepository.updateReminderNotificationId(reminder.id, notificationId);
          } catch (error) {
            await cancelReminderNotification(notificationId);
            if (__DEV__) {
              console.warn('[ShetiHisab] Restored reminder notification id was not saved', error);
            }
          }
        }
      }
      setPendingBackup(null);
      Alert.alert(t('common.saved'), t('backup.restored'), [
        {
          text: t('common.continue'),
          onPress: () => {
            void initialize().then(() => router.replace('/(tabs)/home'));
          },
        },
      ]);
    } catch {
      Alert.alert(t('common.somethingWrong'), t('backup.restoreError'));
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <ScreenContainer>
        <AppHeader backLabel={t('common.back')} onBack={() => router.back()} title={t('backup.title')} />
        <SimpleCard style={[styles.info, { gap: theme.spacing.sm }]}> 
          <AppText variant="heading" weight="bold">{t('backup.localTitle')}</AppText>
          <AppText color="secondary">{t('backup.description')}</AppText>
        </SimpleCard>
        <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
          <LargeButton icon="share-2" loading={working} onPress={() => void exportBackup()} title={t('backup.export')} />
          <LargeButton icon="upload" disabled={working} onPress={() => void chooseBackup()} title={t('backup.restore')} variant="secondary" />
        </View>
      </ScreenContainer>
      <ConfirmationDialog
        cancelLabel={t('common.cancel')}
        confirmLabel={t('backup.replaceData')}
        destructive
        loading={working}
        message={t('backup.restoreMessage')}
        onCancel={() => setPendingBackup(null)}
        onConfirm={() => void restore()}
        title={t('backup.restoreTitle')}
        visible={pendingBackup !== null}
      />
    </>
  );
}

const styles = StyleSheet.create({ info: { width: '100%' }, actions: { width: '100%' } });
