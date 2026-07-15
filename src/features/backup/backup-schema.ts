import { z } from 'zod';

const nullableText = z.string().nullable();
const areaUnit = z.enum(['guntha', 'acre', 'hectare']);
const timestamp = z.string().min(1);

const profile = z.object({
  id: z.literal(1),
  name: z.string(),
  village: nullableText,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const settings = z.object({
  id: z.literal(1),
  language: z.enum(['mr', 'en']),
  textSize: z.enum(['normal', 'large', 'extraLarge']),
  defaultAreaUnit: areaUnit,
  setupCompleted: z.boolean(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

const farm = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  village: nullableText,
  totalArea: z.number().nullable(),
  areaUnit,
  notes: nullableText,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const crop = z.object({
  id: z.number().int().positive(),
  farmId: z.number().int().positive().nullable(),
  farmName: nullableText,
  cropName: z.string(),
  season: nullableText,
  area: z.number().nullable(),
  areaUnit,
  plantingDate: nullableText,
  expectedHarvestDate: nullableText,
  status: z.enum(['active', 'completed']),
  notes: nullableText,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const expense = z.object({
  id: z.number().int().positive(),
  cropId: z.number().int().positive().nullable(),
  cropName: nullableText,
  category: z.enum([
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
  ]),
  amount: z.number().positive(),
  date: timestamp,
  notes: nullableText,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const income = z.object({
  id: z.number().int().positive(),
  cropId: z.number().int().positive().nullable(),
  cropName: nullableText,
  buyerName: nullableText,
  totalAmount: z.number().positive(),
  amountReceived: z.number().nonnegative(),
  pendingAmount: z.number().nonnegative(),
  paymentStatus: z.enum(['paid', 'partiallyPaid', 'pending']),
  quantity: z.number().nullable(),
  unit: nullableText,
  rate: z.number().nullable(),
  date: timestamp,
  notes: nullableText,
  createdAt: timestamp,
  updatedAt: timestamp,
}).refine((value) => value.amountReceived <= value.totalAmount, {
  message: 'Received amount exceeds total amount.',
  path: ['amountReceived'],
});

const payment = z.object({
  id: z.number().int().positive(),
  incomeId: z.number().int().positive(),
  amount: z.number().positive(),
  date: timestamp,
  notes: nullableText,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const reminder = z.object({
  id: z.number().int().positive(),
  cropId: z.number().int().positive().nullable(),
  cropName: nullableText,
  title: z.string(),
  date: timestamp,
  notes: nullableText,
  isCompleted: z.boolean(),
  notificationId: nullableText,
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const backupSchema = z.object({
  version: z.literal(1),
  createdAt: timestamp,
  profile: profile.nullable(),
  settings,
  farms: z.array(farm),
  crops: z.array(crop),
  expenses: z.array(expense),
  incomes: z.array(income),
  payments: z.array(payment),
  reminders: z.array(reminder),
});

export type BackupData = z.infer<typeof backupSchema>;
