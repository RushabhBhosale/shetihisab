import { z } from 'zod';

export const expenseCategories = [
  'seeds',
  'fertilizer',
  'pesticide',
  'labour',
  'tractor',
  'water',
  'transport',
  'equipment',
  'electricity',
  'other',
] as const;

export const expenseSchema = z.object({
  category: z.enum(expenseCategories),
  amount: z
    .string()
    .trim()
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, 'validation.amount'),
  cropId: z.string(),
  date: z.string().min(1, 'validation.dateRequired'),
  notes: z.string().trim(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
