import { CloudinaryUploadResult } from '../cloudinary/types';
import { FileCategory, RelatedEntityType } from './types';
import { localStorage as safeStorage } from "@/shared/lib/localStorage";

export interface FileMetadata {
  url: string;
  publicId: string;
  filename: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  category: FileCategory;
  relatedEntityId: string;
  relatedEntityType: RelatedEntityType;
  uploadedBy?: string;
}

import { apiClient } from '@/core/api/client';
import { API_CONFIG } from '@/config/api.config';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Save file metadata to backend after Cloudinary upload
 */
export async function saveFileMetadata(
  uploadResults: CloudinaryUploadResult[],
  files: File[],
  options: {
    category: FileCategory;
    relatedEntityId: string;
    relatedEntityType: RelatedEntityType;
    uploadedBy?: string;
  },
  token?: string
): Promise<void> {
  if (uploadResults.length === 0) return;

  const fileMetadata: FileMetadata[] = uploadResults.map((result, index) => ({
    url: result.secureUrl,
    publicId: result.publicId,
    filename: files[index]?.name || `file_${index}`,
    format: result.format,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
    duration: result.duration,
    category: options.category,
    relatedEntityId: options.relatedEntityId,
    relatedEntityType: options.relatedEntityType,
    uploadedBy: options.uploadedBy,
  }));

  try {
    // Rely on apiClient's interceptors for auth from Cookies/Storage
    // If explicit token provided, we could pass it, but interceptors currently handle auth globally
    // which is safer and includes Cookie support which was missing here.
    const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : undefined;

    await apiClient.post('/files/bulk', fileMetadata, config);
  } catch (error) {
    console.error('Error saving file metadata:', error);
    // Don't throw - allow upload to succeed even if metadata save fails
    // User can retry or metadata can be saved later
  }
}

/**
 * Save file metadata from existing metadata array (when entity already exists)
 */
export async function saveFileMetadataFromArray(
  metadataArray: Array<{
    publicId: string;
    url: string;
    format: string;
    bytes: number;
    uploadedAt?: string;
  }>,
  filenames: string[],
  options: {
    category: FileCategory;
    relatedEntityId: string;
    relatedEntityType: RelatedEntityType;
    uploadedBy?: string;
  },
  token?: string
): Promise<void> {
  if (metadataArray.length === 0) return;

  const fileMetadata: FileMetadata[] = metadataArray.map((meta, index) => ({
    url: meta.url,
    publicId: meta.publicId,
    filename: filenames[index] || `file_${index}`,
    format: meta.format,
    bytes: meta.bytes,
    category: options.category,
    relatedEntityId: options.relatedEntityId,
    relatedEntityType: options.relatedEntityType,
    uploadedBy: options.uploadedBy,
  }));

  try {
    const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : undefined;
    await apiClient.post('/files/bulk', fileMetadata, config);
  } catch (error) {
    console.error('Error saving file metadata:', error);
  }
}

/**
 * Delete file metadata from backend
 */
export async function deleteFileMetadata(
  fileId: string,
  token?: string
): Promise<void> {
  try {
    const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : undefined;
    await apiClient.delete(`/files/${fileId}`, config);
  } catch (error) {
    console.error('Error deleting file metadata:', error);
  }
}

/**
 * Get files for an entity
 */
export async function getFilesForEntity(
  entityType: RelatedEntityType,
  entityId: string,
  category?: FileCategory,
  token?: string
): Promise<FileMetadata[]> {
  try {
    const config = token ? {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { entityType, entityId, category }
    } : {
      params: { entityType, entityId, category }
    };

    const response = await apiClient.get<FileMetadata[]>('/files', config);
    return response.data;
  } catch (error) {
    console.error('Error getting files:', error);
    return [];
  }
}

