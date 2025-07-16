"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  Users, 
  Plus,
  Search,
  Edit,
  Store as StoreIcon,
  UserPlus,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Building
} from "lucide-react"
import { apiCall } from "@/lib/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { toast } from "sonner"
import { Store } from "@/lib/types"

interface StoreAdmin {
  id: number
  email: string
  username: string
  is_active: boolean
  created_at: string
  updated_at: string | null
  role: string
  store_id: number
  managed_store: {
    id: number
    name: string
    city: string
    logo_url?: string
    rating: number
  }
}

interface CreateAdminData {
  username: string
  email: string
  password: string
  store_id: number
}

export default function StoreAdminsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const storeIdParam = searchParams.get('store_id')
  
  const [storeAdmins, setStoreAdmins] = useState<StoreAdmin[]>([])
  const [availableStores, setAvailableStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<CreateAdminData>({
    username: '',
    email: '',
    password: '',
    store_id: storeIdParam ? parseInt(storeIdParam) : 0
  })

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user?.is_admin) {
      router.push("/login")
      return
    }

    loadData()
    
    // Auto-open create modal if store_id is provided
    if (storeIdParam) {
      setIsCreateModalOpen(true)
    }
  }, [authLoading, isAuthenticated, user, router, storeIdParam])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [adminsData, storesData] = await Promise.all([
        apiCall<{ store_admins: StoreAdmin[] }>('/api/v1/admin/store-admins?per_page=100'),
        apiCall<{ stores: Store[] }>('/api/v1/stores/')
      ])

      setStoreAdmins(adminsData.store_admins)
      
      // Filter stores that don't have admins yet
      const managedStoreIds = adminsData.store_admins.map(admin => admin.store_id)
      const unassignedStores = storesData.stores.filter(store => 
        !managedStoreIds.includes(store.id)
      )
      setAvailableStores(unassignedStores)
      
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load store admins data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    if (!formData.username || !formData.email || !formData.password || !formData.store_id) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsCreating(true)

    try {
      const newAdmin = await apiCall<StoreAdmin>('/api/v1/admin/create-store-admin', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      setStoreAdmins(prev => [newAdmin, ...prev])
      setAvailableStores(prev => prev.filter(store => store.id !== formData.store_id))
      setIsCreateModalOpen(false)
      setFormData({ username: '', email: '', password: '', store_id: 0 })
      
      toast.success(`Store admin "${newAdmin.username}" created successfully`)
      
      // Redirect back to stores if came from there
      if (storeIdParam) {
        setTimeout(() => {
          router.push('/admin/stores')
        }, 2000)
      }
      
    } catch (err: any) {
      console.error('Error creating admin:', err)
      toast.error(err.message || 'Failed to create store admin')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeactivateAdmin = async (adminId: number, adminName: string) => {
    if (!confirm(`Are you sure you want to deactivate admin "${adminName}"? They will lose access to the store admin panel.`)) {
      return
    }

    try {
      await apiCall(`/api/v1/admin/store-admins/${adminId}?is_active=false`, {
        method: 'PUT'
      })

      const deactivatedAdmin = storeAdmins.find(admin => admin.id === adminId)
      setStoreAdmins(prev => prev.map(admin => 
        admin.id === adminId 
          ? { ...admin, is_active: false, updated_at: new Date().toISOString() }
          : admin
      ))
      
      // Add store back to available stores when admin is deactivated
      if (deactivatedAdmin) {
        setAvailableStores(prev => [...prev, {
          id: deactivatedAdmin.managed_store.id,
          name: deactivatedAdmin.managed_store.name,
          city: deactivatedAdmin.managed_store.city,
          rating: deactivatedAdmin.managed_store.rating
        }])
      }
      
      toast.success(`Admin "${adminName}" deactivated successfully`)
    } catch (err: any) {
      console.error('Error deactivating admin:', err)
      toast.error(err.message || 'Failed to deactivate admin')
    }
  }

  const handleToggleStatus = async (adminId: number, currentStatus: boolean, storeId?: number) => {
    try {
      const newStatus = !currentStatus
      await apiCall(`/api/v1/admin/store-admins/${adminId}?is_active=${newStatus}${storeId ? `&store_id=${storeId}` : ''}`, {
        method: 'PUT'
      })
      
      setStoreAdmins(prev => prev.map(admin => 
        admin.id === adminId 
          ? { ...admin, is_active: newStatus, updated_at: new Date().toISOString() }
          : admin
      ))
      
      // Update available stores when reactivating admin
      if (newStatus) {
        const admin = storeAdmins.find(a => a.id === adminId)
        if (admin) {
          setAvailableStores(prev => prev.filter(store => store.id !== admin.store_id))
        }
      } else {
        const admin = storeAdmins.find(a => a.id === adminId)
        if (admin) {
          setAvailableStores(prev => [...prev, {
            id: admin.managed_store.id,
            name: admin.managed_store.name,
            city: admin.managed_store.city,
            rating: admin.managed_store.rating
          }])
        }
      }
      
      toast.success(`Admin ${newStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (err: any) {
      console.error('Error toggling admin status:', err)
      toast.error(err.message || 'Failed to update admin status')
    }
  }

  const filteredAdmins = storeAdmins.filter(admin =>
    admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.managed_store.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSelectedStore = () => {
    if (!formData.store_id) return null
    return availableStores.find(store => store.id === formData.store_id)
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading store admins...</p>
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
          <Button onClick={loadData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/admin/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Store Admins</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage store administrators</p>
          </div>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button disabled={availableStores.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Create Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Store Admin</DialogTitle>
              <DialogDescription>
                Create a new administrator for a store. They will have access to manage products and orders.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="admin_username"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@store.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="store">Assign to Store *</Label>
                <Select value={formData.store_id.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, store_id: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStores.map((store) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>{store.name} - {store.city}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableStores.length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    All stores already have assigned admins
                  </p>
                )}
              </div>
              
              {getSelectedStore() && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <StoreIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Selected Store: {getSelectedStore()?.name}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    City: {getSelectedStore()?.city} • Rating: {getSelectedStore()?.rating}/5
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAdmin} disabled={isCreating || !formData.store_id}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Admin
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeAdmins.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeAdmins.filter(admin => admin.is_active).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned Stores</CardTitle>
                            <StoreIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableStores.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search admins by name, email, or store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>Store Administrators ({filteredAdmins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAdmins.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{admin.username}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {admin.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <StoreIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{admin.managed_store.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{admin.managed_store.city}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.is_active ? "default" : "secondary"}>
                        {admin.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(admin.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(admin.id, admin.is_active, admin.store_id)}
                        >
                          {admin.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/stores/${admin.managed_store.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {admin.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeactivateAdmin(admin.id, admin.username)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No matching admins found' : 'No store admins yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create store administrators to manage individual stores'
                }
              </p>
              {!searchTerm && availableStores.length > 0 && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Admin
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 