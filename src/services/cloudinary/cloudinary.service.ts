import { getCloudinaryUploadUrl, CLOUDINARY_CONFIG } from '@/config/cloudinary.config';
import {
  CloudinaryUploadOptions,
  CloudinaryUploadResult,
  CloudinaryError,
  UploadProgressCallback,
  UploadErrorType,
  CloudinaryUploadError,
} from './types';
import { validateFile, validateFiles, ValidationResult } from './fileValidation';

/**
 * Upload a single file to Cloudinary
 */
export async function uploadToCloudinary(
  file: File,
  options: CloudinaryUploadOptions = {},
  onProgress?: UploadProgressCallback
): Promise<CloudinaryUploadResult> {
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new CloudinaryUploadError(
      UploadErrorType.VALIDATION_ERROR,
      validation.error || 'File validation failed'
    );
  }

  // Prepare FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

  // Add optional parameters
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.publicId) {
    formData.append('public_id', options.publicId);
  }

  if (options.resourceType && options.resourceType !== 'auto') {
    formData.append('resource_type', options.resourceType);
  }

  if (options.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','));
  }

  if (options.context) {
    formData.append('context', JSON.stringify(options.context));
  }

  if (options.eager && options.eager.length > 0) {
    formData.append('eager', options.eager.join('|'));
  }

  // Upload with progress tracking (using XMLHttpRequest for progress)
  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const uploadUrl = getCloudinaryUploadUrl();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const rawResponse = JSON.parse(xhr.responseText);

          // Transform Cloudinary's snake_case response to our camelCase interface
          const response: CloudinaryUploadResult = {
            publicId: rawResponse.public_id,
            secureUrl: rawResponse.secure_url,
            url: rawResponse.url,
            format: rawResponse.format,
            bytes: rawResponse.bytes,
            width: rawResponse.width,
            height: rawResponse.height,
            duration: rawResponse.duration,
            thumbnailUrl: rawResponse.thumbnail_url,
            createdAt: rawResponse.created_at,
            resourceType: rawResponse.resource_type,
            version: rawResponse.version,
            signature: rawResponse.signature,
            eager: rawResponse.eager?.map((e: any) => ({
              url: e.url,
              secureUrl: e.secure_url,
              transformation: e.transformation,
            })),
          };

          resolve(response);
        } catch (error) {
          reject(new CloudinaryUploadError(
            UploadErrorType.UNKNOWN_ERROR,
            'Failed to parse Cloudinary response',
            error instanceof Error ? error : undefined
          ));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText) as CloudinaryError;
          reject(new CloudinaryUploadError(
            UploadErrorType.NETWORK_ERROR,
            error.error?.message || 'Upload failed',
          ));
        } catch {
          reject(new CloudinaryUploadError(
            UploadErrorType.NETWORK_ERROR,
            `Upload failed with status ${xhr.status}`,
          ));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new CloudinaryUploadError(
        UploadErrorType.NETWORK_ERROR,
        'Network error during upload',
      ));
    });

    xhr.addEventListener('abort', () => {
      reject(new CloudinaryUploadError(
        UploadErrorType.NETWORK_ERROR,
        'Upload aborted',
      ));
    });

    // Send request
    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
}

/**
 * Upload with retry logic
 */
export async function uploadWithRetry(
  file: File,
  folder: string,
  options: CloudinaryUploadOptions = {},
  maxRetries = 3
): Promise<CloudinaryUploadResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadToCloudinary(file, { folder, ...options });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Upload failed');

      // Don't retry validation errors
      if (error instanceof CloudinaryUploadError &&
        (error.type === UploadErrorType.VALIDATION_ERROR ||
          error.type === UploadErrorType.SIZE_ERROR ||
          error.type === UploadErrorType.TYPE_ERROR)) {
        throw error;
      }

      // Retry network errors
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw new CloudinaryUploadError(
    UploadErrorType.NETWORK_ERROR,
    `Upload failed after ${maxRetries} attempts: ${lastError?.message}`,
    lastError || undefined
  );
}

/**
 * Upload multiple files to Cloudinary
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  folder: string,
  options: Omit<CloudinaryUploadOptions, 'folder'> = {},
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<CloudinaryUploadResult[]> {
  // Validate all files first
  const validation = validateFiles(files);
  if (!validation.valid) {
    throw new CloudinaryUploadError(
      UploadErrorType.VALIDATION_ERROR,
      validation.error || 'File validation failed'
    );
  }

  // Upload files in parallel (limit concurrent uploads)
  const CONCURRENT_LIMIT = 3;
  const results: CloudinaryUploadResult[] = [];

  for (let i = 0; i < files.length; i += CONCURRENT_LIMIT) {
    const batch = files.slice(i, i + CONCURRENT_LIMIT);
    const batchResults = await Promise.all(
      batch.map((file, batchIndex) => {
        const fileIndex = i + batchIndex;
        return uploadToCloudinary(
          file,
          { folder, ...options },
          (progress) => {
            if (onProgress) {
              onProgress(fileIndex, progress);
            }
          }
        );
      })
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Delete a file from Cloudinary
 * Note: Requires backend API call with API secret
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // This should be called from backend for security
  // Frontend can only request deletion via API
  throw new Error('Delete operation must be performed via backend API');
}

/**
 * Get optimized URL with transformations
 */
export function getOptimizedUrl(
  publicId: string,
  transformations?: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'limit' | 'scale';
  }
): string {
  const { cloudName } = CLOUDINARY_CONFIG;
  let url = `https://res.cloudinary.com/${cloudName}/image/upload`;

  if (transformations) {
    const parts: string[] = [];

    if (transformations.width) parts.push(`w_${transformations.width}`);
    if (transformations.height) parts.push(`h_${transformations.height}`);
    if (transformations.crop) parts.push(`c_${transformations.crop}`);
    if (transformations.quality) {
      parts.push(`q_${transformations.quality}`);
    } else {
      parts.push('q_auto');
    }
    if (transformations.format) {
      parts.push(`f_${transformations.format}`);
    } else {
      parts.push('f_auto');
    }

    if (parts.length > 0) {
      url += `/${parts.join(',')}`;
    }
  }

  url += `/${publicId}`;
  return url;
}

/**
 * Optimize an existing Cloudinary URL by injecting transformations
 */
export function optimizeCloudinaryUrl(
  url: string,
  width: number,
  height: number,
  fit: 'fill' | 'fit' | 'limit' | 'scale' = 'fill'
): string {
  if (!url || !url.includes('cloudinary.com')) return url;

  // Split at /upload/
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  // Construct transformation string
  const transformation = `w_${width},h_${height},c_${fit},q_auto,f_auto`;

  return `${parts[0]}/upload/${transformation}/${parts[1]}`;
}

