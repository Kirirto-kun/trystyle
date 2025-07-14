/**
 * Image compression utilities for handling large file uploads
 * Solves browser memory limits and reduces upload times
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeBytes?: number
  outputFormat?: string
}

export interface CompressionResult {
  compressedFile: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

// Browser limits and constants
const MAX_CANVAS_PIXELS = 16777216 // Safari limit
const MAX_STRING_LENGTH = 536870888 // Chrome base64 limit (512MB)
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB default limit
const DEFAULT_QUALITY = 0.85
const DEFAULT_MAX_DIMENSION = 1920

/**
 * Check if image dimensions are safe for Canvas operations
 */
function isSafeDimension(width: number, height: number): boolean {
  return width * height <= MAX_CANVAS_PIXELS
}

/**
 * Calculate safe dimensions that respect browser limits
 */
function calculateSafeDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = DEFAULT_MAX_DIMENSION,
  maxHeight: number = DEFAULT_MAX_DIMENSION
): { width: number; height: number; needsResize: boolean } {
  // First check if original dimensions are within Canvas limits
  const exceedsCanvasLimit = originalWidth * originalHeight > MAX_CANVAS_PIXELS
  
  // Calculate aspect ratio
  const aspectRatio = originalWidth / originalHeight
  
  let targetWidth = originalWidth
  let targetHeight = originalHeight
  let needsResize = false
  
  // Resize if exceeds Canvas limits
  if (exceedsCanvasLimit) {
    const maxPixelsForRatio = Math.sqrt(MAX_CANVAS_PIXELS)
    if (aspectRatio > 1) {
      targetWidth = Math.min(maxPixelsForRatio * Math.sqrt(aspectRatio), maxWidth)
      targetHeight = targetWidth / aspectRatio
    } else {
      targetHeight = Math.min(maxPixelsForRatio / Math.sqrt(aspectRatio), maxHeight)
      targetWidth = targetHeight * aspectRatio
    }
    needsResize = true
  }
  
  // Also resize if exceeds max dimensions
  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    if (targetWidth / maxWidth > targetHeight / maxHeight) {
      targetWidth = maxWidth
      targetHeight = maxWidth / aspectRatio
    } else {
      targetHeight = maxHeight
      targetWidth = maxHeight * aspectRatio
    }
    needsResize = true
  }
  
  return {
    width: Math.floor(targetWidth),
    height: Math.floor(targetHeight),
    needsResize: needsResize || exceedsCanvasLimit
  }
}

/**
 * Compress image using Canvas API with error handling
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = DEFAULT_MAX_DIMENSION,
    maxHeight = DEFAULT_MAX_DIMENSION,
    quality = DEFAULT_QUALITY,
    maxSizeBytes = DEFAULT_MAX_SIZE,
    outputFormat = 'image/jpeg'
  } = options

  // Pre-flight checks
  if (file.size > maxSizeBytes) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB)`)
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      try {
        const { width: targetWidth, height: targetHeight, needsResize } = calculateSafeDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        )

        // If no resize needed and file is already small enough, return original
        if (!needsResize && file.size <= maxSizeBytes * 0.8) {
          resolve({
            compressedFile: file,
            originalSize: file.size,
            compressedSize: file.size,
            compressionRatio: 1
          })
          return
        }

        // Create canvas with safe dimensions
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          throw new Error('Could not get canvas context')
        }

        // Verify dimensions are safe
        if (!isSafeDimension(targetWidth, targetHeight)) {
          throw new Error(`Calculated dimensions (${targetWidth}x${targetHeight}) exceed browser limits`)
        }

        canvas.width = targetWidth
        canvas.height = targetHeight

        // Draw and compress
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            // Create new file with compressed data
            const compressedFile = new File([blob], file.name, {
              type: outputFormat,
              lastModified: Date.now()
            })

            const compressionRatio = file.size / blob.size

            resolve({
              compressedFile,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio
            })

            // Clean up
            canvas.remove()
          },
          outputFormat,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Load image
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string
      }
    }
    reader.onerror = () => {
      reject(new Error('Failed to read image file'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Convert file to base64 with safety checks
 */
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check estimated base64 size (roughly 1.37x original size)
    const estimatedBase64Size = file.size * 1.37
    
    if (estimatedBase64Size > MAX_STRING_LENGTH * 0.8) { // 80% safety margin
      reject(new Error(`File too large for base64 conversion. Estimated size: ${(estimatedBase64Size / 1024 / 1024).toFixed(1)}MB, limit: ${(MAX_STRING_LENGTH * 0.8 / 1024 / 1024).toFixed(1)}MB`))
      return
    }

    const reader = new FileReader()
    
    reader.onload = () => {
      try {
        const result = reader.result as string
        
        // Double-check result size
        if (result.length > MAX_STRING_LENGTH * 0.8) {
          reject(new Error('Resulting base64 string exceeds browser limits'))
          return
        }
        
        resolve(result)
      } catch (error) {
        reject(new Error('Failed to process base64 result'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file for base64 conversion'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Validate file before processing
 */
export function validateImageFile(file: File, maxSizeBytes: number = DEFAULT_MAX_SIZE): string | null {
  if (!file.type.startsWith('image/')) {
    return 'File must be an image'
  }
  
  if (file.size > maxSizeBytes) {
    return `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB)`
  }
  
  const estimatedBase64Size = file.size * 1.37
  if (estimatedBase64Size > MAX_STRING_LENGTH * 0.8) {
    return `File too large for processing. Try reducing image size or quality.`
  }
  
  return null // No errors
}

/**
 * Get human readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 