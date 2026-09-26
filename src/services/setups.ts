import { supabase } from './supabase';
import type { Setup, SetupInsert, SetupUpdate } from '../types/database';

export async function getSetups(userId: string, strategyId?: string): Promise<Setup[]> {
  let query = supabase
    .from('setups')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (strategyId) {
    query = query.eq('strategy_id', strategyId);
  }

  const { data, error } = await query;
  if (error) throw new Error('خطا در دریافت ستاپ‌ها');
  return data || [];
}

export async function createSetup(input: SetupInsert): Promise<Setup> {
  const { data, error } = await supabase
    .from('setups')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error('خطا در ایجاد ستاپ');
  return data;
}

export async function updateSetup(id: string, userId: string, input: SetupUpdate): Promise<Setup> {
  const { data, error } = await supabase
    .from('setups')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error('خطا در بروزرسانی ستاپ');
  return data;
}

export async function deleteSetup(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('setups')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error('خطا در حذف ستاپ');
}
