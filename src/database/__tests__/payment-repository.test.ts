import type { SQLiteDatabase } from 'expo-sqlite';

import { createPayment } from '@/database/repositories/payment-repository';

const incomeRow = {
  id: 8, crop_id: 2, crop_name: 'Wheat', buyer_name: null, total_amount: 1000,
  amount_received: 400, quantity: null, unit: null, rate: null, income_date: '2026-07-15', notes: null,
  created_at: '2026-07-15T10:00:00.000Z', updated_at: '2026-07-15T10:00:00.000Z',
};
const paymentRow = {
  id: 9, income_id: 8, amount: 300, payment_date: '2026-07-15', notes: null,
  created_at: '2026-07-15T11:00:00.000Z', updated_at: '2026-07-15T11:00:00.000Z',
};

function createDatabase() {
  const execAsync = jest.fn().mockResolvedValue(undefined);
  const runAsync = jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 9 });
  const getFirstAsync = jest.fn().mockResolvedValueOnce(incomeRow).mockResolvedValueOnce(paymentRow);
  return { database: { execAsync, runAsync, getFirstAsync } as unknown as SQLiteDatabase, execAsync, runAsync, getFirstAsync };
}

describe('paymentRepository', () => {
  it('adds a payment and updates amount received in one transaction', async () => {
    const { database, execAsync, runAsync } = createDatabase();
    const payment = await createPayment({ incomeId: 8, amount: 300, date: '2026-07-15' }, database);
    expect(execAsync).toHaveBeenNthCalledWith(1, 'BEGIN IMMEDIATE');
    expect(runAsync.mock.calls[0]?.[0]).toContain('INSERT INTO payments');
    expect(runAsync.mock.calls[1]?.[0]).toContain('amount_received');
    expect(execAsync).toHaveBeenLastCalledWith('COMMIT');
    expect(payment).toMatchObject({ id: 9, amount: 300 });
  });

  it('rejects a payment above pending and rolls back', async () => {
    const { database, execAsync, runAsync, getFirstAsync } = createDatabase();
    getFirstAsync.mockReset().mockResolvedValue({ ...incomeRow, amount_received: 900 });
    await expect(createPayment({ incomeId: 8, amount: 101, date: '2026-07-15' }, database)).rejects.toThrow('exceeds');
    expect(runAsync).not.toHaveBeenCalled();
    expect(execAsync).toHaveBeenLastCalledWith('ROLLBACK');
  });
});
