"use client"

import React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/contexts/language-context"
import { 
  MessageSquare, 
  Shirt, 
  ListChecks, 
  Camera,
  Heart,
  Sparkles,
  ArrowRight,
  Bot,
  ShoppingBag
} from "lucide-react"

export default function DashboardPage() {
  const t = useTranslations('common')
  const tDashboard = useTranslations('dashboard')

  const features = [
    {
      href: "/dashboard/chat",
      icon: MessageSquare,
      title: t('navigation.chat'),
      description: tDashboard('overview.features.chat.description'),
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      href: "/dashboard/tryon",
      icon: Camera,
      title: t('navigation.tryon'),
      description: tDashboard('overview.features.tryon.description'),
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      href: "/dashboard/wardrobe",
      icon: Shirt,
      title: t('navigation.wardrobe'),
      description: tDashboard('overview.features.wardrobe.description'),
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      href: "/dashboard/catalog",
      icon: ShoppingBag,
      title: t('navigation.catalog'),
      description: "Browse products and stores to find your perfect style",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20"
    },
    {
      href: "/dashboard/waitlist",
      icon: ListChecks,
      title: t('navigation.waitlist'),
      description: tDashboard('overview.features.waitlist.description'),
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
  ]

  return (
    <div className="p-6 space-y-8 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bot className="h-12 w-12 text-primary" />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary/60 animate-bounce" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {tDashboard('overview.welcome')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {tDashboard('overview.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.href} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className={`absolute inset-0 ${feature.bgColor}`} />
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-lg`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              <Button asChild variant="ghost" className="w-full mt-4 group-hover:bg-white/50 dark:group-hover:bg-gray-800/50">
                <Link href={feature.href} className="flex items-center justify-center space-x-2">
                  <span>Open {feature.title}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-0">
        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {tDashboard('overview.gettingStarted.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {tDashboard('overview.gettingStarted.description')}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/wardrobe">
                <Shirt className="h-4 w-4 mr-2" />
                {tDashboard('overview.gettingStarted.buildWardrobe')}
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                {tDashboard('overview.gettingStarted.askStylist')}
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/tryon">
                <Camera className="h-4 w-4 mr-2" />
                {tDashboard('overview.gettingStarted.tryClothes')}
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/catalog">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Catalog
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900 dark:text-white">{tDashboard('overview.stats.aiChat.title')}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{tDashboard('overview.stats.aiChat.description')}</p>
        </Card>
        
        <Card className="p-4 text-center bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <Camera className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900 dark:text-white">{tDashboard('overview.stats.virtualTryon.title')}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{tDashboard('overview.stats.virtualTryon.description')}</p>
        </Card>
        
        <Card className="p-4 text-center bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <Shirt className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900 dark:text-white">{tDashboard('overview.stats.smartWardrobe.title')}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{tDashboard('overview.stats.smartWardrobe.description')}</p>
        </Card>

        <Card className="p-4 text-center bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
          <ShoppingBag className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Product Catalog</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">Discover new styles</p>
        </Card>
      </div>
    </div>
  )
} 