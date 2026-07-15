import { incomeSchema } from '@/features/incomes/income-schema';

const validIncome = {
  cropId: '1', buyerName: '', totalAmount: '1000', amountReceived: '400',
  quantity: '', unit: '', rate: '', date: '2026-07-15', notes: '',
};

describe('incomeSchema', () => {
  it('requires a crop and positive total', () => {
    expect(incomeSchema.safeParse(validIncome).success).toBe(true);
    expect(incomeSchema.safeParse({ ...validIncome, cropId: '' }).success).toBe(false);
    expect(incomeSchema.safeParse({ ...validIncome, totalAmount: '0' }).success).toBe(false);
  });

  it('prevents received amount exceeding total', () => {
    const result = incomeSchema.safeParse({ ...validIncome, amountReceived: '1001' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe('validation.receivedTooHigh');
  });

  it('requires quantity and rate together', () => {
    expect(incomeSchema.safeParse({ ...validIncome, quantity: '10', rate: '' }).success).toBe(false);
    expect(incomeSchema.safeParse({ ...validIncome, quantity: '10', rate: '100' }).success).toBe(true);
  });
});
