"use client"

import Link from "next/link"

import { MobileNav } from "./mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useAuth } from "@/contexts/auth-context"

interface MobileHeaderProps {
  title?: string
  showNav?: boolean
}

export function MobileHeader({ title, showNav = true }: MobileHeaderProps) {
  const { isAuthenticated } = useAuth()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="container flex h-14 items-center px-4">
        {showNav && <MobileNav />}
        
        <div className="flex items-center space-x-2 flex-1">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <img src="/logo.jpeg" alt="TryStyle Logo" className="h-6 w-6 rounded object-cover" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {title || "TryStyle"}
            </span>
          </Link>
        </div>

        {!showNav && (
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="ghost" size="icon" showText={false} />
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  )
}