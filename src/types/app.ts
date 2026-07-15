export type AppLanguage = 'mr' | 'en';

export type TextSizePreference = 'normal' | 'large' | 'extraLarge';

export interface AppProfile {
  id: number;
  name: string;
  village: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  id: number;
  language: AppLanguage;
  textSize: TextSizePreference;
  setupCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileInput {
  name: string;
  village?: string | null;
}
