import { z } from 'zod';

const optionalPositiveNumber = z.string().trim().refine(
  (value) => value === '' || (Number.isFinite(Number(value)) && Number(value) > 0),
  'validation.positiveNumber',
);

export const incomeSchema = z
  .object({
    cropId: z.string().min(1, 'validation.cropRequired'),
    buyerName: z.string().trim(),
    totalAmount: z.string().trim().refine(
      (value) => Number.isFinite(Number(value)) && Number(value) > 0,
      'validation.amount',
    ),
    amountReceived: z.string().trim().refine(
      (value) => value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0,
      'validation.receivedAmount',
    ),
    quantity: optionalPositiveNumber,
    unit: z.string().trim(),
    rate: optionalPositiveNumber,
    date: z.string().min(1, 'validation.dateRequired'),
    notes: z.string().trim(),
  })
  .superRefine((values, context) => {
    const hasQuantity = values.quantity !== '';
    const hasRate = values.rate !== '';
    if (hasQuantity !== hasRate) {
      context.addIssue({
        code: 'custom',
        message: 'validation.quantityAndRate',
        path: [hasQuantity ? 'rate' : 'quantity'],
      });
    }
    const total = Number(values.totalAmount);
    const received = Number(values.amountReceived);
    if (Number.isFinite(total) && Number.isFinite(received) && received > total) {
      context.addIssue({
        code: 'custom',
        message: 'validation.receivedTooHigh',
        path: ['amountReceived'],
      });
    }
  });

export type IncomeFormValues = z.infer<typeof incomeSchema>;
