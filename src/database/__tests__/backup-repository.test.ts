import type { SQLiteDatabase } from 'expo-sqlite';

import { parseBackup, restoreBackup } from '@/database/repositories/backup-repository';
import type { BackupData } from '@/features/backup/backup-schema';

const backup: BackupData = {
  version: 1,
  createdAt: '2026-07-15T12:00:00.000Z',
  profile: null,
  settings: {
    id: 1,
    language: 'mr',
    textSize: 'large',
    defaultAreaUnit: 'guntha',
    setupCompleted: true,
    createdAt: '2026-07-15T10:00:00.000Z',
    updatedAt: '2026-07-15T10:00:00.000Z',
  },
  farms: [],
  crops: [],
  expenses: [],
  incomes: [],
  payments: [],
  reminders: [],
};

describe('backupRepository', () => {
  it('parses a valid versioned backup and rejects invalid JSON data', () => {
    expect(parseBackup(JSON.stringify(backup))).toEqual(backup);
    expect(() => parseBackup('{"version":2}')).toThrow();
  });

  it('commits a successful replacement', async () => {
    const execAsync = jest.fn().mockResolvedValue(undefined);
    const runAsync = jest.fn().mockResolvedValue({ changes: 1 });
    const database = { execAsync, runAsync } as unknown as SQLiteDatabase;
    await restoreBackup(backup, database);
    expect(execAsync).toHaveBeenNthCalledWith(1, 'BEGIN IMMEDIATE');
    expect(execAsync).toHaveBeenLastCalledWith('COMMIT');
  });

  it('rolls back when any import write fails', async () => {
    const execAsync = jest.fn().mockResolvedValue(undefined);
    const runAsync = jest.fn().mockResolvedValueOnce({ changes: 1 }).mockRejectedValueOnce(new Error('write failed'));
    const database = { execAsync, runAsync } as unknown as SQLiteDatabase;
    await expect(restoreBackup(backup, database)).rejects.toThrow('write failed');
    expect(execAsync).toHaveBeenLastCalledWith('ROLLBACK');
    expect(execAsync).not.toHaveBeenCalledWith('COMMIT');
  });
});
