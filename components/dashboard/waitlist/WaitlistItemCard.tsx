"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Wand2, Trash } from "lucide-react"
import { tryOnWaitlistItem } from "@/lib/api"
import type { WaitlistItem } from "@/lib/api"
import { toast } from "sonner"
import TryOnDialog from "./TryOnDialog"
import FullscreenWaitlistModal from "./FullscreenWaitlistModal"

interface WaitlistItemCardProps {
  item: WaitlistItem
  onTryOnComplete: () => void
  onDelete: (itemId: number) => void
}

export default function WaitlistItemCard({ item, onTryOnComplete, onDelete }: WaitlistItemCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isTryOnDialogOpen, setIsTryOnDialogOpen] = useState(false)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)

  const handleTryOnPhotoSelected = async (file: File) => {
    setIsProcessing(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(error)
      })
      await tryOnWaitlistItem({ image_base64: base64, waitlist_item_id: item.id })
      toast.success("Try-on completed successfully!")
      onTryOnComplete()
      setIsTryOnDialogOpen(false)
    } catch (error) {
      console.error("Try-on error:", error)
      toast.error("Failed to process try-on. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const hasTryOn = Boolean(item.try_on_url);

  return (
    <>
      <Card className="overflow-hidden cursor-pointer relative" onClick={() => setIsFullscreenOpen(true)}>
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 z-10"
          aria-label="Delete item"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
        >
          <Trash className="h-4 w-4" />
        </Button>
        <CardContent className="p-0">
          <div className={`flex ${hasTryOn ? 'gap-2' : ''} justify-center items-center aspect-square bg-gray-50`}>
            <div className="flex-1 flex flex-col items-center">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt="Original item"
                  width={200}
                  height={200}
                  className="object-cover rounded-md border border-gray-200"
                  onClick={e => { e.stopPropagation(); setIsFullscreenOpen(true); }}
                />
              ) : (
                <div className="flex items-center justify-center w-[200px] h-[200px] bg-gray-100 text-gray-400 rounded-md border border-gray-200">
                  No image
                </div>
              )}
              <span className="mt-2 text-xs text-muted-foreground">Original</span>
            </div>
            {hasTryOn && (
              <div className="flex-1 flex flex-col items-center">
                <Image
                  src={item.try_on_url!}
                  alt="Try-on result"
                  width={200}
                  height={200}
                  className="object-cover rounded-md border border-primary"
                  onClick={e => { e.stopPropagation(); setIsFullscreenOpen(true); }}
                />
                <span className="mt-2 text-xs text-primary">Try-On</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 flex flex-col items-center">
          <span className="text-xs text-gray-400 mb-1">{new Date(item.created_at).toLocaleString()}</span>
          {!hasTryOn && (
            <Button
              className="w-full"
              onClick={e => { e.stopPropagation(); setIsTryOnDialogOpen(true); }}
              disabled={isProcessing || item.status === "processed"}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Try On
                </>
              )}
            </Button>
          )}
          <TryOnDialog
            isOpen={isTryOnDialogOpen}
            onOpenChange={setIsTryOnDialogOpen}
            onPhotoSelected={handleTryOnPhotoSelected}
            isProcessing={isProcessing}
          />
        </CardFooter>
      </Card>
      <FullscreenWaitlistModal
        open={isFullscreenOpen}
        onOpenChange={setIsFullscreenOpen}
        item={item}
      />
    </>
  )
} 