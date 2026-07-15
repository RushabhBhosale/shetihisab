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
      </Stack>
    </>
  );
}
