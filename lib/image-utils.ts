/**
 * Image processing utilities for try-on functionality
 * Provides high-quality image resizing and dimension handling
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ResizeProgress {
  stage: 'loading' | 'processing' | 'completed' | 'error';
  percentage: number;
  message: string;
}

/**
 * Get image dimensions from URL
 */
export function getImageDimensions(imageUrl: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image dimensions'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Resize image to exact dimensions using high-quality Canvas API
 */
export function resizeImageToExactDimensions(
  imageUrl: string,
  targetWidth: number,
  targetHeight: number,
  quality: number = 0.95,
  onProgress?: (progress: ResizeProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        onProgress?.({
          stage: 'processing',
          percentage: 25,
          message: 'Creating high-quality canvas...'
        });

        // Create canvas with target dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        onProgress?.({
          stage: 'processing',
          percentage: 50,
          message: 'Applying advanced image processing...'
        });

        // Enable high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        onProgress?.({
          stage: 'processing',
          percentage: 65,
          message: 'Calculating optimal proportions...'
        });

        // Calculate scaling to fit image within target dimensions while preserving aspect ratio
        const sourceAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;
        
        let drawWidth: number;
        let drawHeight: number;
        let offsetX: number;
        let offsetY: number;

        if (sourceAspect > targetAspect) {
          // Image is wider than target - fit to width
          drawWidth = targetWidth;
          drawHeight = targetWidth / sourceAspect;
          offsetX = 0;
          offsetY = (targetHeight - drawHeight) / 2;
        } else {
          // Image is taller than target or same aspect - fit to height
          drawHeight = targetHeight;
          drawWidth = targetHeight * sourceAspect;
          offsetX = (targetWidth - drawWidth) / 2;
          offsetY = 0;
        }

        // Fill canvas with white background (in case image doesn't fill entire canvas)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        onProgress?.({
          stage: 'processing',
          percentage: 75,
          message: 'Rendering high-quality image...'
        });

        // Draw the image preserving aspect ratio and centering it
        ctx.drawImage(
          img, 
          0, 0, img.width, img.height,  // source rectangle
          offsetX, offsetY, drawWidth, drawHeight  // destination rectangle
        );

        onProgress?.({
          stage: 'processing',
          percentage: 85,
          message: 'Finalizing image...'
        });

        // Convert to blob with high quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }

            const resizedUrl = URL.createObjectURL(blob);
            
            onProgress?.({
              stage: 'completed',
              percentage: 100,
              message: 'Image resized successfully!'
            });
            
            resolve(resizedUrl);
          },
          'image/jpeg',
          quality
        );

      } catch (error) {
        onProgress?.({
          stage: 'error',
          percentage: 0,
          message: 'Failed to process image'
        });
        reject(error);
      }
    };

    img.onerror = () => {
      onProgress?.({
        stage: 'error',
        percentage: 0,
        message: 'Failed to load image'
      });
      reject(new Error('Failed to load image for resizing'));
    };

    onProgress?.({
      stage: 'loading',
      percentage: 10,
      message: 'Loading original image...'
    });

    img.src = imageUrl;
  });
}

/**
 * Calculate optimal display dimensions for screen
 */
export function calculateDisplayDimensions(
  originalWidth: number,
  originalHeight: number,
  maxScreenWidth: number,
  maxScreenHeight: number
): { width: number; height: number; scale: number } {
  const scaleX = maxScreenWidth / originalWidth;
  const scaleY = maxScreenHeight / originalHeight;
  const scale = Math.min(scaleX, scaleY, 1);
  
  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
    scale
  };
}

/**
 * Check if image needs resizing
 */
export function needsResizing(
  originalDimensions: ImageDimensions,
  targetDimensions: ImageDimensions,
  tolerance: number = 5
): boolean {
  const widthDiff = Math.abs(originalDimensions.width - targetDimensions.width);
  const heightDiff = Math.abs(originalDimensions.height - targetDimensions.height);
  
  return widthDiff > tolerance || heightDiff > tolerance;
}

/**
 * Create cache key for resized images
 */
export function createResizeCacheKey(
  imageUrl: string,
  width: number,
  height: number
): string {
  return `resized_${btoa(imageUrl)}_${width}x${height}`;
}

/**
 * Cleanup object URL to prevent memory leaks
 */
export function cleanupImageUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
} 