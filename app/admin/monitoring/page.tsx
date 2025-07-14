"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  Database, 
  Activity, 
  Server,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Cpu,
  HardDrive,
  Network,
  Clock
} from "lucide-react"
import { apiCall } from "@/lib/api"

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

interface PoolAnalysis {
  pool_metrics: {
    pool_size: number
    checked_in_connections: number
    checked_out_connections: number
    overflow_connections: number
    total_capacity: number
  }
  analysis: {
    pool_usage_percentage: number
    health_status: string
    available_connections: number
  }
}

interface SystemHealth {
  message: string
  timestamp: string
  version: string
}

export default function SystemMonitoringPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null)
  const [poolAnalysis, setPoolAnalysis] = useState<PoolAnalysis | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user?.is_admin) {
      router.push("/login")
      return
    }

    loadMonitoringData()
    
    // Set up auto refresh every 30 seconds
    const interval = setInterval(loadMonitoringData, 30000)
    return () => clearInterval(interval)
  }, [authLoading, isAuthenticated, user, router])

  const loadMonitoringData = async () => {
    setIsLoading(true)

    try {
      const [dbData, poolData, healthData] = await Promise.all([
        apiCall<DatabaseStatus>('/api/v1/admin/database/status'),
        apiCall<PoolAnalysis>('/api/v1/admin/database/pool-status'),
        apiCall<SystemHealth>('/api/v1/admin/health')
      ])

      setDbStatus(dbData)
      setPoolAnalysis(poolData)
      setSystemHealth(healthData)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error loading monitoring data:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadMonitoringData()
  }

  const getStatusIcon = (isHealthy: boolean) => {
    if (isHealthy) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? "text-green-600" : "text-red-600"
  }

  const getPoolHealthColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading system monitoring...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time system health and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastRefresh && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
              </div>
            </div>
          )}
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(dbStatus?.is_connected || false)}
              <span className={`text-sm font-medium ${getStatusColor(dbStatus?.is_connected || false)}`}>
                {dbStatus?.is_connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dbStatus?.message || 'Loading...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Pool</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`text-sm font-medium ${getPoolHealthColor(poolAnalysis?.analysis.health_status || 'unknown')}`}>
                {poolAnalysis?.analysis.health_status || 'Unknown'}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {poolAnalysis?.analysis.pool_usage_percentage 
                ? `${poolAnalysis.analysis.pool_usage_percentage.toFixed(1)}% usage`
                : 'Loading...'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(!!systemHealth)}
              <span className={`text-sm font-medium ${getStatusColor(!!systemHealth)}`}>
                {systemHealth ? 'Healthy' : 'Unhealthy'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {systemHealth?.version || 'Loading...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Check</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Auto-refresh: 30s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Database Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Database Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connection Status</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(dbStatus?.is_connected || false)}
                <Badge variant={dbStatus?.is_connected ? "default" : "destructive"}>
                  {dbStatus?.is_connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
            
            {dbStatus?.pool_status && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pool Size</span>
                  <span className="text-sm font-medium">{dbStatus.pool_status.pool_size}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Connections</span>
                  <span className="text-sm font-medium">{dbStatus.pool_status.checked_out_connections}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Available Connections</span>
                  <span className="text-sm font-medium">{dbStatus.pool_status.checked_in_connections}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overflow Connections</span>
                  <span className="text-sm font-medium">{dbStatus.pool_status.overflow_connections}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Capacity</span>
                  <span className="text-sm font-medium">{dbStatus.pool_status.total_capacity}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Connection Pool Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {poolAnalysis ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Health Status</span>
                  <Badge 
                    variant={
                      poolAnalysis.analysis.health_status === 'healthy' ? 'default' :
                      poolAnalysis.analysis.health_status === 'warning' ? 'secondary' : 'destructive'
                    }
                  >
                    {poolAnalysis.analysis.health_status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pool Usage</span>
                  <span className="text-sm font-medium">
                    {poolAnalysis.analysis.pool_usage_percentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Available Connections</span>
                  <span className="text-sm font-medium">
                    {poolAnalysis.analysis.available_connections}
                  </span>
                </div>
                
                {/* Usage Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Connection Usage</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {poolAnalysis.pool_metrics.checked_out_connections}/{poolAnalysis.pool_metrics.total_capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        poolAnalysis.analysis.pool_usage_percentage > 80 ? 'bg-red-500' :
                        poolAnalysis.analysis.pool_usage_percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(poolAnalysis.analysis.pool_usage_percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading pool analysis...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>System Health Check</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {systemHealth ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Status</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge variant="default">Healthy</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Message</span>
                <span className="text-sm font-medium">{systemHealth.message}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Version</span>
                <span className="text-sm font-medium">{systemHealth.version}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Health Check</span>
                <span className="text-sm font-medium">
                  {formatTimestamp(systemHealth.timestamp)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Unable to fetch system health</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-600">Healthy</span>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Database connected</li>
                <li>• Pool usage &lt; 60%</li>
                <li>• API responding normally</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-yellow-600">Warning</span>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Pool usage 60-80%</li>
                <li>• Increased response times</li>
                <li>• Monitor closely</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-600">Critical</span>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Database disconnected</li>
                <li>• Pool usage &gt; 80%</li>
                <li>• API not responding</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 