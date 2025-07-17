"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, X, MessageSquare, Shirt, ListChecks, LogOut, Download, Store } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslations } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

const API_BASE_URL = "https://www.closetmind.studio"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const tCommon = useTranslations('common')
  
  const navItems = [
    { href: "/dashboard/chat", label: tCommon('navigation.chat'), icon: MessageSquare },
    { href: "/dashboard/tryon", label: tCommon('navigation.tryon'), icon: Shirt },
    { href: "/dashboard/wardrobe", label: tCommon('navigation.wardrobe'), icon: Shirt },
    { href: "/dashboard/catalog", label: tCommon('navigation.catalog'), icon: Store },
    { href: "/dashboard/waitlist", label: tCommon('navigation.waitlist'), icon: ListChecks },
  ]

  const handleDownloadExtension = () => {
    window.location.href = `${API_BASE_URL}/waitlist/download-extension`
    setOpen(false)
  }

  const handleLogout = () => {
    logout()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden text-gray-900 dark:text-white"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 w-[280px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <SheetTitle className="sr-only">Menu Navigation</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center space-x-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <img src="/logo.jpeg" alt="TryStyle Logo" className="h-6 w-6 rounded object-cover" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">{tCommon('sidebar.title')}</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                  pathname === item.href
                    ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="flex-1 justify-start text-left h-12 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                {tCommon('sidebar.signOut')}
              </Button>
              <LanguageSwitcher variant="ghost" size="icon" showText={false} />
              <ThemeToggle />
            </div>

            {user && (
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                {tCommon('sidebar.signedInAs')} {user.username || user.email}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}