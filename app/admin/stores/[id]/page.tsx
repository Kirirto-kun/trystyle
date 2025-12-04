"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Loader2, 
  Store as StoreIcon, 
  ArrowLeft,
  Save,
  MapPin,
  Users,
  Star,
  UserPlus,
  Edit,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Calendar,
  Building,
  Globe,
  Image
} from "lucide-react"
import { apiCall } from "@/lib/api"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Store } from "@/lib/types"

interface StoreAdmin {
  id: number
  email: string
  username: string
  is_active: boolean
  created_at: string
  store_id: number
  managed_store: {
    id: number
    name: string
    city: string
    logo_url: string
    rating: number
  }
}

interface UpdateStoreData {
  name: string
  description: string
  city: string
  logo_url: string
  website_url: string
}

export default function StoreDetailPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string
  
  // Data states
  const [store, setStore] = useState<Store | null>(null)
  const [storeAdmin, setStoreAdmin] = useState<StoreAdmin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Form state
  const [formData, setFormData] = useState<UpdateStoreData>({
    name: '',
    description: '',
    city: '',
    logo_url: '',
    website_url: ''
  })
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user?.is_admin) {
      router.push("/login")
      return
    }

    loadStoreData()
  }, [authLoading, isAuthenticated, user, router, storeId])

  useEffect(() => {
    if (store) {
      const newFormData = {
        name: store.name,
        description: store.description,
        city: store.city,
        logo_url: store.logo_url,
        website_url: store.website_url
      }
      setFormData(newFormData)
    }
  }, [store])

  useEffect(() => {
    if (store) {
      const hasFormChanges = (
        formData.name !== store.name ||
        formData.description !== store.description ||
        formData.city !== store.city ||
        formData.logo_url !== store.logo_url ||
        formData.website_url !== store.website_url
      )
      setHasChanges(hasFormChanges)
    }
  }, [formData, store])

  const loadStoreData = async () => {
    setIsLoading(true)

    try {
      const [storeData, adminsData] = await Promise.all([
        apiCall<Store>(`/api/v1/stores/${storeId}`),
        apiCall<{ store_admins: StoreAdmin[] }>('/api/v1/admin/store-admins?per_page=100')
      ])

      setStore(storeData)
      
      // Find admin for this store
      const admin = adminsData.store_admins.find(admin => admin.store_id === parseInt(storeId))
      setStoreAdmin(admin || null)
    } catch (err) {
      console.error('Error loading store data:', err)
      toast.error('Failed to load store data')
      router.push('/admin/stores')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!formData.name || !formData.city) {
      toast.error('Please fill in required fields (name and city)')
      return
    }

    setIsSaving(true)

    try {
      const updatedStore = await apiCall<Store>(`/api/v1/stores/${storeId}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      })

      setStore(updatedStore)
      setHasChanges(false)
      toast.success('Store updated successfully')
    } catch (err) {
      console.error('Error updating store:', err)
      toast.error('Failed to update store')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading store details...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Store not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested store could not be found.</p>
          <Button onClick={() => router.push('/admin/stores')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stores
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/admin/stores')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stores
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="w-8 h-8 object-contain" />
              ) : (
                <Store className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{store.name}</h1>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{store.city}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{store.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4" />
                  <span>{store.total_products} products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Button onClick={handleSaveChanges} disabled={isSaving}>
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
          
          {!storeAdmin && (
            <Button 
              onClick={() => router.push(`/admin/users/admins?store_id=${store.id}`)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Admin
            </Button>
          )}
          
          {store.website_url && (
            <Button 
              variant="outline"
              onClick={() => window.open(store.website_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Website
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit Store</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Store Info Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Store Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{store.rating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  Average customer rating
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{store.total_products}</div>
                <p className="text-xs text-muted-foreground">
                  Available in catalog
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Status</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {storeAdmin ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Assigned</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <span className="text-sm font-medium text-orange-600">Unassigned</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {storeAdmin ? `Managed by ${storeAdmin.username}` : 'No admin assigned'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Store Details */}
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Store Name</Label>
                  <p className="text-gray-900 dark:text-white">{store.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">City</Label>
                  <p className="text-gray-900 dark:text-white">{store.city}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</Label>
                  <p className="text-gray-900 dark:text-white">{store.description || 'No description provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</Label>
                  <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(store.created_at)}</span>
                  </div>
                </div>
                {store.updated_at && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</Label>
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(store.updated_at)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 pt-4 border-t">
                {store.logo_url && (
                  <div className="flex items-center space-x-2">
                    <Image className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <a 
                      href={store.logo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Logo
                    </a>
                  </div>
                )}
                {store.website_url && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <a 
                      href={store.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Store Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Store name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City *</Label>
                  <Input
                    id="edit-city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Store description..."
                  rows={3}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-logo">Logo URL</Label>
                  <Input
                    id="edit-logo"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-website">Website URL</Label>
                  <Input
                    id="edit-website"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://store-website.com"
                  />
                </div>
              </div>

              {hasChanges && (
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2">
                    <Edit className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      You have unsaved changes
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setFormData({
                          name: store.name,
                          description: store.description,
                          city: store.city,
                          logo_url: store.logo_url,
                          website_url: store.website_url
                        })
                      }}
                    >
                      Reset
                    </Button>
                    <Button size="sm" onClick={handleSaveChanges} disabled={isSaving}>
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Administrator</CardTitle>
            </CardHeader>
            <CardContent>
              {storeAdmin ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{storeAdmin.username}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{storeAdmin.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={storeAdmin.is_active ? "default" : "secondary"}>
                            {storeAdmin.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Assigned {formatDate(storeAdmin.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push('/admin/users/admins')}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Admin Assigned</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This store doesn't have an administrator yet. Assign one to enable store management.
                  </p>
                  <Button onClick={() => router.push(`/admin/users/admins?store_id=${store.id}`)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Admin
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 