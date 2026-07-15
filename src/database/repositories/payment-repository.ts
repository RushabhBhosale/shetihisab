import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/database/client';
import { getIncomeById } from '@/database/repositories/income-repository';
import type { Payment, PaymentInput } from '@/types/app';
import { roundMoney } from '@/utils/finance';

interface PaymentRow {
  id: number;
  income_id: number;
  amount: number;
  payment_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    incomeId: row.income_id,
    amount: row.amount,
    date: row.payment_date,
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

async function inTransaction<T>(database: SQLiteDatabase, action: () => Promise<T>) {
  await database.execAsync('BEGIN IMMEDIATE');
  try {
    const result = await action();
    await database.execAsync('COMMIT');
    return result;
  } catch (error) {
    await database.execAsync('ROLLBACK');
    throw error;
  }
}

function assertPaymentAmount(amount: number, maximum: number) {
  if (amount <= 0) {
    throw new Error('Payment amount must be greater than zero.');
  }
  if (roundMoney(amount) > roundMoney(maximum)) {
    throw new Error('Payment amount exceeds the pending amount.');
  }
}

export async function getAllPayments(database?: SQLiteDatabase): Promise<Payment[]> {
  const connection = await resolveDatabase(database);
  const rows = await connection.getAllAsync<PaymentRow>(
    `SELECT id, income_id, amount, payment_date, notes, created_at, updated_at
     FROM payments ORDER BY payment_date DESC, updated_at DESC, id DESC`,
  );
  return rows.map(mapPayment);
}

export async function getPaymentsByIncomeId(
  incomeId: number,
  database?: SQLiteDatabase,
) {
  const connection = await resolveDatabase(database);
  const rows = await connection.getAllAsync<PaymentRow>(
    `SELECT id, income_id, amount, payment_date, notes, created_at, updated_at
     FROM payments WHERE income_id = ? ORDER BY payment_date DESC, id DESC`,
    incomeId,
  );
  return rows.map(mapPayment);
}

export async function getPaymentById(id: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<PaymentRow>(
    `SELECT id, income_id, amount, payment_date, notes, created_at, updated_at
     FROM payments WHERE id = ?`,
    id,
  );
  return row ? mapPayment(row) : null;
}

export async function createPayment(input: PaymentInput, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  return inTransaction(connection, async () => {
    const income = await getIncomeById(input.incomeId, connection);
    if (!income) {
      throw new Error('Income was not found.');
    }
    assertPaymentAmount(input.amount, income.pendingAmount);
    const now = new Date().toISOString();
    const amount = roundMoney(input.amount);
    const result = await connection.runAsync(
      `INSERT INTO payments
        (income_id, amount, payment_date, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      input.incomeId,
      amount,
      input.date,
      optionalText(input.notes),
      now,
      now,
    );
    await connection.runAsync(
      `UPDATE incomes
       SET amount_received = MIN(total_amount, amount_received + ?), updated_at = ?
       WHERE id = ?`,
      amount,
      now,
      input.incomeId,
    );
    const payment = await getPaymentById(result.lastInsertRowId, connection);
    if (!payment) {
      throw new Error('Payment was not saved.');
    }
    return payment;
  });
}

export async function updatePayment(
  id: number,
  input: PaymentInput,
  database?: SQLiteDatabase,
) {
  const connection = await resolveDatabase(database);
  return inTransaction(connection, async () => {
    const [payment, income] = await Promise.all([
      getPaymentById(id, connection),
      getIncomeById(input.incomeId, connection),
    ]);
    if (!payment || !income || payment.incomeId !== input.incomeId) {
      throw new Error('Payment was not found.');
    }
    assertPaymentAmount(input.amount, income.pendingAmount + payment.amount);
    const amount = roundMoney(input.amount);
    const difference = roundMoney(amount - payment.amount);
    const now = new Date().toISOString();
    await connection.runAsync(
      `UPDATE payments
       SET amount = ?, payment_date = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      amount,
      input.date,
      optionalText(input.notes),
      now,
      id,
    );
    await connection.runAsync(
      `UPDATE incomes
       SET amount_received = MIN(total_amount, MAX(0, amount_received + ?)), updated_at = ?
       WHERE id = ?`,
      difference,
      now,
      input.incomeId,
    );
    const updated = await getPaymentById(id, connection);
    if (!updated) {
      throw new Error('Payment was not found.');
    }
    return updated;
  });
}

export async function deletePayment(id: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  return inTransaction(connection, async () => {
    const payment = await getPaymentById(id, connection);
    if (!payment) {
      return;
    }
    const now = new Date().toISOString();
    await connection.runAsync('DELETE FROM payments WHERE id = ?', id);
    await connection.runAsync(
      `UPDATE incomes
       SET amount_received = MAX(0, amount_received - ?), updated_at = ?
       WHERE id = ?`,
      payment.amount,
      now,
      payment.incomeId,
    );
  });
}

export const paymentRepository = {
  getAllPayments,
  getPaymentsByIncomeId,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
};
