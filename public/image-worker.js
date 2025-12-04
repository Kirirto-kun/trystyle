/**
 * WebWorker for image compression and processing
 * Handles heavy image operations without blocking UI
 */

// Browser limits and constants
const MAX_CANVAS_PIXELS = 16777216 // Safari limit
const MAX_STRING_LENGTH = 536870888 // Chrome base64 limit (512MB)
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB default limit
const DEFAULT_QUALITY = 0.85
const DEFAULT_MAX_DIMENSION = 1920

/**
 * Check if image dimensions are safe for Canvas operations
 */
function isSafeDimension(width, height) {
  return width * height <= MAX_CANVAS_PIXELS
}

/**
 * Calculate safe dimensions that respect browser limits
 */
function calculateSafeDimensions(originalWidth, originalHeight, maxWidth = DEFAULT_MAX_DIMENSION, maxHeight = DEFAULT_MAX_DIMENSION) {
  const exceedsCanvasLimit = originalWidth * originalHeight > MAX_CANVAS_PIXELS
  const aspectRatio = originalWidth / originalHeight
  
  let targetWidth = originalWidth
  let targetHeight = originalHeight
  let needsResize = false
  
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
 * Compress image using Canvas API in worker
 */
function compressImageInWorker(imageData, options) {
  return new Promise((resolve, reject) => {
    try {
      const {
        maxWidth = DEFAULT_MAX_DIMENSION,
        maxHeight = DEFAULT_MAX_DIMENSION,
        quality = DEFAULT_QUALITY,
        outputFormat = 'image/jpeg'
      } = options

      // Create image from data
      const img = new Image()
      
      img.onload = () => {
        try {
          const { width: targetWidth, height: targetHeight, needsResize } = calculateSafeDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          )

          // Create canvas with safe dimensions
          const canvas = new OffscreenCanvas(targetWidth, targetHeight)
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            throw new Error('Could not get canvas context in worker')
          }

          // Verify dimensions are safe
          if (!isSafeDimension(targetWidth, targetHeight)) {
            throw new Error(`Calculated dimensions (${targetWidth}x${targetHeight}) exceed browser limits`)
          }

          // Draw and compress
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

          canvas.convertToBlob({ type: outputFormat, quality })
            .then(blob => {
              const compressionRatio = imageData.size / blob.size

              // Convert blob to array buffer for transfer
              blob.arrayBuffer().then(arrayBuffer => {
                resolve({
                  compressedData: arrayBuffer,
                  originalSize: imageData.size,
                  compressedSize: blob.size,
                  compressionRatio,
                  mimeType: outputFormat
                })
              })
            })
            .catch(reject)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image in worker'))
      }

      // Load image from data
      img.src = imageData.dataUrl
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Convert file to base64 with safety checks in worker
 */
function convertToBase64InWorker(arrayBuffer, mimeType) {
  return new Promise((resolve, reject) => {
    try {
      // Check estimated base64 size
      const estimatedBase64Size = arrayBuffer.byteLength * 1.37
      
      if (estimatedBase64Size > MAX_STRING_LENGTH * 0.8) {
        reject(new Error(`File too large for base64 conversion. Estimated size: ${(estimatedBase64Size / 1024 / 1024).toFixed(1)}MB`))
        return
      }

      // Create blob from array buffer
      const blob = new Blob([arrayBuffer], { type: mimeType })
      
      // Use FileReader to convert to base64
      const reader = new FileReader()
      
      reader.onload = () => {
        try {
          const result = reader.result
          
          if (result.length > MAX_STRING_LENGTH * 0.8) {
            reject(new Error('Resulting base64 string exceeds browser limits'))
            return
          }
          
          resolve(result)
        } catch (error) {
          reject(new Error('Failed to process base64 result in worker'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read blob for base64 conversion in worker'))
      }
      
      reader.readAsDataURL(blob)
    } catch (error) {
      reject(error)
    }
  })
}

// Handle messages from main thread
self.onmessage = async function(e) {
  const { type, data, options, id } = e.data

  try {
    switch (type) {
      case 'compress':
        // Compress image
        const compressionResult = await compressImageInWorker(data, options)
        
        // Convert to base64
        const base64 = await convertToBase64InWorker(compressionResult.compressedData, compressionResult.mimeType)
        
        // Send result back
        self.postMessage({
          type: 'success',
          id,
          result: {
            base64,
            originalSize: compressionResult.originalSize,
            compressedSize: compressionResult.compressedSize,
            compressionRatio: compressionResult.compressionRatio
          }
        })
        break

      case 'validate':
        // Validate file
        const { file, maxSizeBytes = DEFAULT_MAX_SIZE } = data
        
        let validationError = null
        
        if (!file.type.startsWith('image/')) {
          validationError = 'File must be an image'
        } else if (file.size > maxSizeBytes) {
          validationError = `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB)`
        } else {
          const estimatedBase64Size = file.size * 1.37
          if (estimatedBase64Size > MAX_STRING_LENGTH * 0.8) {
            validationError = 'File too large for processing. Try reducing image size or quality.'
          }
        }
        
        self.postMessage({
          type: 'validation',
          id,
          result: { valid: !validationError, error: validationError }
        })
        break

      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error) {
    console.error('Worker error:', error)
    self.postMessage({
      type: 'error',
      id,
      error: error.message || 'Unknown worker error'
    })
  }
}

// Handle worker startup
self.postMessage({ type: 'ready' }) 