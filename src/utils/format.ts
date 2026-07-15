import type { AppLanguage, AreaUnit } from '@/types/app';

function localeFor(language: AppLanguage) {
  return language === 'mr' ? 'mr-IN' : 'en-IN';
}

export function formatArea(
  area: number | null,
  areaUnit: AreaUnit,
  unitLabel: string,
  language: AppLanguage,
) {
  if (area === null) {
    return null;
  }

  const number = new Intl.NumberFormat(localeFor(language), {
    maximumFractionDigits: 2,
  }).format(area);
  return `${number} ${unitLabel}`;
}

export function formatDate(date: string | null, language: AppLanguage) {
  if (!date) {
    return null;
  }

  const parsed = new Date(date.includes('T') ? date : `${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(localeFor(language), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string | null) {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}
