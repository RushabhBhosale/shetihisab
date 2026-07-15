import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { PaymentStatus } from '@/types/app';

export function PaymentStatusLabel({ status, label }: { status: PaymentStatus; label: string }) {
  const theme = useAppTheme();
  const paid = status === 'paid';
  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.label,
        {
          backgroundColor: paid ? theme.colors.primarySoft : theme.colors.background,
          borderColor: paid ? theme.colors.primary : theme.colors.textSecondary,
          borderRadius: theme.radii.pill,
        },
      ]}>
      <Feather
        color={paid ? theme.colors.primary : theme.colors.textSecondary}
        name={paid ? 'check-circle' : 'clock'}
        size={22}
      />
      <AppText color={paid ? 'primary' : 'secondary'} variant="small" weight="bold">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    alignSelf: 'flex-start',
    minHeight: 40,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
});
