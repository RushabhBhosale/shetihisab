import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/database/client';
import type { Expense, ExpenseCategory, ExpenseInput } from '@/types/app';

interface ExpenseRow {
  id: number;
  crop_id: number | null;
  crop_name: string | null;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const expenseSelect = `
  SELECT e.id, e.crop_id, c.crop_name, e.category, e.amount, e.expense_date,
         e.notes, e.created_at, e.updated_at
  FROM expenses e
  LEFT JOIN crops c ON c.id = e.crop_id
`;

function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    cropId: row.crop_id,
    cropName: row.crop_name,
    category: row.category,
    amount: row.amount,
    date: row.expense_date,
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

export async function getAllExpenses(database?: SQLiteDatabase): Promise<Expense[]> {
  const connection = await resolveDatabase(database);
  const rows = await connection.getAllAsync<ExpenseRow>(
    `${expenseSelect} ORDER BY e.expense_date DESC, e.updated_at DESC, e.id DESC`,
  );
  return rows.map(mapExpense);
}

export async function getExpenseById(id: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<ExpenseRow>(
    `${expenseSelect} WHERE e.id = ?`,
    id,
  );
  return row ? mapExpense(row) : null;
}

export async function getExpensesByCropId(cropId: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const rows = await connection.getAllAsync<ExpenseRow>(
    `${expenseSelect} WHERE e.crop_id = ? ORDER BY e.expense_date DESC, e.id DESC`,
    cropId,
  );
  return rows.map(mapExpense);
}

export async function createExpense(input: ExpenseInput, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const now = new Date().toISOString();
  const result = await connection.runAsync(
    `INSERT INTO expenses
      (crop_id, category, amount, expense_date, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    input.cropId ?? null,
    input.category,
    input.amount,
    input.date,
    optionalText(input.notes),
    now,
    now,
  );
  const expense = await getExpenseById(result.lastInsertRowId, connection);
  if (!expense) {
    throw new Error('Expense was not saved.');
  }
  return expense;
}

export async function updateExpense(
  id: number,
  input: ExpenseInput,
  database?: SQLiteDatabase,
) {
  const connection = await resolveDatabase(database);
  const result = await connection.runAsync(
    `UPDATE expenses
     SET crop_id = ?, category = ?, amount = ?, expense_date = ?, notes = ?, updated_at = ?
     WHERE id = ?`,
    input.cropId ?? null,
    input.category,
    input.amount,
    input.date,
    optionalText(input.notes),
    new Date().toISOString(),
    id,
  );
  if (result.changes === 0) {
    throw new Error('Expense was not found.');
  }
  const expense = await getExpenseById(id, connection);
  if (!expense) {
    throw new Error('Expense was not found.');
  }
  return expense;
}

export async function deleteExpense(id: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  await connection.runAsync('DELETE FROM expenses WHERE id = ?', id);
}

export async function getExpenseTotal(
  from: string | null = null,
  to: string | null = null,
  database?: SQLiteDatabase,
) {
  const connection = await resolveDatabase(database);
  const hasRange = Boolean(from && to);
  const row = await connection.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses${
      hasRange ? ' WHERE expense_date >= ? AND expense_date < ?' : ''
    }`,
    ...(hasRange ? [from as string, to as string] : []),
  );
  return row?.total ?? 0;
}

export async function getTodayExpenseTotal(today: string, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE expense_date = ?',
    today,
  );
  return row?.total ?? 0;
}

export const expenseRepository = {
  getAllExpenses,
  getExpenseById,
  getExpensesByCropId,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseTotal,
  getTodayExpenseTotal,
};
