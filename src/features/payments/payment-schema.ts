import { z } from 'zod';

export function createPaymentSchema(maximumAmount: number) {
  return z.object({
    amount: z
      .string()
      .trim()
      .refine(
        (value) => Number.isFinite(Number(value)) && Number(value) > 0,
        'validation.amount',
      )
      .refine(
        (value) => Number(value) <= maximumAmount,
        'validation.paymentExceedsPending',
      ),
    date: z.string().min(1, 'validation.dateRequired'),
    notes: z.string().trim(),
  });
}

export type PaymentFormValues = {
  amount: string;
  date: string;
  notes: string;
};
