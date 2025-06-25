"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Leaf } from "lucide-react"
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-gentle"></div>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Leaf className="h-4 w-4 text-forest-500 animate-leaf-dance" />
            <p className="text-muted-foreground">Loading your stylish world...</p>
            <Leaf className="h-4 w-4 text-forest-500 animate-leaf-dance" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative elements for light theme only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none dark:hidden">
        <div className="absolute top-10 right-20 animate-float">
          <Leaf className="h-5 w-5 text-forest-300 opacity-40" />
        </div>
        <div className="absolute bottom-20 left-10 animate-leaf-dance" style={{ animationDelay: '1s' }}>
          <Leaf className="h-4 w-4 text-forest-400 opacity-30" />
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:block w-72 flex-shrink-0 border-r border-border bg-card">
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
            isChatPage ? "" : "p-4 sm:p-6 lg:p-8"
          )}>
            <div className={cn(
              isChatPage ? "h-full" : "bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm min-h-full"
            )}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}