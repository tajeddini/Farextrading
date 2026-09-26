import type { AccountStatus, PhaseStatus, PhaseType } from '../types/database';
import { ACCOUNT_STATUSES, PHASE_STATUSES, PHASE_TYPES } from '../types/database';

// --- Number / Currency Formatting ---

export function formatCurrency(value: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// --- Date Formatting ---

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return '—';
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '—';
  }
}

export function formatShortDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return '—';
  }
}

// --- Status Labels ---

export function getAccountStatusLabel(status: AccountStatus): string {
  const found = ACCOUNT_STATUSES.find((s) => s.value === status);
  return found?.label || status;
}

export function getPhaseStatusLabel(status: PhaseStatus): string {
  const found = PHASE_STATUSES.find((s) => s.value === status);
  return found?.label || status;
}

export function getPhaseTypeLabel(type: PhaseType): string {
  const found = PHASE_TYPES.find((t) => t.value === type);
  return found?.label || type;
}

// --- Phase Order ---

const PHASE_TYPE_ORDER: Record<PhaseType, number> = {
  challenge: 0,
  evaluation: 1,
  phase1: 2,
  phase2: 3,
  funded: 4,
};

export function sortPhasesByType<T extends { phase_type: PhaseType; created_at: string }>(
  phases: T[]
): T[] {
  return [...phases].sort((a, b) => {
    const orderDiff = PHASE_TYPE_ORDER[a.phase_type] - PHASE_TYPE_ORDER[b.phase_type];
    if (orderDiff !== 0) return orderDiff;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

// --- Validation Helpers ---

export function isValidNumber(value: string): boolean {
  if (value.trim() === '') return false;
  return !isNaN(Number(value)) && isFinite(Number(value));
}

export function isNonNegativeNumber(value: string): boolean {
  if (!isValidNumber(value)) return false;
  return Number(value) >= 0;
}

export function parseNumber(value: string): number | null {
  if (!isValidNumber(value)) return null;
  return Number(value);
}
