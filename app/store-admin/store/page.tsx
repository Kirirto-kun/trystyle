"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  Store, 
  Save,
  MapPin,
  Globe,
  Star,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  Building,
  Phone,
  Mail
} from "lucide-react"
import { apiCall } from "@/lib/api"
import { toast } from "sonner"

interface StoreInfo {
  id: number
  name: string
  description: string
  city: string
  logo_url: string
  website_url: string
  phone?: string
  email?: string
  address?: string
  rating: number
  total_products: number
  total_orders: number
  created_at: string
  updated_at: string
}

interface StoreUpdateData {
  name: string
  description: string
  city: string
  logo_url: string
  website_url: string
  phone?: string
  email?: string
  address?: string
}

export default function StoreSettingsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  
  const [formData, setFormData] = useState<StoreUpdateData>({
    name: '',
    description: '',
    city: '',
    logo_url: '',
    website_url: '',
    phone: '',
    email: '',
    address: ''
  })

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user?.is_store_admin) {
      router.push("/login")
      return
    }

    loadStoreInfo()
  }, [authLoading, isAuthenticated, user, router])

  useEffect(() => {
    if (storeInfo) {
      const newFormData = {
        name: storeInfo.name,
        description: storeInfo.description,
        city: storeInfo.city,
        logo_url: storeInfo.logo_url,
        website_url: storeInfo.website_url,
        phone: storeInfo.phone || '',
        email: storeInfo.email || '',
        address: storeInfo.address || ''
      }
      setFormData(newFormData)
    }
  }, [storeInfo])

  useEffect(() => {
    if (storeInfo) {
      const hasFormChanges = (
        formData.name !== storeInfo.name ||
        formData.description !== storeInfo.description ||
        formData.city !== storeInfo.city ||
        formData.logo_url !== storeInfo.logo_url ||
        formData.website_url !== storeInfo.website_url ||
        formData.phone !== (storeInfo.phone || '') ||
        formData.email !== (storeInfo.email || '') ||
        formData.address !== (storeInfo.address || '')
      )
      setHasChanges(hasFormChanges)
    }
  }, [formData, storeInfo])

  const loadStoreInfo = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Используем dashboard эндпоинт для получения информации о магазине
      const dashboardData = await apiCall<{
        store: StoreInfo
        total_products: number
        active_products: number
        total_reviews: number
        average_rating: number
      }>('/api/v1/store-admin/dashboard')
      
      // Добавляем недостающие поля к данным магазина
      const storeData = {
        ...dashboardData.store,
        total_products: dashboardData.total_products,
        total_orders: 0, // Пока нет в API
        created_at: new Date().toISOString(), // Временно
        updated_at: new Date().toISOString() // Временно
      }
      
      setStoreInfo(storeData)
    } catch (err) {
      console.error('Error loading store info:', err)
      setError('Failed to load store information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof StoreUpdateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.name.trim()) {
      errors.push('Store name is required')
    }

    if (!formData.city.trim()) {
      errors.push('City is required')
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Invalid email format')
    }

    if (formData.website_url && !formData.website_url.startsWith('http')) {
      errors.push('Website URL must start with http:// or https://')
    }

    return errors
  }

  const handleSave = async () => {
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(', '))
      return
    }

    setIsSaving(true)

    try {
      // Используем правильный эндпоинт согласно спецификации
      await apiCall('/api/v1/store-admin/store-settings', {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          description: formData.address, // Используем address как description
          city: formData.city,
          logo_url: formData.logo_url,
          website_url: formData.website_url
        })
      })

      // Обновляем локальные данные
      if (storeInfo) {
        const updatedStore = {
          ...storeInfo,
          name: formData.name,
          city: formData.city,
          logo_url: formData.logo_url,
          website_url: formData.website_url,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          updated_at: new Date().toISOString()
        }
        setStoreInfo(updatedStore)
      }
      
      setHasChanges(false)
      toast.success('Store information updated successfully')
    } catch (err: any) {
      console.error('Error updating store:', err)
      toast.error(err.message || 'Failed to update store information')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading store settings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={loadStoreInfo}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!storeInfo) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Store Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">Unable to load store information</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Store Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your store information</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      {/* Store Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeInfo.total_products}</div>
            <p className="text-xs text-muted-foreground">Products in catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeInfo.total_orders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeInfo.rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Store Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your store name"
                required
              />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Almaty"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your store..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Full store address"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+7 777 123 4567"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="store@example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              value={formData.website_url}
              onChange={(e) => handleInputChange('website_url', e.target.value)}
              placeholder="https://yourstore.com"
            />
          </div>

          <div>
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => handleInputChange('logo_url', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            {formData.logo_url && (
              <div className="mt-2">
                <img 
                  src={formData.logo_url} 
                  alt="Store logo preview"
                  className="w-16 h-16 rounded-lg object-cover border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Store Status */}
      <Card>
        <CardHeader>
          <CardTitle>Store Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="font-medium text-green-900 dark:text-green-100">Store Active</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your store is live and accepting orders
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Active
              </Badge>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Created:</strong> {formatDate(storeInfo.created_at)}</p>
              <p><strong>Last Updated:</strong> {formatDate(storeInfo.updated_at)}</p>
              <p><strong>Store ID:</strong> #{storeInfo.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button (Mobile) */}
      {hasChanges && (
        <div className="md:hidden">
          <Button className="w-full" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
} 