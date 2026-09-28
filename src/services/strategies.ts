import { supabase } from './supabase';
import type { Strategy, StrategyInsert, StrategyUpdate } from '../types/database';

export async function getStrategies(userId: string): Promise<Strategy[]> {
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) throw new Error('خطا در دریافت استراتژی‌ها');
  return data || [];
}

export async function createStrategy(input: StrategyInsert): Promise<Strategy> {
  const { data, error } = await supabase
    .from('strategies')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error('خطا در ایجاد استراتژی');
  return data;
}

export async function updateStrategy(id: string, userId: string, input: StrategyUpdate): Promise<Strategy> {
  const { data, error } = await supabase
    .from('strategies')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error('خطا در بروزرسانی استراتژی');
  return data;
}

export async function deleteStrategy(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('strategies')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error('خطا در حذف استراتژی');
}
