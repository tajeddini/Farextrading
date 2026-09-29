import { supabase } from './supabase';
import type { TradeJournal, TradeJournalInsert, TradeJournalUpdate, TradeWithJournal, Tag, Mistake } from '../types/database';

export async function getTradeJournal(tradeId: string, userId: string): Promise<TradeJournal | null> {
  const { data, error } = await supabase
    .from('trade_journals')
    .select('*')
    .eq('trade_id', tradeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error('خطا در دریافت ژورنال');
  return data;
}

export async function createTradeJournal(input: TradeJournalInsert): Promise<TradeJournal> {
  const { data, error } = await supabase
    .from('trade_journals')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error('خطا در ایجاد ژورنال');
  return data;
}

export async function updateTradeJournal(
  tradeId: string,
  userId: string,
  input: TradeJournalUpdate
): Promise<TradeJournal> {
  const { data, error } = await supabase
    .from('trade_journals')
    .update(input)
    .eq('trade_id', tradeId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error('خطا در بروزرسانی ژورنال');
  return data;
}

export async function upsertTradeJournal(
  tradeId: string,
  userId: string,
  input: TradeJournalUpdate
): Promise<TradeJournal> {
  const { data, error } = await supabase
    .from('trade_journals')
    .upsert({ ...input, trade_id: tradeId, user_id: userId })
    .select()
    .single();

  if (error) throw new Error('خطا در ذخیره ژورنال');
  return data;
}

export interface JournalFilters {
  accountId?: string;
  journalStatus?: string;
  strategyId?: string;
  search?: string;
}

export async function getTradesWithJournal(
  userId: string,
  filters: JournalFilters = {},
  page: number = 1,
  limit: number = 50
): Promise<TradeWithJournal[]> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('trades')
    .select(`
      *,
      journal:trade_journals(*),
      tags:trade_tags(tag:tags(*)),
      mistakes:trade_mistakes(notes, mistake:mistakes(*))
    `)
    .eq('user_id', userId)
    .order('entry_datetime', { ascending: false })
    .range(from, to);

  // Apply filters
  if (filters.accountId) {
    query = query.eq('account_id', filters.accountId);
  }

  if (filters.search) {
    query = query.or(`symbol.ilike.%${filters.search}%,ticket.ilike.%${filters.search}%,comment.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching trades with journal:', error);
    throw new Error('خطا در دریافت معاملات');
  }

  let trades = (data || []).map((trade: any) => ({
    ...trade,
    journal: trade.journal?.[0] || null,
    tags: (trade.tags || []).map((t: any) => t.tag),
    mistakes: (trade.mistakes || []).map((m: any) => ({
      mistake: m.mistake,
      notes: m.notes,
    })),
  }));

  // Apply client-side filters that require journal data
  if (filters.journalStatus) {
    trades = trades.filter((t: any) => {
      const status = t.journal?.status || 'not_started';
      return status === filters.journalStatus;
    });
  }

  if (filters.strategyId) {
    trades = trades.filter((t: any) => {
      if (filters.strategyId === 'no_strategy') {
        return !t.journal?.strategy_id;
      }
      return t.journal?.strategy_id === filters.strategyId;
    });
  }

  return trades;
}

export async function getTradeWithJournal(tradeId: string, userId: string): Promise<TradeWithJournal | null> {
  const { data, error } = await supabase
    .from('trades')
    .select(`
      *,
      journal:trade_journals(*),
      tags:trade_tags(tag:tags(*)),
      mistakes:trade_mistakes(notes, mistake:mistakes(*))
    `)
    .eq('id', tradeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error('خطا در دریافت معامله');
  if (!data) return null;

  return {
    ...data,
    journal: (data as any).journal?.[0] || null,
    tags: ((data as any).tags || []).map((t: any) => t.tag),
    mistakes: ((data as any).mistakes || []).map((m: any) => ({
      mistake: m.mistake,
      notes: m.notes,
    })),
  };
}

export async function getTradeCount(userId: string, filters: JournalFilters = {}): Promise<number> {
  let query = supabase
    .from('trades')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (filters.accountId) {
    query = query.eq('account_id', filters.accountId);
  }

  if (filters.search) {
    query = query.or(`symbol.ilike.%${filters.search}%,ticket.ilike.%${filters.search}%,comment.ilike.%${filters.search}%`);
  }

  const { count, error } = await query;
  
  if (error) {
    console.error('Error counting trades:', error);
    throw new Error('خطا در شمارش معاملات');
  }
  
  return count || 0;
}
