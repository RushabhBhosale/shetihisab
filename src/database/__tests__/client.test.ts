import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import { initializeDatabase } from '@/database/client';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

describe('database initialization', () => {
  it('opens the database, enables safe pragmas, and runs numbered migrations', async () => {
    const database = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      getFirstAsync: jest.fn().mockResolvedValue({ user_version: 0 }),
      withExclusiveTransactionAsync: jest.fn(),
    } as unknown as SQLiteDatabase;

    (database.withExclusiveTransactionAsync as jest.Mock).mockImplementation(
      async (callback: (transaction: SQLiteDatabase) => Promise<void>) => callback(database),
    );
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(database);

    await initializeDatabase();

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('shetihisab.db');
    expect(database.execAsync).toHaveBeenCalledWith(
      'PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;',
    );
    expect(database.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS app_profile'),
    );
    expect(database.execAsync).toHaveBeenCalledWith('PRAGMA user_version = 1');
  });
});
