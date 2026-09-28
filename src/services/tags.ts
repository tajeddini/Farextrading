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

export async function setTradeTags(tradeId: string, tagIds: string[]): Promise<void> {
  // Remove existing
  await supabase.from('trade_tags').delete().eq('trade_id', tradeId);
  
  // Add new
  if (tagIds.length > 0) {
    const { error } = await supabase
      .from('trade_tags')
      .insert(tagIds.map(tagId => ({ trade_id: tradeId, tag_id: tagId })));

    if (error) throw new Error('خطا در تنظیم تگ‌ها');
  }
}
