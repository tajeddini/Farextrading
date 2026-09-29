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

/**
 * Set trade mistakes with atomic-like safety
 * 
 * Strategy: Use a diff-based approach to minimize data loss risk
 * 1. Get current mistakes
 * 2. Calculate additions and removals
 * 3. Apply changes in safe order
 * 
 * Note: True atomicity requires Supabase RPC/transactions
 * This approach minimizes the window for partial failure
 */
export async function setTradeMistakes(tradeId: string, mistakeIds: { id: string; notes?: string }[]): Promise<void> {
  // Validate input
  if (!Array.isArray(mistakeIds)) {
    throw new Error('mistakeIds must be an array');
  }

  // Remove duplicates by id
  const uniqueMistakes = mistakeIds.reduce((acc, m) => {
    if (!acc.find(x => x.id === m.id)) {
      acc.push(m);
    }
    return acc;
  }, [] as { id: string; notes?: string }[]);

  // Step 1: Get current mistakes
  const { data: currentMistakes, error: fetchError } = await supabase
    .from('trade_mistakes')
    .select('mistake_id')
    .eq('trade_id', tradeId);

  if (fetchError) {
    throw new Error('خطا در دریافت اشتباهات فعلی');
  }

  const currentMistakeIds = new Set(currentMistakes?.map(m => m.mistake_id) || []);
  const newMistakeIds = new Set(uniqueMistakes.map(m => m.id));

  // Step 2: Calculate diff
  const toAdd = uniqueMistakes.filter(m => !currentMistakeIds.has(m.id));
  const toRemove = [...currentMistakeIds].filter(id => !newMistakeIds.has(id));

  // Step 3: Apply changes safely
  // Add new mistakes first (if this fails, we still have old mistakes)
  if (toAdd.length > 0) {
    const { error: insertError } = await supabase
      .from('trade_mistakes')
      .insert(toAdd.map(m => ({ trade_id: tradeId, mistake_id: m.id, notes: m.notes || null })));

    if (insertError) {
      console.error('Failed to add new mistakes:', insertError);
      throw new Error('خطا در افزودن اشتباهات جدید');
    }
  }

  // Remove old mistakes (if this fails, we have extra mistakes but no data loss)
  if (toRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from('trade_mistakes')
      .delete()
      .eq('trade_id', tradeId)
      .in('mistake_id', toRemove);

    if (deleteError) {
      console.error('Failed to remove old mistakes:', deleteError);
      // Don't throw - we added new mistakes successfully
      // Old mistakes remain but this is safer than losing data
    }
  }
}
