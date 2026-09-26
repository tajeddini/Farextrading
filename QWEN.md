# QWEN.md — Forex Trading Journal & Analytics

## وضعیت فعلی

پروژه در فاز **MT4/MT5 Trade Import** تکمیل شده.
- ✅ Supabase integration
- ✅ Authentication (signup/login/logout/session)
- ✅ Database schema (profiles, trading_accounts, account_phases, trades, import_batches)
- ✅ RLS policies
- ✅ Application layout & routing
- ✅ Theme system (dark/light)
- ✅ Protected routes
- ✅ Accounts management (list, create, edit, detail, archive, search, filter, sort)
- ✅ Phases management (list, create, edit, status change)
- ✅ **MT4/MT5 CSV Import (parser, normalizer, duplicate detection, preview, batch import)**
- ✅ Toast notification system
- ✅ Number/Currency/Date formatting utilities
- ❌ Trade management UI (فاز بعدی)
- ❌ Trading Journal (فاز بعدی)
- ❌ Analytics (فاز بعدی)

## تکنولوژی‌ها

| لایه | تکنولوژی |
|------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Routing | React Router DOM v6 |
| CSV Parser | papaparse |
| Charts | Recharts (نصب شده، استفاده نشده) |
| Testing | Vitest + @testing-library/react + jsdom |

## ساختار پروژه

```
src/
├── components/
│   ├── layout/AppLayout.tsx
│   ├── ui/                     # Button, Input, Select, Card, Badge, Loading, EmptyState, ErrorState, Modal, ConfirmDialog
│   ├── accounts/               # AccountCard, AccountForm, AccountFilters, AccountSummary
│   ├── account-phases/         # PhaseCard, PhaseForm
│   └── ProtectedRoute.tsx
├── contexts/
│   ├── AuthContext.tsx          # useAuth()
│   ├── ThemeContext.tsx         # useTheme()
│   └── ToastContext.tsx         # useToast()
├── pages/
│   ├── auth/LoginPage.tsx
│   ├── auth/RegisterPage.tsx
│   ├── dashboard/DashboardPage.tsx
│   ├── accounts/AccountsPage.tsx
│   ├── accounts/AccountDetailPage.tsx
│   ├── import/ImportPage.tsx   # MT4/MT5 import workflow
│   └── PlaceholderPage.tsx
├── services/
│   ├── supabase.ts
│   ├── profiles.ts
│   ├── accounts.ts
│   ├── accountPhases.ts
│   ├── trades.ts               # Trade CRUD
│   └── importBatches.ts        # Import batch tracking
├── types/database.ts
├── utils/
│   ├── auth-errors.ts
│   ├── format.ts               # formatCurrency, formatDate, etc.
│   ├── csv-parser.ts           # CSV parsing with papaparse
│   ├── trade-normalizer.ts     # Normalize MT4/MT5 data
│   └── duplicate-detector.ts   # Duplicate detection
├── App.tsx
├── main.tsx
├── router.tsx
└── index.css

supabase/migrations/
├── 001_initial_schema.sql      # profiles, trading_accounts, account_phases
├── 002_rls_policies.sql        # RLS for above tables
├── 003_trade_import.sql        # trades, import_batches
└── 004_trade_import_rls.sql    # RLS for trades, import_batches
```

## Routes

```
/login                    → Public
/register                 → Public
/app/dashboard            → Protected
/app/accounts             → Protected (Accounts list)
/app/accounts/:accountId  → Protected (Account detail + phases)
/app/import               → Protected (MT4/MT5 import workflow)
/app/trades               → Protected (placeholder)
/app/journal              → Protected (placeholder)
/app/analytics            → Protected (placeholder)
/app/calendar             → Protected (placeholder)
/app/reviews              → Protected (placeholder)
/app/settings             → Protected (placeholder)
```

## Database Schema

### profiles
- `id` UUID PK → auth.users(id)
- `display_name`, `avatar_url`, `timezone`, `default_currency`

### trading_accounts
- `id` UUID PK
- `user_id` FK → profiles(id)
- `name`, `broker`, `platform`, `account_number_label`
- `currency`, `initial_balance`, `current_balance`
- `status` ENUM: active | passed | failed | funded | archived

### account_phases
- `id` UUID PK
- `account_id` FK → trading_accounts(id)
- `name`, `phase_type` ENUM, `status` ENUM
- `starting_balance`, `target_balance`, `maximum_drawdown`, `daily_drawdown_limit`
- `start_date`, `end_date`

