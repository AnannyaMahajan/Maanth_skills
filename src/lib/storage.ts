import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export const BUCKET_NAME = 'app-files';

export interface UploadResult {
  path: string;
  url: string;
}

/**
 * Uploads a file to Supabase Storage.
 * @param file The file to upload.
 * @param userId The user ID (required for the path).
 * @param featureName The name of the feature (e.g., 'avatars', 'skills').
 * @param itemId The ID of the item (e.g., skill ID).
 * @returns The file path and a signed URL.
 */
export async function uploadFile(
  file: File,
  userId: string,
  featureName: string,
  itemId: string = 'general'
): Promise<UploadResult> {
  const extension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${extension}`;
  const path = `${userId}/${featureName}/${itemId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const signedUrl = await getSignedUrl(path);

  return {
    path: data.path,
    url: signedUrl,
  };
}

/**
 * Generates a signed URL for a file in Supabase Storage.
 * @param path The file path.
 * @param expiresIn Seconds until the signed URL expires (default 1 hour).
 * @returns The signed URL.
 */
export async function getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

/**
 * Deletes a file from Supabase Storage.
 * @param path The file path.
 */
export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw error;
  }
}
