import type { SQLiteDatabase } from 'expo-sqlite';

import { saveProfile } from '@/database/repositories/profile-repository';

describe('profileRepository', () => {
  it('saves and returns the single profile row', async () => {
    const row = {
      id: 1,
      name: 'Ramesh',
      village: 'Pune',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };
    const database = {
      runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
      getFirstAsync: jest.fn().mockResolvedValue(row),
    } as unknown as SQLiteDatabase;

    const profile = await saveProfile({ name: '  Ramesh  ', village: ' Pune ' }, database);

    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO app_profile'),
      1,
      'Ramesh',
      'Pune',
      expect.any(String),
      expect.any(String),
    );
    expect(profile).toEqual({
      id: 1,
      name: 'Ramesh',
      village: 'Pune',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  });
});
