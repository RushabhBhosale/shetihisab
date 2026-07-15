# ShetiHisab

ShetiHisab is a simple, local-first farming finance and crop record app built for clear one-handed use on Android.

## Current features

- Two-step setup for language, name, and optional village
- Marathi and English, with Marathi as the default
- Normal, Large, and Extra Large text preferences
- Local Expo SQLite storage with numbered migrations
- Add, view, edit, and delete farms
- Add, view, edit, complete, reactivate, and delete crops
- Optional farm links, area, season, planting date, harvest date, and notes
- Real farm and active-crop totals on Home
- Expense tracking with categories, crop links, daily totals, and full CRUD
- Income and sales tracking with automatic quantity × rate totals
- Multiple payments with paid, partially paid, and pending status
- Automatic expense, income, pending, and profit calculations
- One-off reminders with optional local notifications
- Chronological activity history and month/year/all-time summaries
- Transactional local JSON backup and restore
- Home, Crops, Add Entry, and History tabs
- Settings with data management, backup/restore, and a two-step app-data reset
- Accessible labels, large touch targets, readable contrast, and simple error/retry states
- Focused tests for database setup, repositories, profile/settings persistence, and form validation

The app intentionally remains local-first: there are no accounts, cloud sync, backend, charts, receipt uploads, or recurring reminders.

## Run locally

This project uses Expo SDK 57 and requires Node.js 22.13 or newer.

```bash
npm install
npm run android
```

You can also start the development server with `npm start` and then choose an Android device or emulator.

## Checks

```bash
npm run typecheck
npm run lint
npm test
```

## Project layout

```text
app/                    Expo Router screens
  setup/                First-time language and profile setup
  (tabs)/               Home, Crops, Add Entry, and History
  crops/                Crop add, details, and edit screens
  farms/                Farm list, add, details, and edit screens
  expenses/             Expense list, add, details, and edit screens
  incomes/              Income list, add, details, and edit screens
  payments/             Income payment add and edit screens
  reminders/            Reminder list, add, details, and edit screens
  settings/             App settings and backup/restore
src/
  components/           Accessible reusable UI
  database/             SQLite client, migrations, and repositories
  features/             Feature-specific validation
  hooks/                Shared hooks
  i18n/                 English and Marathi translations
  store/                Small Zustand app state
  theme/                Light theme and text scales
  types/                Shared app types
```
