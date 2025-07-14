"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Store, ShoppingBag, Activity, AlertTriangle, CheckCircle, TrendingUp, UserPlus } from "lucide-react"
import { apiCall } from "@/lib/api"

interface UserStats {
  total_users: number
  active_users: number
  inactive_users: number
  users_last_24h: number
  users_last_week: number
  users_last_month: number
  users_with_phone: number
  active_percentage: number
  phone_percentage: number
  first_user?: {
    id: number
    username: string
    email: string
    is_active: boolean
    created_at: string
  }
}

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

interface DatabaseStatus {
  is_connected: boolean
  pool_status: {
    pool_size: number
    checked_in_connections: number
    checked_out_connections: number
    overflow_connections: number
    total_capacity: number
  }
  message: string
}

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [storeAdmins, setStoreAdmins] = useState<StoreAdmin[]>([])
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user?.is_admin) {
      router.push("/login")
      return
    }

    loadDashboardData()
  }, [authLoading, isAuthenticated, user, router])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [userStatsData, storeAdminsData, dbStatusData] = await Promise.all([
        apiCall<UserStats>('/api/v1/admin/users/stats'),
        apiCall<{ store_admins: StoreAdmin[] }>('/api/v1/admin/store-admins?per_page=10'),
        apiCall<DatabaseStatus>('/api/v1/admin/database/status')
      ])

      setUserStats(userStatsData)
      setStoreAdmins(storeAdminsData.store_admins)
      setDatabaseStatus(dbStatusData)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user?.is_admin) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">Admin privileges required</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">System overview and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            Super Admin
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.total_users?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              {userStats?.active_percentage ? `${userStats.active_percentage.toFixed(1)}% active` : 'Loading...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Admins</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeAdmins.length}</div>
            <p className="text-xs text-muted-foreground">
              Managing stores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users (24h)</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.users_last_24h || '0'}</div>
            <p className="text-xs text-muted-foreground">
              {userStats?.users_last_week ? `${userStats.users_last_week} this week` : 'Loading...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {databaseStatus?.is_connected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-600">Issues</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Database connection
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Store Admins */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Store Admins</CardTitle>
        </CardHeader>
        <CardContent>
          {storeAdmins.length > 0 ? (
            <div className="space-y-4">
              {storeAdmins.slice(0, 5).map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{admin.username}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{admin.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {admin.managed_store.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {admin.managed_store.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              No store admins found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push('/admin/users')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Manage Users</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push('/admin/stores')}
            >
              <Store className="h-6 w-6" />
              <span className="text-sm">Manage Stores</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push('/admin/monitoring')}
            >
              <Activity className="h-6 w-6" />
              <span className="text-sm">System Monitor</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push('/admin/analytics')}
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 