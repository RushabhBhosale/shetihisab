import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/database/client';
import type { ActivityItem, ActivityKind } from '@/types/app';

interface ActivityRow {
  entity_id: number;
  kind: ActivityKind;
  title: string;
  amount: number | null;
  created_at: string;
  updated_at: string;
}

export async function getRecentActivity(
  limit = 20,
  database?: SQLiteDatabase,
): Promise<ActivityItem[]> {
  const connection = database ?? (await getDatabase());
  const rows = await connection.getAllAsync<ActivityRow>(
    `SELECT entity_id, kind, title, amount, created_at, updated_at
     FROM (
       SELECT e.id AS entity_id, 'expense' AS kind, e.category AS title,
              e.amount, e.created_at, e.updated_at FROM expenses e
       UNION ALL
       SELECT i.id, 'income', COALESCE(c.crop_name, i.buyer_name, ''),
              i.total_amount, i.created_at, i.updated_at
       FROM incomes i LEFT JOIN crops c ON c.id = i.crop_id
       UNION ALL
       SELECT p.id, 'payment', COALESCE(c.crop_name, i.buyer_name, ''),
              p.amount, p.created_at, p.updated_at
       FROM payments p
       JOIN incomes i ON i.id = p.income_id
       LEFT JOIN crops c ON c.id = i.crop_id
       UNION ALL
       SELECT c.id, 'crop', c.crop_name, NULL, c.created_at, c.updated_at FROM crops c
       UNION ALL
       SELECT r.id, 'reminder', r.title, NULL, r.created_at, r.updated_at FROM reminders r
     ) activity
     ORDER BY updated_at DESC, entity_id DESC
     LIMIT ?`,
    limit,
  );
  return rows.map((row) => ({
    id: `${row.kind}-${row.entity_id}`,
    entityId: row.entity_id,
    kind: row.kind,
    title: row.title,
    amount: row.amount,
    action: row.created_at === row.updated_at ? 'added' : 'updated',
    date: row.updated_at,
  }));
}

export const activityRepository = { getRecentActivity };
