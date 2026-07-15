import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { LanguageButton } from '@/components/language-button';
import { LargeButton } from '@/components/large-button';
import { LargeTextInput } from '@/components/large-text-input';
import { ScreenContainer } from '@/components/screen-container';
import { SettingRow } from '@/components/setting-row';
import { SimpleCard } from '@/components/simple-card';
import {
  profileSchema,
  type ProfileFormValues,
} from '@/features/profile/profile-schema';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppStore } from '@/store/app-store';
import type { AppLanguage, TextSizePreference } from '@/types/app';

type ActiveSection = 'language' | 'name' | 'village' | 'textSize' | 'about' | null;

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const language = useAppStore((state) => state.language);
  const textSize = useAppStore((state) => state.textSize);
  const profile = useAppStore((state) => state.profile);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const setTextSize = useAppStore((state) => state.setTextSize);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const resetApp = useAppStore((state) => state.resetApp);
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [saving, setSaving] = useState(false);
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [resetting, setResetting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? '',
      village: profile?.village ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: profile?.name ?? '',
      village: profile?.village ?? '',
    });
  }, [profile, reset]);

  const toggleSection = (section: Exclude<ActiveSection, null>) => {
    setActiveSection((current) => (current === section ? null : section));
  };

  const chooseLanguage = async (nextLanguage: AppLanguage) => {
    if (nextLanguage === language || saving) {
      return;
    }

    setSaving(true);
    try {
      await setLanguage(nextLanguage);
      Alert.alert(t('common.saved'), t('settings.languageSaved'));
    } catch {
      Alert.alert(t('common.somethingWrong'), t('common.pleaseTryAgain'));
    } finally {
      setSaving(false);
    }
  };

  const chooseTextSize = async (nextTextSize: TextSizePreference) => {
    if (nextTextSize === textSize || saving) {
      return;
    }

    setSaving(true);
    try {
      await setTextSize(nextTextSize);
      Alert.alert(t('common.saved'), t('settings.textSizeSaved'));
    } catch {
      Alert.alert(t('common.somethingWrong'), t('common.pleaseTryAgain'));
    } finally {
      setSaving(false);
    }
  };

  const saveProfileChanges = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await updateProfile(values);
      setActiveSection(null);
      Alert.alert(t('common.saved'), t('settings.profileSaved'));
    } catch {
      Alert.alert(t('common.somethingWrong'), t('setup.profile.saveError'));
    } finally {
      setSaving(false);
    }
  });

  const confirmReset = async () => {
    setResetting(true);
    try {
      await resetApp();
      setResetStep(0);
      router.replace('/setup/language');
    } catch {
      Alert.alert(t('common.somethingWrong'), t('settings.resetError'));
    } finally {
      setResetting(false);
    }
  };

  const textSizeLabel = {
    normal: t('settings.normal'),
    large: t('settings.large'),
    extraLarge: t('settings.extraLarge'),
  }[textSize];

  return (
    <>
      <ScreenContainer keyboardSafe>
        <AppHeader
          backLabel={t('common.back')}
          onBack={() => router.back()}
          title={t('settings.title')}
        />

        <View style={[styles.rows, { gap: theme.spacing.md }]}>
          <SettingRow
            expanded={activeSection === 'language'}
            icon="globe"
            label={t('settings.changeLanguage')}
            onPress={() => toggleSection('language')}
            value={language === 'mr' ? t('common.marathi') : t('common.english')}
          />
          {activeSection === 'language' ? (
            <SimpleCard style={[styles.section, { gap: theme.spacing.md }]}>
              <View accessibilityRole="radiogroup" style={[styles.rows, { gap: theme.spacing.md }]}>
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
            </SimpleCard>
          ) : null}

          <SettingRow
            expanded={activeSection === 'name'}
            icon="user"
            label={t('settings.editName')}
            onPress={() => toggleSection('name')}
            value={profile?.name}
          />
          {activeSection === 'name' ? (
            <SimpleCard style={[styles.section, { gap: theme.spacing.md }]}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onBlur, onChange, value } }) => (
                  <LargeTextInput
                    autoCapitalize="words"
                    error={errors.name?.message ? t(errors.name.message) : undefined}
                    label={t('setup.profile.name')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder={t('setup.profile.namePlaceholder')}
                    value={value}
                  />
                )}
              />
              <LargeButton
                loading={saving}
                onPress={() => void saveProfileChanges()}
                title={t('settings.saveName')}
              />
            </SimpleCard>
          ) : null}

          <SettingRow
            expanded={activeSection === 'village'}
            icon="map-pin"
            label={t('settings.editVillage')}
            onPress={() => toggleSection('village')}
            value={profile?.village || t('settings.noVillage')}
          />
          {activeSection === 'village' ? (
            <SimpleCard style={[styles.section, { gap: theme.spacing.md }]}>
              <Controller
                control={control}
                name="village"
                render={({ field: { onBlur, onChange, value } }) => (
                  <LargeTextInput
                    autoCapitalize="words"
                    label={t('setup.profile.village')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    optionalLabel={t('setup.profile.optional')}
                    placeholder={t('setup.profile.villagePlaceholder')}
                    value={value}
                  />
                )}
              />
              <LargeButton
                loading={saving}
                onPress={() => void saveProfileChanges()}
                title={t('settings.saveVillage')}
              />
            </SimpleCard>
          ) : null}

          <SettingRow
            expanded={activeSection === 'textSize'}
            icon="type"
            label={t('settings.textSize')}
            onPress={() => toggleSection('textSize')}
            value={textSizeLabel}
          />
          {activeSection === 'textSize' ? (
            <SimpleCard style={[styles.section, { gap: theme.spacing.md }]}>
              <View accessibilityRole="radiogroup" style={[styles.rows, { gap: theme.spacing.md }]}>
                <LanguageButton
                  label={t('settings.normal')}
                  onPress={() => void chooseTextSize('normal')}
                  selected={textSize === 'normal'}
                />
                <LanguageButton
                  label={t('settings.large')}
                  onPress={() => void chooseTextSize('large')}
                  selected={textSize === 'large'}
                />
                <LanguageButton
                  label={t('settings.extraLarge')}
                  onPress={() => void chooseTextSize('extraLarge')}
                  selected={textSize === 'extraLarge'}
                />
              </View>
            </SimpleCard>
          ) : null}

          <SettingRow
            icon="map"
            label={t('settings.manageFarms')}
            onPress={() => router.push('/farms')}
          />

          <SettingRow
            danger
            icon="trash-2"
            label={t('settings.resetData')}
            onPress={() => setResetStep(1)}
          />

          <SettingRow
            expanded={activeSection === 'about'}
            icon="info"
            label={t('settings.about')}
            onPress={() => toggleSection('about')}
          />
          {activeSection === 'about' ? (
            <SimpleCard style={[styles.section, { gap: theme.spacing.sm }]}>
              <AppText>{t('settings.aboutText')}</AppText>
              <AppText color="secondary" variant="small">
                {t('settings.version')}
              </AppText>
            </SimpleCard>
          ) : null}
        </View>
      </ScreenContainer>

      <ConfirmationDialog
        cancelLabel={t('common.cancel')}
        confirmLabel={t('settings.firstResetAction')}
        message={t('settings.firstResetMessage')}
        onCancel={() => setResetStep(0)}
        onConfirm={() => setResetStep(2)}
        title={t('settings.firstResetTitle')}
        visible={resetStep === 1}
      />
      <ConfirmationDialog
        cancelLabel={t('common.cancel')}
        confirmLabel={t('settings.secondResetAction')}
        destructive
        loading={resetting}
        message={t('settings.secondResetMessage')}
        onCancel={() => setResetStep(0)}
        onConfirm={() => void confirmReset()}
        title={t('settings.secondResetTitle')}
        visible={resetStep === 2}
      />
    </>
  );
}

const styles = StyleSheet.create({
  rows: {
    width: '100%',
  },
  section: {
    width: '100%',
  },
});
