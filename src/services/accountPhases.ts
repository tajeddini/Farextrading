import { supabase } from './supabase';
import type { AccountPhase, AccountPhaseInsert, AccountPhaseUpdate } from '../types/database';

export async function getPhases(accountId: string, userId: string): Promise<AccountPhase[]> {
  // First verify the account belongs to the user
  const { data: account, error: accountError } = await supabase
    .from('trading_accounts')
    .select('id')
    .eq('id', accountId)
    .eq('user_id', userId)
    .maybeSingle();

  if (accountError || !account) {
    throw new Error('دسترسی غیرمجاز به حساب');
  }

  const { data, error } = await supabase
    .from('account_phases')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching phases:', error);
    throw new Error('خطا در دریافت فازها');
  }

  return data || [];
}

export async function getPhase(phaseId: string, userId: string): Promise<AccountPhase | null> {
  // Verify ownership through account
  const { data, error } = await supabase
    .from('account_phases')
    .select('*, trading_accounts!inner(user_id)')
    .eq('id', phaseId)
    .eq('trading_accounts.user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching phase:', error);
    throw new Error('خطا در دریافت فاز');
  }

  return data;
}

export async function createPhase(input: AccountPhaseInsert, userId: string): Promise<AccountPhase> {
  // Verify account ownership
  const { data: account, error: accountError } = await supabase
    .from('trading_accounts')
    .select('id')
    .eq('id', input.account_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (accountError || !account) {
    throw new Error('دسترسی غیرمجاز به حساب');
  }

  const { data, error } = await supabase
    .from('account_phases')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('Error creating phase:', error);
    throw new Error('خطا در ایجاد فاز');
  }

  return data;
}

export async function updatePhase(
  phaseId: string,
  userId: string,
  input: AccountPhaseUpdate
): Promise<AccountPhase> {
  // Verify ownership through account
  const { data: phase, error: fetchError } = await supabase
    .from('account_phases')
    .select('*, trading_accounts!inner(user_id)')
    .eq('id', phaseId)
    .eq('trading_accounts.user_id', userId)
    .maybeSingle();

  if (fetchError || !phase) {
    throw new Error('دسترسی غیرمجاز به فاز');
  }

  const { data, error } = await supabase
    .from('account_phases')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', phaseId)
    .select()
    .single();

  if (error) {
    console.error('Error updating phase:', error);
    throw new Error('خطا در بروزرسانی فاز');
  }

  return data;
}

export async function deletePhase(phaseId: string, userId: string): Promise<void> {
  // Verify ownership through account
  const { data: phase, error: fetchError } = await supabase
    .from('account_phases')
    .select('*, trading_accounts!inner(user_id)')
    .eq('id', phaseId)
    .eq('trading_accounts.user_id', userId)
    .maybeSingle();

  if (fetchError || !phase) {
    throw new Error('دسترسی غیرمجاز به فاز');
  }

  const { error } = await supabase
    .from('account_phases')
    .delete()
    .eq('id', phaseId);

  if (error) {
    console.error('Error deleting phase:', error);
    throw new Error('خطا در حذف فاز');
  }
}
