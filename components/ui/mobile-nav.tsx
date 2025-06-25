"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, X, Bot, MessageSquare, Shirt, ListChecks, LogOut, Download } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const API_BASE_URL = "https://www.closetmind.studio"

const navItems = [
  { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/dashboard/tryon", label: "Try-On", icon: Shirt },
  { href: "/dashboard/wardrobe", label: "My Wardrobe", icon: Shirt },
  { href: "/dashboard/waitlist", label: "Wishlist", icon: ListChecks },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { logout, user } = useAuth()

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
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 w-[280px] bg-background border-border">
        <SheetTitle className="sr-only">Menu Navigation</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center space-x-2 px-6 py-4 border-b border-border">
            <Bot className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">ClosetMind</span>
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
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  "active:bg-accent active:text-accent-foreground",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="px-4 py-6 border-t border-border space-y-3">
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="flex-1 justify-start text-left h-12"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
              <ThemeToggle />
            </div>

            {user && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                Signed in as {user.username || user.email}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}