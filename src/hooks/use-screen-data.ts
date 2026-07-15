import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

interface ScreenDataState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
}

export function useScreenData<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<ScreenDataState<T>>({
    data: null,
    loading: true,
    error: false,
  });

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: false }));
    try {
      const data = await loader();
      setState({ data, loading: false, error: false });
    } catch (error) {
      if (__DEV__) {
        console.error('[ShetiHisab] Could not load screen data', error);
      }
      setState((current) => ({ ...current, loading: false, error: true }));
    }
  }, [loader]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { ...state, reload };
}
