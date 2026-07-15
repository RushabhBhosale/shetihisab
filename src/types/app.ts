export type AppLanguage = 'mr' | 'en';

export type TextSizePreference = 'normal' | 'large' | 'extraLarge';

export type AreaUnit = 'guntha' | 'acre' | 'hectare';

export type CropStatus = 'active' | 'completed';

export type ExpenseCategory =
  | 'seeds'
  | 'fertilizer'
  | 'pesticide'
  | 'labour'
  | 'tractor'
  | 'water'
  | 'transport'
  | 'equipment'
  | 'electricity'
  | 'other';

export type PaymentStatus = 'paid' | 'partiallyPaid' | 'pending';

export type SummaryRange = 'month' | 'year' | 'all';

export interface AppProfile {
  id: number;
  name: string;
  village: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  id: number;
  language: AppLanguage;
  textSize: TextSizePreference;
  defaultAreaUnit: AreaUnit;
  setupCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileInput {
  name: string;
  village?: string | null;
}

export interface Farm {
  id: number;
  name: string;
  village: string | null;
  totalArea: number | null;
  areaUnit: AreaUnit;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FarmInput {
  name: string;
  village?: string | null;
  totalArea?: number | null;
  areaUnit: AreaUnit;
  notes?: string | null;
}

export interface Crop {
  id: number;
  farmId: number | null;
  farmName: string | null;
  cropName: string;
  season: string | null;
  area: number | null;
  areaUnit: AreaUnit;
  plantingDate: string | null;
  expectedHarvestDate: string | null;
  status: CropStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CropInput {
  farmId?: number | null;
  cropName: string;
  season?: string | null;
  area?: number | null;
  areaUnit: AreaUnit;
  plantingDate?: string | null;
  expectedHarvestDate?: string | null;
  status?: CropStatus;
  notes?: string | null;
}

export interface Expense {
  id: number;
  cropId: number | null;
  cropName: string | null;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  cropId?: number | null;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes?: string | null;
}

export interface Income {
  id: number;
  cropId: number | null;
  cropName: string | null;
  buyerName: string | null;
  totalAmount: number;
  amountReceived: number;
  pendingAmount: number;
  paymentStatus: PaymentStatus;
  quantity: number | null;
  unit: string | null;
  rate: number | null;
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeInput {
  cropId: number;
  buyerName?: string | null;
  totalAmount: number;
  amountReceived: number;
  quantity?: number | null;
  unit?: string | null;
  rate?: number | null;
  date: string;
  notes?: string | null;
}

export interface Payment {
  id: number;
  incomeId: number;
  amount: number;
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInput {
  incomeId: number;
  amount: number;
  date: string;
  notes?: string | null;
}

export interface Reminder {
  id: number;
  cropId: number | null;
  cropName: string | null;
  title: string;
  date: string;
  notes: string | null;
  isCompleted: boolean;
  notificationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderInput {
  cropId?: number | null;
  title: string;
  date: string;
  notes?: string | null;
  isCompleted?: boolean;
  notificationId?: string | null;
}

export interface FinancialTotals {
  totalExpense: number;
  totalIncome: number;
  pendingAmount: number;
  profit: number;
}

export interface CropFinancialSummary extends FinancialTotals {
  cropId: number;
  cropName: string;
}

export type ActivityKind = 'expense' | 'income' | 'payment' | 'crop' | 'reminder';

export interface ActivityItem {
  id: string;
  entityId: number;
  kind: ActivityKind;
  title: string;
  amount: number | null;
  action: 'added' | 'updated';
  date: string;
}
