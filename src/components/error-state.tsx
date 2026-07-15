import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { LargeButton } from '@/components/large-button';
import { useAppTheme } from '@/hooks/use-app-theme';

interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export function ErrorState({ onRetry, message }: ErrorStateProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <View
      accessibilityLiveRegion="assertive"
      style={[styles.container, { backgroundColor: theme.colors.background, gap: theme.spacing.md }]}>
      <AppText variant="heading" weight="bold" style={styles.center}>
        {message ?? t('common.somethingWrong')}
      </AppText>
      <AppText color="secondary" style={styles.center}>
        {t('common.pleaseTryAgain')}
      </AppText>
      <View style={[styles.action, { marginTop: theme.spacing.md }]}>
        <LargeButton icon="refresh-cw" onPress={onRetry} title={t('common.retry')} />
      </View>
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
  action: {
    width: '100%',
    maxWidth: 420,
  },
});
