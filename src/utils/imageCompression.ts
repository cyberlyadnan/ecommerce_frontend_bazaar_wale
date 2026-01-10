import imageCompression from 'browser-image-compression';

export interface ImageCompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}

/**
 * Compress and optimize image before upload
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  // Default compression options
  const compressionOptions: ImageCompressionOptions = {
    maxSizeMB: 1, // Maximum file size in MB (1MB default)
    maxWidthOrHeight: 1920, // Maximum width or height in pixels (Full HD)
    useWebWorker: true, // Use web worker for better performance
    initialQuality: 0.85, // Initial quality (85% - good balance between quality and size)
    ...options,
  };

  // Don't compress if file is already small enough
  const maxSizeBytes = (compressionOptions.maxSizeMB || 1) * 1024 * 1024;
  if (file.size <= maxSizeBytes) {
    console.log('[Image Compression] File already small enough, skipping compression', {
      originalSize: file.size,
      maxSize: maxSizeBytes,
    });
    return file;
  }

  try {
    console.log('[Image Compression] Starting compression', {
      originalSize: file.size,
      originalName: file.name,
      originalType: file.type,
      options: compressionOptions,
    });

    const compressedFile = await imageCompression(file, compressionOptions);

    console.log('[Image Compression] Compression complete', {
      originalSize: file.size,
      compressedSize: compressedFile.size,
      reduction: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`,
      originalName: file.name,
    });

    return compressedFile;
  } catch (error) {
    console.error('[Image Compression] Compression failed, using original file', error);
    // If compression fails, return original file
    return file;
  }
}

/**
 * Compress image with product-specific settings (higher quality for product images)
 */
export async function compressProductImage(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 2, // Allow up to 2MB for product images (higher quality)
    maxWidthOrHeight: 2560, // 2K resolution for product images
    initialQuality: 0.9, // Higher quality for product images
  });
}

/**
 * Compress image with category-specific settings (balanced quality)
 */
export async function compressCategoryImage(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 1, // 1MB max for category images
    maxWidthOrHeight: 1920, // Full HD
    initialQuality: 0.85, // Good quality
  });
}

/**
 * Compress image with blog-specific settings (web-optimized)
 */
export async function compressBlogImage(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 1, // 1MB max for blog images
    maxWidthOrHeight: 1920, // Full HD
    initialQuality: 0.8, // Slightly lower quality for faster loading
  });
}

/**
 * Compress image with review-specific settings (smaller, faster)
 */
export async function compressReviewImage(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.5, // 500KB max for review images
    maxWidthOrHeight: 1280, // HD resolution is enough for reviews
    initialQuality: 0.75, // Lower quality for faster upload
  });
}
