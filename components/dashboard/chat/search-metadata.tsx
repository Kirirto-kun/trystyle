"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Clock, Hash } from "lucide-react"

interface SearchMetadataProps {
  searchQuery?: string
  totalFound?: number
  processingTimeMs?: number
}

export default function SearchMetadata({ 
  searchQuery, 
  totalFound, 
  processingTimeMs 
}: SearchMetadataProps) {
  // Don't render if no metadata is provided
  if (!searchQuery && !totalFound && !processingTimeMs) {
    return null
  }

  return (
    <Card className="w-full mb-3 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
      <CardContent className="p-2 md:p-3">
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-300">
          {searchQuery && (
            <div className="flex items-center gap-1 md:gap-2">
              <Search className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="truncate">Поиск: "{searchQuery}"</span>
            </div>
          )}
          
          {totalFound !== undefined && (
            <div className="flex items-center gap-1 md:gap-2">
              <Hash className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span>Найдено: {totalFound}</span>
            </div>
          )}
          
          {processingTimeMs && (
            <div className="flex items-center gap-1 md:gap-2">
              <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span>Время: {(processingTimeMs / 1000).toFixed(1)}с</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 