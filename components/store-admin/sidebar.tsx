"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Upload,
  ShoppingCart, 
  Store, 
  LogOut, 
  Settings,
  Package,
  BarChart3,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Badge } from "@/components/ui/badge"

export default function StoreAdminSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const router = useRouter()
  
  const navItems = [
    { 
      href: "/store-admin", 
      label: "Dashboard", 
      icon: LayoutDashboard,
      description: "Store overview"
    },
    { 
      href: "/store-admin/products", 
      label: "Products", 
      icon: ShoppingBag,
      description: "Manage products"
    },
    { 
      href: "/store-admin/products/add", 
      label: "Add Product", 
      icon: Upload,
      description: "Upload via photos",
      highlight: true
    },
    { 
      href: "/store-admin/orders", 
      label: "Orders", 
      icon: ShoppingCart,
      description: "Manage orders"
    },
    { 
      href: "/store-admin/store", 
      label: "Store Settings", 
      icon: Store,
      description: "Store configuration"
    },
    { 
      href: "/store-admin/analytics", 
      label: "Analytics", 
      icon: BarChart3,
      description: "Store analytics"
    },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <aside className="w-full h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Store Admin</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">Store Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-colors",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-900 dark:text-white"
                )}>
                  {item.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.description}
                </p>
              </div>
              {item.highlight && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  AI
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Controls */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.username || 'Store Admin'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Add Product Button */}
        <Button 
          className="w-full"
          onClick={() => router.push('/store-admin/products/add')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
    </aside>
  )
} 