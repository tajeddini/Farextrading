// ============================================================
// Supabase Storage Provider
// Implementation of StorageProvider using Supabase Storage
// ============================================================

import { supabase } from '../supabase';
import { STORAGE_CONFIG } from '../../config/storage';
import type { StorageProvider } from './types';

export class SupabaseStorageProvider implements StorageProvider {
  private bucketName: string;

  constructor(bucketName: string = STORAGE_CONFIG.BUCKET_NAME) {
    this.bucketName = bucketName;
  }

  async upload(params: {
    path: string;
    file: File | Blob;
    contentType: string;
  }): Promise<{ path: string; size: number }> {
    const { path, file, contentType } = params;

    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(path, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      throw new Error(`خطا در آپلود فایل: ${error.message}`);
    }

    return {
      path: data.path,
      size: file.size,
    };
  }

  async delete(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) {
      console.error('Supabase Storage delete error:', error);
      throw new Error(`خطا در حذف فایل: ${error.message}`);
    }
  }

  async getSignedUrl(path: string, expirySeconds: number = STORAGE_CONFIG.SIGNED_URL_EXPIRY): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(path, expirySeconds);

    if (error) {
      console.error('Supabase Storage signed URL error:', error);
      throw new Error(`خطا در ایجاد لینک موقت: ${error.message}`);
    }

    return data.signedUrl;
  }

  async exists(path: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(path.split('/').slice(0, -1).join('/'), {
          limit: 1,
          offset: 0,
          search: path.split('/').pop(),
        });

      if (error) {
        return false;
      }

      return data.length > 0;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let providerInstance: SupabaseStorageProvider | null = null;

export function getSupabaseStorageProvider(): SupabaseStorageProvider {
  if (!providerInstance) {
    providerInstance = new SupabaseStorageProvider();
  }
  return providerInstance;
}
