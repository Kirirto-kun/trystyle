"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  ShoppingBag, 
  Activity, 
  TrendingUp, 
  LogOut, 
  Settings,
  Shield,
  Database,
  UserCog
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Badge } from "@/components/ui/badge"

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const router = useRouter()
  
  const navItems = [
    { 
      href: "/admin", 
      label: "Dashboard", 
      icon: LayoutDashboard,
      description: "System overview"
    },
    { 
      href: "/admin/users", 
      label: "User Management", 
      icon: Users,
      description: "Manage all users"
    },
    { 
      href: "/admin/users/admins", 
      label: "Store Admins", 
      icon: UserCog,
      description: "Manage store admins"
    },
    { 
      href: "/admin/stores", 
      label: "Store Management", 
      icon: Store,
      description: "Manage stores"
    },
    { 
      href: "/admin/products", 
      label: "Product Management", 
      icon: ShoppingBag,
      description: "Manage all products"
    },
    { 
      href: "/admin/analytics", 
      label: "Analytics", 
      icon: TrendingUp,
      description: "System analytics"
    },
    { 
      href: "/admin/monitoring", 
      label: "System Monitor", 
      icon: Activity,
      description: "System health"
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
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">Super Administrator</p>
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
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-colors",
                isActive
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  isActive
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-900 dark:text-white"
                )}>
                  {item.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.description}
                </p>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
        {/* User Info */}
        {user && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">Signed in as</p>
              <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                Super Admin
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.username || user.email}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
              <LanguageSwitcher variant="ghost" size="icon" showText={false} />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
              <ThemeToggle />
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <Link 
            href="/admin/monitoring"
            className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Database className="h-3 w-3" />
            <span>System Status</span>
          </Link>
        </div>
      </div>
    </aside>
  )
} 