import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/database/client';
import type { AreaUnit, Crop, CropInput, CropStatus } from '@/types/app';

interface CropRow {
  id: number;
  farm_id: number | null;
  farm_name: string | null;
  crop_name: string;
  season: string | null;
  area: number | null;
  area_unit: AreaUnit;
  planting_date: string | null;
  expected_harvest_date: string | null;
  status: CropStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const cropSelect = `
  SELECT
    c.id,
    c.farm_id,
    f.name AS farm_name,
    c.crop_name,
    c.season,
    c.area,
    c.area_unit,
    c.planting_date,
    c.expected_harvest_date,
    c.status,
    c.notes,
    c.created_at,
    c.updated_at
  FROM crops c
  LEFT JOIN farms f ON f.id = c.farm_id
`;

function mapCrop(row: CropRow): Crop {
  return {
    id: row.id,
    farmId: row.farm_id,
    farmName: row.farm_name,
    cropName: row.crop_name,
    season: row.season,
    area: row.area,
    areaUnit: row.area_unit,
    plantingDate: row.planting_date,
    expectedHarvestDate: row.expected_harvest_date,
    status: row.status,
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

export async function getAllCrops(database?: SQLiteDatabase): Promise<Crop[]> {
  const connection = await resolveDatabase(database);
  const rows = await connection.getAllAsync<CropRow>(
    `${cropSelect} ORDER BY c.updated_at DESC, c.id DESC`,
  );
  return rows.map(mapCrop);
}

async function getCropsByStatus(status: CropStatus, database?: SQLiteDatabase): Promise<Crop[]> {
  const connection = await resolveDatabase(database);
  const rows = await connection.getAllAsync<CropRow>(
    `${cropSelect} WHERE c.status = ? ORDER BY c.updated_at DESC, c.id DESC`,
    status,
  );
  return rows.map(mapCrop);
}

export async function getActiveCrops(database?: SQLiteDatabase) {
  return getCropsByStatus('active', database);
}

export async function getCompletedCrops(database?: SQLiteDatabase) {
  return getCropsByStatus('completed', database);
}

export async function getCropsByFarmId(farmId: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const rows = await connection.getAllAsync<CropRow>(
    `${cropSelect} WHERE c.farm_id = ? ORDER BY c.updated_at DESC, c.id DESC`,
    farmId,
  );
  return rows.map(mapCrop);
}

export async function getCropById(
  id: number,
  database?: SQLiteDatabase,
): Promise<Crop | null> {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<CropRow>(`${cropSelect} WHERE c.id = ?`, id);
  return row ? mapCrop(row) : null;
}

export async function createCrop(input: CropInput, database?: SQLiteDatabase): Promise<Crop> {
  const connection = await resolveDatabase(database);
  const now = new Date().toISOString();
  const result = await connection.runAsync(
    `INSERT INTO crops
      (farm_id, crop_name, season, area, area_unit, planting_date,
       expected_harvest_date, status, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.farmId ?? null,
    input.cropName.trim(),
    optionalText(input.season),
    input.area ?? null,
    input.areaUnit,
    input.plantingDate ?? null,
    input.expectedHarvestDate ?? null,
    input.status ?? 'active',
    optionalText(input.notes),
    now,
    now,
  );
  const crop = await getCropById(result.lastInsertRowId, connection);
  if (!crop) {
    throw new Error('Crop was not saved.');
  }
  return crop;
}

export async function updateCrop(
  id: number,
  input: CropInput,
  database?: SQLiteDatabase,
): Promise<Crop> {
  const connection = await resolveDatabase(database);
  const result = await connection.runAsync(
    `UPDATE crops
     SET farm_id = ?, crop_name = ?, season = ?, area = ?, area_unit = ?,
         planting_date = ?, expected_harvest_date = ?, notes = ?, updated_at = ?
     WHERE id = ?`,
    input.farmId ?? null,
    input.cropName.trim(),
    optionalText(input.season),
    input.area ?? null,
    input.areaUnit,
    input.plantingDate ?? null,
    input.expectedHarvestDate ?? null,
    optionalText(input.notes),
    new Date().toISOString(),
    id,
  );
  if (result.changes === 0) {
    throw new Error('Crop was not found.');
  }
  const crop = await getCropById(id, connection);
  if (!crop) {
    throw new Error('Crop was not found.');
  }
  return crop;
}

async function updateCropStatus(
  id: number,
  status: CropStatus,
  database?: SQLiteDatabase,
): Promise<Crop> {
  const connection = await resolveDatabase(database);
  const result = await connection.runAsync(
    'UPDATE crops SET status = ?, updated_at = ? WHERE id = ?',
    status,
    new Date().toISOString(),
    id,
  );
  if (result.changes === 0) {
    throw new Error('Crop was not found.');
  }
  const crop = await getCropById(id, connection);
  if (!crop) {
    throw new Error('Crop was not found.');
  }
  return crop;
}

export async function markCropCompleted(id: number, database?: SQLiteDatabase) {
  return updateCropStatus(id, 'completed', database);
}

export async function markCropActive(id: number, database?: SQLiteDatabase) {
  return updateCropStatus(id, 'active', database);
}

export async function deleteCrop(id: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  await connection.runAsync('DELETE FROM crops WHERE id = ?', id);
}

export async function getCropCount(database?: SQLiteDatabase): Promise<number> {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM crops');
  return row?.count ?? 0;
}

export async function getActiveCropCount(database?: SQLiteDatabase): Promise<number> {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM crops WHERE status = ?',
    'active',
  );
  return row?.count ?? 0;
}

export const cropRepository = {
  getAllCrops,
  getActiveCrops,
  getCompletedCrops,
  getCropsByFarmId,
  getCropById,
  createCrop,
  updateCrop,
  markCropCompleted,
  markCropActive,
  deleteCrop,
  getCropCount,
  getActiveCropCount,
};
