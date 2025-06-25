import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import type { ClothingItemResponse } from "@/lib/types"
import { Tag, Trash, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WardrobeItemCardProps {
  item: ClothingItemResponse
  onDelete: (itemId: number) => void
  isProcessing?: boolean
}

export default function WardrobeItemCard({ item, onDelete, isProcessing = false }: WardrobeItemCardProps) {
  const placeholderImg = `/placeholder.svg?width=300&height=400&query=${encodeURIComponent(item.name || "clothing item")}`

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (isProcessing) return;
    onDelete(item.id)
  }

  if (isProcessing) {
    return (
      <Card className="overflow-hidden flex flex-col h-full animate-pulse">
        <CardHeader className="p-0 relative aspect-[3/4] bg-muted/50 rounded-t-lg flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-2 md:p-3 flex-grow">
          <div className="h-4 bg-muted rounded w-full mb-2"></div>
          <div className="h-3 bg-muted rounded w-3/4"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="p-0 relative aspect-[3/4]">
        <Image
          src={item.image_url || placeholderImg}
          alt={item.name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
          unoptimized={!item.image_url}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = placeholderImg
          }}
        />
        <Button
          onClick={handleDeleteClick}
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 z-10"
          aria-label="Delete item"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-2 md:p-3 flex-grow">
        <CardTitle className="text-sm md:text-base font-semibold truncate mb-2" title={item.name}>
          {item.name}
        </CardTitle>
        {item.features && Object.keys(item.features).length > 0 && (
          <div className="space-y-1">
            {Object.entries(item.features)
              .slice(0, 2)
              .map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mr-1"
                >
                  <Tag size={10} className="mr-1" /> 
                  {key}: {String(value)}
                </span>
              ))}
            {Object.keys(item.features).length > 2 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                +{Object.keys(item.features).length - 2} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}