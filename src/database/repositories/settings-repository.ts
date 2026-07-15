import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/database/client';
import type { AppLanguage, AppSettings, TextSizePreference } from '@/types/app';

interface SettingsRow {
  id: number;
  language: AppLanguage;
  text_size: TextSizePreference;
  setup_completed: number;
  created_at: string;
  updated_at: string;
}

function mapSettings(row: SettingsRow): AppSettings {
  return {
    id: row.id,
    language: row.language,
    textSize: row.text_size,
    setupCompleted: row.setup_completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function resolveDatabase(database?: SQLiteDatabase) {
  return database ?? getDatabase();
}

export async function getSettings(database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<SettingsRow>(
    `SELECT id, language, text_size, setup_completed, created_at, updated_at
     FROM app_settings WHERE id = ?`,
    1,
  );

  if (!row) {
    throw new Error('App settings are missing.');
  }

  return mapSettings(row);
}

export async function updateLanguage(language: AppLanguage, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  await connection.runAsync(
    'UPDATE app_settings SET language = ?, updated_at = ? WHERE id = ?',
    language,
    new Date().toISOString(),
    1,
  );
  return getSettings(connection);
}

export async function updateTextSize(
  textSize: TextSizePreference,
  database?: SQLiteDatabase,
) {
  const connection = await resolveDatabase(database);
  await connection.runAsync(
    'UPDATE app_settings SET text_size = ?, updated_at = ? WHERE id = ?',
    textSize,
    new Date().toISOString(),
    1,
  );
  return getSettings(connection);
}

export async function markSetupComplete(database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  await connection.runAsync(
    'UPDATE app_settings SET setup_completed = ?, updated_at = ? WHERE id = ?',
    1,
    new Date().toISOString(),
    1,
  );
  return getSettings(connection);
}

export async function resetSettings(database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const now = new Date().toISOString();

  await connection.runAsync('DELETE FROM app_profile');
  await connection.runAsync('DELETE FROM app_metadata');
  await connection.runAsync(
    `UPDATE app_settings
     SET language = ?, text_size = ?, setup_completed = ?, updated_at = ?
     WHERE id = ?`,
    'mr',
    'large',
    0,
    now,
    1,
  );

  return getSettings(connection);
}

export const settingsRepository = {
  getSettings,
  updateLanguage,
  updateTextSize,
  markSetupComplete,
  resetSettings,
};
