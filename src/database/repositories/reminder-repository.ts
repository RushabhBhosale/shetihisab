import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/database/client';
import type { Reminder, ReminderInput } from '@/types/app';

interface ReminderRow {
  id: number;
  crop_id: number | null;
  crop_name: string | null;
  title: string;
  reminder_date: string;
  notes: string | null;
  is_completed: number;
  notification_id: string | null;
  created_at: string;
  updated_at: string;
}

const reminderSelect = `
  SELECT r.id, r.crop_id, c.crop_name, r.title, r.reminder_date, r.notes,
         r.is_completed, r.notification_id, r.created_at, r.updated_at
  FROM reminders r
  LEFT JOIN crops c ON c.id = r.crop_id
`;

function mapReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    cropId: row.crop_id,
    cropName: row.crop_name,
    title: row.title,
    date: row.reminder_date,
    notes: row.notes,
    isCompleted: row.is_completed === 1,
    notificationId: row.notification_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function optionalText(value?: string | null) {
  return value?.trim() || null;
}

async function resolveDatabase(database?: SQLiteDatabase) {
  return database ?? getDatabase();
}

export async function getAllReminders(database?: SQLiteDatabase): Promise<Reminder[]> {
  const connection = await resolveDatabase(database);
  const rows = await connection.getAllAsync<ReminderRow>(
    `${reminderSelect} ORDER BY r.is_completed ASC, r.reminder_date ASC, r.id DESC`,
  );
  return rows.map(mapReminder);
}

export async function getReminderById(id: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<ReminderRow>(
    `${reminderSelect} WHERE r.id = ?`,
    id,
  );
  return row ? mapReminder(row) : null;
}

export async function getRemindersByCropId(cropId: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const rows = await connection.getAllAsync<ReminderRow>(
    `${reminderSelect} WHERE r.crop_id = ?
     ORDER BY r.is_completed ASC, r.reminder_date ASC, r.id DESC`,
    cropId,
  );
  return rows.map(mapReminder);
}

export async function getNextReminder(today: string, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const row = await connection.getFirstAsync<ReminderRow>(
    `${reminderSelect}
     WHERE r.is_completed = 0 AND r.reminder_date >= ?
     ORDER BY r.reminder_date ASC, r.id ASC LIMIT 1`,
    today,
  );
  return row ? mapReminder(row) : null;
}

export async function createReminder(input: ReminderInput, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  const now = new Date().toISOString();
  const result = await connection.runAsync(
    `INSERT INTO reminders
      (crop_id, title, reminder_date, notes, is_completed, notification_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    input.cropId ?? null,
    input.title.trim(),
    input.date,
    optionalText(input.notes),
    input.isCompleted ? 1 : 0,
    input.notificationId ?? null,
    now,
    now,
  );
  const reminder = await getReminderById(result.lastInsertRowId, connection);
  if (!reminder) {
    throw new Error('Reminder was not saved.');
  }
  return reminder;
}

export async function updateReminder(
  id: number,
  input: ReminderInput,
  database?: SQLiteDatabase,
) {
  const connection = await resolveDatabase(database);
  const result = await connection.runAsync(
    `UPDATE reminders
     SET crop_id = ?, title = ?, reminder_date = ?, notes = ?,
         is_completed = ?, notification_id = ?, updated_at = ?
     WHERE id = ?`,
    input.cropId ?? null,
    input.title.trim(),
    input.date,
    optionalText(input.notes),
    input.isCompleted ? 1 : 0,
    input.notificationId ?? null,
    new Date().toISOString(),
    id,
  );
  if (result.changes === 0) {
    throw new Error('Reminder was not found.');
  }
  const reminder = await getReminderById(id, connection);
  if (!reminder) {
    throw new Error('Reminder was not found.');
  }
  return reminder;
}

export async function markReminderComplete(id: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  await connection.runAsync(
    `UPDATE reminders
     SET is_completed = 1, notification_id = NULL, updated_at = ? WHERE id = ?`,
    new Date().toISOString(),
    id,
  );
}

export async function updateReminderNotificationId(
  id: number,
  notificationId: string | null,
  database?: SQLiteDatabase,
) {
  const connection = await resolveDatabase(database);
  await connection.runAsync('UPDATE reminders SET notification_id = ? WHERE id = ?', notificationId, id);
}

export async function deleteReminder(id: number, database?: SQLiteDatabase) {
  const connection = await resolveDatabase(database);
  await connection.runAsync('DELETE FROM reminders WHERE id = ?', id);
}

export const reminderRepository = {
  getAllReminders,
  getReminderById,
  getRemindersByCropId,
  getNextReminder,
  createReminder,
  updateReminder,
  markReminderComplete,
  updateReminderNotificationId,
  deleteReminder,
};
