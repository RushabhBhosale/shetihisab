# ShetiHisab

ShetiHisab is a simple, local-first farming record app built for clear one-handed use on Android. Phase 2 adds farm and crop tracking while intentionally keeping financial transactions as placeholders.

## Current features

- Two-step setup for language, name, and optional village
- Marathi and English, with Marathi as the default
- Normal, Large, and Extra Large text preferences
- Local Expo SQLite storage with numbered migrations
- Add, view, edit, and delete farms
- Add, view, edit, complete, reactivate, and delete crops
- Optional farm links, area, season, planting date, harvest date, and notes
- Real farm and active-crop totals on Home
- Recent farm and crop activity in History
- Home, Crops, Add Entry, and History tabs
- Settings with farm management and a two-step app-data reset
- Accessible labels, large touch targets, readable contrast, and simple error/retry states
- Focused tests for database setup, repositories, profile/settings persistence, and form validation

Phase 2 does not include expenses, income, sales, payments, production, profit calculations, reports, charts, exports, notifications, scanning, accounts, sync, or a backend.

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
