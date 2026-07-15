import { Redirect } from 'expo-router';

import { useAppStore } from '@/store/app-store';

export default function IndexScreen() {
  const setupCompleted = useAppStore((state) => state.setupCompleted);

  return <Redirect href={setupCompleted ? '/(tabs)/home' : '/setup/language'} />;
}
