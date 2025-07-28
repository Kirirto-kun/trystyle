"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  Store as StoreIcon, 
  Plus,
  Search,
  Filter,
  Building,
  MapPin,
  Users,
  Star,
  UserPlus,
  Edit,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { apiCall } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Store } from "@/lib/types"

interface StoreAdmin {
  id: number
  email: string
  username: string
  is_active: boolean
  store_id: number
  managed_store: {
    id: number
    name: string
    city: string
    rating: number
  }
}

interface CreateStoreData {
  name: string
  description: string
  city: string
  logo_url: string
  website_url: string
}

interface CityStats {
  city: string
  stores_count: number
  total_products: number
  average_rating: number
}

export default function StoresManagementPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  
  // Data states
  const [stores, setStores] = useState<Store[]>([])
  const [storeAdmins, setStoreAdmins] = useState<StoreAdmin[]>([])
  const [cityStats, setCityStats] = useState<CityStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // UI states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [adminFilter, setAdminFilter] = useState<string>("all")
  
  // Form state
  const [formData, setFormData] = useState<CreateStoreData>({
    name: '',
    description: '',
    city: '',
    logo_url: '',
    website_url: ''
  })

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user?.is_admin) {
      router.push("/login")
      return
    }

    loadData()
  }, [authLoading, isAuthenticated, user, router])

  const loadData = async () => {
    setIsLoading(true)

    try {
      const [storesData, adminsData, citiesData] = await Promise.all([
        apiCall<{ stores: Store[], total: number }>('/api/v1/stores/'),
        apiCall<{ store_admins: StoreAdmin[] }>('/api/v1/admin/store-admins?per_page=100'),
        apiCall<{ cities: CityStats[] }>('/api/v1/stores/cities')
      ])

      setStores(storesData.stores)
      setStoreAdmins(adminsData.store_admins)
      setCityStats(citiesData.cities)
    } catch (err) {
      console.error('Error loading stores data:', err)
      toast.error('Failed to load stores data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateStore = async () => {
    if (!formData.name || !formData.city) {
      toast.error('Please fill in required fields (name and city)')
      return
    }

    setIsCreating(true)

    try {
      const newStore = await apiCall<Store>('/api/v1/stores/', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      setStores(prev => [newStore, ...prev])
      setIsCreateModalOpen(false)
      setFormData({ name: '', description: '', city: '', logo_url: '', website_url: '' })
      toast.success(`Store "${newStore.name}" created successfully`)
      
      // Ask if user wants to create admin
      if (confirm(`Store created! Would you like to create an admin for "${newStore.name}"?`)) {
        router.push(`/admin/users/admins?store_id=${newStore.id}`)
      }
    } catch (err) {
      console.error('Error creating store:', err)
      toast.error('Failed to create store')
    } finally {
      setIsCreating(false)
    }
  }

  const getStoreAdmin = (storeId: number) => {
    return storeAdmins.find(admin => admin.store_id === storeId)
  }

  const getStoresWithoutAdmins = () => {
    const managedStoreIds = storeAdmins.map(admin => admin.store_id)
    return stores.filter(store => !managedStoreIds.includes(store.id))
  }

  const getFilteredStores = () => {
    let filtered = stores

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // City filter
    if (selectedCity !== "all") {
      filtered = filtered.filter(store => store.city === selectedCity)
    }

    // Admin filter
    if (adminFilter === "with_admin") {
      const managedStoreIds = storeAdmins.map(admin => admin.store_id)
      filtered = filtered.filter(store => managedStoreIds.includes(store.id))
    } else if (adminFilter === "without_admin") {
      const managedStoreIds = storeAdmins.map(admin => admin.store_id)
      filtered = filtered.filter(store => !managedStoreIds.includes(store.id))
    }

    return filtered
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCities = () => {
    const cities = [...new Set(stores.map(store => store.city))]
    return cities.sort()
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading stores management...</p>
        </div>
      </div>
    )
  }

  const filteredStores = getFilteredStores()
  const storesWithoutAdmins = getStoresWithoutAdmins()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stores Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage stores, assign admins, and monitor performance</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Store
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Store</DialogTitle>
              <DialogDescription>
                Add a new store to the platform. You can assign an admin after creation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Store Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. H&M Almaty Center"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g. Almaty"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Store description..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://store-website.com"
                  value={formData.website_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateStore} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Store
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                            <StoreIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {getCities().length} cities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeAdmins.length}</div>
            <p className="text-xs text-muted-foreground">
              {stores.length > 0 ? Math.round((storeAdmins.length / stores.length) * 100) : 0}% coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Admins</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{storesWithoutAdmins.length}</div>
            <p className="text-xs text-muted-foreground">
              Stores without assigned admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCities().length}</div>
            <p className="text-xs text-muted-foreground">
              Geographic coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search stores by name or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {getCities().map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={adminFilter} onValueChange={setAdminFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Admin status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                <SelectItem value="with_admin">With Admin</SelectItem>
                <SelectItem value="without_admin">Need Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stores Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStores.map((store) => {
          const admin = getStoreAdmin(store.id)
          return (
            <Card key={store.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <StoreIcon className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{store.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span>{store.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{store.rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Store Info */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {store.description && (
                    <p className="mb-2 line-clamp-2">{store.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span>{store.total_products} products</span>
                    <span>Created {formatDate(store.created_at)}</span>
                  </div>
                </div>

                {/* Admin Status */}
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {admin ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Admin: {admin.username}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-600">No admin assigned</span>
                    </div>
                  )}
                  <Badge variant={admin ? "default" : "secondary"}>
                    {admin ? "Managed" : "Unassigned"}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => router.push(`/admin/stores/${store.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {!admin && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/admin/users/admins?store_id=${store.id}`)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Assign Admin
                    </Button>
                  )}
                  {store.website_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(store.website_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredStores.length === 0 && (
        <Card>
          <CardContent className="py-12">
                      <div className="text-center">
            <StoreIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || selectedCity !== "all" || adminFilter !== "all" 
                  ? "No stores match your filters" 
                  : "No stores found"
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || selectedCity !== "all" || adminFilter !== "all"
                  ? "Try adjusting your search criteria"
                  : "Create your first store to get started"
                }
              </p>
              {!searchTerm && selectedCity === "all" && adminFilter === "all" && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Store
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 