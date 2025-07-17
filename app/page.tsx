"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Camera,
  Heart,
  MessageSquare,
  Palette,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  BarChart3,
  Users,
  Layers
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
  const { isLoading, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const tLanding = useTranslations('landing')
  const t = useTranslations('common')

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Route based on user role
      if (user.is_admin) {
        router.push("/admin")
      } else if (user.is_store_admin) {
        router.push("/store-admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [isLoading, isAuthenticated, user, router])

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
            <img src="/logo.jpeg" alt="TryStyle Logo" className="h-7 w-7 rounded-md object-cover transition-transform group-hover:scale-110" />
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="text-base bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100">
                <Link href="/register">
                  {tLanding('hero.cta')} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                <Link href="/register">
                  {tLanding('hero.secondaryCta')} <Store className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
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
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('features.smartSearch.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('features.smartSearch.description')}</p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('features.aiStylist.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('features.aiStylist.description')}</p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <Layers className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('features.outfitBuilder.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('features.outfitBuilder.description')}</p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('features.virtualTryon.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('features.virtualTryon.description')}</p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('features.brandCatalogs.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('features.brandCatalogs.description')}</p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('features.wishlist.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('features.wishlist.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* For Business Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{tLanding('forBusiness.title')}</h2>
              <p className="max-w-xl mx-auto text-gray-600 dark:text-gray-300 mt-2">
                {tLanding('forBusiness.subtitle')}
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <Store className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('forBusiness.catalogDigitization.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('forBusiness.catalogDigitization.description')}</p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('forBusiness.analyticsCustomers.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('forBusiness.analyticsCustomers.description')}</p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tLanding('forBusiness.aiConsultant.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tLanding('forBusiness.aiConsultant.description')}</p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button size="lg" variant="outline" asChild className="text-base border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                <Link href="/register">
                  {tLanding('forBusiness.cta')} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
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

        {/* Testimonials */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{tLanding('testimonials.title')}</h2>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              <motion.div
                className="p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{tLanding('testimonials.reviews.0.quote')}"</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{tLanding('testimonials.reviews.0.name')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tLanding('testimonials.reviews.0.title')}</p>
                </div>
              </motion.div>

              <motion.div
                className="p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{tLanding('testimonials.reviews.1.quote')}"</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{tLanding('testimonials.reviews.1.name')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tLanding('testimonials.reviews.1.title')}</p>
                </div>
              </motion.div>

              <motion.div
                className="p-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{tLanding('testimonials.reviews.2.quote')}"</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{tLanding('testimonials.reviews.2.name')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tLanding('testimonials.reviews.2.title')}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-gray-800 dark:to-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main CTA for Customers */}
            <div className="text-center mb-12">
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

            {/* Business CTA */}
            <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                {tLanding('finalCta.businessCta.title')}
              </p>
              <Button size="lg" variant="outline" asChild className="text-base border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                <Link href="/register">
                  {tLanding('finalCta.businessCta.cta')} <Store className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
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