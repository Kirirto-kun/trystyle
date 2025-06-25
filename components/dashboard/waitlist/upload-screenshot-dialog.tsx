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
import { Loader2, UploadCloud } from "lucide-react"
import { apiCall } from "@/lib/api"
import type { WaitListScreenshotUpload } from "@/lib/types"
import { toast } from "sonner"
import Image from "next/image"

interface UploadScreenshotDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onItemAdded: () => void
}

export default function UploadScreenshotDialog({ isOpen, onOpenChange, onItemAdded }: UploadScreenshotDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setFile(null)
      setPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !preview) {
      toast.error("Please select an image file.")
      return
    }
    setIsSubmitting(true)

    const payload: WaitListScreenshotUpload = {
      image_base64: preview, // preview already contains "data:image/...;base64,..."
    }

    try {
      await apiCall("/waitlist/upload-screenshot", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      toast.success("Screenshot uploaded to waitlist!")
      onItemAdded()
      onOpenChange(false) // Close dialog
      setFile(null)
      setPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (error) {
      console.error("Failed to upload screenshot:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetDialog = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    onOpenChange(false)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetDialog()
        else onOpenChange(true)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Screenshot to Waitlist</DialogTitle>
          <DialogDescription>Select an image from your device to add it to your waitlist.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="screenshotFile">Screenshot File</Label>
            <Input
              id="screenshotFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              required
              disabled={isSubmitting}
            />
          </div>
          {preview && (
            <div className="mt-2 border border-border rounded-md p-2">
              <p className="text-sm text-muted-foreground mb-1">Preview:</p>
              <Image
                src={preview || "/placeholder.svg"}
                alt="Screenshot preview"
                width={300}
                height={200}
                className="rounded-md object-contain max-h-[200px] w-auto mx-auto"
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !file}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <UploadCloud className="mr-2 h-4 w-4" /> Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
