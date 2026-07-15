import { useMemo } from 'react';

import { colors, getTypography, radii, spacing } from '@/theme/theme';
import { useAppStore } from '@/store/app-store';

export function useAppTheme() {
  const textSize = useAppStore((state) => state.textSize);

  return useMemo(
    () => ({
      colors,
      radii,
      spacing,
      typography: getTypography(textSize),
      textSize,
    }),
    [textSize],
  );
}
