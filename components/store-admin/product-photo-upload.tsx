"use client"

import React, { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  X, 
  Loader2, 
  Camera, 
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Image as ImageIcon
} from "lucide-react"
import { apiCall } from "@/lib/api"
import { toast } from "sonner"

interface PhotoProductUpload {
  images_base64: string[]
  name?: string
  price: number
  original_price?: number
  sizes: string[]
  colors: string[]
  stock_quantity: number
}

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

interface ProductPhotoUploadProps {
  onSuccess?: (product: ProductResponse) => void
  onError?: (error: string) => void
}

export default function ProductPhotoUpload({ onSuccess, onError }: ProductPhotoUploadProps) {
  const { user } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    original_price: '',
    sizes: [] as string[],
    colors: [] as string[],
    stock_quantity: 0
  })
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Валидация изображений
  const validateImages = (files: File[]) => {
    const errors: string[] = []
    
    if (files.length === 0) {
      errors.push('Необходимо загрузить хотя бы одно изображение')
    }
    
    if (files.length > 5) {
      errors.push('Максимум 5 изображений за раз')
    }

    files.forEach((file, index) => {
      if (!file.type.startsWith('image/')) {
        errors.push(`Файл ${index + 1} не является изображением`)
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        errors.push(`Файл ${index + 1} слишком большой (максимум 10MB)`)
      }
    })

    return errors
  }

  // Конвертация файла в base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Обработка drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFiles = (newFiles: File[]) => {
    const validationErrors = validateImages(newFiles)
    if (validationErrors.length > 0) {
      onError?.(validationErrors.join(', '))
      toast.error(validationErrors.join(', '))
      return
    }
    
    setFiles(prev => [...prev, ...newFiles].slice(0, 5))
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayInput = (field: 'sizes' | 'colors', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, [field]: array }))
  }

  const validateForm = () => {
    const errors: string[] = []

    if (files.length === 0) {
      errors.push('Необходимо загрузить хотя бы одно изображение')
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.push('Цена должна быть больше 0')
    }

    if (formData.original_price && parseFloat(formData.original_price) <= parseFloat(formData.price)) {
      errors.push('Цена до скидки должна быть больше текущей цены')
    }

    if (formData.name && formData.name.length > 200) {
      errors.push('Название не должно превышать 200 символов')
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join(', ')
      onError?.(errorMessage)
      toast.error(errorMessage)
      return
    }

    setLoading(true)
    
    try {
      // Конвертируем файлы в base64
      const images_base64 = await Promise.all(
        files.map(file => fileToBase64(file))
      )

      const uploadData: PhotoProductUpload = {
        images_base64,
        name: formData.name || undefined,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
        sizes: formData.sizes,
        colors: formData.colors,
        stock_quantity: parseInt(formData.stock_quantity.toString()) || 0
      }

      const result = await apiCall<ProductResponse>('/api/v1/store-admin/products/upload-photos', {
        method: 'POST',
        body: JSON.stringify(uploadData)
      })

      onSuccess?.(result)
      toast.success(`Товар "${result.name}" успешно создан! AI определил категорию: ${result.category}`)
      
      // Сброс формы
      setFiles([])
      setFormData({
        name: '',
        price: '',
        original_price: '',
        sizes: [] as string[],
        colors: [] as string[],
        stock_quantity: 0
      })
      
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при создании товара'
      onError?.(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Photo Upload</h2>
          <p className="text-gray-600 dark:text-gray-400">Upload photos and let AI analyze your product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Product Photos</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                AI Powered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Drag & Drop Zone */}
            <div 
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
                ${dragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Drag photos here or click to browse
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Up to 5 photos, max 10MB each
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      AI will automatically analyze product characteristics
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* File Preview */}
            {files.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Uploaded Images ({files.length}/5)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Product Name (Optional)</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Leave empty for AI generation"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  If not specified, AI will generate automatically
                </p>
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="price">Price (KZT) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="15000"
                  min="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="original_price">Original Price (Optional)</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => handleInputChange('original_price', e.target.value)}
                  placeholder="18000"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be higher than current price
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                            <div>
                <Label htmlFor="sizes">Sizes (comma separated)</Label>
                <Input
                  id="sizes"
                  type="text"
                  value={(formData.sizes || []).join(', ')}
                  onChange={(e) => handleArrayInput('sizes', e.target.value)}
                  placeholder="S, M, L, XL"
                />
              </div>
              
              <div>
                <Label htmlFor="colors">Colors (comma separated)</Label>
                <Input
                  id="colors"
                  type="text"
                  value={(formData.colors || []).join(', ')}
                  onChange={(e) => handleArrayInput('colors', e.target.value)}
                  placeholder="белый, черный, синий"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading || files.length === 0}
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Product with AI
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 