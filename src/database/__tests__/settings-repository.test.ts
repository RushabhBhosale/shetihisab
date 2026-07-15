import type { SQLiteDatabase } from 'expo-sqlite';

import {
  markSetupComplete,
  resetSettings,
  updateLanguage,
  updateTextSize,
} from '@/database/repositories/settings-repository';

const settingsRow = {
  id: 1,
  language: 'mr',
  text_size: 'large',
  setup_completed: 0,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

function createDatabase() {
  return {
    runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
    getFirstAsync: jest.fn().mockResolvedValue(settingsRow),
  } as unknown as SQLiteDatabase;
}

describe('settingsRepository', () => {
  it('saves the selected language with parameters', async () => {
    const database = createDatabase();

    await updateLanguage('en', database);

    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('SET language = ?'),
      'en',
      expect.any(String),
      1,
    );
  });

  it('saves the selected text size with parameters', async () => {
    const database = createDatabase();

    await updateTextSize('extraLarge', database);

    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('SET text_size = ?'),
      'extraLarge',
      expect.any(String),
      1,
    );
  });

  it('marks first-time setup as complete', async () => {
    const database = createDatabase();

    await markSetupComplete(database);

    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('SET setup_completed = ?'),
      1,
      expect.any(String),
      1,
    );
  });

  it('resets saved data without a native-only transaction', async () => {
    const database = createDatabase();

    await resetSettings(database);

    expect(database.runAsync).toHaveBeenNthCalledWith(1, 'DELETE FROM app_profile');
    expect(database.runAsync).toHaveBeenNthCalledWith(2, 'DELETE FROM app_metadata');
    expect(database.runAsync).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('SET language = ?'),
      'mr',
      'large',
      0,
      expect.any(String),
      1,
    );
  });
});
