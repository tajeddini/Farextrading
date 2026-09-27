# QWEN.md — Forex Trading Journal & Analytics

## وضعیت فعلی

پروژه در فاز **Core Analytics** تکمیل شده.
- ✅ Supabase integration
- ✅ Authentication
- ✅ Database schema (profiles, trading_accounts, account_phases, trades, import_batches, strategies, setups, tags, mistakes, trade_journals, trade_tags, trade_mistakes, trade_images)
- ✅ RLS policies (تمام جداول)
- ✅ Accounts & Phases management
- ✅ MT4/MT5 CSV Import
- ✅ Trading Journal (Pre-Trade Plan, Psychology, Rule Adherence, Post-Trade Review)
- ✅ Strategy/Setup system
- ✅ Tag system (many-to-many)
- ✅ Mistake tracking (many-to-many)
- ✅ Emotion tracking (before/during/after)
- ✅ Persian Voice-to-Text (Web Speech API)
- ✅ Trade List with pagination, filters
- ✅ Trade Detail with journal tabs
- ✅ Trade Screenshot Storage (Supabase Storage)
- ✅ Image optimization (WebP conversion, resize)
- ✅ **Core Analytics (KPIs, Equity Curve, Drawdown, P/L Charts, Performance Breakdown)**
- ✅ Toast notification system
- ❌ Advanced Analytics (فاز بعدی)

## تکنولوژی‌ها

| لایه | تکنولوژی |
|------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Routing | React Router DOM v6 |
| CSV Parser | papaparse |
| Speech-to-Text | Web Speech API (fa-IR) |
| Testing | Vitest + @testing-library/react + jsdom |

## ساختار پروژه

```
src/
├── components/
│   ├── layout/AppLayout.tsx
│   ├── ui/                     # Button, Input, Select, Card, Badge, Loading, EmptyState, ErrorState, Modal, ConfirmDialog
│   ├── accounts/               # AccountCard, AccountForm, AccountFilters, AccountSummary
│   ├── account-phases/         # PhaseCard, PhaseForm
│   ├── journal/
│   │   └── VoiceInput.tsx      # Persian voice-to-text button
│   └── ProtectedRoute.tsx
├── contexts/
│   ├── AuthContext.tsx          # useAuth()
│   ├── ThemeContext.tsx         # useTheme()
│   └── ToastContext.tsx         # useToast()
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── accounts/
│   ├── import/ImportPage.tsx
│   └── trades/
│       ├── TradesPage.tsx       # Trade list with pagination/filters
│       └── TradeDetailPage.tsx  # Trade detail + journal + screenshots
├── components/
│   ├── trades/
│   │   ├── TradeImageUpload.tsx   # Drag & drop image upload
│   │   └── TradeImageViewer.tsx   # Image grid + lightbox viewer
├── services/
│   ├── supabase.ts
│   ├── profiles.ts
│   ├── accounts.ts
│   ├── accountPhases.ts
│   ├── trades.ts
│   ├── importBatches.ts
│   ├── strategies.ts
│   ├── setups.ts
│   ├── tags.ts
│   ├── mistakes.ts
│   ├── tradeJournals.ts
│   ├── tradeImages.ts          # Screenshot upload/delete/replace
│   ├── speechToText.ts         # Web Speech API abstraction
│   └── storage/
│       ├── types.ts            # StorageProvider interface
│       └── supabaseProvider.ts # Supabase Storage implementation
├── types/database.ts
├── utils/
│   ├── auth-errors.ts
│   ├── format.ts
│   ├── csv-parser.ts
│   ├── trade-normalizer.ts
│   ├── duplicate-detector.ts
│   └── imageProcessing.ts    # WebP conversion, resize, validation
├── config/
│   └── storage.ts            # Storage configuration constants
├── App.tsx
├── main.tsx
├── router.tsx
└── index.css

supabase/migrations/
├── 001_initial_schema.sql
├── 002_rls_policies.sql
├── 003_trade_import.sql
├── 004_trade_import_rls.sql
├── 005_trading_journal.sql     # strategies, setups, tags, mistakes, trade_journals, trade_tags, trade_mistakes
├── 006_trading_journal_rls.sql # RLS for journal tables
├── 007_trade_images.sql        # trade_images table
└── 008_trade_images_rls.sql    # RLS for trade_images
```

## Routes

```
/login                    → Public
/register                 → Public
/app/dashboard            → Protected
/app/accounts             → Protected
/app/accounts/:accountId  → Protected
/app/import               → Protected (MT4/MT5 import)
/app/trades               → Protected (Trade list)
/app/trades/:tradeId      → Protected (Trade detail + journal)
/app/journal              → Protected (placeholder)
/app/analytics            → Protected (placeholder)
/app/calendar             → Protected (placeholder)
/app/reviews              → Protected (placeholder)
/app/settings             → Protected (placeholder)
```

## Database Schema

### جداول اصلی
- **profiles**: پروفایل کاربر
- **trading_accounts**: حساب‌های معاملاتی
- **account_phases**: فازهای حساب
- **trades**: معاملات (objective imported data)
- **import_batches**: تاریخچه import

