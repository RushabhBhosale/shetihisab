import type { SQLiteDatabase } from 'expo-sqlite';

import {
  createCrop,
  deleteCrop,
  getActiveCrops,
  markCropCompleted,
  updateCrop,
} from '@/database/repositories/crop-repository';

const cropRow = {
  id: 11,
  farm_id: 7,
  farm_name: 'Home Farm',
  crop_name: 'Sugarcane',
  season: 'Kharif',
  area: 20,
  area_unit: 'guntha',
  planting_date: '2026-07-01',
  expected_harvest_date: '2027-01-01',
  status: 'active',
  notes: null,
  created_at: '2026-07-15T10:00:00.000Z',
  updated_at: '2026-07-15T10:00:00.000Z',
};

const cropInput = {
  farmId: 7,
  cropName: 'Sugarcane',
  season: 'Kharif',
  area: 20,
  areaUnit: 'guntha' as const,
  plantingDate: '2026-07-01',
  expectedHarvestDate: '2027-01-01',
  status: 'active' as const,
  notes: null,
};

function createDatabase() {
  const runAsync = jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 11 });
  const getFirstAsync = jest.fn().mockResolvedValue(cropRow);
  const getAllAsync = jest.fn().mockResolvedValue([cropRow]);
  return {
    database: { runAsync, getFirstAsync, getAllAsync } as unknown as SQLiteDatabase,
    runAsync,
    getFirstAsync,
    getAllAsync,
  };
}

describe('cropRepository', () => {
  it('creates and maps a crop', async () => {
    const { database, runAsync } = createDatabase();

    const crop = await createCrop(cropInput, database);

    expect(runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO crops'),
      7,
      'Sugarcane',
      'Kharif',
      20,
      'guntha',
      '2026-07-01',
      '2027-01-01',
      'active',
      null,
      expect.any(String),
      expect.any(String),
    );
    expect(crop).toMatchObject({ id: 11, farmName: 'Home Farm', cropName: 'Sugarcane' });
  });

  it('updates crop details', async () => {
    const { database, runAsync } = createDatabase();

    await updateCrop(11, { ...cropInput, season: 'Rabi' }, database);

    expect(runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE crops'),
      7,
      'Sugarcane',
      'Rabi',
      20,
      'guntha',
      '2026-07-01',
      '2027-01-01',
      null,
      expect.any(String),
      11,
    );
  });

  it('marks a crop completed', async () => {
    const { database, runAsync } = createDatabase();

    await markCropCompleted(11, database);

    expect(runAsync).toHaveBeenCalledWith(
      'UPDATE crops SET status = ?, updated_at = ? WHERE id = ?',
      'completed',
      expect.any(String),
      11,
    );
  });

  it('deletes only the selected crop', async () => {
    const { database, runAsync } = createDatabase();

    await deleteCrop(11, database);

    expect(runAsync).toHaveBeenCalledWith('DELETE FROM crops WHERE id = ?', 11);
  });

  it('fetches only active crops and maps the rows', async () => {
    const { database, getAllAsync } = createDatabase();

    const crops = await getActiveCrops(database);

    expect(getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE c.status = ?'),
      'active',
    );
    expect(crops).toHaveLength(1);
    expect(crops[0]).toMatchObject({ status: 'active', farmId: 7 });
  });
});
