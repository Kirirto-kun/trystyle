"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, ShoppingBag, Heart, ArrowRight } from "lucide-react"
import { SuggestedOutfit } from "@/lib/chat-types"
import OutfitCard from "./outfit-card"

interface OutfitShowcaseProps {
  outfits: SuggestedOutfit[]
  searchDescription?: string
  uploadedImageUrl?: string
  nextSteps?: string[]
  onSetInput?: (text: string) => void
}

export default function OutfitShowcase({ outfits, searchDescription, uploadedImageUrl, nextSteps, onSetInput }: OutfitShowcaseProps) {
  // Ensure outfits exist and is not empty
  if (!outfits || outfits.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Нет доступных образов</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-pink-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Подобранные образы
          </h2>
          <Sparkles className="w-6 h-6 text-pink-500" />
        </div>
        
        {uploadedImageUrl && (
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <img
                src={uploadedImageUrl}
                alt="Uploaded image"
                className="max-w-64 max-h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Ваше фото
              </div>
            </div>
          </div>
        )}

        {searchDescription && (
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 dark:text-gray-300 text-left leading-relaxed text-sm">
              {searchDescription}
            </p>
          </div>
        )}
      </div>

      {/* Outfits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {outfits.map((outfit, index) => (
          <OutfitCard 
            key={index} 
            outfit={outfit} 
            index={index + 1}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Heart className="w-4 h-4" />
          <span>Найдено {outfits.length} образов для вас</span>
        </div>

        {/* Next Steps CTA Buttons */}
        {nextSteps && nextSteps.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {nextSteps.map((step, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-200 text-sm font-medium px-4 py-2"
                  onClick={() => {
                    if (onSetInput) {
                      onSetInput(step)
                    } else {
                      console.log("Next step clicked:", step)
                    }
                  }}
                >
                  {step}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
