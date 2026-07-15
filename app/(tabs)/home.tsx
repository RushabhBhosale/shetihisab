import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { LargeButton } from '@/components/large-button';
import { ScreenContainer } from '@/components/screen-container';
import { SimpleCard } from '@/components/simple-card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppStore } from '@/store/app-store';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const profile = useAppStore((state) => state.profile);

  return (
    <ScreenContainer>
      <AppHeader
        action={{
          icon: 'settings',
          label: t('common.settings'),
          onPress: () => router.push('/settings'),
        }}
        title={t('common.appName')}
      />
      <AppText accessibilityRole="header" variant="heading" weight="bold">
        {t('home.greeting', { name: profile?.name ?? '' })}
      </AppText>

      <SimpleCard style={[styles.summary, { gap: theme.spacing.lg, marginTop: theme.spacing.lg }]}>
        <AmountRow label={t('home.totalExpense')} value={t('home.zeroAmount')} />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <AmountRow label={t('home.totalIncome')} value={t('home.zeroAmount')} />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <AmountRow highlight label={t('home.profit')} value={t('home.zeroAmount')} />
      </SimpleCard>

      <View style={{ marginTop: theme.spacing.lg }}>
        <LargeButton
          icon="plus-circle"
          onPress={() => router.push('/(tabs)/add')}
          title={t('home.addNewEntry')}
        />
      </View>

      <View style={[styles.recent, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}>
        <AppText accessibilityRole="header" variant="heading" weight="bold">
          {t('home.recentEntries')}
        </AppText>
        <SimpleCard>
          <AppText color="secondary" style={styles.center}>
            {t('home.noEntries')}
          </AppText>
        </SimpleCard>
      </View>
    </ScreenContainer>
  );
}

function AmountRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.amountRow}>
      <AppText variant="label" weight="semibold">
        {label}
      </AppText>
      <AppText color={highlight ? 'primary' : 'text'} variant="amount" weight="bold">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    width: '100%',
  },
  amountRow: {
    gap: 4,
  },
  divider: {
    width: '100%',
    height: 1,
  },
  recent: {
    width: '100%',
  },
  center: {
    textAlign: 'center',
  },
});
