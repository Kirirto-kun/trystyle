"use client"
import { useState, useRef } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UploadCloud, XCircle, Camera, CheckCircle, AlertCircle, Info } from "lucide-react"
import { apiCall } from "@/lib/api"
import type { PhotoUpload, ClothingItemResponse } from "@/lib/types"
import { toast } from "sonner"
import Image from "next/image"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  compressImage, 
  convertFileToBase64, 
  validateImageFile, 
  formatFileSize,
  type CompressionResult
} from "@/lib/image-compression"

interface AddWardrobeItemDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onItemAdded: () => void // Callback after items are successfully added
  onUploadStarted: (count: number) => void; // New callback
}

interface ImagePreview {
  id: string
  file: File
  base64: string
  status: 'processing' | 'compressed' | 'error' | 'original'
  error?: string
  compressionResult?: CompressionResult
}

export default function AddWardrobeItemDialog({ isOpen, onOpenChange, onItemAdded, onUploadStarted }: AddWardrobeItemDialogProps) {
  const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newImagePreviews: ImagePreview[] = []
    
    // Add files with initial processing status
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.warning(`Skipped non-image file: ${file.name}`)
        continue
      }
      
      // Validate file size and requirements
      const validationError = validateImageFile(file)
      if (validationError) {
        toast.error(`${file.name}: ${validationError}`)
        continue
      }
      
      // Add with processing status and temporary preview
      const tempPreview: ImagePreview = {
        id: `${file.name}-${Date.now()}-${i}`,
        file,
        base64: '', // Will be set after processing
        status: 'processing'
      }
      
      newImagePreviews.push(tempPreview)
    }
    
    // Add to state immediately to show processing status
    setSelectedImages((prev) => [...prev, ...newImagePreviews])
    
    // Process each file individually
    for (const preview of newImagePreviews) {
      processImageFile(preview)
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const processImageFile = async (preview: ImagePreview) => {
    try {
      // Step 1: Compress image if needed
      const compressionResult = await compressImage(preview.file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        outputFormat: preview.file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      })
      
      // Step 2: Convert to base64
      const base64 = await convertFileToBase64(compressionResult.compressedFile)
      
      // Update preview with success
      setSelectedImages(prev => prev.map(img => 
        img.id === preview.id 
          ? { 
              ...img, 
              base64, 
              status: compressionResult.compressionRatio > 1.1 ? 'compressed' : 'original',
              compressionResult
            }
          : img
      ))
      
      // Show compression info if significant
      if (compressionResult.compressionRatio > 1.2) {
        toast.success(
          `${preview.file.name} compressed: ${formatFileSize(compressionResult.originalSize)} → ${formatFileSize(compressionResult.compressedSize)} (${Math.round((1 - compressionResult.compressedSize / compressionResult.originalSize) * 100)}% smaller)`
        )
      }
      
    } catch (error) {
      console.error("Image processing error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown processing error"
      
      // Update preview with error
      setSelectedImages(prev => prev.map(img => 
        img.id === preview.id 
          ? { ...img, status: 'error', error: errorMessage }
          : img
      ))
      
      toast.error(`Failed to process ${preview.file.name}: ${errorMessage}`)
    }
  }



  const removeImage = (id: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image to upload.")
      return
    }
    
    // Check for processing or error images
    const processingImages = selectedImages.filter(img => img.status === 'processing')
    const errorImages = selectedImages.filter(img => img.status === 'error')
    const readyImages = selectedImages.filter(img => 
      (img.status === 'compressed' || img.status === 'original') && img.base64
    )
    
    if (processingImages.length > 0) {
      toast.error(`Please wait for ${processingImages.length} image(s) to finish processing.`)
      return
    }
    
    if (errorImages.length > 0) {
      toast.error(`Please remove or fix ${errorImages.length} image(s) with errors before uploading.`)
      return
    }
    
    if (readyImages.length === 0) {
      toast.error("No valid images ready for upload.")
      return
    }
    
    const imageCount = readyImages.length;
    setIsSubmitting(true)

    try {
      const photosToUpload: PhotoUpload[] = readyImages.map((img) => ({
        image_base64: img.base64,
      }))

      // Immediately close the dialog and notify the parent component
      onUploadStarted(imageCount);
      onOpenChange(false);
      resetDialogState();
      
      const uploadToast = toast.loading(`Uploading ${imageCount} item(s)...`);

      await apiCall<ClothingItemResponse[]>("/wardrobe/items", {
        method: "POST",
        body: JSON.stringify(photosToUpload),
      })
      
      toast.success(`${imageCount} item(s) have been added to your wardrobe!`, { id: uploadToast });
      onItemAdded()
      
    } catch (error) {
      console.error("Failed to add items:", error)
      toast.error(`Failed to upload ${imageCount} item(s). Please try again.`);
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetDialogState = () => {
    setSelectedImages([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetDialogState()
    }
    onOpenChange(open)
  }

  // Placeholder for camera functionality
  const handleOpenCamera = () => {
    toast.info("Camera functionality coming soon!")
    // Implementation would involve navigator.mediaDevices.getUserMedia
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Clothing Photos</DialogTitle>
          <DialogDescription>
            Select one or more photos. Large images will be automatically compressed for faster upload.
          </DialogDescription>
        </DialogHeader>
        
        {/* Information alert */}
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Upload Guidelines:</strong> Maximum 10MB per image. Large images will be automatically resized to 1920px and compressed for optimal performance.
          </AlertDescription>
        </Alert>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="wardrobePhotos" className="block mb-2 font-medium">
              Select Photos
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
                disabled={isSubmitting}
              >
                <UploadCloud className="mr-2 h-4 w-4" /> Choose Files
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenCamera}
                className="flex-1"
                disabled={isSubmitting}
              >
                <Camera className="mr-2 h-4 w-4" /> Use Camera
              </Button>
            </div>
            <Input
              id="wardrobePhotos"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden" // Hide the default input, trigger via button
              disabled={isSubmitting}
            />
          </div>

          {selectedImages.length > 0 && (
            <div>
              <Label className="block mb-2 font-medium">Selected Images ({selectedImages.length})</Label>
              <ScrollArea className="h-64 w-full rounded-md border border-gray-200 dark:border-gray-700 p-2">
                <div className="space-y-3">
                  {selectedImages.map((imgPreview) => (
                    <div key={imgPreview.id} className="flex items-center space-x-3 p-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                      {/* Image Preview */}
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {imgPreview.base64 ? (
                          <Image
                            src={imgPreview.base64}
                            alt={imgPreview.file.name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          </div>
                        )}
                        
                        {/* Status indicator overlay */}
                        <div className="absolute -top-1 -right-1">
                          {imgPreview.status === 'processing' && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Loader2 className="h-3 w-3 text-white animate-spin" />
                            </div>
                          )}
                          {imgPreview.status === 'compressed' && (
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                          {imgPreview.status === 'original' && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                          {imgPreview.status === 'error' && (
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <AlertCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {imgPreview.file.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(imgPreview.file.size)}
                          {imgPreview.compressionResult && (
                            <span className="ml-1 text-green-600 dark:text-green-400">
                              → {formatFileSize(imgPreview.compressionResult.compressedSize)} 
                              ({Math.round((1 - imgPreview.compressionResult.compressedSize / imgPreview.compressionResult.originalSize) * 100)}% smaller)
                            </span>
                          )}
                        </div>
                        
                        {/* Status text */}
                        <div className="text-xs mt-1">
                          {imgPreview.status === 'processing' && (
                            <span className="text-blue-600 dark:text-blue-400">Processing...</span>
                          )}
                          {imgPreview.status === 'compressed' && (
                            <span className="text-green-600 dark:text-green-400">Compressed & Ready</span>
                          )}
                          {imgPreview.status === 'original' && (
                            <span className="text-blue-600 dark:text-blue-400">Ready (No compression needed)</span>
                          )}
                          {imgPreview.status === 'error' && (
                            <span className="text-red-600 dark:text-red-400">{imgPreview.error}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Remove button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                        onClick={() => removeImage(imgPreview.id)}
                        disabled={isSubmitting}
                      >
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Remove {imgPreview.file.name}</span>
                      </Button>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
              
              {/* Summary info */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {(() => {
                  const processing = selectedImages.filter(img => img.status === 'processing').length
                  const ready = selectedImages.filter(img => img.status === 'compressed' || img.status === 'original').length
                  const errors = selectedImages.filter(img => img.status === 'error').length
                  
                  return (
                    <div className="flex space-x-4">
                      {ready > 0 && <span className="text-green-600 dark:text-green-400">{ready} ready</span>}
                      {processing > 0 && <span className="text-blue-600 dark:text-blue-400">{processing} processing</span>}
                      {errors > 0 && <span className="text-red-600 dark:text-red-400">{errors} errors</span>}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                selectedImages.length === 0 || 
                selectedImages.some(img => img.status === 'processing') ||
                selectedImages.filter(img => img.status === 'compressed' || img.status === 'original').length === 0
              }
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {(() => {
                const readyCount = selectedImages.filter(img => 
                  (img.status === 'compressed' || img.status === 'original') && img.base64
                ).length
                const processingCount = selectedImages.filter(img => img.status === 'processing').length
                const errorCount = selectedImages.filter(img => img.status === 'error').length
                
                if (isSubmitting) return "Uploading..."
                if (processingCount > 0) return `Processing ${processingCount} image(s)...`
                if (errorCount > 0 && readyCount === 0) return "Fix errors to continue"
                if (readyCount === 0) return "Select images to upload"
                return `Upload ${readyCount} image(s)`
              })()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
