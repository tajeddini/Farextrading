import { supabase } from './supabase';
import type { Trade, TradeInsert } from '../types/database';

export async function getTrades(userId: string, accountId?: string): Promise<Trade[]> {
  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('entry_datetime', { ascending: false });

  if (accountId) {
    query = query.eq('account_id', accountId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching trades:', error);
    throw new Error('خطا در دریافت معاملات');
  }

  return data || [];
}

export async function getTrade(tradeId: string, userId: string): Promise<Trade | null> {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('id', tradeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching trade:', error);
    throw new Error('خطا در دریافت معامله');
  }

  return data;
}

export async function createTrade(input: TradeInsert): Promise<Trade> {
  const { data, error } = await supabase
    .from('trades')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('Error creating trade:', error);
    throw new Error('خطا در ایجاد معامله');
  }

  return data;
}

export async function createTradesBatch(trades: TradeInsert[]): Promise<Trade[]> {
  const { data, error } = await supabase
    .from('trades')
    .insert(trades)
    .select();

  if (error) {
    console.error('Error creating trades batch:', error);
    throw new Error('خطا در ایجاد معاملات');
  }

  return data || [];
}

export async function getTradesByAccount(accountId: string, userId: string): Promise<Trade[]> {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('account_id', accountId)
    .eq('user_id', userId)
    .order('entry_datetime', { ascending: false });

  if (error) {
    console.error('Error fetching trades by account:', error);
    throw new Error('خطا در دریافت معاملات');
  }

  return data || [];
}

export async function getTradeCount(userId: string, accountId?: string): Promise<number> {
  let query = supabase
    .from('trades')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (accountId) {
    query = query.eq('account_id', accountId);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting trades:', error);
    return 0;
  }

  return count || 0;
}

export async function checkDuplicateTrades(
  userId: string,
  accountId: string,
  tickets: string[]
): Promise<Set<string>> {
  if (tickets.length === 0) return new Set();

  const { data, error } = await supabase
    .from('trades')
    .select('ticket')
    .eq('user_id', userId)
    .eq('account_id', accountId)
    .in('ticket', tickets);

  if (error) {
    console.error('Error checking duplicates:', error);
    return new Set();
  }

  return new Set(data?.map(t => t.ticket).filter(Boolean) || []);
}
