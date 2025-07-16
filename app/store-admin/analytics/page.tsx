"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  Calendar,
  Package,
  Star,
  MessageSquare,
  AlertTriangle
} from "lucide-react"
import { apiCall } from "@/lib/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AnalyticsData {
  period: string
  products_added: number
  reviews_received: number
  rating_change: number
  period_start: string
  period_end: string
}

interface LowStockAlert {
  product_id: number
  product_name: string
  current_stock: number
  threshold: number
  category: string
}

export default function AnalyticsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month")
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user?.is_store_admin) {
      router.push("/login")
      return
    }

    loadAnalyticsData()
  }, [authLoading, isAuthenticated, user, router, selectedPeriod])

  useEffect(() => {
    loadLowStockAlerts()
  }, [lowStockThreshold])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const analyticsData = await apiCall<AnalyticsData>(`/api/v1/store-admin/analytics?period=${selectedPeriod}`)
      setAnalytics(analyticsData)
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadLowStockAlerts = async () => {
    try {
      const alertsData = await apiCall<LowStockAlert[]>(`/api/v1/store-admin/low-stock-alerts?threshold=${lowStockThreshold}`)
      setLowStockAlerts(alertsData)
    } catch (err) {
      console.error('Error loading low stock alerts:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRatingChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getRatingChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />
    if (change < 0) return <TrendingDown className="h-4 w-4" />
    return <BarChart3 className="h-4 w-4" />
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week': return 'Week'
      case 'month': return 'Month'
      case 'year': return 'Year'
      default: return 'Month'
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
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
          <Button onClick={loadAnalyticsData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Store performance insights</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Period Info */}
      {analytics && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analysis Period</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatDate(analytics.period_start)} - {formatDate(analytics.period_end)}
                </p>
              </div>
              <Badge variant="outline">
                {getPeriodLabel(analytics.period)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products Added</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.products_added}</div>
              <p className="text-xs text-muted-foreground">
                This {selectedPeriod}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews Received</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.reviews_received}</div>
              <p className="text-xs text-muted-foreground">
                Customer feedback
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating Change</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold flex items-center space-x-2 ${getRatingChangeColor(analytics.rating_change)}`}>
                {getRatingChangeIcon(analytics.rating_change)}
                <span>{analytics.rating_change > 0 ? '+' : ''}{analytics.rating_change.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.rating_change > 0 ? 'Improvement' : analytics.rating_change < 0 ? 'Decline' : 'No change'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Low Stock Alerts</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Threshold:</span>
            <Select value={lowStockThreshold.toString()} onValueChange={(value) => setLowStockThreshold(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {lowStockAlerts.length > 0 ? (
            <div className="space-y-3">
              {lowStockAlerts.map((alert) => (
                <div key={alert.product_id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{alert.product_name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Category: {alert.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">{alert.current_stock}</p>
                    <p className="text-xs text-gray-500">units left</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All Good!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                No products are running low on stock (threshold: {lowStockThreshold})
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 