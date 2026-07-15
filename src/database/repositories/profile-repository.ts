import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/database/client';
import type { AppProfile, ProfileInput } from '@/types/app';

interface ProfileRow {
  id: number;
  name: string;
  village: string | null;
  created_at: string;
  updated_at: string;
}

function mapProfile(row: ProfileRow): AppProfile {
  return {
    id: row.id,
    name: row.name,
    village: row.village,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function resolveDatabase(database?: SQLiteDatabase) {
  return database ?? getDatabase();
}

export async function getProfile(database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<ProfileRow>(
    'SELECT id, name, village, created_at, updated_at FROM app_profile WHERE id = ?',
    1,
  );

  return row ? mapProfile(row) : null;
}

export async function saveProfile(input: ProfileInput, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const now = new Date().toISOString();
  const name = input.name.trim();
  const village = input.village?.trim() || null;

  await connection.runAsync(
    `INSERT INTO app_profile (id, name, village, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       village = excluded.village,
       updated_at = excluded.updated_at`,
    1,
    name,
    village,
    now,
    now,
  );

  const profile = await getProfile(connection);
  if (!profile) {
    throw new Error('Profile was not saved.');
  }

  return profile;
}

export async function updateProfile(input: ProfileInput, database?: SQLiteDatabase) {
  return saveProfile(input, database);
}

export const profileRepository = {
  getProfile,
  saveProfile,
  updateProfile,
};
