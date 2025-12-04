"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  ShoppingBag, 
  ShoppingCart, 
  TrendingUp, 
  Upload,
  Plus,
  Eye,
  Edit,
  Package,
  Star,
  Users,
  Activity,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { apiCall } from "@/lib/api"

interface StoreStats {
  total_products: number
  active_products: number
  total_orders: number
  pending_orders: number
  revenue_today: number
  revenue_month: number
  avg_rating: number
  total_reviews: number
}

interface RecentOrder {
  id: number
  customer_name: string
  product_count: number
  total_amount: number
  status: string
  created_at: string
}

interface Product {
  id: number
  name: string
  price: number
  stock_quantity: number
  is_active: boolean
  image_urls: string[]
  created_at: string
}

export default function StoreAdminDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<StoreStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user?.is_store_admin) {
      router.push("/login")
      return
    }

    loadDashboardData()
  }, [authLoading, isAuthenticated, user, router])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Используем новый эндпоинт dashboard согласно спецификации
      const dashboardData = await apiCall<{
        store: {
          id: number
          name: string
          city: string
          logo_url: string
          rating: number
        }
        total_products: number
        active_products: number
        inactive_products: number
        products_by_category: Record<string, number>
        total_reviews: number
        average_rating: number
        recent_products: Product[]
        low_stock_products: Product[]
        top_rated_products: Product[]
      }>('/api/v1/store-admin/dashboard')

      // Адаптируем данные под текущий интерфейс
      setStats({
        total_products: dashboardData.total_products,
        active_products: dashboardData.active_products,
        total_orders: 0, // Пока нет в API
        pending_orders: 0, // Пока нет в API
        revenue_today: 0, // Пока нет в API
        revenue_month: 0, // Пока нет в API
        avg_rating: dashboardData.average_rating,
        total_reviews: dashboardData.total_reviews
      })
      
      setRecentProducts(dashboardData.recent_products)
      setRecentOrders([]) // Пока нет в API dashboard
      
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('kk-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'shipped': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'delivered': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading store dashboard...</p>
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
          <Button onClick={loadDashboardData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Store Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your store and track performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            Store Admin
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.active_products || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_orders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pending_orders || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (Month)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.revenue_month || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Today: {formatCurrency(stats?.revenue_today || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.avg_rating || 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_reviews || 0} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push('/store-admin/products/add')}
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm">Add Product</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push('/store-admin/products')}
            >
              <ShoppingBag className="h-6 w-6" />
              <span className="text-sm">View Products</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push('/store-admin/orders')}
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="text-sm">Manage Orders</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push('/store-admin/store')}
            >
              <Package className="h-6 w-6" />
              <span className="text-sm">Store Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders & Products */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/store-admin/orders')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.customer_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.product_count} items • {formatCurrency(order.total_amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">No orders yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Products</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/store-admin/products')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProducts.length > 0 ? (
                recentProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.image_urls.length > 0 ? (
                        <img 
                          src={product.image_urls[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(product.price)} • Stock: {product.stock_quantity}
                      </p>
                    </div>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">No products yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => router.push('/store-admin/products/add')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add First Product
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 