import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppStore } from '@/store/app-store';
import type { ActivityItem, ExpenseCategory } from '@/types/app';
import { formatCurrency, formatDate } from '@/utils/format';

type FeatherName = ComponentProps<typeof Feather>['name'];

const icons: Record<ActivityItem['kind'], FeatherName> = {
  expense: 'arrow-up-circle',
  income: 'arrow-down-circle',
  payment: 'credit-card',
  crop: 'sun',
  reminder: 'bell',
};

export function ActivityCard({ activity, onPress }: { activity: ActivityItem; onPress: () => void }) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const title = activity.kind === 'expense'
    ? t(`expenseCategories.${activity.title as ExpenseCategory}`)
    : activity.title || t(`history.kinds.${activity.kind}`);
  const action = t(`history.actions.${activity.kind}.${activity.action}`);
  const date = formatDate(activity.date, language) ?? activity.date;
  return (
    <Pressable
      accessibilityLabel={`${title}, ${action}, ${date}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          gap: theme.spacing.md,
          padding: theme.spacing.lg,
        },
        pressed && styles.pressed,
      ]}>
      <Feather color={theme.colors.primary} name={icons[activity.kind]} size={30} />
      <View style={styles.text}>
        <AppText variant="label" weight="bold">{title}</AppText>
        <AppText color="secondary" variant="small">{action} · {date}</AppText>
        {activity.amount !== null ? <AppText weight="bold">{formatCurrency(activity.amount, language)}</AppText> : null}
      </View>
      <Feather color={theme.colors.primary} name="chevron-right" size={28} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', minHeight: 76, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1 },
  pressed: { opacity: 0.72 },
});
