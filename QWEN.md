# QWEN.md — Forex Trading Journal & Analytics

## وضعیت فعلی

پروژه در فاز **Foundation** (زیرساخت) قرار دارد.
- ✅ Supabase integration
- ✅ Authentication (signup/login/logout/session)
- ✅ Database schema (profiles, trading_accounts, account_phases)
- ✅ RLS policies
- ✅ Application layout & routing
- ✅ Theme system (dark/light)
- ✅ Protected routes
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

## ساختار پروژه

```
src/
├── components/
│   ├── layout/AppLayout.tsx    # Sidebar + Header + Outlet
│   ├── ui/                     # Button, Input, Select, Card, Badge, Loading, EmptyState, ErrorState
│   └── ProtectedRoute.tsx      # Auth guard
├── contexts/
│   ├── AuthContext.tsx          # useAuth() — user, session, profile, signIn, signUp, signOut
│   └── ThemeContext.tsx         # useTheme() — theme, toggleTheme, setTheme
├── pages/
│   ├── auth/LoginPage.tsx
│   ├── auth/RegisterPage.tsx
│   ├── dashboard/DashboardPage.tsx
│   └── PlaceholderPage.tsx
├── services/
│   ├── supabase.ts             # Singleton Supabase client
│   ├── profiles.ts             # Profile CRUD
│   ├── accounts.ts             # TradingAccount CRUD
│   └── accountPhases.ts        # AccountPhase CRUD
├── types/database.ts           # All TypeScript types
├── App.tsx                     # Providers wrapper
├── main.tsx                    # Entry point
├── router.tsx                  # All routes
└── index.css                   # Tailwind + custom styles

supabase/migrations/
├── 001_initial_schema.sql      # Tables, indexes, triggers
└── 002_rls_policies.sql        # RLS policies
```

## Routes

```
/login                    → Public (redirect if authenticated)
/register                 → Public (redirect if authenticated)
/app                      → Protected (redirect if unauthenticated)
/app/dashboard            → Protected
/app/accounts             → Protected (placeholder)
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

### account_phases
- `id` UUID PK
- `account_id` FK → trading_accounts(id)
- `name`, `phase_type` ENUM, `status` ENUM
- `starting_balance`, `target_balance`, `maximum_drawdown`, `daily_drawdown_limit`
- `start_date`, `end_date`

## RLS Rules

- **profiles**: auth.uid() = id (users access only own profile)
- **trading_accounts**: auth.uid() = user_id (users access only own accounts)
- **account_phases**: ownership derived through parent account's user_id

## دستورات

```bash
npm run dev        # Development server
npm run build      # Production build
npm run typecheck  # TypeScript check
```

## Environment Variables

```
VITE_SUPABASE_URL=       # Supabase project URL
VITE_SUPABASE_ANON_KEY=  # Supabase anon/public key
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
