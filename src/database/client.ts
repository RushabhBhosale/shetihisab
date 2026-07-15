import * as SQLite from 'expo-sqlite';

import { migrateDatabase } from './migrations';

const DATABASE_NAME = 'shetihisab.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return databasePromise;
}

export async function initializeDatabase() {
  const database = await getDatabase();
  await database.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrateDatabase(database);
  return database;
}
