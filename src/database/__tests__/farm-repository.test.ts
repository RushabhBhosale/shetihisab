import type { SQLiteDatabase } from 'expo-sqlite';

import {
  createFarm,
  deleteFarm,
  updateFarm,
} from '@/database/repositories/farm-repository';

const farmRow = {
  id: 7,
  name: 'Home Farm',
  village: 'Pune',
  total_area: 40,
  area_unit: 'guntha',
  notes: null,
  created_at: '2026-07-15T10:00:00.000Z',
  updated_at: '2026-07-15T10:00:00.000Z',
};

const farmInput = {
  name: 'Home Farm',
  village: 'Pune',
  totalArea: 40,
  areaUnit: 'guntha' as const,
  notes: null,
};

function createDatabase() {
  const runAsync = jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 7 });
  const getFirstAsync = jest.fn().mockResolvedValue(farmRow);
  return {
    database: { runAsync, getFirstAsync } as unknown as SQLiteDatabase,
    runAsync,
    getFirstAsync,
  };
}

describe('farmRepository', () => {
  it('creates and maps a farm', async () => {
    const { database, runAsync } = createDatabase();

    const farm = await createFarm(farmInput, database);

    expect(runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO farms'),
      'Home Farm',
      'Pune',
      40,
      'guntha',
      null,
      expect.any(String),
      expect.any(String),
    );
    expect(farm).toMatchObject({
      id: 7,
      name: 'Home Farm',
      totalArea: 40,
      areaUnit: 'guntha',
    });
  });

  it('updates a farm with parameterized values', async () => {
    const { database, runAsync } = createDatabase();

    await updateFarm(7, { ...farmInput, name: 'North Farm' }, database);

    expect(runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE farms'),
      'North Farm',
      'Pune',
      40,
      'guntha',
      null,
      expect.any(String),
      7,
    );
  });

  it('deletes a farm without linked crops', async () => {
    const { database, runAsync } = createDatabase();
    runAsync.mockResolvedValueOnce({ changes: 0 }).mockResolvedValueOnce({ changes: 1 });

    const result = await deleteFarm(7, database);

    expect(result).toEqual({ unlinkedCropCount: 0 });
    expect(runAsync).toHaveBeenNthCalledWith(
      1,
      'UPDATE crops SET farm_id = NULL, updated_at = ? WHERE farm_id = ?',
      expect.any(String),
      7,
    );
    expect(runAsync).toHaveBeenNthCalledWith(2, 'DELETE FROM farms WHERE id = ?', 7);
  });

  it('unlinks crops before deleting their farm', async () => {
    const { database, runAsync } = createDatabase();
    runAsync.mockResolvedValueOnce({ changes: 3 }).mockResolvedValueOnce({ changes: 1 });

    const result = await deleteFarm(7, database);

    expect(result).toEqual({ unlinkedCropCount: 3 });
    expect(runAsync.mock.calls[0]?.[0]).toContain('SET farm_id = NULL');
    expect(runAsync.mock.calls[1]?.[0]).toContain('DELETE FROM farms');
  });
});
