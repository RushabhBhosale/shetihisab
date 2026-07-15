import type { SQLiteDatabase } from 'expo-sqlite';

interface Migration {
  version: number;
  sql: string;
}

const migrations: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS app_profile (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        village TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY,
        language TEXT NOT NULL DEFAULT 'mr',
        text_size TEXT NOT NULL DEFAULT 'large',
        setup_completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT NOT NULL
      );

      INSERT OR IGNORE INTO app_settings (
        id,
        language,
        text_size,
        setup_completed,
        created_at,
        updated_at
      ) VALUES (1, 'mr', 'large', 0, datetime('now'), datetime('now'));
    `,
  },
];

export async function migrateDatabase(database: SQLiteDatabase) {
  const result = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue;
    }

    // Expo SQLite's exclusive transaction API is native-only. Running each
    // numbered migration directly follows Expo's cross-platform migration
    // pattern and keeps initialization working in the web worker as well.
    await database.execAsync(migration.sql);
    await database.execAsync(`PRAGMA user_version = ${migration.version}`);
  }
}
