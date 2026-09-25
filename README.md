# ژورنال معاملاتی فارکس

یک پلتفرم جامع برای ثبت، مدیریت و تحلیل معاملات فارکس.

## ویژگی‌ها

- 🔐 احراز هویت امن با Supabase Auth
- 💼 مدیریت حساب‌های معاملاتی و فازها
- 📥 ورود اطلاعات از MT4/MT5
- 📝 ژورنال معاملاتی کامل
- 📊 آنالیتیکس پیشرفته
- 📅 تقویم معاملاتی
- 🖼️ مدیریت اسکرین‌شات معاملات
- 🌙 حالت تاریک/روشن

## تکنولوژی‌ها

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Charts**: Recharts
- **Routing**: React Router DOM v6

## شروع کار

### ۱. نصب وابستگی‌ها

```bash
npm install
```

### ۲. تنظیم Environment Variables

فایل `.env.example` را کپی کنید:

```bash
cp .env.example .env
```

سپس مقادیر Supabase خود را وارد کنید:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### ۳. ایجاد Supabase Project

1. به [supabase.com](https://supabase.com) بروید
2. یک پروژه جدید بسازید
3. URL و Anon Key را از Settings > API کپی کنید

### ۴. اجرای Migrations

مهاجرت‌های SQL را در Supabase SQL Editor اجرا کنید:

1. به Supabase Dashboard > SQL Editor بروید
2. محتوای `supabase/migrations/001_initial_schema.sql` را اجرا کنید
3. سپس `supabase/migrations/002_rls_policies.sql` را اجرا کنید

### ۵. اجرای سرور توسعه

```bash
npm run dev
```

### ۶. بیلد Production

```bash
npm run build
```

## ساختار پروژه

```
src/
├── components/
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts (Auth, Theme)
├── pages/              # Page components
│   ├── auth/           # Login, Register
│   └── dashboard/      # Dashboard
├── services/           # Service layer (Supabase queries)
├── types/              # TypeScript types
├── App.tsx             # Root component
├── main.tsx            # Entry point
├── router.tsx          # Route definitions
└── index.css           # Global styles

supabase/
└── migrations/         # Database migrations
```

## امنیت

- تمام جداول دارای Row Level Security (RLS) هستند
- کاربران فقط به داده‌های خود دسترسی دارند
- Service Role Key هرگز در frontend استفاده نمی‌شود
- تمام داده‌های حساس در environment variables نگهداری می‌شوند

## دستورات

```bash
npm run dev        # سرور توسعه
npm run build      # بیلد production
npm run typecheck  # بررسی TypeScript
```

## مجوز

Private - All rights reserved
