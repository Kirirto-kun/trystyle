"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MessageSquare, Shirt, ListChecks, LogOut, Download, Bot, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { FloatingNatureElements } from "@/components/ui/nature-decorations"

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
    <aside className="h-full w-full bg-sidebar/90 backdrop-blur-lg flex flex-col border-r border-sidebar-border/50 shadow-xl relative overflow-hidden">
      {/* Decorative elements */}
      <FloatingNatureElements />
      
      {/* Logo */}
      <Link href="/dashboard" className="p-6 pb-4 flex items-center space-x-3 hover:opacity-80 transition-all duration-300 group">
        <div className="relative">
          <Bot className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-gentle"></div>
          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-nature-400 animate-float" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sidebar-foreground to-primary bg-clip-text text-transparent">
            ClosetMind
          </h1>
          <p className="text-sm text-muted-foreground">AI Fashion Assistant</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-grow px-6 space-y-3">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-4">
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
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <div className="relative">
              <item.icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              {pathname === item.href && (
                <div className="absolute inset-0 bg-sidebar-primary-foreground/20 rounded-full blur-sm"></div>
              )}
            </div>
            <span className="font-medium text-base">{item.label}</span>
            {pathname === item.href && (
              <div className="absolute right-3 w-2 h-2 bg-sidebar-primary-foreground rounded-full animate-pulse-gentle"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-6 space-y-4 border-t border-sidebar-border/30">
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="flex-1 justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all duration-300 h-12"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
          <div className="bg-sidebar-accent/50 rounded-lg p-2">
            <ThemeToggle />
          </div>
        </div>
        
        {user && (
          <div className="text-center p-4 bg-sidebar-accent/30 rounded-lg border border-sidebar-border/30">
            <p className="text-xs text-sidebar-foreground/70 mb-2">Signed in as</p>
            <p className="text-sm font-medium text-sidebar-foreground">
              {user.username || user.email}
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
