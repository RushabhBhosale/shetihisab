import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { cropRepository } from '@/database/repositories/crop-repository';
import { farmRepository } from '@/database/repositories/farm-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';
import { useAppStore } from '@/store/app-store';
import { formatDate } from '@/utils/format';
import { buildRecentActivity, type RecentActivity } from '@/utils/recent-activity';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const loadActivity = useCallback(async () => {
    const [farms, crops] = await Promise.all([
      farmRepository.getAllFarms(),
      cropRepository.getAllCrops(),
    ]);
    return buildRecentActivity(farms, crops);
  }, []);
  const { data, loading, error, reload } = useScreenData(loadActivity);

  if (loading && !data) {
    return <LoadingScreen message={t('history.loading')} />;
  }

  if (error && !data) {
    return <ErrorState message={t('history.loadError')} onRetry={() => void reload()} />;
  }

  return (
    <ScreenContainer>
      <AppHeader title={t('history.title')} />
      {data?.length ? (
        <View style={[styles.list, { gap: theme.spacing.md }]}> 
          {data.map((activity) => (
            <ActivityRow
              activity={activity}
              date={formatDate(activity.date, language) ?? activity.date}
              key={activity.id}
              onPress={() =>
                router.push(
                  activity.type === 'crop'
                    ? `/crops/${activity.id.replace('crop-', '')}`
                    : `/farms/${activity.id.replace('farm-', '')}`,
                )
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState
          description={t('history.emptyDescription')}
          icon="book-open"
          title={t('history.emptyTitle')}
        />
      )}
    </ScreenContainer>
  );
}

function ActivityRow({
  activity,
  date,
  onPress,
}: {
  activity: RecentActivity;
  date: string;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const actionKey = `${activity.type}${activity.action === 'added' ? 'Added' : 'Updated'}` as
    | 'cropAdded'
    | 'cropUpdated'
    | 'farmAdded'
    | 'farmUpdated';

  return (
    <Pressable
      accessibilityHint={t('common.view')}
      accessibilityLabel={`${activity.name}, ${t(`history.${actionKey}`)}, ${date}`}
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
      <Feather
        color={theme.colors.primary}
        name={activity.type === 'crop' ? 'sun' : 'map'}
        size={30}
      />
      <View style={styles.rowText}>
        <AppText variant="label" weight="bold">
          {activity.name}
        </AppText>
        <AppText color="secondary" variant="small">
          {t(`history.${actionKey}`)} · {date}
        </AppText>
      </View>
      <Feather color={theme.colors.primary} name="chevron-right" size={28} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
  row: {
    width: '100%',
    minHeight: 76,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.72,
  },
});
