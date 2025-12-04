"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  CheckCircle,
  Sparkles,
  Star,
  Package,
  Tag,
  Loader2
} from "lucide-react"
import ProductPhotoUpload from "@/components/store-admin/product-photo-upload"

interface ProductResponse {
  id: number
  name: string
  description: string
  price: number
  original_price?: number
  category: string
  brand: string
  features: string[]
  sizes: string[]
  colors: string[]
  image_urls: string[]
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
  store_id: number
  price_info: {
    formatted_price: string
    formatted_original_price?: string
  }
  discount_percentage: number
  is_in_stock: boolean
  store: {
    id: number
    name: string
    city: string
    logo_url?: string
    rating: number
  }
}

export default function AddProductPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [createdProduct, setCreatedProduct] = useState<ProductResponse | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user?.is_store_admin) {
      router.push("/login")
      return
    }
  }, [authLoading, isAuthenticated, user, router])

  const handleSuccess = (product: ProductResponse) => {
    setCreatedProduct(product)
    setShowSuccess(true)
    
    // Auto redirect after 5 seconds
    setTimeout(() => {
      router.push('/store-admin/products')
    }, 5000)
  }

  const handleError = (error: string) => {
    console.error('Product creation error:', error)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('kk-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (showSuccess && createdProduct) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/store-admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Success Message */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                  Product Created Successfully!
                </h2>
                <p className="text-green-700 dark:text-green-300">
                  AI has analyzed your photos and created the product
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span>AI Analysis Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Product Images */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Images</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(createdProduct.image_urls || []).slice(0, 4).map((url, index) => (
                    <div key={index} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <img 
                        src={url} 
                        alt={`${createdProduct.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {createdProduct.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {createdProduct.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                    <Badge variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {createdProduct.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Price:</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(createdProduct.price)}
                      </span>
                      {createdProduct.original_price && (
                        <div>
                          <span className="text-sm text-gray-500 line-through mr-2">
                            {formatCurrency(createdProduct.original_price)}
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            -{createdProduct.discount_percentage}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Stock:</span>
                    <span className="font-medium">{createdProduct.stock_quantity} units</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Store:</span>
                    <div className="text-right">
                      <p className="font-medium">{createdProduct.store.name}</p>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                        {createdProduct.store.rating}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Features */}
                {(createdProduct.features || []).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      AI Detected Features:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {(createdProduct.features || []).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes and Colors */}
                <div className="grid grid-cols-2 gap-4">
                  {(createdProduct.sizes || []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Sizes:</h4>
                      <div className="flex flex-wrap gap-1">
                        {(createdProduct.sizes || []).map((size, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(createdProduct.colors || []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Colors:</h4>
                      <div className="flex flex-wrap gap-1">
                        {(createdProduct.colors || []).map((color, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-6 pt-6 border-t">
              <Button onClick={() => router.push('/store-admin/products')}>
                <Package className="h-4 w-4 mr-2" />
                View All Products
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Add Another Product
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Auto redirect notice */}
        <div className="text-center text-sm text-gray-500">
          Automatically redirecting to products page in 5 seconds...
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => router.push('/store-admin')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Upload Component */}
      <ProductPhotoUpload onSuccess={handleSuccess} onError={handleError} />
    </div>
  )
} 