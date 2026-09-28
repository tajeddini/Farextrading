import { supabase } from './supabase';
import type { Profile, ProfileInsert, ProfileUpdate } from '../types/database';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    throw new Error('خطا در دریافت پروفایل');
  }

  return data;
}

export async function createProfile(input: ProfileInsert): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw new Error('خطا در ایجاد پروفایل');
  }

  return data;
}

export async function updateProfile(userId: string, input: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw new Error('خطا در بروزرسانی پروفایل');
  }

  return data;
}
