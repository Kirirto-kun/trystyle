"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Sidebar from "@/components/dashboard/sidebar"
import { MobileHeader } from "@/components/ui/mobile-header"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile Header - плавающий для всех страниц */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <MobileHeader title="Dashboard" />
      </div>

      <div className="flex h-screen">
        {/* Desktop Sidebar - Fixed */}
        <div className="hidden lg:block w-72 flex-shrink-0 fixed left-0 top-0 h-full z-40">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-screen pt-14 lg:pt-0 lg:ml-72 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 