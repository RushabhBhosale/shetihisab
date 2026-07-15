import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';

interface ScreenContainerProps {
  children: ReactNode;
  scroll?: boolean;
  keyboardSafe?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function ScreenContainer({
  children,
  scroll = true,
  keyboardSafe = false,
  contentContainerStyle,
}: ScreenContainerProps) {
  const theme = useAppTheme();
  const contentStyle = [
    styles.content,
    { padding: theme.spacing.lg },
    contentContainerStyle,
  ];
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={contentStyle}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {keyboardSafe ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
});
