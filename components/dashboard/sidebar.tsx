"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MessageSquare, Shirt, ListChecks, LogOut, Download, Bot, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const API_BASE_URL = "https://www.closetmind.studio"

const navItems = [
  { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/dashboard/tryon", label: "Try-On", icon: Shirt },
  { href: "/dashboard/wardrobe", label: "My Wardrobe", icon: Shirt },
  { href: "/dashboard/waitlist", label: "Wishlist", icon: ListChecks },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
  }

  const handleDownloadExtension = () => {
    window.location.href = `${API_BASE_URL}/waitlist/download-extension`
  }

  return (
    <aside className="h-full w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg flex flex-col border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50"></div>
      
      {/* Logo */}
      <Link href="/dashboard" className="relative p-6 pb-4 flex items-center space-x-3 hover:opacity-80 transition-all duration-300 group">
        <div className="relative">
          <Bot className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary/60 animate-bounce" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            TryStyle
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">AI Fashion Assistant</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="relative flex-grow px-6 space-y-3">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
            Navigation
          </h2>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-4 px-4 py-4 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 group relative overflow-hidden",
              pathname === item.href
                ? "bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/25 dark:shadow-white/25"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
            )}
          >
            <div className="relative">
              <item.icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              {pathname === item.href && (
                <div className="absolute inset-0 bg-white/20 dark:bg-black/20 rounded-full blur-sm"></div>
              )}
            </div>
            <span className="font-medium text-base">{item.label}</span>
            {pathname === item.href && (
              <div className="absolute right-3 w-2 h-2 bg-white dark:bg-black rounded-full animate-pulse"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="relative p-6 space-y-4 border-t border-gray-200/30 dark:border-gray-700/30">
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="flex-1 justify-start text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 h-12"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
            <ThemeToggle />
          </div>
        </div>
        
        {user && (
          <div className="text-center p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/30 dark:border-gray-700/30">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.username || user.email}
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
