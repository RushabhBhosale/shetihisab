import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/database/client';
import type { Income, IncomeInput } from '@/types/app';
import { getPaymentStatus, roundMoney } from '@/utils/finance';

interface IncomeRow {
  id: number;
  crop_id: number | null;
  crop_name: string | null;
  buyer_name: string | null;
  total_amount: number;
  amount_received: number;
  quantity: number | null;
  unit: string | null;
  rate: number | null;
  income_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const incomeSelect = `
  SELECT i.id, i.crop_id, c.crop_name, i.buyer_name, i.total_amount,
         i.amount_received, i.quantity, i.unit, i.rate, i.income_date,
         i.notes, i.created_at, i.updated_at
  FROM incomes i
  LEFT JOIN crops c ON c.id = i.crop_id
`;

function mapIncome(row: IncomeRow): Income {
  const pendingAmount = roundMoney(Math.max(0, row.total_amount - row.amount_received));
  return {
    id: row.id,
    cropId: row.crop_id,
    cropName: row.crop_name,
    buyerName: row.buyer_name,
    totalAmount: row.total_amount,
    amountReceived: row.amount_received,
    pendingAmount,
    paymentStatus: getPaymentStatus(row.total_amount, row.amount_received),
    quantity: row.quantity,
    unit: row.unit,
    rate: row.rate,
    date: row.income_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function optionalText(value?: string | null) {
  return value?.trim() || null;
}

function assertIncome(input: IncomeInput) {
  if (input.totalAmount <= 0 || input.amountReceived < 0) {
    throw new Error('Income amounts are invalid.');
  }
  if (roundMoney(input.amountReceived) > roundMoney(input.totalAmount)) {
    throw new Error('Amount received cannot exceed total amount.');
  }
}

async function resolveDatabase(database?: SQLiteDatabase) {
  return database ?? getDatabase();
}

export async function getAllIncomes(database?: SQLiteDatabase): Promise<Income[]> {
  const connection = await resolveDatabase(database);
  const rows = await connection.getAllAsync<IncomeRow>(
    `${incomeSelect} ORDER BY i.income_date DESC, i.updated_at DESC, i.id DESC`,
  );
  return rows.map(mapIncome);
}

export async function getIncomeById(id: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<IncomeRow>(`${incomeSelect} WHERE i.id = ?`, id);
  return row ? mapIncome(row) : null;
}

export async function getIncomesByCropId(cropId: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const rows = await connection.getAllAsync<IncomeRow>(
    `${incomeSelect} WHERE i.crop_id = ? ORDER BY i.income_date DESC, i.id DESC`,
    cropId,
  );
  return rows.map(mapIncome);
}

export async function createIncome(input: IncomeInput, database?: SQLiteDatabase) {
  assertIncome(input);
  const connection = await resolveDatabase(database);
  const now = new Date().toISOString();
  const result = await connection.runAsync(
    `INSERT INTO incomes
      (crop_id, buyer_name, total_amount, amount_received, quantity, unit, rate,
       income_date, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.cropId,
    optionalText(input.buyerName),
    roundMoney(input.totalAmount),
    roundMoney(input.amountReceived),
    input.quantity ?? null,
    optionalText(input.unit),
    input.rate ?? null,
    input.date,
    optionalText(input.notes),
    now,
    now,
  );
  const income = await getIncomeById(result.lastInsertRowId, connection);
  if (!income) {
    throw new Error('Income was not saved.');
  }
  return income;
}

export async function updateIncome(
  id: number,
  input: IncomeInput,
  database?: SQLiteDatabase,
) {
  assertIncome(input);
  const connection = await resolveDatabase(database);
  const result = await connection.runAsync(
    `UPDATE incomes
     SET crop_id = ?, buyer_name = ?, total_amount = ?, amount_received = ?, quantity = ?,
         unit = ?, rate = ?, income_date = ?, notes = ?, updated_at = ?
     WHERE id = ?`,
    input.cropId,
    optionalText(input.buyerName),
    roundMoney(input.totalAmount),
    roundMoney(input.amountReceived),
    input.quantity ?? null,
    optionalText(input.unit),
    input.rate ?? null,
    input.date,
    optionalText(input.notes),
    new Date().toISOString(),
    id,
  );
  if (result.changes === 0) {
    throw new Error('Income was not found.');
  }
  const income = await getIncomeById(id, connection);
  if (!income) {
    throw new Error('Income was not found.');
  }
  return income;
}

export async function deleteIncome(id: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  await connection.runAsync('DELETE FROM incomes WHERE id = ?', id);
}

export async function getIncomeTotals(
  from: string | null = null,
  to: string | null = null,
  database?: SQLiteDatabase,
) {
  const connection = await resolveDatabase(database);
  const hasRange = Boolean(from && to);
  const row = await connection.getFirstAsync<{ total: number; pending: number }>(
    `SELECT COALESCE(SUM(total_amount), 0) AS total,
            COALESCE(SUM(MAX(total_amount - amount_received, 0)), 0) AS pending
     FROM incomes${hasRange ? ' WHERE income_date >= ? AND income_date < ?' : ''}`,
    ...(hasRange ? [from as string, to as string] : []),
  );
  return { totalIncome: row?.total ?? 0, pendingAmount: row?.pending ?? 0 };
}

export const incomeRepository = {
  getAllIncomes,
  getIncomeById,
  getIncomesByCropId,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeTotals,
};
