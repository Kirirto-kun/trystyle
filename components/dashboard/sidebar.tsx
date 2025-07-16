"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MessageSquare, Shirt, ListChecks, LogOut, Download, Bot, Sparkles, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslations } from "@/contexts/language-context"

const API_BASE_URL = "https://www.closetmind.studio"

export default function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const router = useRouter()
  const tCommon = useTranslations('common')
  
  const navItems = [
    { href: "/dashboard/chat", label: tCommon('navigation.chat'), icon: MessageSquare },
    { href: "/dashboard/tryon", label: tCommon('navigation.tryon'), icon: Shirt },
    { href: "/dashboard/wardrobe", label: tCommon('navigation.wardrobe'), icon: Shirt },
    { href: "/dashboard/catalog", label: tCommon('navigation.catalog'), icon: Store },
    { href: "/dashboard/waitlist", label: tCommon('navigation.waitlist'), icon: ListChecks },
  ]

  const handleLogout = () => {
    logout()
  }

  const handleDownloadExtension = () => {
    window.location.href = `${API_BASE_URL}/waitlist/download-extension`
  }

  return (
    <aside className="h-screen w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg flex flex-col border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50"></div>
      
      {/* Logo */}
      <Link href="/dashboard" className="relative p-6 pb-4 flex items-center space-x-3 hover:opacity-80 transition-all duration-300 group flex-shrink-0">
        <div className="relative">
          <Bot className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary/60 animate-bounce" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {tCommon('sidebar.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{tCommon('sidebar.subtitle')}</p>
        </div>
      </Link>

      {/* Navigation - Scrollable */}
      <nav className="relative flex-grow px-6 space-y-3 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
            {tCommon('sidebar.navigation')}
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

      {/* Bottom section - Fixed */}
      <div className="relative p-6 space-y-4 border-t border-gray-200/30 dark:border-gray-700/30 flex-shrink-0">
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="flex-1 justify-start text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 h-12"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            {tCommon('sidebar.signOut')}
          </Button>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
            <LanguageSwitcher variant="ghost" size="icon" showText={false} />
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
            <ThemeToggle />
          </div>
        </div>
        
        {user && (
          <div className="text-center p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/30 dark:border-gray-700/30">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{tCommon('sidebar.signedInAs')}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.username || user.email}
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
