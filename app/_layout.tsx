import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { ErrorState } from '@/components/error-state';
import { LoadingScreen } from '@/components/loading-screen';
import '@/i18n';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/theme';

export default function RootLayout() {
  const initializationStatus = useAppStore((state) => state.initializationStatus);
  const setupCompleted = useAppStore((state) => state.setupCompleted);
  const initialize = useAppStore((state) => state.initialize);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (
      initializationStatus === 'ready' &&
      !setupCompleted &&
      segments[0] !== 'setup'
    ) {
      router.replace('/setup/language');
    }
  }, [initializationStatus, router, segments, setupCompleted]);

  if (initializationStatus === 'idle' || initializationStatus === 'loading') {
    return <LoadingScreen />;
  }

  if (initializationStatus === 'error') {
    return <ErrorState onRetry={() => void initialize()} />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          animation: 'none',
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="setup/language" />
        <Stack.Screen name="setup/profile" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="settings/backup" />
        <Stack.Screen name="farms/index" />
        <Stack.Screen name="farms/add" />
        <Stack.Screen name="farms/[id]" />
        <Stack.Screen name="farms/edit/[id]" />
        <Stack.Screen name="crops/add" />
        <Stack.Screen name="crops/[id]" />
        <Stack.Screen name="crops/edit/[id]" />
        <Stack.Screen name="expenses/index" />
        <Stack.Screen name="expenses/add" />
        <Stack.Screen name="expenses/[id]" />
        <Stack.Screen name="expenses/edit/[id]" />
        <Stack.Screen name="incomes/index" />
        <Stack.Screen name="incomes/add" />
        <Stack.Screen name="incomes/[id]" />
        <Stack.Screen name="incomes/edit/[id]" />
        <Stack.Screen name="payments/add" />
        <Stack.Screen name="payments/edit/[id]" />
        <Stack.Screen name="reminders/index" />
        <Stack.Screen name="reminders/add" />
        <Stack.Screen name="reminders/[id]" />
        <Stack.Screen name="reminders/edit/[id]" />
        <Stack.Screen name="summary" />
      </Stack>
    </>
  );
}
