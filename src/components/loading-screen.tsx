import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

export function LoadingScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <View
      accessibilityLabel={t('loading.title')}
      accessibilityLiveRegion="polite"
      style={[styles.container, { backgroundColor: theme.colors.background, gap: theme.spacing.lg }]}>
      <ActivityIndicator color={theme.colors.primary} size="large" />
      <AppText variant="heading" weight="bold" style={styles.center}>
        {t('loading.title')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  center: {
    textAlign: 'center',
  },
});
