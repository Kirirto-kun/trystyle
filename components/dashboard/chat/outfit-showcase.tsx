"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, ShoppingBag, Heart, ArrowRight } from "lucide-react"
import { SuggestedOutfit } from "@/lib/chat-types"
import OutfitCard from "./outfit-card"
import { useIsWidget } from "@/contexts/widget-context"

interface OutfitShowcaseProps {
  outfits: SuggestedOutfit[]
  searchDescription?: string
  uploadedImageUrl?: string
  nextSteps?: string[]
  onSetInput?: (text: string) => void
}

export default function OutfitShowcase({ outfits, searchDescription, uploadedImageUrl, nextSteps, onSetInput }: OutfitShowcaseProps) {
  const isWidget = useIsWidget()
  
  // Ensure outfits exist and is not empty
  if (!outfits || outfits.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Нет доступных образов</p>
      </div>
    )
  }

  return (
    <div className={`w-full ${isWidget ? "max-w-full overflow-hidden" : ""}`}>
      {/* Header Section */}
      <div className={isWidget ? "mb-4 text-center" : "mb-8 text-center"}>
        <div className={`flex items-center justify-center gap-3 ${isWidget ? "mb-2" : "mb-4"}`}>
          <Sparkles className={isWidget ? "w-4 h-4 text-pink-500" : "w-6 h-6 text-pink-500"} />
          <h2 className={isWidget ? "text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent" : "text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent"}>
            Подобранные образы
          </h2>
          <Sparkles className={isWidget ? "w-4 h-4 text-pink-500" : "w-6 h-6 text-pink-500"} />
        </div>
        
        {uploadedImageUrl && (
          <div className={isWidget ? "mb-3 flex justify-center" : "mb-6 flex justify-center"}>
            <div className="relative">
              <img
                src={uploadedImageUrl}
                alt="Uploaded image"
                className={isWidget ? "max-w-32 max-h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" : "max-w-64 max-h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"}
              />
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Ваше фото
              </div>
            </div>
          </div>
        )}

        {searchDescription && (
          <div className={isWidget ? "max-w-full mx-auto px-2" : "max-w-4xl mx-auto"}>
            <p className={`text-gray-600 dark:text-gray-300 text-left leading-relaxed ${isWidget ? "text-xs" : "text-sm"}`}>
              {searchDescription}
            </p>
          </div>
        )}
      </div>

      {/* Outfits Grid */}
      <div className={`${isWidget ? "grid grid-cols-1 gap-4 max-w-full" : "grid grid-cols-1 lg:grid-cols-2 gap-8"}`}>
        {outfits.map((outfit, index) => (
          <OutfitCard 
            key={index} 
            outfit={outfit} 
            index={index + 1}
          />
        ))}
      </div>

      {/* Footer */}
      <div className={isWidget ? "mt-4 text-center" : "mt-8 text-center"}>
        <div className={`flex items-center justify-center gap-2 ${isWidget ? "text-xs" : "text-sm"} text-gray-500 dark:text-gray-400 ${isWidget ? "mb-2" : "mb-4"}`}>
          <Heart className={isWidget ? "w-3 h-3" : "w-4 h-4"} />
          <span>Найдено {outfits.length} образов для вас</span>
        </div>

        {/* Next Steps CTA Buttons */}
        {nextSteps && nextSteps.length > 0 && (
          <div className={isWidget ? "mt-3" : "mt-6"}>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {nextSteps.map((step, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={isWidget ? "border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-200 text-xs font-medium px-2 py-1" : "border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-200 text-sm font-medium px-4 py-2"}
                  onClick={() => {
                    if (onSetInput) {
                      onSetInput(step)
                    } else {
                      console.log("Next step clicked:", step)
                    }
                  }}
                >
                  {step}
                  {!isWidget && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
