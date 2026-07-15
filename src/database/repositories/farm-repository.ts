import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/database/client';
import type { AreaUnit, Farm, FarmInput } from '@/types/app';

interface FarmRow {
  id: number;
  name: string;
  village: string | null;
  total_area: number | null;
  area_unit: AreaUnit;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapFarm(row: FarmRow): Farm {
  return {
    id: row.id,
    name: row.name,
    village: row.village,
    totalArea: row.total_area,
    areaUnit: row.area_unit,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function optionalText(value?: string | null) {
  return value?.trim() || null;
}

async function resolveDatabase(database?: SQLiteDatabase) {
  return database ?? getDatabase();
}

export async function getAllFarms(database?: SQLiteDatabase): Promise<Farm[]> {
  const connection = await resolveDatabase(database);
  const rows = await connection.getAllAsync<FarmRow>(
    `SELECT id, name, village, total_area, area_unit, notes, created_at, updated_at
     FROM farms
     ORDER BY updated_at DESC, id DESC`,
  );
  return rows.map(mapFarm);
}

export async function getFarmById(
  id: number,
  database?: SQLiteDatabase,
): Promise<Farm | null> {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<FarmRow>(
    `SELECT id, name, village, total_area, area_unit, notes, created_at, updated_at
     FROM farms WHERE id = ?`,
    id,
  );
  return row ? mapFarm(row) : null;
}

export async function createFarm(input: FarmInput, database?: SQLiteDatabase): Promise<Farm> {
  const connection = await resolveDatabase(database);
  const now = new Date().toISOString();
  const result = await connection.runAsync(
    `INSERT INTO farms
      (name, village, total_area, area_unit, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    input.name.trim(),
    optionalText(input.village),
    input.totalArea ?? null,
    input.areaUnit,
    optionalText(input.notes),
    now,
    now,
  );
  const farm = await getFarmById(result.lastInsertRowId, connection);
  if (!farm) {
    throw new Error('Farm was not saved.');
  }
  return farm;
}

export async function updateFarm(
  id: number,
  input: FarmInput,
  database?: SQLiteDatabase,
): Promise<Farm> {
  const connection = await resolveDatabase(database);
  const result = await connection.runAsync(
    `UPDATE farms
     SET name = ?, village = ?, total_area = ?, area_unit = ?, notes = ?, updated_at = ?
     WHERE id = ?`,
    input.name.trim(),
    optionalText(input.village),
    input.totalArea ?? null,
    input.areaUnit,
    optionalText(input.notes),
    new Date().toISOString(),
    id,
  );
  if (result.changes === 0) {
    throw new Error('Farm was not found.');
  }
  const farm = await getFarmById(id, connection);
  if (!farm) {
    throw new Error('Farm was not found.');
  }
  return farm;
}

export async function deleteFarm(id: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const unlinkResult = await connection.runAsync(
    'UPDATE crops SET farm_id = NULL, updated_at = ? WHERE farm_id = ?',
    new Date().toISOString(),
    id,
  );
  await connection.runAsync('DELETE FROM farms WHERE id = ?', id);
  return { unlinkedCropCount: unlinkResult.changes };
}

export async function getFarmCropCount(id: number, database?: SQLiteDatabase): Promise<number> {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM crops WHERE farm_id = ?',
    id,
  );
  return row?.count ?? 0;
}

export const farmRepository = {
  getAllFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
  getFarmCropCount,
};
