import type { SQLiteDatabase } from 'expo-sqlite';

import { createIncome, getIncomeById } from '@/database/repositories/income-repository';

const row = {
  id: 8, crop_id: 2, crop_name: 'Wheat', buyer_name: 'Market', total_amount: 1000,
  amount_received: 400, quantity: 10, unit: 'Quintal', rate: 100,
  income_date: '2026-07-15', notes: null,
  created_at: '2026-07-15T10:00:00.000Z', updated_at: '2026-07-15T10:00:00.000Z',
};

describe('incomeRepository', () => {
  it('creates income and derives pending/payment status', async () => {
    const database = {
      runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 8 }),
      getFirstAsync: jest.fn().mockResolvedValue(row),
    } as unknown as SQLiteDatabase;
    const income = await createIncome({ cropId: 2, buyerName: 'Market', totalAmount: 1000, amountReceived: 400, quantity: 10, unit: 'Quintal', rate: 100, date: '2026-07-15' }, database);
    expect(income).toMatchObject({ pendingAmount: 600, paymentStatus: 'partiallyPaid' });
  });

  it('derives paid and pending statuses', async () => {
    const getFirstAsync = jest.fn().mockResolvedValueOnce({ ...row, amount_received: 1000 }).mockResolvedValueOnce({ ...row, amount_received: 0 });
    const database = { getFirstAsync } as unknown as SQLiteDatabase;
    await expect(getIncomeById(8, database)).resolves.toMatchObject({ paymentStatus: 'paid', pendingAmount: 0 });
    await expect(getIncomeById(8, database)).resolves.toMatchObject({ paymentStatus: 'pending', pendingAmount: 1000 });
  });

  it('rejects received amount above total before writing', async () => {
    const runAsync = jest.fn();
    const database = { runAsync } as unknown as SQLiteDatabase;
    await expect(createIncome({ cropId: 2, totalAmount: 100, amountReceived: 101, date: '2026-07-15' }, database)).rejects.toThrow('cannot exceed');
    expect(runAsync).not.toHaveBeenCalled();
  });
});
