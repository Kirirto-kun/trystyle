"use client"

import Link from "next/link"
import { Bot } from "lucide-react"
import { MobileNav } from "./mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"

interface MobileHeaderProps {
  title?: string
  showNav?: boolean
}

export function MobileHeader({ title, showNav = true }: MobileHeaderProps) {
  const { isAuthenticated } = useAuth()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-14 items-center px-4">
        {showNav && <MobileNav />}
        
        <div className="flex items-center space-x-2 flex-1">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">
              {title || "ClosetMind"}
            </span>
          </Link>
        </div>

        {!showNav && <ThemeToggle />}
      </div>
    </header>
  )
}