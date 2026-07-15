import { createPaymentSchema } from '@/features/payments/payment-schema';

describe('paymentSchema', () => {
  it('accepts an amount up to the pending balance', () => {
    const schema = createPaymentSchema(500);
    expect(schema.safeParse({ amount: '500', date: '2026-07-15', notes: '' }).success).toBe(true);
  });

  it('rejects a payment above the pending balance', () => {
    const schema = createPaymentSchema(500);
    const result = schema.safeParse({ amount: '501', date: '2026-07-15', notes: '' });
    expect(result.success).toBe(false);
  });
});
