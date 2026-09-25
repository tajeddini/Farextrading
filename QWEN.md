# QWEN.md — Forex Trading Journal & Analytics

## وضعیت پروژه

این پروژه در مرحله **شروع از صفر** است. هیچ کد کاربردی در پروژه وجود ندارد. فقط یک skeleton خالی با وابستگی‌های از پیش نصب شده موجود است.

## معماری هدف

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Charts**: Recharts
- **Routing**: React Router DOM v6
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Drag & Drop**: @dnd-kit
- **UUID**: uuid

## ساختار پروژه

```
/
├── index.html          # Entry HTML
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── src/
│   ├── main.tsx        # React entry point
│   ├── App.tsx         # Root component (خالی)
│   └── index.css       # Tailwind import
└── QWEN.md             # این فایل
```

## دستورات مهم

```bash
npm run dev        # اجرای سرور توسعه
npm run build      # بیلد production
npm run typecheck  # بررسی type
```

## قوانین Database (Supabase)

- تمام جداول باید `user_id` داشته باشند
- RLS باید روی تمام جداول فعال باشد
- هیچ داده‌ای نباید بدون ownership check قابل دسترسی باشد
- Trade ها باید immutable باشند (حذف فیزیکی ممنوع، فقط soft delete)
- Import نباید داده‌های موجود را overwrite کند

## قوانین Security

- Supabase anon key فقط در client
- Supabase service-role key فقط در server
- RLS policies باید بر اساس `auth.uid()` باشد
- تمام API routes باید ownership را چک کنند

## قوانین Storage

- تصاویر در Supabase Storage ذخیره می‌شوند
- مسیر: `trade-images/{user_id}/{trade_id}/{filename}`
- فشرده‌سازی قبل از آپلود
- Signed URLs برای دسترسی

## قراردادهای کدنویسی

- TypeScript strict mode
- Functional components فقط
- Custom hooks برای logic
- کامپوننت‌ها در `src/components/`
- صفحات در `src/pages/`
- Hooks در `src/hooks/`
- Utils در `src/utils/`
- Types در `src/types/`
- Services در `src/services/`

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # فقط server-side
```

## Deployment

- Vercel (frontend)
- Supabase (backend + database + storage)
