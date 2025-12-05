"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ExternalLink, Star, Mail } from "lucide-react"
import { SuggestedOutfit } from "@/lib/chat-types"
import Image from "next/image"
import EmailOutfitDialog from "./email-outfit-dialog"
import { useIsWidget } from "@/contexts/widget-context"
import { useSelectedItems } from "@/contexts/selected-items-context"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface OutfitCardProps {
  outfit: SuggestedOutfit
  index: number
}

export default function OutfitCard({ outfit, index }: OutfitCardProps) {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const isWidget = useIsWidget()
  const { toggleItem, isSelected } = useSelectedItems()
  
  // Ensure outfit and items exist
  if (!outfit || !outfit.items || outfit.items.length === 0) {
    return null
  }

  const totalPrice = outfit.items.reduce((sum, item) => {
    if (!item || !item.price) return sum
    const price = parseFloat(item.price.replace(/[^\d]/g, ''))
    return sum + (isNaN(price) ? 0 : price)
  }, 0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + '₽'
  }

  const renderOutfitItem = (item: any, itemIndex: number, compact: boolean = false) => {
    const itemId = item.id
    const selected = itemId ? isSelected(itemId) : false
    
    return (
      <div className={`relative group/item ${compact ? "flex-shrink-0" : ""}`} style={compact ? { width: isWidget ? '90px' : '120px', minWidth: isWidget ? '90px' : '120px', maxWidth: isWidget ? '90px' : '120px' } : {}}>
        <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 w-full">
          <div className={`${isWidget && compact ? "aspect-[2/3]" : "aspect-[3/4]"} relative w-full`}>
            <Image
              src={item.image_url || '/placeholder.jpg'}
              alt={item.name || 'Item'}
              fill
              className="object-cover transition-transform duration-500 group-hover/item:scale-105"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.jpg'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
            
            {/* Star button for selection - always visible */}
            {itemId && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleItem(itemId)
                }}
                className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all duration-200 ${
                  selected 
                    ? 'bg-yellow-400 hover:bg-yellow-500' 
                    : 'bg-white/80 hover:bg-white'
                } shadow-md`}
                title={selected ? "Убрать из выбора" : "Выбрать товар"}
              >
                <Star 
                  className={selected ? "w-4 h-4 text-yellow-900 fill-yellow-900" : "w-4 h-4 text-gray-700"} 
                />
              </button>
            )}
            
            {/* Hover overlay with quick action */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
              <Button 
                size="sm" 
                className={`bg-white/90 text-black hover:bg-white shadow-md ${isWidget ? "text-[10px] px-1.5 py-0.5" : "text-xs"}`}
                onClick={() => window.open(item.link, '_blank')}
              >
                <ExternalLink className={isWidget ? "w-2.5 h-2.5 mr-0.5" : "w-3 h-3 mr-1"} />
                {!isWidget && "В магазин"}
              </Button>
            </div>
          </div>
        
        {/* Item Info - Always visible */}
        <div className={isWidget && compact ? "p-1.5 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700" : "p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700"}>
          {item.brand && !isWidget && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
              {item.brand}
            </div>
          )}
          <div className={`${isWidget && compact ? "text-[10px] mb-0.5" : "text-xs mb-2"} font-medium text-gray-900 dark:text-gray-100 overflow-hidden text-ellipsis`} style={{ display: '-webkit-box', WebkitLineClamp: isWidget && compact ? 1 : 2, WebkitBoxOrient: 'vertical' }}>
            {item.name}
          </div>
          <div className={isWidget && compact ? "text-[10px] font-bold text-gray-900 dark:text-gray-100" : "text-sm font-bold text-gray-900 dark:text-gray-100"}>
            {item.price}
          </div>
        </div>
      </div>
    </div>
    )
  }

  return (
    <Card className={`group relative overflow-hidden bg-white dark:bg-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-500 ${isWidget ? "max-w-full" : "hover:-translate-y-2"} rounded-2xl`}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 opacity-50" />
      
      {/* Content */}
      <CardContent className={`relative ${isWidget ? "p-3" : "p-6"} max-w-full overflow-hidden`}>
        {/* Header */}
        <div className={isWidget ? "mb-3" : "mb-6"}>
          <div className={`flex items-center gap-2 ${isWidget ? "mb-2" : "mb-3"}`}>
            <Badge variant="secondary" className={`bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 dark:from-pink-900 dark:to-purple-900 dark:text-pink-200 ${isWidget ? "px-2 py-0.5 rounded-full text-[10px] font-medium" : "px-3 py-1 rounded-full text-xs font-medium"}`}>
              ✨ Образ #{index}
            </Badge>
            {!isWidget && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-3 h-3 text-yellow-400 fill-current" />
                ))}
              </div>
            )}
          </div>
          
          <h3 className={`${isWidget ? "text-xs mb-2" : "text-sm mb-3"} font-semibold text-gray-900 dark:text-gray-100 leading-relaxed`}>
            {outfit.outfit_description}
          </h3>
          
          {/* Total Price - Compact display */}
          <div className={`bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl ${isWidget ? "p-2" : "p-3"} border border-gray-200 dark:border-gray-600`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`${isWidget ? "text-[10px] mb-0.5" : "text-xs mb-1"} text-gray-600 dark:text-gray-400`}>
                  Стоимость образа
                </div>
                <div className={isWidget ? "text-sm font-bold text-gray-900 dark:text-gray-100" : "text-lg font-bold text-gray-900 dark:text-gray-100"}>
                  {formatPrice(totalPrice)}
                </div>
              </div>
              {!isWidget && (
                <div className="text-2xl opacity-20">
                  💎
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Display - Adaptive Layout */}
        <div className={`${isWidget ? "mb-3" : "mb-6"} w-full max-w-full overflow-hidden`}>
          {isWidget ? (
            // Widget layout: специальная обработка для одного товара
            outfit.items.length === 1 ? (
              // Один товар - показываем по центру, больше размером
              <div className="flex justify-center w-full">
                <div className="w-40 max-w-full">
                  {renderOutfitItem(outfit.items[0], 0, false)}
                </div>
              </div>
            ) : (
              // Несколько товаров - горизонтальная прокрутка с ScrollArea
              <div className="w-full max-w-full">
                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-2 w-max">
                    {outfit.items.map((item, itemIndex) => (
                      <div key={item.id ?? itemIndex} className="flex-shrink-0">
                        {renderOutfitItem(item, itemIndex, true)}
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="h-2" />
                </ScrollArea>
              </div>
            )
          ) : (
            // Regular layout: адаптивная сетка
            <>
              {outfit.items.length === 1 && (
                <div className="flex justify-center">
                  <div className="w-60 max-w-full">
                    {renderOutfitItem(outfit.items[0], 0)}
                  </div>
                </div>
              )}
              
              {outfit.items.length === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  {outfit.items.map((item, itemIndex) => (
                    <div key={item.id ?? itemIndex}>
                      {renderOutfitItem(item, itemIndex)}
                    </div>
                  ))}
                </div>
              )}
              
              {outfit.items.length === 3 && (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="w-48 max-w-full">
                      {renderOutfitItem(outfit.items[0], 0)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    {outfit.items.slice(1).map((item, itemIndex) => (
                      <div key={item.id ?? `item-${itemIndex + 1}`}>
                        {renderOutfitItem(item, itemIndex + 1)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {outfit.items.length >= 4 && (
                <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                  {outfit.items.map((item, itemIndex) => (
                    <div key={item.id ?? itemIndex}>
                      {renderOutfitItem(item, itemIndex)}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className={`${isWidget ? "mt-3 pt-2" : "mt-6 pt-4"} border-t border-gray-200 dark:border-gray-700`}>
          <div className={isWidget ? "flex gap-1.5" : "flex gap-3"}>
            <Button 
              className={`flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 ${isWidget ? "py-1.5 rounded-lg text-xs font-medium" : "py-2 rounded-lg text-sm font-medium"}`}
            >
              <ShoppingBag className={isWidget ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"} />
              {isWidget ? "Купить" : "Купить весь образ"}
            </Button>
            {!isWidget && (
              <>
                <Button 
                  onClick={() => setIsEmailDialogOpen(true)}
                  variant="outline"
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                  title="Отправить на почту"
                >
                  <Mail className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-pink-300 dark:hover:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300"
                >
                  <Star className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>

      {/* Email Dialog */}
      <EmailOutfitDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        outfit={outfit}
      />
    </Card>
  )
}
