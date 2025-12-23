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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    const authToken = safeStorage.getItem<string>('authToken', "");
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const url = API_BASE_URL.endsWith("/api")
      ? `${API_BASE_URL}/files/bulk`
      : `${API_BASE_URL}/api/files/bulk`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(fileMetadata),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to save file metadata: ${error}`);
    }
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

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    const authToken = safeStorage.getItem<string>('authToken', "");
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const url = API_BASE_URL.endsWith("/api")
      ? `${API_BASE_URL}/files/bulk`
      : `${API_BASE_URL}/api/files/bulk`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(fileMetadata),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to save file metadata: ${error}`);
    }
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
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    const authToken = safeStorage.getItem<string>('authToken', "");
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const url = API_BASE_URL.endsWith("/api")
      ? `${API_BASE_URL}/files/${fileId}`
      : `${API_BASE_URL}/api/files/${fileId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete file metadata: ${error}`);
    }
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
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    const authToken = safeStorage.getItem<string>('authToken', "");
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  }

  const baseUrl = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;

  let url = `${baseUrl}/files?entityType=${entityType}&entityId=${entityId}`;
  if (category) {
    url += `&category=${category}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get files: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting files:', error);
    return [];
  }
}

