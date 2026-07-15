import type { TextSizePreference } from '@/types/app';

export const colors = {
  background: '#FAFBF7',
  surface: '#FFFFFF',
  primary: '#1B5E20',
  primaryPressed: '#144A18',
  primarySoft: '#E4F1E4',
  text: '#172218',
  textSecondary: '#465448',
  border: '#C9D3C7',
  danger: '#A32119',
  dangerSoft: '#FCE8E6',
  overlay: 'rgba(10, 22, 12, 0.55)',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

const textScales = {
  normal: {
    small: 16,
    body: 18,
    label: 18,
    heading: 27,
    title: 31,
    amount: 30,
  },
  large: {
    small: 18,
    body: 20,
    label: 20,
    heading: 30,
    title: 34,
    amount: 34,
  },
  extraLarge: {
    small: 20,
    body: 23,
    label: 23,
    heading: 34,
    title: 38,
    amount: 38,
  },
} as const;

export function getTypography(textSize: TextSizePreference) {
  const size = textScales[textSize];

  return {
    ...size,
    smallLineHeight: Math.round(size.small * 1.45),
    bodyLineHeight: Math.round(size.body * 1.45),
    labelLineHeight: Math.round(size.label * 1.35),
    headingLineHeight: Math.round(size.heading * 1.25),
    titleLineHeight: Math.round(size.title * 1.2),
    amountLineHeight: Math.round(size.amount * 1.2),
  };
}
