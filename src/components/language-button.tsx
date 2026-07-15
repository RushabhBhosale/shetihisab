import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

interface LanguageButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function LanguageButton({ label, selected, onPress }: LanguageButtonProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radii.md,
          minHeight: 72,
        },
        pressed && styles.pressed,
      ]}>
      <AppText color={selected ? 'primary' : 'text'} variant="heading" weight="bold">
        {label}
      </AppText>
      <View style={styles.status}>
        {selected ? <Feather color={theme.colors.primary} name="check-circle" size={32} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  status: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