### جداول Journal
- **strategies**: استراتژی‌های کاربر
- **setups**: ستاپ‌ها (optional strategy relationship)
- **tags**: تگ‌های کاربر
- **mistakes**: اشتباهات تعریف‌شده
- **trade_journals**: ژورنال هر معامله (pre-trade, psychology, review)
- **trade_tags**: many-to-many بین trade و tag
- **trade_mistakes**: many-to-many بین trade و mistake

### جداول Storage
- **trade_images**: متادیتای تصاویر معامله (ذخیره در Supabase Storage)

## معماری Trade ↔ Journal

### Trade (Objective Data)
داده‌های عینی از بروکر import شده:
- ticket, position_id, symbol, side, volume
- entry/exit datetime, price
- commission, swap, profit
- duration_seconds (auto-calculated)
- source, source_file, import_batch_id

### Trade Journal (Subjective Data)
داده‌های ذهنی trader:
- strategy_id, setup_id
- market_context, market_bias, timeframe, confluences
- entry_reason, expected_scenario, invalidating_condition
- planned_risk_amount/percentage, planned_rr, confidence
- checklist (JSONB)
- emotion_before/during/after
- execution_quality, rule_adherence, rule_adherence_notes
- what_went_well, what_went_wrong, lesson_learned, post_trade_notes
- status (not_started/in_progress/completed)

### جداسازی مهم
Trade data هرگز توسط journal تغییر نمی‌کند. Journal فقط metadata اضافی اضافه می‌کند.

## RLS Rules

- **strategies/setups/tags/mistakes**: auth.uid() = user_id
- **trade_journals**: auth.uid() = user_id
- **trade_tags/trade_mistakes**: ownership از طریق trade.user_id

## Voice-to-Text

- Web Speech API abstraction
- Language: fa-IR (Persian)
- Graceful degradation برای مرورگرهای بدون پشتیبانی
- قابل جایگزینی با provider دیگر در آینده

## Screenshot Storage Architecture

### اصل جداسازی
- **PostgreSQL**: فقط متادیتا (trade_images table)
- **Supabase Storage**: فایل‌های تصویری واقعی
- **هرگز** باینری تصویر در database ذخیره نمی‌شود

### trade_images Table
- id, trade_id, user_id
- storage_provider, storage_bucket, storage_path
- original_filename, original_size_bytes, processed_size_bytes
- mime_type, width, height
- created_at, updated_at

### Storage Path Structure
```
trade-screenshots/
  trades/{tradeId}/{uuid}.webp
```

### Image Processing Pipeline
1. Client-side validation (type, size)
2. Load image in browser
3. Resize if > 1920x1920 (preserve aspect ratio)
4. Convert to WebP (quality: 80)
5. Upload to Supabase Storage
6. Save metadata to PostgreSQL
7. On DB failure: cleanup Storage object

### Configuration (src/config/storage.ts)
- MAX_UPLOAD_SIZE: 10MB
- MAX_WIDTH/HEIGHT: 1920px
- WEBP_QUALITY: 80
- ALLOWED_MIME_TYPES: jpeg, png, webp
- SIGNED_URL_EXPIRY: 1 hour

### Storage Provider Abstraction
- StorageProvider interface (src/services/storage/types.ts)
- SupabaseStorageProvider implementation
- Future: CloudflareR2StorageProvider قابل اضافه شدن

### Security
- Private bucket (دسترسی فقط با signed URL)
- RLS: auth.uid() = user_id
- Ownership validation در service layer
- Service-role key هرگز در frontend نیست

### UI Integration
- Tab جدید "اسکرین‌شات‌ها" در TradeDetailPage
- Drag & drop upload
- Image grid با thumbnail
- Lightbox viewer با signed URL
- Delete با confirmation
- Multiple images per trade

## دستورات

```bash
npm run dev        # Development server
npm run build      # Production build
npm run typecheck  # TypeScript check
npx vitest run     # Run tests
```

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## قوانین مهم

1. Trade data (broker) ≠ Journal data (trader) — هرگز mix نکنید
2. Journal قابل ذخیره partial است (status: not_started → in_progress → completed)
3. Tags و Mistakes many-to-many هستند (نه comma-separated)
4. Emotions structured هستند (قبل/حین/بعد)
5. Rule Adherence: followed/partially_followed/violated/not_set
6. Voice-to-text: Web Speech API abstraction — قابل تعویض
7. duration_seconds auto-calculated توسط trigger
8. RLS در سطح database — نه فقط frontend
9. تصاویر در Supabase Storage — متادیتا در PostgreSQL
10. Image processing در client-side (WebP conversion, resize)
11. Signed URLs برای دسترسی به تصاویر (private bucket)
12. Multiple images per trade پشتیبانی می‌شود
13. Safe replace: اول upload جدید، بعد delete قدیمی
14. Cleanup در صورت DB failure بعد از Storage upload
