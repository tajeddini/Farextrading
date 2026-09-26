// ============================================================
// Trade Images Service
// Handles trade screenshot upload, retrieval, and deletion
// ============================================================

import { supabase } from './supabase';
import { getSupabaseStorageProvider } from './storage/supabaseProvider';
import { STORAGE_CONFIG } from '../config/storage';
import { processImage, validateImageFile } from '../utils/imageProcessing';
import type { TradeImage, TradeImageInsert } from '../types/database';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a trade image
 */
export async function uploadTradeImage(
  tradeId: string,
  userId: string,
  file: File
): Promise<TradeImage> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Process image (resize + WebP conversion)
  const processed = await processImage(file);

  // Generate unique storage path
  const extension = 'webp';
  const filename = `${uuidv4()}.${extension}`;
  const storagePath = `trades/${tradeId}/${filename}`;

  // Upload to storage
  const provider = getSupabaseStorageProvider();
  await provider.upload({
    path: storagePath,
    file: processed.blob,
    contentType: 'image/webp',
  });

  // Insert metadata into database
  const insertData: TradeImageInsert = {
    trade_id: tradeId,
    user_id: userId,
    storage_provider: STORAGE_CONFIG.PROVIDER,
    storage_bucket: STORAGE_CONFIG.BUCKET_NAME,
    storage_path: storagePath,
    original_filename: file.name,
    original_size_bytes: processed.originalSize,
    processed_size_bytes: processed.processedSize,
    mime_type: 'image/webp',
    width: processed.width,
    height: processed.height,
  };

  const { data, error } = await supabase
    .from('trade_images')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    // Cleanup: delete uploaded file if DB insert fails
    try {
      await provider.delete(storagePath);
    } catch (cleanupError) {
      console.error('Failed to cleanup orphaned storage file:', cleanupError);
    }
    throw new Error('خطا در ذخیره اطلاعات تصویر');
  }

  return data;
}

/**
 * Get all images for a trade
 */
export async function getTradeImages(tradeId: string): Promise<TradeImage[]> {
  const { data, error } = await supabase
    .from('trade_images')
    .select('*')
    .eq('trade_id', tradeId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error('خطا در دریافت تصاویر');
  }

  return data || [];
}

/**
 * Get signed URL for an image
 */
export async function getTradeImageUrl(image: TradeImage): Promise<string> {
  const provider = getSupabaseStorageProvider();
  return provider.getSignedUrl(image.storage_path);
}

/**
 * Delete a trade image
 */
export async function deleteTradeImage(imageId: string, userId: string): Promise<void> {
  // Get image metadata
  const { data: image, error: fetchError } = await supabase
    .from('trade_images')
    .select('*')
    .eq('id', imageId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !image) {
    throw new Error('تصویر یافت نشد یا دسترسی غیرمجاز است');
  }

  // Delete from storage
  const provider = getSupabaseStorageProvider();
  try {
    await provider.delete(image.storage_path);
  } catch (storageError) {
    console.error('Failed to delete from storage:', storageError);
    // Continue to delete DB record even if storage delete fails
    // This prevents orphaned DB records
  }

  // Delete from database
  const { error } = await supabase
    .from('trade_images')
    .delete()
    .eq('id', imageId)
    .eq('user_id', userId);

  if (error) {
    throw new Error('خطا در حذف تصویر');
  }
}

/**
 * Replace a trade image (safe replacement)
 */
export async function replaceTradeImage(
  imageId: string,
  userId: string,
  newFile: File
): Promise<TradeImage> {
  // Get existing image
  const { data: existingImage, error: fetchError } = await supabase
    .from('trade_images')
    .select('*')
    .eq('id', imageId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !existingImage) {
    throw new Error('تصویر یافت نشد یا دسترسی غیرمجاز است');
  }

  // Upload new image first
  const newImage = await uploadTradeImage(
    existingImage.trade_id,
    userId,
    newFile
  );

  // Delete old image
  try {
    await deleteTradeImage(imageId, userId);
  } catch (deleteError) {
    console.error('Failed to delete old image after replacement:', deleteError);
    // New image is already uploaded, so we don't rollback
    // This prevents data loss
  }

  return newImage;
}

/**
 * Get storage usage statistics for a user
 */
export async function getStorageStats(userId: string): Promise<{
  totalImages: number;
  totalSizeBytes: number;
  averageSizeBytes: number;
}> {
  const { data, error } = await supabase
    .from('trade_images')
    .select('processed_size_bytes')
    .eq('user_id', userId);

  if (error) {
    throw new Error('خطا در دریافت آمار ذخیره‌سازی');
  }

  const totalImages = data?.length || 0;
  const totalSizeBytes = data?.reduce((sum, img) => sum + img.processed_size_bytes, 0) || 0;
  const averageSizeBytes = totalImages > 0 ? totalSizeBytes / totalImages : 0;

  return {
    totalImages,
    totalSizeBytes,
    averageSizeBytes,
  };
}
