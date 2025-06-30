"use client"
import { ExternalLink, ShoppingCart, MapPin, Package, Palette } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Product {
  id?: number
  name: string
  price: string
  original_price?: string
  description: string
  image_urls?: string[]
  store_name?: string
  store_city?: string
  sizes?: string[]
  colors?: string[]
  in_stock?: boolean
  link: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const router = useRouter()

  const handleClick = () => {
    // Check if it's an internal link (starts with /)
    if (product.link.startsWith('/')) {
      router.push(product.link)
    } else {
      // External link
      window.open(product.link, '_blank', 'noopener,noreferrer')
    }
  }

  const hasDiscount = product.original_price && product.original_price !== product.price
  const isInternal = product.link.startsWith('/')

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      {/* Product Image - Reduced height */}
      {product.image_urls && product.image_urls.length > 0 && (
        <div className="relative aspect-[4/3] md:aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={product.image_urls[selectedImageIndex]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Image thumbnails if multiple images */}
          {product.image_urls.length > 1 && (
            <div className="absolute bottom-1 left-1 flex gap-0.5">
              {product.image_urls.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex(index)
                  }}
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors ${
                    selectedImageIndex === index 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Stock status badge */}
          {product.in_stock !== undefined && (
            <Badge 
              variant={product.in_stock ? "default" : "secondary"} 
              className={`absolute top-1.5 right-1.5 text-xs px-1.5 py-0.5 ${
                product.in_stock 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}
            >
              {product.in_stock ? 'В наличии' : 'Нет'}
            </Badge>
          )}
        </div>
      )}

      <CardContent className="p-2 md:p-3">
        <div className="space-y-1.5 md:space-y-2">
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-semibold text-xs md:text-sm line-clamp-2 flex-1 text-gray-900 dark:text-white leading-tight" title={product.name}>
              {product.name}
            </h3>
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
              <Badge variant="secondary" className="font-bold text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                {product.price}
              </Badge>
              {hasDiscount && (
                <span className="text-xs text-gray-500 line-through">
                  {product.original_price}
                </span>
              )}
            </div>
          </div>

          {/* Store information */}
          {(product.store_name || product.store_city) && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">
                {product.store_name}
                {product.store_name && product.store_city && ', '}
                {product.store_city}
              </span>
            </div>
          )}
          
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-tight" title={product.description}>
            {product.description}
          </p>

          {/* Sizes and Colors - More compact */}
          <div className="space-y-1">
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Package className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                <div className="flex flex-wrap gap-0.5">
                  {product.sizes.slice(0, 3).map((size) => (
                    <Badge key={size} variant="outline" className="text-xs px-1 py-0 h-auto border-gray-300">
                      {size}
                    </Badge>
                  ))}
                  {product.sizes.length > 3 && (
                    <span className="text-xs text-gray-500">+{product.sizes.length - 3}</span>
                  )}
                </div>
              </div>
            )}
            
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Palette className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                <div className="flex flex-wrap gap-0.5">
                  {product.colors.slice(0, 2).map((color) => (
                    <Badge key={color} variant="outline" className="text-xs px-1 py-0 h-auto border-gray-300">
                      {color}
                    </Badge>
                  ))}
                  {product.colors.length > 2 && (
                    <span className="text-xs text-gray-500">+{product.colors.length - 2}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 md:p-3 pt-0">
        <Button 
          onClick={handleClick}
          className="w-full group-hover:shadow-md transition-all duration-300 h-7 md:h-8 text-xs font-medium bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
          size="sm"
          disabled={product.in_stock === false}
        >
          <ShoppingCart className="w-3 h-3 mr-1.5" />
          {isInternal ? 'Подробнее' : 'В магазин'}
          <ExternalLink className="w-3 h-3 ml-1.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}