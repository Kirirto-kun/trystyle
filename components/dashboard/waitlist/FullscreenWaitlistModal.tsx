"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { WaitlistItem } from "@/lib/api"

interface FullscreenWaitlistModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: WaitlistItem | null
}

export default function FullscreenWaitlistModal({ open, onOpenChange, item }: FullscreenWaitlistModalProps) {
  if (!item) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full flex flex-col items-center bg-white">
        <DialogTitle className="sr-only">Waitlist Item Preview</DialogTitle>
        <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
          <div className="flex flex-col items-center">
            <Image
              src={item.image_url}
              alt="Original item"
              width={400}
              height={400}
              className="object-contain rounded-lg border border-gray-200 bg-gray-50"
            />
            <span className="mt-2 text-base text-muted-foreground">Original</span>
          </div>
          {item.try_on_url && (
            <div className="flex flex-col items-center">
              <Image
                src={item.try_on_url}
                alt="Try-on result"
                width={400}
                height={400}
                className="object-contain rounded-lg border border-primary bg-gray-50"
              />
              <span className="mt-2 text-base text-primary">Try-On</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 