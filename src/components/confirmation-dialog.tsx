import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { LargeButton } from '@/components/large-button';
import { useAppTheme } from '@/hooks/use-app-theme';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading = false,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const theme = useAppTheme();

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={visible}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View
          accessibilityViewIsModal
          style={[
            styles.dialog,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.lg,
              gap: theme.spacing.md,
              padding: theme.spacing.lg,
            },
          ]}>
          <AppText accessibilityRole="header" variant="heading" weight="bold">
            {title}
          </AppText>
          <AppText color="secondary">{message}</AppText>
          <View style={[styles.actions, { marginTop: theme.spacing.sm }]}>
            <LargeButton
              loading={loading}
              onPress={onConfirm}
              title={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
            />
            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancel,
                { minHeight: 56 },
                pressed && styles.pressed,
              ]}>
              <AppText color="primary" variant="label" weight="bold">
                {cancelLabel}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 500,
  },
  actions: {
    width: '100%',
    gap: 8,
  },
  cancel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
});
