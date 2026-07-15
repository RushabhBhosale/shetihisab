import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { ScreenContainer } from '@/components/screen-container';
import { useAppTheme } from '@/hooks/use-app-theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

export default function AddEntryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();

  return (
    <ScreenContainer>
      <AppHeader title={t('add.title')} />
      <View style={[styles.choices, { gap: theme.spacing.md }]}> 
        <EntryChoice
          description={t('add.cropDescription')}
          icon="sun"
          onPress={() => router.push('/crops/add')}
          title={t('add.crop')}
        />
        <EntryChoice
          description={t('add.expenseDescription')}
          icon="arrow-up-circle"
          onPress={() => router.push('/expenses/add')}
          title={t('add.expense')}
        />
        <EntryChoice
          description={t('add.incomeDescription')}
          icon="arrow-down-circle"
          onPress={() => router.push('/incomes/add')}
          title={t('add.income')}
        />
        <EntryChoice
          description={t('add.farmDescription')}
          icon="map"
          onPress={() => router.push('/farms/add')}
          title={t('add.farm')}
        />
      </View>
    </ScreenContainer>
  );
}

function EntryChoice({
  title,
  description,
  icon,
  onPress,
}: {
  title: string;
  description: string;
  icon: FeatherName;
  onPress: () => void;
}) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityHint={description}
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          minHeight: 108,
          padding: theme.spacing.lg,
        },
        pressed && styles.pressed,
      ]}>
      <Feather color={theme.colors.primary} name={icon} size={42} />
      <View style={styles.choiceText}>
        <AppText variant="heading" weight="bold">
          {title}
        </AppText>
        <AppText color="secondary" variant="small">
          {description}
        </AppText>
      </View>
      <Feather color={theme.colors.primary} name="chevron-right" size={32} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  choices: {
    width: '100%',
  },
  choice: {
    width: '100%',
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  choiceText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.72,
  },
});
