# ژورنال معاملاتی فارکس

یک پلتفرم جامع برای ثبت، مدیریت و تحلیل معاملات فارکس با تمرکز بر بهبود عملکرد معامله‌گر.

## ویژگی‌ها

### مدیریت حساب‌ها
- ایجاد و مدیریت چندین حساب معاملاتی
- پشتیبانی از فازهای مختلف (Challenge, Phase 1, Phase 2, Funded)
- پیگیری موجودی و وضعیت حساب‌ها

### واردات معاملات
- پشتیبانی از MT4/MT5 CSV exports
- تشخیص خودکار فرمت و نگاشت ستون‌ها
- تشخیص معاملات تکراری
- پردازش دسته‌ای برای فایل‌های بزرگ

### ژورنال معاملاتی
- برنامه قبل از معامله (Pre-Trade Plan)
- روانشناسی معامله (احساسات قبل/حین/بعد)
- بررسی بعد از معامله (Post-Trade Review)
- پایبندی به قوانین
- ورود صوتی فارسی

### اسکرین‌شات‌ها
- آپلود تصاویر نمودار
- بهینه‌سازی خودکار (WebP conversion)
- گالری تصاویر برای هر معامله

### آنالیتیکس پیشرفته
- شاخص‌های کلیدی عملکرد (KPIs)
- منحنی سرمایه و Drawdown
- تحلیل ساعت و روز هفته
- تقویم معاملاتی
- بازبینی‌های روزانه/هفتگی/ماهانه

### تحلیل What-If
- شبیه‌سازی سناریوهای فرضی
- فیلترهای پیشرفته (حذف بر اساس نماد، جهت، روز، ...)
- مقایسه عملکرد واقعی و شبیه‌سازی‌شده

### داشبورد سفارشی
- ویجت‌های قابل تنظیم
- KPIs، نمودارها و جداول
- ذخیره‌سازی چیدمان شخصی

### حالت مهمان
- دسترسی به داده‌های نمونه بدون ثبت‌نام
- آشنایی با قابلیت‌های سیستم

## تکنولوژی‌ها

### Frontend
- **React 18** + **TypeScript**
- **Vite** برای build
- **Tailwind CSS v4** برای استایل
- **React Router DOM v6** برای routing
- **Recharts** برای نمودارها
- **Framer Motion** برای انیمیشن‌ها
- **date-fns** برای مدیریت تاریخ
- **Lucide React** برای آیکون‌ها

### Backend
- **Supabase** (PostgreSQL + Auth + Storage)
- **Row Level Security (RLS)** برای امنیت داده‌ها
- **Signed URLs** برای دسترسی به تصاویر

### Testing
- **Vitest** برای unit tests
- **Testing Library** برای component tests

## شروع کار

### پیش‌نیازها
- Node.js 18+
- npm یا yarn
- حساب Supabase

### نصب

```bash
# Clone repository
git clone <repository-url>
cd forex-trading-journal

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your Supabase credentials
```

### تنظیم Supabase

1. ایجاد پروژه در [Supabase](https://supabase.com)
2. اجرای migrations در SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - ... (تمام migrations به ترتیب)
3. ایجاد Storage bucket:
   - Name: `trade-screenshots`
   - Public: **OFF** (private)
   - File size limit: 10MB
   - Allowed MIME types: image/jpeg, image/png, image/webp

### اجرای محلی

```bash
# Development server
npm run dev

# Production build
npm run build

# Run tests
npm run test

# TypeScript check
npm run typecheck
```

## متغیرهای محیطی

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**توجه:** هرگز `SUPABASE_SERVICE_ROLE_KEY` را در frontend استفاده نکنید.

## ساختار پروژه

```
src/
├── components/          # کامپوننت‌های UI
│   ├── ui/             # کامپوننت‌های پایه
│   ├── accounts/       # کامپوننت‌های حساب
│   ├── account-phases/ # کامپوننت‌های فاز
│   ├── trades/         # کامپوننت‌های معاملات
│   ├── journal/        # کامپوننت‌های ژورنال
│   └── layout/         # Layout components
├── contexts/           # React Contexts
├── pages/              # صفحات
│   ├── auth/          # احراز هویت
│   ├── accounts/      # مدیریت حساب‌ها
│   ├── trades/        # معاملات
│   ├── analytics/     # آنالیتیکس
│   ├── calendar/      # تقویم
│   ├── reviews/       # بازبینی‌ها
│   ├── import/        # واردات
│   └── dashboard/     # داشبورد
├── services/          # سرویس‌های API
│   ├── analytics/     # سرویس‌های آنالیتیکس
│   └── storage/       # سرویس‌های Storage
├── types/             # TypeScript types
├── utils/             # Utility functions
├── hooks/             # Custom hooks
├── config/            # Configuration
└── data/              # Mock data (Guest mode)

supabase/
└── migrations/        # Database migrations
```

## امنیت

### RLS (Row Level Security)
تمام جداول database با RLS محافظت شده‌اند:
- کاربران فقط به داده‌های خود دسترسی دارند
- Cross-user access امکان‌پذیر نیست
- Ownership از طریق `auth.uid()` بررسی می‌شود

### Storage Security
- Bucket خصوصی
- Signed URLs با expiry
- Upload validation (MIME, size, dimensions)
- Image optimization (WebP)

### Environment Variables
- فقط متغیرهای عمومی در frontend
- Service-role key هرگز در client نیست

## Deployment

### Vercel

1. اتصال repository به Vercel
2. تنظیم environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy

### Supabase Production Checklist

- [ ] تمام migrations اجرا شده‌اند
- [ ] RLS policies فعال هستند
- [ ] Storage bucket ایجاد شده (private)
- [ ] Auth redirect URLs تنظیم شده‌اند
- [ ] Environment variables در Vercel تنظیم شده‌اند

## محدودیت‌های شناخته شده

### عملکرد
- آنالیتیکس برای datasets بسیار بزرگ (>5000 معاملات) ممکن است کند باشد
- توصیه: Server-side aggregation برای scale بزرگ

### ویژگی‌های آینده
- Drag-and-drop برای dashboard widgets
- Multiple saved dashboards
- Custom widget sizes
- Persistent What-If presets

## مستندات فنی

- [Security Audit](docs/SECURITY_AUDIT.md)
- [Performance Audit](docs/PERFORMANCE_AUDIT.md)
- [Responsive Audit](docs/RESPONSIVE_AUDIT.md)

## مجوز

Private - All rights reserved

## پشتیبانی

برای گزارش مشکلات یا درخواست ویژگی‌ها، لطفاً issue ایجاد کنید.