### trades
- `id` UUID PK
- `user_id` FK → profiles(id)
- `account_id` FK → trading_accounts(id)
- `phase_id` FK → account_phases(id) (nullable)
- `import_batch_id` FK → import_batches(id) (nullable)
- `ticket`, `position_id` (identification)
- `symbol`, `side` ENUM (buy/sell), `volume`
- `entry_datetime`, `entry_price`, `stop_loss`, `take_profit`
- `exit_datetime`, `exit_price`
- `commission`, `swap`, `profit`
- `comment`, `magic_number`
- `source` ENUM (mt4/mt5/manual), `source_file`
- `duration_seconds` (auto-calculated)

### import_batches
- `id` UUID PK
- `user_id` FK → profiles(id)
- `account_id` FK → trading_accounts(id)
- `phase_id` FK → account_phases(id) (nullable)
- `source` ENUM, `file_name`, `file_size`
- `total_rows`, `valid_rows`, `invalid_rows`, `duplicate_rows`, `imported_rows`
- `status` ENUM (processing/completed/completed_with_warnings/failed)
- `error_message`, `parser_version`
- `created_at`, `completed_at`

## RLS Rules

- **profiles**: auth.uid() = id
- **trading_accounts**: auth.uid() = user_id
- **account_phases**: ownership derived through parent account
- **trades**: auth.uid() = user_id
- **import_batches**: auth.uid() = user_id

## Import Architecture

### Workflow
1. Select Account & Phase
2. Upload CSV file
3. Detect format & map columns
4. Normalize & validate
5. Detect duplicates
6. Preview
7. Confirm & batch import
8. Show result

### Supported Formats
- MT4 CSV exports (standard and alternate headers)
- MT5 CSV exports (basic — deal aggregation not yet implemented)
- Comma, semicolon, tab delimiters
- UTF-8 with/without BOM

### Column Mapping
Automatic mapping with aliases:
- Ticket/Order → ticket
- Symbol/Instrument → symbol
- Type/Direction → side
- Volume/Lots → volume
- Open Time/Entry Time → entry_datetime
- Open Price/Price → entry_price
- Close Time/Exit Time → exit_datetime
- Close Price → exit_price
- Profit/P/L → profit
- Commission, Swap, Comment, Magic Number

### Duplicate Detection
Strategy:
1. If ticket available: `ticket + symbol + entry_datetime`
2. Fallback: composite fingerprint of all key fields
3. User can choose to skip duplicates (default)

### Batch Import
- Chunk size: 500 records per batch
- Transaction-safe
- Progress tracking via import_batches table

## Validation Rules

### Account Form
- name: required, max 100 chars
- currency: required
- initial_balance: numeric, non-negative
- current_balance: numeric, non-negative

### Phase Form
- name: required, max 100 chars
- phase_type: required
- status: required
- starting_balance: numeric, non-negative
- end_date >= start_date

### Trade Import
Required fields: symbol, side, volume, entry_datetime, entry_price, exit_datetime, exit_price, profit
Optional: ticket, position_id, stop_loss, take_profit, commission, swap, comment, magic_number

## دستورات

```bash
npm run dev        # Development server
npm run build      # Production build
npm run typecheck  # TypeScript check
npx vitest         # Run tests (watch)
npx vitest run     # Run tests once
```

## Testing

- **Framework**: Vitest + @testing-library/react + jsdom
- **Test files**: `src/**/*.test.{ts,tsx}`
- **Coverage**: csv-parser, trade-normalizer, duplicate-detector, format, auth-errors, database constants

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## قوانین مهم

1. **هرگز** service-role key را در frontend استفاده نکنید
2. **هرگز** .env را commit نکنید
3. تمام جداول باید RLS داشته باشند
4. تمام داده‌های user-owned باید `user_id` داشته باشند
5. Trade ها immutable هستند (فقط soft delete در آینده)
6. Timestamps به صورت TIMESTAMPTZ ذخیره می‌شوند
7. زبان UI فارسی است
8. RTL layout استفاده می‌شود
9. حساب‌ها آرشیو می‌شوند نه حذف
10. اعداد مالی در database به صورت NUMERIC ذخیره می‌شوند
11. Import نباید داده‌های موجود را overwrite کند
12. Duplicate detection mandatory است
13. Batch import با chunk size 500

## Known Limitations

### MT5 Import
- Deal aggregation (multiple deals → one trade) not yet implemented
- Only complete trade records are imported
- Complex MT5 exports may require manual intervention
- Architecture allows future expansion

### CSV Formats
- Tested with standard MT4/MT5 exports
- Some broker-specific formats may need custom mapping
- XLSX not yet supported (only CSV)
