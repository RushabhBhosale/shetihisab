import { expenseSchema } from '@/features/expenses/expense-schema';

const validExpense = { category: 'seeds' as const, amount: '500', cropId: '', date: '2026-07-15', notes: '' };

describe('expenseSchema', () => {
  it('accepts a positive amount and optional crop', () => {
    expect(expenseSchema.safeParse(validExpense).success).toBe(true);
  });

  it('rejects zero, negative, and non-numeric amounts', () => {
    expect(expenseSchema.safeParse({ ...validExpense, amount: '0' }).success).toBe(false);
    expect(expenseSchema.safeParse({ ...validExpense, amount: '-2' }).success).toBe(false);
    expect(expenseSchema.safeParse({ ...validExpense, amount: 'five' }).success).toBe(false);
  });

  it('requires a date', () => {
    expect(expenseSchema.safeParse({ ...validExpense, date: '' }).success).toBe(false);
  });
});
