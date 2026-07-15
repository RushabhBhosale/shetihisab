import type { SQLiteDatabase } from 'expo-sqlite';

interface Migration {
  version: number;
  migrate: (database: SQLiteDatabase) => Promise<void>;
}

const phaseOneSql = `
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
`;

const phaseTwoSql = `
  CREATE TABLE IF NOT EXISTS farms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    village TEXT,
    total_area REAL,
    area_unit TEXT NOT NULL DEFAULT 'guntha',
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_id INTEGER,
    crop_name TEXT NOT NULL,
    season TEXT,
    area REAL,
    area_unit TEXT NOT NULL DEFAULT 'guntha',
    planting_date TEXT,
    expected_harvest_date TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed')),
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_crops_status ON crops(status);
  CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON crops(farm_id);
`;

const finalPhaseSql = `
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_id INTEGER,
    category TEXT NOT NULL,
    amount REAL NOT NULL CHECK(amount > 0),
    expense_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS incomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_id INTEGER,
    buyer_name TEXT,
    total_amount REAL NOT NULL CHECK(total_amount > 0),
    amount_received REAL NOT NULL DEFAULT 0 CHECK(amount_received >= 0 AND amount_received <= total_amount),
    quantity REAL,
    unit TEXT,
    rate REAL,
    income_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    amount REAL NOT NULL CHECK(amount > 0),
    payment_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (income_id) REFERENCES incomes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_id INTEGER,
    title TEXT NOT NULL,
    reminder_date TEXT NOT NULL,
    notes TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0 CHECK(is_completed IN (0, 1)),
    notification_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
  CREATE INDEX IF NOT EXISTS idx_expenses_crop_id ON expenses(crop_id);
  CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(income_date);
  CREATE INDEX IF NOT EXISTS idx_incomes_crop_id ON incomes(crop_id);
  CREATE INDEX IF NOT EXISTS idx_payments_income_id ON payments(income_id);
  CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(reminder_date, is_completed);
  CREATE INDEX IF NOT EXISTS idx_reminders_crop_id ON reminders(crop_id);
`;

const migrations: Migration[] = [
  {
    version: 1,
    migrate: async (database) => database.execAsync(phaseOneSql),
  },
  {
    version: 2,
    migrate: async (database) => {
      const settingsColumns = await database.getAllAsync<{ name: string }>(
        'PRAGMA table_info(app_settings)',
      );

      if (!settingsColumns.some((column) => column.name === 'default_area_unit')) {
        await database.execAsync(
          "ALTER TABLE app_settings ADD COLUMN default_area_unit TEXT NOT NULL DEFAULT 'guntha'",
        );
      }

      await database.execAsync(phaseTwoSql);
    },
  },
  {
    version: 3,
    migrate: async (database) => database.execAsync(finalPhaseSql),
  },
];

export async function migrateDatabase(database: SQLiteDatabase) {
  const result = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue;
    }

    try {
      // Expo SQLite's exclusive transaction API is native-only. Running each
      // numbered migration directly follows Expo's cross-platform pattern.
      await migration.migrate(database);
      await database.execAsync(`PRAGMA user_version = ${migration.version}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Database migration ${migration.version} failed: ${reason}`);
    }
  }
}
