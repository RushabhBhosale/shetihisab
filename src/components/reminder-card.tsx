import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { LargeButton } from '@/components/large-button';
import { SimpleCard } from '@/components/simple-card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppStore } from '@/store/app-store';
import type { Reminder } from '@/types/app';
import { formatDate } from '@/utils/format';

export function ReminderCard({ reminder, onView }: { reminder: Reminder; onView: () => void }) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  return (
    <SimpleCard style={[styles.card, { gap: theme.spacing.md }]}> 
      <AppText variant="heading" weight="bold">{reminder.title}</AppText>
      {reminder.cropName ? <AppText color="secondary">{reminder.cropName}</AppText> : null}
      <AppText color={reminder.isCompleted ? 'secondary' : 'primary'} weight="semibold">
        {reminder.isCompleted ? t('reminders.completedStatus') : formatDate(reminder.date, language)}
      </AppText>
      <LargeButton icon="eye" onPress={onView} title={t('common.view')} variant="secondary" />
    </SimpleCard>
  );
}

const styles = StyleSheet.create({ card: { width: '100%' } });
