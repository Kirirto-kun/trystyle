"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, ImageUp, ListChecks } from "lucide-react"
import { getWaitlistItems, apiCall } from "@/lib/api"
import type { WaitlistItem } from "@/lib/api"
import UploadScreenshotDialog from "./UploadScreenshotDialog"
import WaitlistItemCard from "./WaitlistItemCard"
import { toast } from "sonner"

export default function WaitlistContainer() {
  const [items, setItems] = useState<WaitlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const fetchItems = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getWaitlistItems()
      setItems(data)
    } catch (err) {
      setError("Failed to fetch waitlist items. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleItemAdded = () => {
    fetchItems()
  }

  const handleDeleteItem = async (itemId: number) => {
    const originalItems = [...items]
    setItems(currentItems => currentItems.filter(item => item.id !== itemId))
    setError(null)

    try {
      await apiCall(`/waitlist/items/${itemId}`, {
        method: 'DELETE',
      })
      toast.success("Item deleted from waitlist.")
    } catch (err) {
      setError("Failed to delete item. Please try again.")
      setItems(originalItems)
      console.error(err)
      toast.error("Failed to delete item from waitlist.")
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">My Items</h2>
        <Button 
          onClick={() => setIsUploadDialogOpen(true)}
          className="w-full sm:w-auto h-11 md:h-10"
        >
          <ImageUp className="mr-2 h-4 w-4 md:h-5 md:w-5" /> 
          Upload Screenshot
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12 md:py-16">
          <div className="text-center">
            <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary mx-auto mb-3" />
            <p className="text-base md:text-lg">Loading your waitlist...</p>
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center text-destructive bg-destructive/10 p-6 md:p-8 rounded-md">
          <AlertTriangle className="h-8 w-8 md:h-10 md:w-10 mb-2" />
          <p className="text-base md:text-lg font-medium text-center">{error}</p>
          <Button onClick={fetchItems} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-12 md:py-16 border-2 border-dashed border-border rounded-lg">
          <ListChecks className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-muted-foreground">Your waitlist is empty!</h3>
          <p className="text-muted-foreground mt-1 mb-6">Add items you want by uploading a screenshot.</p>
          <Button 
            onClick={() => setIsUploadDialogOpen(true)} 
            className="w-full sm:w-auto"
          >
            <ImageUp className="mr-2 h-4 w-4 md:h-5 md:w-5" /> 
            Upload First Screenshot
          </Button>
        </div>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {items.map((item) => (
            <WaitlistItemCard
              key={item.id}
              item={item}
              onTryOnComplete={fetchItems}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}

      <UploadScreenshotDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onItemAdded={handleItemAdded}
      />
    </div>
  )
}