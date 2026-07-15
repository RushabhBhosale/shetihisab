import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/database/client';
import { cropRepository } from '@/database/repositories/crop-repository';
import { expenseRepository } from '@/database/repositories/expense-repository';
import { farmRepository } from '@/database/repositories/farm-repository';
import { incomeRepository } from '@/database/repositories/income-repository';
import { paymentRepository } from '@/database/repositories/payment-repository';
import { profileRepository } from '@/database/repositories/profile-repository';
import { reminderRepository } from '@/database/repositories/reminder-repository';
import { settingsRepository } from '@/database/repositories/settings-repository';
import { backupSchema, type BackupData } from '@/features/backup/backup-schema';

export async function createBackup(database?: SQLiteDatabase): Promise<BackupData> {
  const connection = database ?? (await getDatabase());
  const [profile, settings, farms, crops, expenses, incomes, payments, reminders] =
    await Promise.all([
      profileRepository.getProfile(connection),
      settingsRepository.getSettings(connection),
      farmRepository.getAllFarms(connection),
      cropRepository.getAllCrops(connection),
      expenseRepository.getAllExpenses(connection),
      incomeRepository.getAllIncomes(connection),
      paymentRepository.getAllPayments(connection),
      reminderRepository.getAllReminders(connection),
    ]);
  if (settings.id !== 1 || (profile && profile.id !== 1)) {
    throw new Error('App profile or settings are invalid.');
  }
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    profile: profile ? { ...profile, id: 1 as const } : null,
    settings: { ...settings, id: 1 as const },
    farms,
    crops,
    expenses,
    incomes,
    payments,
    reminders,
  };
}

export function parseBackup(json: string) {
  return backupSchema.parse(JSON.parse(json));
}

export async function restoreBackup(backup: BackupData, database?: SQLiteDatabase) {
  const data = backupSchema.parse(backup);
  const connection = database ?? (await getDatabase());
  await connection.execAsync('BEGIN IMMEDIATE');
  try {
    await connection.runAsync('DELETE FROM payments');
    await connection.runAsync('DELETE FROM reminders');
    await connection.runAsync('DELETE FROM expenses');
    await connection.runAsync('DELETE FROM incomes');
    await connection.runAsync('DELETE FROM crops');
    await connection.runAsync('DELETE FROM farms');
    await connection.runAsync('DELETE FROM app_profile');

    await connection.runAsync(
      `UPDATE app_settings
       SET language = ?, text_size = ?, default_area_unit = ?, setup_completed = ?,
           created_at = ?, updated_at = ? WHERE id = ?`,
      data.settings.language,
      data.settings.textSize,
      data.settings.defaultAreaUnit,
      data.settings.setupCompleted ? 1 : 0,
      data.settings.createdAt,
      data.settings.updatedAt,
      data.settings.id,
    );

    if (data.profile) {
      await connection.runAsync(
        `INSERT INTO app_profile (id, name, village, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        data.profile.id,
        data.profile.name,
        data.profile.village,
        data.profile.createdAt,
        data.profile.updatedAt,
      );
    }

    for (const farm of data.farms) {
      await connection.runAsync(
        `INSERT INTO farms
          (id, name, village, total_area, area_unit, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        farm.id,
        farm.name,
        farm.village,
        farm.totalArea,
        farm.areaUnit,
        farm.notes,
        farm.createdAt,
        farm.updatedAt,
      );
    }

    for (const crop of data.crops) {
      await connection.runAsync(
        `INSERT INTO crops
          (id, farm_id, crop_name, season, area, area_unit, planting_date,
           expected_harvest_date, status, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        crop.id,
        crop.farmId,
        crop.cropName,
        crop.season,
        crop.area,
        crop.areaUnit,
        crop.plantingDate,
        crop.expectedHarvestDate,
        crop.status,
        crop.notes,
        crop.createdAt,
        crop.updatedAt,
      );
    }

    for (const expense of data.expenses) {
      await connection.runAsync(
        `INSERT INTO expenses
          (id, crop_id, category, amount, expense_date, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        expense.id,
        expense.cropId,
        expense.category,
        expense.amount,
        expense.date,
        expense.notes,
        expense.createdAt,
        expense.updatedAt,
      );
    }

    for (const income of data.incomes) {
      await connection.runAsync(
        `INSERT INTO incomes
          (id, crop_id, buyer_name, total_amount, amount_received, quantity, unit, rate,
           income_date, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        income.id,
        income.cropId,
        income.buyerName,
        income.totalAmount,
        income.amountReceived,
        income.quantity,
        income.unit,
        income.rate,
        income.date,
        income.notes,
        income.createdAt,
        income.updatedAt,
      );
    }

    for (const payment of data.payments) {
      await connection.runAsync(
        `INSERT INTO payments
          (id, income_id, amount, payment_date, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        payment.id,
        payment.incomeId,
        payment.amount,
        payment.date,
        payment.notes,
        payment.createdAt,
        payment.updatedAt,
      );
    }

    for (const reminder of data.reminders) {
      await connection.runAsync(
        `INSERT INTO reminders
          (id, crop_id, title, reminder_date, notes, is_completed, notification_id,
           created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
        reminder.id,
        reminder.cropId,
        reminder.title,
        reminder.date,
        reminder.notes,
        reminder.isCompleted ? 1 : 0,
        reminder.createdAt,
        reminder.updatedAt,
      );
    }

    await connection.execAsync('COMMIT');
  } catch (error) {
    await connection.execAsync('ROLLBACK');
    throw error;
  }
}

export const backupRepository = { createBackup, parseBackup, restoreBackup };
