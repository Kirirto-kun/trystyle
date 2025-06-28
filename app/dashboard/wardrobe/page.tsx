"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, Shirt, ImageUp, Layers } from "lucide-react"
import { apiCall } from "@/lib/api"
import type { ClothingItemResponse } from "@/lib/types"
import AddWardrobeItemDialog from "@/components/dashboard/wardrobe/add-item-dialog"
import WardrobeItemCard from "@/components/dashboard/wardrobe/wardrobe-item-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface GroupedItems {
  [category: string]: (ClothingItemResponse | ProcessingItem)[]
}

interface ProcessingItem {
  id: string
  name: string
  isProcessing: true
  category: "Processing"
}

const UNCATEGORIZED_KEY = "Uncategorized"
const PROCESSING_CATEGORY = "Processing"

export default function WardrobePage() {
  const [items, setItems] = useState<ClothingItemResponse[]>([])
  const [processingItems, setProcessingItems] = useState<ProcessingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("all")
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const initialItemCountRef = useRef(0);

  const fetchItems = async (isInitialFetch = false) => {
    if (isInitialFetch) setIsLoading(true)
    setError(null)
    try {
      const data = await apiCall<ClothingItemResponse[]>("/wardrobe/items")
      const newItemsAdded = data.length - initialItemCountRef.current;
      
      if (newItemsAdded > 0) {
        setProcessingItems(prev => prev.slice(newItemsAdded));
      }
      
      setItems(data)
      initialItemCountRef.current = data.length

      if (processingItems.length - newItemsAdded <= 0) {
        setProcessingItems([]);
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
          refreshIntervalRef.current = null;
        }
      }

    } catch (err) {
      setError("Failed to fetch wardrobe items. Please try again.")
      console.error(err)
    } finally {
      if (isInitialFetch) setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItems(true)
  }, [])

  useEffect(() => {
    if (processingItems.length > 0 && !refreshIntervalRef.current) {
      refreshIntervalRef.current = setInterval(() => {
        fetchItems(false);
      }, 5000);
    } else if (processingItems.length === 0 && refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [processingItems.length])


  const groupedItems = useMemo(() => {
    const allItems = [...processingItems, ...items];
    return allItems.reduce((acc, item) => {
      const category = (item as ClothingItemResponse).category || (item as ProcessingItem).category || UNCATEGORIZED_KEY
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    }, {} as GroupedItems)
  }, [items, processingItems])

  useEffect(() => {
    const categories = Object.keys(groupedItems);
    if (categories.length > 0 && !categories.includes(activeTab) && activeTab !== "all") {
      setActiveTab("all");
    }
  }, [groupedItems, activeTab])

  const handleItemAdded = () => {
    fetchItems(false)
  }
  
  const handleUploadStarted = (count: number) => {
    initialItemCountRef.current = items.length;
    const newProcessingItems: ProcessingItem[] = Array.from({ length: count }, (_, i) => ({
      id: `processing-${Date.now()}-${i}`,
      name: "Processing...",
      isProcessing: true,
      category: PROCESSING_CATEGORY,
    }))
    setProcessingItems(prev => [...prev, ...newProcessingItems]);
  };

  const handleDeleteItem = async (itemId: number) => {
    const originalItems = [...items]
    setItems(currentItems => currentItems.filter(item => item.id !== itemId))
    setError(null)

    try {
      await apiCall(`/wardrobe/items/${itemId}`, {
        method: 'DELETE',
      })
      initialItemCountRef.current -= 1;
    } catch (err) {
      setError("Failed to delete item. Please try again.")
      setItems(originalItems)
      console.error(err)
    }
  }

  const categoryOrder = useMemo(() => {
    const order = Object.keys(groupedItems).sort((a, b) => {
      if (a === PROCESSING_CATEGORY) return -1
      if (b === PROCESSING_CATEGORY) return 1
      if (a === UNCATEGORIZED_KEY) return 1
      if (b === UNCATEGORIZED_KEY) return -1
      return a.localeCompare(b)
    })
    return order
  }, [groupedItems])

  // Achievement system
  const achievementTiers = [
    { target: 10, title: "Getting Started", description: "Upload your first 10 items" },
    { target: 25, title: "Fashion Explorer", description: "Build a solid wardrobe" },
    { target: 50, title: "Style Enthusiast", description: "Create a diverse collection" },
    { target: 100, title: "Fashion Master", description: "Complete wardrobe collection" },
    { target: 200, title: "Ultimate Stylist", description: "Fashion guru level" }
  ]

  const currentItemCount = items.length
  const currentTier = achievementTiers.find(tier => currentItemCount < tier.target) || achievementTiers[achievementTiers.length - 1]
  const progress = currentTier ? Math.min((currentItemCount / currentTier.target) * 100, 100) : 100
  const remainingItems = currentTier ? Math.max(currentTier.target - currentItemCount, 0) : 0

  return (
    <div className="space-y-4 md:space-y-6 bg-white dark:bg-gray-900 min-h-screen p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">My Wardrobe</h2>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="w-full sm:w-auto h-11 md:h-10 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
        >
          <ImageUp className="mr-2 h-4 w-4 md:h-5 md:w-5" /> 
          Upload Photos
        </Button>
      </div>

      {/* Achievement Progress */}
      {currentItemCount >= 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {progress >= 100 ? "Achievement Unlocked!" : "Next Achievement"}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {currentTier.title} - {currentTier.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {currentItemCount}/{currentTier.target}
              </p>
              {progress < 100 && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {remainingItems} more to go
                </p>
              )}
            </div>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-gray-200 dark:bg-gray-700"
          />
          {progress >= 100 && currentItemCount >= currentTier.target && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
              ✨ Congratulations! Achievement completed!
            </p>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-12 md:py-16">
          <div className="text-center">
            <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary mx-auto mb-3" />
            <p className="text-base md:text-lg text-gray-900 dark:text-white">Loading your wardrobe...</p>
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-6 md:p-8 rounded-md border border-red-200 dark:border-red-800">
          <AlertTriangle className="h-8 w-8 md:h-10 md:w-10 mb-2" />
          <p className="text-base md:text-lg font-medium text-center">{error}</p>
          <Button onClick={() => fetchItems(true)} variant="outline" className="mt-4 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && items.length === 0 && processingItems.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-12 md:py-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Shirt className="h-12 w-12 md:h-16 md:w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Your wardrobe is empty!</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-1 mb-6">Start by uploading photos of your clothing items.</p>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
          >
            <ImageUp className="mr-2 h-4 w-4 md:h-5 md:w-5" /> 
            Upload First Photos
          </Button>
        </div>
      )}

      {!isLoading && !error && (items.length > 0 || processingItems.length > 0) && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full overflow-x-auto tabs-scrollbar">
            <TabsList className="flex h-8 md:h-10 p-0.5 md:p-1 gap-1 w-max min-w-full">
              <TabsTrigger value="all" className="flex-shrink-0 text-xs md:text-sm font-medium px-2 md:px-3 py-1 md:py-1.5 h-7 md:h-8 min-w-fit">
                All ({items.length + processingItems.length})
              </TabsTrigger>
              {categoryOrder.map((category) => (
                <TabsTrigger key={category} value={category} className="flex-shrink-0 text-xs md:text-sm font-medium capitalize px-2 md:px-3 py-1 md:py-1.5 h-7 md:h-8 min-w-fit">
                  {category} ({groupedItems[category].length})
                  {category === PROCESSING_CATEGORY && (
                    <Loader2 className="ml-1 md:ml-2 h-2.5 w-2.5 md:h-3 md:w-3 animate-spin" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {[...processingItems, ...items].map((item) => (
                <WardrobeItemCard 
                  key={item.id} 
                  item={item as ClothingItemResponse} 
                  onDelete={handleDeleteItem}
                  isProcessing={(item as ProcessingItem).isProcessing}
                />
              ))}
            </div>
          </TabsContent>
          
          {categoryOrder.map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {groupedItems[category].map((item) => (
                  <WardrobeItemCard 
                    key={item.id} 
                    item={item as ClothingItemResponse} 
                    onDelete={handleDeleteItem}
                    isProcessing={(item as ProcessingItem).isProcessing}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <AddWardrobeItemDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onItemAdded={handleItemAdded} 
        onUploadStarted={handleUploadStarted}
      />
    </div>
  )
}