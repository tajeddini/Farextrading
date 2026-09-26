// ============================================================
// Database Types — Forex Trading Journal
// These types mirror the PostgreSQL schema
// ============================================================

// --- Enums ---

export type AccountStatus = 'active' | 'passed' | 'failed' | 'funded' | 'archived';
export type PhaseStatus = 'active' | 'completed' | 'failed' | 'skipped';
export type PhaseType = 'challenge' | 'phase1' | 'phase2' | 'funded' | 'evaluation';

// --- Profile ---

export interface Profile {
  id: string; // matches auth.users.id
  display_name: string | null;
  avatar_url: string | null;
  timezone: string;
  default_currency: string;
  created_at: string;
  updated_at: string;
}

// --- Trading Account ---

export interface TradingAccount {
  id: string;
  user_id: string;
  name: string;
  broker: string | null;
  platform: string | null;
  account_number_label: string | null;
  currency: string;
  initial_balance: number;
  current_balance: number;
  status: AccountStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// --- Account Phase ---

export interface AccountPhase {
  id: string;
  account_id: string;
  name: string;
  phase_type: PhaseType;
  status: PhaseStatus;
  starting_balance: number;
  target_balance: number | null;
  maximum_drawdown: number | null;
  daily_drawdown_limit: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

// --- Trade Side ---
export type TradeSide = 'buy' | 'sell';

// --- Trade Source ---
export type TradeSource = 'mt4' | 'mt5' | 'manual';

// --- Import Batch Status ---
export type ImportBatchStatus = 'processing' | 'completed' | 'completed_with_warnings' | 'failed';

// --- Trade ---
export interface Trade {
  id: string;
  user_id: string;
  account_id: string;
  phase_id: string | null;
  import_batch_id: string | null;
  
  // Identification
  ticket: string | null;
  position_id: string | null;
  
  // Trade details
  symbol: string;
  side: TradeSide;
  volume: number;
  
  // Entry
  entry_datetime: string;
  entry_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  
  // Exit
  exit_datetime: string;
  exit_price: number;
  
  // Financial
  commission: number;
  swap: number;
  profit: number;
  
  // Metadata
  comment: string | null;
  magic_number: number | null;
  
  // Source
  source: TradeSource;
  source_file: string | null;
  
  // Duration
  duration_seconds: number | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// --- Import Batch ---
export interface ImportBatch {
  id: string;
  user_id: string;
  account_id: string;
  phase_id: string | null;
  source: TradeSource;
  file_name: string;
  file_size: number | null;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  imported_rows: number;
  status: ImportBatchStatus;
  error_message: string | null;
  parser_version: string | null;
  created_at: string;
  completed_at: string | null;
}

// --- Insert/Update types ---

export type ProfileInsert = Pick<Profile, 'id'> & Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

export type TradingAccountInsert = Omit<TradingAccount, 'id' | 'created_at' | 'updated_at'>;
export type TradingAccountUpdate = Partial<Omit<TradingAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type AccountPhaseInsert = Omit<AccountPhase, 'id' | 'created_at' | 'updated_at'>;
export type AccountPhaseUpdate = Partial<Omit<AccountPhase, 'id' | 'account_id' | 'created_at' | 'updated_at'>>;

export type TradeInsert = Omit<Trade, 'id' | 'created_at' | 'updated_at' | 'duration_seconds'>;
export type TradeUpdate = Partial<Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export interface ImportBatchInsert {
  user_id: string;
  account_id: string;
  phase_id: string | null;
  source: TradeSource;
  file_name: string;
  file_size: number | null;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  imported_rows: number;
  status: ImportBatchStatus;
  error_message?: string | null;
  parser_version?: string | null;
}
export type ImportBatchUpdate = Partial<Omit<ImportBatch, 'id' | 'user_id' | 'created_at'>>;

// --- Constants ---

export const ACCOUNT_STATUSES: { value: AccountStatus; label: string }[] = [
  { value: 'active', label: 'فعال' },
  { value: 'passed', label: 'قبول شده' },
  { value: 'failed', label: 'ناموفق' },
  { value: 'funded', label: 'تأمین سرمایه' },
  { value: 'archived', label: 'آرشیو شده' },
];

export const PHASE_STATUSES: { value: PhaseStatus; label: string }[] = [
  { value: 'active', label: 'فعال' },
  { value: 'completed', label: 'تکمیل شده' },
  { value: 'failed', label: 'ناموفق' },
  { value: 'skipped', label: 'رد شده' },
];

export const PHASE_TYPES: { value: PhaseType; label: string }[] = [
  { value: 'challenge', label: 'چالش' },
  { value: 'phase1', label: 'فاز ۱' },
  { value: 'phase2', label: 'فاز ۲' },
  { value: 'funded', label: 'تأمین سرمایه' },
  { value: 'evaluation', label: 'ارزیابی' },
];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];

export const TIMEZONES = [
  'Asia/Tehran',
  'Asia/Dubai',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'UTC',
];

export const TRADE_SIDES: { value: TradeSide; label: string }[] = [
  { value: 'buy', label: 'خرید' },
  { value: 'sell', label: 'فروش' },
];

export const TRADE_SOURCES: { value: TradeSource; label: string }[] = [
  { value: 'mt4', label: 'MT4' },
  { value: 'mt5', label: 'MT5' },
  { value: 'manual', label: 'دستی' },
];

export const IMPORT_BATCH_STATUSES: { value: ImportBatchStatus; label: string }[] = [
  { value: 'processing', label: 'در حال پردازش' },
  { value: 'completed', label: 'تکمیل شده' },
  { value: 'completed_with_warnings', label: 'تکمیل شده با هشدار' },
  { value: 'failed', label: 'ناموفق' },
];
