# QWEN.md — Forex Trading Journal & Analytics

## وضعیت فعلی

پروژه در فاز **Accounts & Phases Management** تکمیل شده.
- ✅ Supabase integration
- ✅ Authentication (signup/login/logout/session)
- ✅ Database schema (profiles, trading_accounts, account_phases)
- ✅ RLS policies
- ✅ Application layout & routing
- ✅ Theme system (dark/light)
- ✅ Protected routes
- ✅ **Accounts management (list, create, edit, detail, archive, search, filter, sort)**
- ✅ **Phases management (list, create, edit, status change)**
- ✅ Toast notification system
- ✅ Number/Currency/Date formatting utilities
- ❌ Trade model (فاز بعدی)
- ❌ MT4/MT5 Import (فاز بعدی)
- ❌ Analytics (فاز بعدی)

## تکنولوژی‌ها

| لایه | تکنولوژی |
|------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Routing | React Router DOM v6 |
| Charts | Recharts (نصب شده، استفاده نشده) |
| Animations | Framer Motion (نصب شده، استفاده نشده) |
| Icons | Lucide React (نصب شده) + SVG inline |
| Date | date-fns |
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
│   └── ToastContext.tsx         # useToast() — success, error, info, warning
├── pages/
│   ├── auth/LoginPage.tsx
│   ├── auth/RegisterPage.tsx
│   ├── dashboard/DashboardPage.tsx
│   ├── accounts/AccountsPage.tsx      # List + Create + Search + Filter + Sort
│   ├── accounts/AccountDetailPage.tsx # Detail + Edit + Phases management
│   └── PlaceholderPage.tsx
├── services/
│   ├── supabase.ts
│   ├── profiles.ts
│   ├── accounts.ts
│   └── accountPhases.ts
├── types/database.ts
├── utils/
│   ├── auth-errors.ts
│   └── format.ts               # formatCurrency, formatDate, getAccountStatusLabel, sortPhasesByType, etc.
├── App.tsx
├── main.tsx
├── router.tsx
└── index.css

supabase/migrations/
├── 001_initial_schema.sql
└── 002_rls_policies.sql
```

## Routes

```
/login                    → Public
/register                 → Public
/app/dashboard            → Protected
/app/accounts             → Protected (Accounts list)
/app/accounts/:accountId  → Protected (Account detail + phases)
/app/trades               → Protected (placeholder)
/app/journal              → Protected (placeholder)
/app/analytics            → Protected (placeholder)
/app/calendar             → Protected (placeholder)
/app/reviews              → Protected (placeholder)
/app/import               → Protected (placeholder)
/app/settings             → Protected (placeholder)
```

## Database Schema

### profiles
- `id` UUID PK → auth.users(id)
- `display_name`, `avatar_url`, `timezone`, `default_currency`
- Auto-created on user signup via trigger

### trading_accounts
- `id` UUID PK
- `user_id` FK → profiles(id)
- `name`, `broker`, `platform`, `account_number_label`
- `currency`, `initial_balance`, `current_balance`
- `status` ENUM: active | passed | failed | funded | archived
- `notes`

### account_phases
- `id` UUID PK
- `account_id` FK → trading_accounts(id)
- `name`, `phase_type` ENUM, `status` ENUM
- `starting_balance`, `target_balance`, `maximum_drawdown`, `daily_drawdown_limit`
- `start_date`, `end_date`

## RLS Rules

- **profiles**: auth.uid() = id
- **trading_accounts**: auth.uid() = user_id
- **account_phases**: ownership derived through parent account's user_id

## Validation Rules

### Account Form
- name: required, max 100 chars
- currency: required, controlled value
- initial_balance: numeric, non-negative
- current_balance: numeric, non-negative
- broker: optional, max 100 chars
- platform: optional, max 100 chars
- notes: optional, max 1000 chars

### Phase Form
- name: required, max 100 chars
- phase_type: required, controlled value
- status: required, controlled value
- starting_balance: numeric, non-negative
- target_balance: optional, non-negative
- maximum_drawdown: optional, non-negative
- daily_drawdown_limit: optional, non-negative
- end_date >= start_date

## Formatting Conventions

- Currency: `formatCurrency(value, currency)` — uses Intl.NumberFormat
- Numbers: `formatNumber(value, decimals)` — uses Intl.NumberFormat
- Dates: `formatDate()`, `formatDateTime()`, `formatShortDate()` — uses fa-IR locale
- Status labels: centralized in types/database.ts and utils/format.ts
- Phase ordering: challenge → evaluation → phase1 → phase2 → funded

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
- **Config**: `vitest.config.ts`
- **Test files**: `src/**/*.test.{ts,tsx}`
- **Existing tests**: auth-errors, database constants, format utilities

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
5. Trade ها immutable هستند (فقط soft delete)
6. Timestamps به صورت TIMESTAMPTZ ذخیره می‌شوند
7. زبان UI فارسی است
8. RTL layout استفاده می‌شود
9. حساب‌ها آرشیو می‌شوند نه حذف (حفظ تاریخچه)
10. initial_balance پس از ثبت معامله نباید تغییر کند (قانون آینده)
11. اعداد مالی در database به صورت numeric ذخیره می‌شوند
12. فرمت‌بندی فقط در presentation layer انجام می‌شود
