import { supabase } from './supabase';
import type { Tag, TagInsert, TagUpdate } from '../types/database';

export async function getTags(userId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) throw new Error('خطا در دریافت تگ‌ها');
  return data || [];
}

export async function createTag(input: TagInsert): Promise<Tag> {
  const { data, error } = await supabase
    .from('tags')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error('خطا در ایجاد تگ');
  return data;
}

export async function updateTag(id: string, userId: string, input: TagUpdate): Promise<Tag> {
  const { data, error } = await supabase
    .from('tags')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error('خطا در بروزرسانی تگ');
  return data;
}

export async function deleteTag(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error('خطا در حذف تگ');
}

// Trade-Tag relationships
export async function getTradeTags(tradeId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('trade_tags')
    .select('tag:tags(*)')
    .eq('trade_id', tradeId);

  if (error) throw new Error('خطا در دریافت تگ‌های معامله');
  return (data || []).map((dt: any) => dt.tag);
}

export async function addTradeTag(tradeId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('trade_tags')
    .insert({ trade_id: tradeId, tag_id: tagId });

  if (error) throw new Error('خطا در افزودن تگ');
}

export async function removeTradeTag(tradeId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('trade_tags')
    .delete()
    .eq('trade_id', tradeId)
    .eq('tag_id', tagId);

  if (error) throw new Error('خطا در حذف تگ');
}

/**
 * Set trade tags with atomic-like safety
 * 
 * Strategy: Use a diff-based approach to minimize data loss risk
 * 1. Get current tags
 * 2. Calculate additions and removals
 * 3. Apply changes in safe order
 * 
 * Note: True atomicity requires Supabase RPC/transactions
 * This approach minimizes the window for partial failure
 */
export async function setTradeTags(tradeId: string, tagIds: string[]): Promise<void> {
  // Validate input
  if (!Array.isArray(tagIds)) {
    throw new Error('tagIds must be an array');
  }

  // Remove duplicates
  const uniqueTagIds = [...new Set(tagIds)];

  // Step 1: Get current tags
  const { data: currentTags, error: fetchError } = await supabase
    .from('trade_tags')
    .select('tag_id')
    .eq('trade_id', tradeId);

  if (fetchError) {
    throw new Error('خطا در دریافت تگ‌های فعلی');
  }

  const currentTagIds = new Set(currentTags?.map(t => t.tag_id) || []);
  const newTagIds = new Set(uniqueTagIds);

  // Step 2: Calculate diff
  const toAdd = uniqueTagIds.filter(id => !currentTagIds.has(id));
  const toRemove = [...currentTagIds].filter(id => !newTagIds.has(id));

  // Step 3: Apply changes safely
  // Add new tags first (if this fails, we still have old tags)
  if (toAdd.length > 0) {
    const { error: insertError } = await supabase
      .from('trade_tags')
      .insert(toAdd.map(tagId => ({ trade_id: tradeId, tag_id: tagId })));

    if (insertError) {
      console.error('Failed to add new tags:', insertError);
      throw new Error('خطا در افزودن تگ‌های جدید');
    }
  }

  // Remove old tags (if this fails, we have extra tags but no data loss)
  if (toRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from('trade_tags')
      .delete()
      .eq('trade_id', tradeId)
      .in('tag_id', toRemove);

    if (deleteError) {
      console.error('Failed to remove old tags:', deleteError);
      // Don't throw - we added new tags successfully
      // Old tags remain but this is safer than losing data
    }
  }
}
