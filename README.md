# ShetiHisab

ShetiHisab is a simple, local-first farming expense and profit app built for clear one-handed use on Android. Phase 1 provides the app foundation and intentionally keeps all farming transactions as placeholders.

## Phase 1 includes

- Two-step setup for language, name, and optional village
- Marathi and English, with Marathi as the default
- Normal, Large, and Extra Large text preferences
- Local Expo SQLite storage with numbered migrations
- Home, Crops, Add Entry, and History tabs
- Minimal Settings with a two-step app-data reset
- Accessible labels, large touch targets, readable contrast, and simple error/retry states
- Focused tests for database setup, profile/settings persistence, setup completion, and name validation

Phase 1 does not include farms, crop cycles, expenses, income, sales, reports, charts, exports, notifications, scanning, accounts, sync, or a backend.

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
  settings/             Minimal app settings
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
