"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { MobileHeader } from "@/components/ui/mobile-header"
import Sidebar from "@/components/dashboard/sidebar"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isChatPage = pathname === "/dashboard/chat"

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, router])
  
  useEffect(() => {
    const handleResize = () => {
      if (isChatPage && window.innerWidth < 768) {
        document.body.classList.add("overflow-hidden")
      } else {
        document.body.classList.remove("overflow-hidden")
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      document.body.classList.remove("overflow-hidden")
    }
  }, [isChatPage])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">Loading your stylish world...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:block w-72 flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden">
            <MobileHeader />
          </div>

          <main className={cn(
            "flex-1 overflow-y-auto",
            isChatPage ? "" : ""
          )}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}