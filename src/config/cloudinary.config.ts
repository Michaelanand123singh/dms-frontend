/**
 * Cloudinary configuration for direct frontend uploads
 */

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string; // Optional, only for signed uploads
  uploadEndpoint: string;
}

export const CLOUDINARY_CONFIG: CloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  uploadEndpoint: 'https://api.cloudinary.com/v1_1',
};

// Construct upload URL
export const getCloudinaryUploadUrl = (): string => {
  return `${CLOUDINARY_CONFIG.uploadEndpoint}/${CLOUDINARY_CONFIG.cloudName}/auto/upload`;
};

// Validate configuration
export const validateCloudinaryConfig = (): void => {
  if (!CLOUDINARY_CONFIG.cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required');
  }
  if (!CLOUDINARY_CONFIG.uploadPreset) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is required');
  }
};

// Initialize validation on import (client-side only)
// Initialize validation on import (client-side only)
// if (typeof window !== 'undefined') {
//   validateCloudinaryConfig();
// }

