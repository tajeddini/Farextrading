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

// --- Future: Trade (placeholder for now) ---

export interface Trade {
  id: string;
  phase_id: string;
  account_id: string;
  user_id: string;
  // Will be fully defined in Phase 3
  created_at: string;
  updated_at: string;
}

// --- Insert/Update types ---

export type ProfileInsert = Pick<Profile, 'id'> & Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

export type TradingAccountInsert = Omit<TradingAccount, 'id' | 'created_at' | 'updated_at'>;
export type TradingAccountUpdate = Partial<Omit<TradingAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type AccountPhaseInsert = Omit<AccountPhase, 'id' | 'created_at' | 'updated_at'>;
export type AccountPhaseUpdate = Partial<Omit<AccountPhase, 'id' | 'account_id' | 'created_at' | 'updated_at'>>;

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
