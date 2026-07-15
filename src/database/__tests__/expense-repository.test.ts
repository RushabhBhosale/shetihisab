import type { SQLiteDatabase } from 'expo-sqlite';

import { createExpense, deleteExpense, getTodayExpenseTotal, updateExpense } from '@/database/repositories/expense-repository';

const row = {
  id: 4, crop_id: 2, crop_name: 'Wheat', category: 'seeds', amount: 500,
  expense_date: '2026-07-15', notes: null,
  created_at: '2026-07-15T10:00:00.000Z', updated_at: '2026-07-15T10:00:00.000Z',
};
const input = { cropId: 2, category: 'seeds' as const, amount: 500, date: '2026-07-15', notes: null };

function createDatabase() {
  const runAsync = jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 4 });
  const getFirstAsync = jest.fn().mockResolvedValue(row);
  return { database: { runAsync, getFirstAsync } as unknown as SQLiteDatabase, runAsync, getFirstAsync };
}

describe('expenseRepository', () => {
  it('creates and maps an expense', async () => {
    const { database, runAsync } = createDatabase();
    const expense = await createExpense(input, database);
    expect(runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO expenses'), 2, 'seeds', 500, '2026-07-15', null, expect.any(String), expect.any(String));
    expect(expense).toMatchObject({ id: 4, cropName: 'Wheat', amount: 500 });
  });

  it('updates and deletes an expense', async () => {
    const { database, runAsync } = createDatabase();
    await updateExpense(4, { ...input, amount: 650 }, database);
    expect(runAsync.mock.calls[0]?.[0]).toContain('UPDATE expenses');
    await deleteExpense(4, database);
    expect(runAsync).toHaveBeenLastCalledWith('DELETE FROM expenses WHERE id = ?', 4);
  });

  it("calculates today's expenses", async () => {
    const { database, getFirstAsync } = createDatabase();
    getFirstAsync.mockResolvedValueOnce({ total: 900 });
    await expect(getTodayExpenseTotal('2026-07-15', database)).resolves.toBe(900);
    expect(getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('expense_date = ?'), '2026-07-15');
  });
});
