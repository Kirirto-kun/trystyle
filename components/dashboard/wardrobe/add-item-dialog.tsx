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
import { Loader2, UploadCloud, XCircle, Camera } from "lucide-react"
import { apiCall } from "@/lib/api"
import type { PhotoUpload, ClothingItemResponse } from "@/lib/types"
import { toast } from "sonner"
import Image from "next/image"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

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
}

export default function AddWardrobeItemDialog({ isOpen, onOpenChange, onItemAdded, onUploadStarted }: AddWardrobeItemDialogProps) {
  const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImagePreviews: ImagePreview[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith("image/")) {
          try {
            const base64 = await convertFileToBase64(file)
            newImagePreviews.push({ id: `${file.name}-${Date.now()}-${i}`, file, base64 })
          } catch (error) {
            toast.error(`Failed to read file: ${file.name}`)
            console.error("File read error:", error)
          }
        } else {
          toast.warning(`Skipped non-image file: ${file.name}`)
        }
      }
      setSelectedImages((prev) => [...prev, ...newImagePreviews])
    }
    // Reset file input to allow selecting the same file again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
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
    
    const imageCount = selectedImages.length;
    setIsSubmitting(true)

    const photosToUpload: PhotoUpload[] = selectedImages.map((img) => ({
      image_base64: img.base64,
    }))

    // Immediately close the dialog and notify the parent component
    onUploadStarted(imageCount);
    onOpenChange(false);
    resetDialogState();
    
    const uploadToast = toast.loading(`Uploading ${imageCount} item(s)...`);

    apiCall<ClothingItemResponse[]>("/wardrobe/items", {
      method: "POST",
      body: JSON.stringify(photosToUpload),
    }).then(() => {
      toast.success(`${imageCount} item(s) have been added to your wardrobe!`, { id: uploadToast });
      onItemAdded()
    }).catch((error) => {
      console.error("Failed to add items:", error)
      toast.error(`Failed to upload ${imageCount} item(s). Please try again.`, { id: uploadToast });
    }).finally(() => {
      setIsSubmitting(false)
    });
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
            Select one or more photos. They will be processed in the background.
          </DialogDescription>
        </DialogHeader>
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
              <ScrollArea className="h-48 w-full rounded-md border border-border p-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {selectedImages.map((imgPreview) => (
                    <div key={imgPreview.id} className="relative group aspect-square">
                      <Image
                        src={imgPreview.base64 || "/placeholder.svg"}
                        alt={imgPreview.file.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(imgPreview.id)}
                        disabled={isSubmitting}
                      >
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Remove {imgPreview.file.name}</span>
                      </Button>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || selectedImages.length === 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload {selectedImages.length > 0 ? `${selectedImages.length} Image(s)` : ""}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
