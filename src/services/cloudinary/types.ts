/**
 * Cloudinary upload options
 */
export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: string;
  tags?: string[];
  context?: Record<string, string>;
  eager?: string[]; // Eager transformations
}

/**
 * Cloudinary upload result
 */
export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  url: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number; // For videos
  thumbnailUrl?: string; // For videos
  createdAt: string;
  resourceType: 'image' | 'video' | 'raw';
  version: number;
  signature: string;
  eager?: Array<{
    url: string;
    secureUrl: string;
    transformation: string;
  }>;
}

/**
 * Cloudinary error response
 */
export interface CloudinaryError {
  error: {
    message: string;
  };
}

/**
 * File validation options
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Error types for upload errors
 */
export enum UploadErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SIZE_ERROR = 'SIZE_ERROR',
  TYPE_ERROR = 'TYPE_ERROR',
  QUOTA_ERROR = 'QUOTA_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom upload error class
 */
export class CloudinaryUploadError extends Error {
  constructor(
    public type: UploadErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'CloudinaryUploadError';
  }
}

