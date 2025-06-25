"use client"
import { Lightbulb, Heart, Shirt } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface OutfitItem {
  name: string
  category: string
  image_url: string
}

interface OutfitResult {
  outfit_description: string
  items: OutfitItem[]
  reasoning: string
}

interface OutfitDisplayProps {
  outfit: OutfitResult
}

export default function OutfitDisplay({ outfit }: OutfitDisplayProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Shirt className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          {outfit.outfit_description}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 md:space-y-6">
        {/* Outfit Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {outfit.items.map((item, index) => (
            <div key={index} className="group relative">
              <Card className="hover:shadow-md transition-all duration-300 border-2 hover:border-primary/20">
                <CardContent className="p-3 md:p-4">
                  <div className="aspect-square mb-2 md:mb-3 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`flex flex-col items-center justify-center text-muted-foreground ${item.image_url ? 'hidden' : ''}`}>
                      <Shirt className="w-6 h-6 md:w-8 md:h-8 mb-2" />
                      <span className="text-xs">Photo unavailable</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 md:space-y-2">
                    <h4 className="font-medium text-xs md:text-sm line-clamp-2" title={item.name}>
                      {item.name}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        <Separator />
        
        {/* Reasoning Section */}
        <div className="bg-muted/50 rounded-lg p-3 md:p-4">
          <div className="flex items-start gap-2 md:gap-3">
            <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-sm md:text-base mb-1 md:mb-2">Why this look?</h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {outfit.reasoning}
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" className="flex-1 h-9 md:h-10 text-sm">
            <Heart className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            Save outfit
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-9 md:h-10 text-sm">
            <Shirt className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            Create similar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}