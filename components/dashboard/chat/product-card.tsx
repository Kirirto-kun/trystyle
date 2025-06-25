"use client"
import { ExternalLink, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Product {
  name: string
  price: string
  description: string
  link: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleOpenLink = () => {
    window.open(product.link, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 w-full">
      <CardContent className="p-3 md:p-4">
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm md:text-base line-clamp-2 flex-1" title={product.name}>
              {product.name}
            </h3>
            <Badge variant="secondary" className="font-bold text-xs md:text-sm flex-shrink-0">
              {product.price}
            </Badge>
          </div>
          
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-3" title={product.description}>
            {product.description}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 md:p-4 pt-0">
        <Button 
          onClick={handleOpenLink}
          className="w-full group-hover:shadow-md transition-all duration-300 h-9 md:h-10 text-sm md:text-base"
          size="sm"
        >
          <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-2" />
          Go to store
          <ExternalLink className="w-3 h-3 md:w-4 md:h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}