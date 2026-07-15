import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { CropStatus } from '@/types/app';

export function StatusLabel({ status, label }: { status: CropStatus; label: string }) {
  const theme = useAppTheme();
  const active = status === 'active';

  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.label,
        {
          backgroundColor: active ? theme.colors.primarySoft : theme.colors.background,
          borderColor: active ? theme.colors.primary : theme.colors.textSecondary,
          borderRadius: theme.radii.pill,
        },
      ]}>
      <Feather
        color={active ? theme.colors.primary : theme.colors.textSecondary}
        name={active ? 'play-circle' : 'check-circle'}
        size={22}
      />
      <AppText color={active ? 'primary' : 'secondary'} variant="small" weight="bold">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
});
