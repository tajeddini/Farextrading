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
 * Delete a trade image with safety guarantees
 * 
 * Safety strategy:
 * 1. Verify ownership
 * 2. Delete from storage
 * 3. Only if storage deletion succeeds, delete from database
 * 4. If storage deletion fails, preserve DB metadata and throw error
 */
export async function deleteTradeImage(imageId: string, userId: string): Promise<void> {
  // Step 1: Get image metadata and verify ownership
  const { data: image, error: fetchError } = await supabase
    .from('trade_images')
    .select('*')
    .eq('id', imageId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !image) {
    throw new Error('تصویر یافت نشد یا دسترسی غیرمجاز است');
  }

  // Step 2: Delete from storage FIRST
  const provider = getSupabaseStorageProvider();
  try {
    await provider.delete(image.storage_path);
  } catch (storageError) {
    // If storage deletion fails, DO NOT delete DB metadata
    // This prevents orphaned storage objects
    console.error('Storage deletion failed:', storageError);
    throw new Error('خطا در حذف فایل از ذخیره‌سازی. تصویر حذف نشد.');
  }

  // Step 3: Only after successful storage deletion, delete from database
  const { error: dbError } = await supabase
    .from('trade_images')
    .delete()
    .eq('id', imageId)
    .eq('user_id', userId);

  if (dbError) {
    // Storage was deleted but DB metadata remains
    // This creates an orphaned storage object
    // Log for manual cleanup
    console.error('Database deletion failed after storage deletion:', dbError);
    console.error('Orphaned storage path:', image.storage_path);
    throw new Error('خطا در حذف اطلاعات تصویر از پایگاه داده');
  }
}

/**
 * Replace a trade image with safety guarantees
 * 
 * Safety strategy:
 * 1. Verify ownership of existing image
 * 2. Upload new image FIRST (never delete old until new is safe)
 * 3. Update DB metadata to point to new image
 * 4. Only after DB update succeeds, delete old storage object
 * 5. If old deletion fails, log for cleanup but don't fail the operation
 */
export async function replaceTradeImage(
  imageId: string,
  userId: string,
  newFile: File
): Promise<TradeImage> {
  // Step 1: Get existing image and verify ownership
  const { data: existingImage, error: fetchError } = await supabase
    .from('trade_images')
    .select('*')
    .eq('id', imageId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !existingImage) {
    throw new Error('تصویر یافت نشد یا دسترسی غیرمجاز است');
  }

  const oldStoragePath = existingImage.storage_path;

  // Step 2: Upload new image FIRST
  const newImage = await uploadTradeImage(
    existingImage.trade_id,
    userId,
    newFile
  );

  // Step 3: Update DB metadata to point to new image
  // This is safe because we're updating, not deleting
  const { error: updateError } = await supabase
    .from('trade_images')
    .update({
      storage_path: newImage.storage_path,
      original_filename: newImage.original_filename,
      original_size_bytes: newImage.original_size_bytes,
      processed_size_bytes: newImage.processed_size_bytes,
      mime_type: newImage.mime_type,
      width: newImage.width,
      height: newImage.height,
    })
    .eq('id', imageId)
    .eq('user_id', userId);

  if (updateError) {
    // DB update failed, but new image is uploaded
    // Clean up the new image to avoid orphan
    try {
      const provider = getSupabaseStorageProvider();
      await provider.delete(newImage.storage_path);
    } catch (cleanupError) {
      console.error('Failed to cleanup new image after DB update failure:', cleanupError);
    }
    throw new Error('خطا در بروزرسانی اطلاعات تصویر');
  }

  // Step 4: Delete old storage object
  // If this fails, we log it but don't fail the operation
  // The new image is already in use
  try {
    const provider = getSupabaseStorageProvider();
    await provider.delete(oldStoragePath);
  } catch (deleteError) {
    // Old storage object remains orphaned
    // Log for manual cleanup
    console.error('Failed to delete old storage object after replacement:', deleteError);
    console.error('Orphaned storage path:', oldStoragePath);
    // Don't throw - the replacement succeeded, old file is just orphaned
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
