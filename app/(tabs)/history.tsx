import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ActivityCard } from '@/components/activity-card';
import { AppHeader } from '@/components/app-header';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingScreen } from '@/components/loading-screen';
import { ScreenContainer } from '@/components/screen-container';
import { activityRepository } from '@/database/repositories/activity-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenData } from '@/hooks/use-screen-data';
import { getActivityRoute } from '@/utils/activity-route';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const loadActivity = useCallback(() => activityRepository.getRecentActivity(20), []);
  const { data, loading, error, reload } = useScreenData(loadActivity);
  if (loading && !data) return <LoadingScreen message={t('history.loading')} />;
  if (error && !data) return <ErrorState message={t('history.loadError')} onRetry={() => void reload()} />;
  return (
    <ScreenContainer>
      <AppHeader title={t('history.title')} />
      {data?.length ? (
        <View style={[styles.list, { gap: theme.spacing.md }]}> 
          {data.map((activity) => (
            <ActivityCard activity={activity} key={activity.id} onPress={() => router.push(getActivityRoute(activity))} />
          ))}
        </View>
      ) : (
        <EmptyState description={t('history.emptyDescription')} icon="book-open" title={t('history.emptyTitle')} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ list: { width: '100%' } });
