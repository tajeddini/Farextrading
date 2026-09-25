import { supabase } from './supabase';
import type { TradingAccount, TradingAccountInsert, TradingAccountUpdate } from '../types/database';

export async function getAccounts(userId: string): Promise<TradingAccount[]> {
  const { data, error } = await supabase
    .from('trading_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching accounts:', error);
    throw new Error('خطا در دریافت حساب‌ها');
  }

  return data || [];
}

export async function getAccount(accountId: string, userId: string): Promise<TradingAccount | null> {
  const { data, error } = await supabase
    .from('trading_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching account:', error);
    throw new Error('خطا در دریافت حساب');
  }

  return data;
}

export async function createAccount(input: TradingAccountInsert): Promise<TradingAccount> {
  const { data, error } = await supabase
    .from('trading_accounts')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('Error creating account:', error);
    throw new Error('خطا در ایجاد حساب');
  }

  return data;
}

export async function updateAccount(
  accountId: string,
  userId: string,
  input: TradingAccountUpdate
): Promise<TradingAccount> {
  const { data, error } = await supabase
    .from('trading_accounts')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', accountId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating account:', error);
    throw new Error('خطا در بروزرسانی حساب');
  }

  return data;
}

export async function deleteAccount(accountId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('trading_accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting account:', error);
    throw new Error('خطا در حذف حساب');
  }
}

export async function getAccountCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('trading_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error counting accounts:', error);
    return 0;
  }

  return count || 0;
}
