import i18n, { changeLanguage, use as registerPlugin } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resources } from './resources';
import type { AppLanguage } from '@/types/app';

if (!i18n.isInitialized) {
  void registerPlugin(initReactI18next).init({
    resources,
    lng: 'mr',
    fallbackLng: 'mr',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export async function changeAppLanguage(language: AppLanguage) {
  await changeLanguage(language);
}
