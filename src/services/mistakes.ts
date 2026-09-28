import { supabase } from './supabase';
import type { Mistake, MistakeInsert, MistakeUpdate } from '../types/database';

export async function getMistakes(userId: string): Promise<Mistake[]> {
  const { data, error } = await supabase
    .from('mistakes')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) throw new Error('خطا در دریافت اشتباهات');
  return data || [];
}

export async function createMistake(input: MistakeInsert): Promise<Mistake> {
  const { data, error } = await supabase
    .from('mistakes')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error('خطا در ایجاد اشتباه');
  return data;
}

export async function updateMistake(id: string, userId: string, input: MistakeUpdate): Promise<Mistake> {
  const { data, error } = await supabase
    .from('mistakes')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error('خطا در بروزرسانی اشتباه');
  return data;
}

export async function deleteMistake(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('mistakes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error('خطا در حذف اشتباه');
}

// Trade-Mistake relationships
export async function getTradeMistakes(tradeId: string): Promise<{ mistake: Mistake; notes: string | null }[]> {
  const { data, error } = await supabase
    .from('trade_mistakes')
    .select('notes, mistake:mistakes(*)')
    .eq('trade_id', tradeId);

  if (error) throw new Error('خطا در دریافت اشتباهات معامله');
  return (data || []).map((dt: any) => ({ mistake: dt.mistake, notes: dt.notes }));
}

export async function addTradeMistake(tradeId: string, mistakeId: string, notes?: string): Promise<void> {
  const { error } = await supabase
    .from('trade_mistakes')
    .insert({ trade_id: tradeId, mistake_id: mistakeId, notes: notes || null });

  if (error) throw new Error('خطا در افزودن اشتباه');
}

export async function removeTradeMistake(tradeId: string, mistakeId: string): Promise<void> {
  const { error } = await supabase
    .from('trade_mistakes')
    .delete()
    .eq('trade_id', tradeId)
    .eq('mistake_id', mistakeId);

  if (error) throw new Error('خطا در حذف اشتباه');
}

export async function setTradeMistakes(tradeId: string, mistakeIds: { id: string; notes?: string }[]): Promise<void> {
  // Remove existing
  await supabase.from('trade_mistakes').delete().eq('trade_id', tradeId);
  
  // Add new
  if (mistakeIds.length > 0) {
    const { error } = await supabase
      .from('trade_mistakes')
      .insert(mistakeIds.map(m => ({ trade_id: tradeId, mistake_id: m.id, notes: m.notes || null })));

    if (error) throw new Error('خطا در تنظیم اشتباهات');
  }
}
