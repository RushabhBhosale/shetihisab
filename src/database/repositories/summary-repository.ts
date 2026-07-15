import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/database/client';
import type { CropFinancialSummary, FinancialTotals, SummaryRange } from '@/types/app';
import { getSummaryDateRange, roundMoney } from '@/utils/finance';

async function resolveDatabase(database?: SQLiteDatabase) {
  return database ?? getDatabase();
}

interface TotalsRow {
  total_expense: number;
  total_income: number;
  pending_amount: number;
}

function mapTotals(row?: TotalsRow | null): FinancialTotals {
  const totalExpense = roundMoney(row?.total_expense ?? 0);
  const totalIncome = roundMoney(row?.total_income ?? 0);
  return {
    totalExpense,
    totalIncome,
    pendingAmount: roundMoney(row?.pending_amount ?? 0),
    profit: roundMoney(totalIncome - totalExpense),
  };
}

export async function getFinancialTotals(
  range: SummaryRange = 'all',
  database?: SQLiteDatabase,
) {
  const connection = await resolveDatabase(database);
  const { from, to } = getSummaryDateRange(range);
  const expenseRange = from && to ? 'WHERE expense_date >= ? AND expense_date < ?' : '';
  const incomeRange = from && to ? 'WHERE income_date >= ? AND income_date < ?' : '';
  const parameters = from && to ? [from, to, from, to, from, to] : [];
  const row = await connection.getFirstAsync<TotalsRow>(
    `SELECT
      (SELECT COALESCE(SUM(amount), 0) FROM expenses ${expenseRange}) AS total_expense,
      (SELECT COALESCE(SUM(total_amount), 0) FROM incomes ${incomeRange}) AS total_income,
      (SELECT COALESCE(SUM(MAX(total_amount - amount_received, 0)), 0)
       FROM incomes ${incomeRange}) AS pending_amount`,
    ...parameters,
  );
  return mapTotals(row);
}

export async function getCropFinancialTotals(
  cropId: number,
  database?: SQLiteDatabase,
) {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<TotalsRow>(
    `SELECT
      (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE crop_id = ?) AS total_expense,
      (SELECT COALESCE(SUM(total_amount), 0) FROM incomes WHERE crop_id = ?) AS total_income,
      (SELECT COALESCE(SUM(MAX(total_amount - amount_received, 0)), 0)
       FROM incomes WHERE crop_id = ?) AS pending_amount`,
    cropId,
    cropId,
    cropId,
  );
  return mapTotals(row);
}

interface CropSummaryRow extends TotalsRow {
  crop_id: number;
  crop_name: string;
}

export async function getCropSummaries(
  range: SummaryRange = 'all',
  database?: SQLiteDatabase,
): Promise<CropFinancialSummary[]> {
  const connection = await resolveDatabase(database);
  const { from, to } = getSummaryDateRange(range);
  const expenseWhere = from && to ? 'WHERE expense_date >= ? AND expense_date < ?' : '';
  const incomeWhere = from && to ? 'WHERE income_date >= ? AND income_date < ?' : '';
  const parameters = from && to ? [from, to, from, to] : [];
  const rows = await connection.getAllAsync<CropSummaryRow>(
    `WITH expense_totals AS (
       SELECT crop_id, SUM(amount) AS total_expense
       FROM expenses ${expenseWhere} GROUP BY crop_id
     ), income_totals AS (
       SELECT crop_id, SUM(total_amount) AS total_income,
              SUM(MAX(total_amount - amount_received, 0)) AS pending_amount
       FROM incomes ${incomeWhere} GROUP BY crop_id
     )
     SELECT c.id AS crop_id, c.crop_name,
            COALESCE(e.total_expense, 0) AS total_expense,
            COALESCE(i.total_income, 0) AS total_income,
            COALESCE(i.pending_amount, 0) AS pending_amount
     FROM crops c
     LEFT JOIN expense_totals e ON e.crop_id = c.id
     LEFT JOIN income_totals i ON i.crop_id = c.id
     WHERE COALESCE(e.total_expense, 0) > 0 OR COALESCE(i.total_income, 0) > 0
     ORDER BY c.updated_at DESC, c.id DESC`,
    ...parameters,
  );
  return rows.map((row) => ({
    cropId: row.crop_id,
    cropName: row.crop_name,
    ...mapTotals(row),
  }));
}

export const summaryRepository = {
  getFinancialTotals,
  getCropFinancialTotals,
  getCropSummaries,
};
