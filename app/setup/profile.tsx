import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { LargeButton } from '@/components/large-button';
import { LargeTextInput } from '@/components/large-text-input';
import { ScreenContainer } from '@/components/screen-container';
import {
  profileSchema,
  type ProfileFormValues,
} from '@/features/profile/profile-schema';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppStore } from '@/store/app-store';

export default function ProfileSetupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const profile = useAppStore((state) => state.profile);
  const saveProfile = useAppStore((state) => state.saveProfile);
  const completeSetup = useAppStore((state) => state.completeSetup);
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? '',
      village: profile?.village ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await saveProfile(values);
      await completeSetup();
      Alert.alert(t('common.saved'), t('setup.profile.savedMessage'), [
        {
          text: t('common.continue'),
          onPress: () => router.replace('/(tabs)/home'),
        },
      ]);
    } catch {
      Alert.alert(t('common.somethingWrong'), t('setup.profile.saveError'));
    } finally {
      setSaving(false);
    }
  });

  return (
    <ScreenContainer keyboardSafe contentContainerStyle={styles.container}>
      <AppHeader
        backLabel={t('common.back')}
        onBack={() => router.back()}
        title={t('setup.profile.title')}
      />
      <View style={[styles.form, { gap: theme.spacing.lg }]}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onBlur, onChange, value } }) => (
            <LargeTextInput
              autoCapitalize="words"
              autoComplete="name"
              error={errors.name?.message ? t(errors.name.message) : undefined}
              label={t('setup.profile.name')}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('setup.profile.namePlaceholder')}
              returnKeyType="next"
              value={value}
            />
          )}
        />
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
              returnKeyType="done"
              value={value}
            />
          )}
        />
      </View>
      <View style={styles.footer}>
        <LargeButton
          icon="check"
          loading={saving}
          onPress={() => void onSubmit()}
          title={t('setup.profile.saveAndContinue')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  form: {
    width: '100%',
  },
  footer: {
    flex: 1,
    minHeight: 40,
    justifyContent: 'flex-end',
    paddingTop: 32,
  },
});
