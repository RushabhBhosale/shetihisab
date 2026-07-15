import { create } from 'zustand';

import { initializeDatabase } from '@/database/client';
import { profileRepository } from '@/database/repositories/profile-repository';
import { settingsRepository } from '@/database/repositories/settings-repository';
import { changeAppLanguage } from '@/i18n';
import type {
  AppLanguage,
  AppProfile,
  AreaUnit,
  ProfileInput,
  TextSizePreference,
} from '@/types/app';

type InitializationStatus = 'idle' | 'loading' | 'ready' | 'error';

interface AppState {
  initializationStatus: InitializationStatus;
  language: AppLanguage;
  textSize: TextSizePreference;
  defaultAreaUnit: AreaUnit;
  profile: AppProfile | null;
  setupCompleted: boolean;
  initialize: () => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  saveProfile: (input: ProfileInput) => Promise<void>;
  updateProfile: (input: ProfileInput) => Promise<void>;
  setTextSize: (textSize: TextSizePreference) => Promise<void>;
  completeSetup: () => Promise<void>;
  resetApp: () => Promise<void>;
}

const initialPreferences = {
  language: 'mr' as const,
  textSize: 'large' as const,
  defaultAreaUnit: 'guntha' as const,
  profile: null,
  setupCompleted: false,
};

export const useAppStore = create<AppState>((set, get) => ({
  initializationStatus: 'idle',
  ...initialPreferences,

  initialize: async () => {
    if (get().initializationStatus === 'loading') {
      return;
    }

    set({ initializationStatus: 'loading' });

    try {
      await initializeDatabase();
      const [settings, profile] = await Promise.all([
        settingsRepository.getSettings(),
        profileRepository.getProfile(),
      ]);
      await changeAppLanguage(settings.language);
      set({
        initializationStatus: 'ready',
        language: settings.language,
        textSize: settings.textSize,
        defaultAreaUnit: settings.defaultAreaUnit,
        setupCompleted: settings.setupCompleted,
        profile,
      });
    } catch (error) {
      if (__DEV__) {
        console.error('[ShetiHisab] Startup initialization failed', error);
      }
      set({ initializationStatus: 'error' });
    }
  },

  setLanguage: async (language) => {
    await settingsRepository.updateLanguage(language);
    await changeAppLanguage(language);
    set({ language });
  },

  saveProfile: async (input) => {
    const profile = await profileRepository.saveProfile(input);
    set({ profile });
  },

  updateProfile: async (input) => {
    const profile = await profileRepository.updateProfile(input);
    set({ profile });
  },

  setTextSize: async (textSize) => {
    await settingsRepository.updateTextSize(textSize);
    set({ textSize });
  },

  completeSetup: async () => {
    await settingsRepository.markSetupComplete();
    set({ setupCompleted: true });
  },

  resetApp: async () => {
    await settingsRepository.resetSettings();
    await changeAppLanguage('mr');
    set({
      initializationStatus: 'ready',
      ...initialPreferences,
    });
  },
}));
