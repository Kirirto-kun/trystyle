"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Bot,
  Camera,
  Heart,
  MessageSquare,
  Palette,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileHeader } from "@/components/ui/mobile-header"
import { TryOnVisual } from "@/components/landing/TryOnVisual"
import { ChatVisual } from "@/components/landing/ChatVisual"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTranslations } from "@/contexts/language-context"
import { Loader2 } from "lucide-react"

export default function LandingPage() {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const tLanding = useTranslations('landing')
  const t = useTranslations('common')

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navbar */}
      <div className="md:hidden">
        <MobileHeader title={tLanding('brand.name')} showNav={false} />
      </div>

      <motion.nav 
        className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <Bot className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">{tLanding('brand.name')}</span>
          </Link>
          <div className="flex items-center space-x-2">
            <LanguageSwitcher showText={false} />
            <ThemeToggle />
            <Button variant="ghost" asChild className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Link href="/login">{t('buttons.signIn')}</Link>
            </Button>
            <Button asChild className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100">
              <Link href="/register">
                {t('buttons.getStarted')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="py-20 md:py-24 bg-white dark:bg-gray-900">
          <motion.div
            className="container mx-auto px-4 sm:px-6 lg:px-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4 text-gray-900 dark:text-white">
              {tLanding('hero.title')}
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
              {tLanding('hero.subtitle')}
            </p>
            <Button size="lg" asChild className="text-base bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100">
              <Link href="/register">
                {tLanding('hero.cta')} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{tLanding('features.title')}</h2>
              <p className="max-w-xl mx-auto text-gray-600 dark:text-gray-300 mt-2">
                {tLanding('features.subtitle')}
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <Shirt className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('features.wardrobe.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('features.wardrobe.description')}</p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('features.aiChat.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('features.aiChat.description')}</p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('features.tryon.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('features.tryon.description')}</p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('features.shopping.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('features.shopping.description')}</p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('features.waitlist.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('features.waitlist.description')}</p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('features.askAnything.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('features.askAnything.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Try-On Spotlight */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                  {tLanding('spotlight.tryon.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                  {tLanding('spotlight.tryon.description')}
                </p>
                <Button variant="outline" asChild className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Link href="/dashboard/tryon">
                    {tLanding('spotlight.tryon.cta')} <Palette className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <TryOnVisual />
            </div>
          </div>
        </section>

        {/* AI Chat Spotlight */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="md:order-last">
                <ChatVisual />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                  {tLanding('spotlight.aiChat.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                  {tLanding('spotlight.aiChat.description')}
                </p>
                <Button variant="outline" asChild className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Link href="/dashboard/chat">
                    {tLanding('spotlight.aiChat.cta')} <MessageSquare className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-gray-800 dark:to-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {tLanding('finalCta.title')}
            </h2>
            <p className="max-w-xl mx-auto text-gray-600 dark:text-gray-300 mb-6">
              {tLanding('finalCta.subtitle')}
            </p>
            <Button size="lg" asChild className="text-base bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100">
              <Link href="/register">
                {tLanding('finalCta.cta')} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} {tLanding('brand.name')}. {tLanding('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
} 