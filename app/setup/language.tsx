import { useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { LanguageButton } from '@/components/language-button';
import { LargeButton } from '@/components/large-button';
import { ScreenContainer } from '@/components/screen-container';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppStore } from '@/store/app-store';
import type { AppLanguage } from '@/types/app';

export default function LanguageSetupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const [saving, setSaving] = useState(false);

  const chooseLanguage = async (nextLanguage: AppLanguage) => {
    if (nextLanguage === language || saving) {
      return;
    }

    setSaving(true);
    try {
      await setLanguage(nextLanguage);
    } catch {
      Alert.alert(t('common.somethingWrong'), t('common.pleaseTryAgain'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={[styles.content, { gap: theme.spacing.lg }]}>
        <AppText accessibilityRole="header" variant="title" weight="bold" style={styles.center}>
          {t('setup.language.title')}
        </AppText>
        <View accessibilityRole="radiogroup" style={[styles.options, { gap: theme.spacing.md }]}>
          <LanguageButton
            label={t('common.marathi')}
            onPress={() => void chooseLanguage('mr')}
            selected={language === 'mr'}
          />
          <LanguageButton
            label={t('common.english')}
            onPress={() => void chooseLanguage('en')}
            selected={language === 'en'}
          />
        </View>
      </View>
      <LargeButton
        accessibilityLabel={t('setup.language.continueLabel')}
        loading={saving}
        onPress={() => router.push('/setup/profile')}
        title={t('common.continue')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  options: {
    width: '100%',
  },
  center: {
    textAlign: 'center',
  },
});
