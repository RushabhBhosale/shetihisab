import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

export function DetailRow({ icon, label, value }: { icon: FeatherName; label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.row}>
      <Feather color={theme.colors.primary} name={icon} size={27} />
      <View style={styles.text}>
        <AppText color="secondary" variant="small" weight="semibold">
          {label}
        </AppText>
        <AppText>{value}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  text: { flex: 1 },
});
