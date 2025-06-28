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
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

const LandingNavbar = () => {
  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader title="TryStyle" showNav={false} />
      </div>

      {/* Desktop Navigation */}
      <motion.nav 
        className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <Bot className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">TryStyle</span>
          </Link>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" asChild className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100">
              <Link href="/register">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.nav>
    </>
  )
}

const LandingFooter = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 py-8 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} TryStyle. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

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

  const features = [
    {
      icon: <Shirt className="h-8 w-8 text-primary" />,
      title: "Your Digital Wardrobe",
      description: "Add your clothes and see your entire collection in one place.",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "AI Stylist Chat",
      description: "Get outfit advice based on your own clothes.",
    },
    {
      icon: <Camera className="h-8 w-8 text-primary" />,
      title: "Virtual Try-On",
      description: "See how new items look on you before you buy.",
    },
    {
      icon: <ShoppingBag className="h-8 w-8 text-primary" />,
      title: "Shopping Assistant",
      description: "Ask your AI to find where to buy the clothes you want.",
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Curate a Waitlist",
      description: "Save items you love and plan your future purchases.",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Ask Anything",
      description: "Your AI assistant can answer any fashion-related question.",
    },
  ]

  const testimonials = [
    {
      name: "Jessica L.",
      title: "Fashion Enthusiast",
      quote: "TryStyle has completely changed how I get dressed in the morning. The virtual try-on is a game-changer! It's like having a personal stylist in my pocket.",
    },
    {
      name: "David M.",
      title: "Busy Professional",
      quote: "I never knew what to wear. Now I just ask the AI stylist, and it creates amazing outfits from my own clothes. I save so much time and always look great.",
    },
    {
      name: "Samantha K.",
      title: "Savvy Shopper",
      quote: "The shopping assistant found me the perfect dress for a wedding and even discovered a discount code! I'm curating my dream wardrobe with the waitlist feature.",
    }
  ]

  const FADE_IN_ANIMATION_VARIANTS = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  }
  
  const heroTitle = "Your Personal AI Stylist".split(" ")

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <LandingNavbar />

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="py-20 md:py-24 bg-white dark:bg-gray-900">
          <motion.div
            className="container mx-auto px-4 sm:px-6 lg:px-8 text-center"
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4 text-gray-900 dark:text-white"
              variants={{
                animate: { transition: { staggerChildren: 0.08 } }
              }}
            >
              {heroTitle.map((word, i) => (
                <motion.span 
                  key={i}
                  className="inline-block"
                  variants={{
                    initial: { opacity: 0, y: 30 },
                    animate: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.h1>
            <motion.p
              className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8"
              variants={FADE_IN_ANIMATION_VARIANTS}
            >
              Effortlessly manage your wardrobe, get personalized outfit advice, virtually try on clothes, and discover your next favorite piece.
            </motion.p>
            <motion.div variants={FADE_IN_ANIMATION_VARIANTS}>
              <motion.div
                className="inline-block"
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" asChild className="text-base bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100">
                  <Link href="/register">
                    Get Started For Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial="initial"
              whileInView="animate"
              variants={FADE_IN_ANIMATION_VARIANTS}
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">How It Works</h2>
              <p className="max-w-xl mx-auto text-gray-600 dark:text-gray-300 mt-2">
                All your fashion needs, one simple platform.
              </p>
            </motion.div>
            <motion.div 
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              initial="initial"
              whileInView="animate"
              transition={{ staggerChildren: 0.1 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  className="text-center p-4 md:p-6 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary/20 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 hover:shadow-lg"
                  variants={FADE_IN_ANIMATION_VARIANTS}
                  whileHover={{ y: -5, scale: 1.03 }}
                >
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 mx-auto">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Feature Spotlight: Virtual Try-On */}
        <section className="py-20 overflow-hidden bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">See It On Before You Buy</h2>
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg mb-6">
                  No more guessing games. Upload your photo and a picture of any clothing item to see a realistic preview of how it will look on you. Make confident purchase decisions from the comfort of your home.
                </p>
                <Button variant="outline" asChild className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                  <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/dashboard/tryon">
                      Try it now <Palette className="ml-2 h-5 w-5" />
                    </Link>
                  </motion.div>
                </Button>
              </motion.div>
              <TryOnVisual />
            </div>
          </div>
        </section>
        
        {/* Feature Spotlight: AI Stylist */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="md:order-last">
                <ChatVisual />
              </div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Your 24/7 Fashion Expert</h2>
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg mb-6">
                  "What should I wear tonight?" "Does this match?" "Where can I find a red dress under $100?" Get instant answers from your AI stylist that knows your wardrobe and your taste.
                </p>
                <Button variant="outline" asChild className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/dashboard/chat">Start a conversation <MessageSquare className="ml-2 h-5 w-5" /></Link>
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial="initial"
              whileInView="animate"
              variants={FADE_IN_ANIMATION_VARIANTS}
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Loved by Fashion Forward People</h2>
            </motion.div>
            <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:border-primary/20 hover:shadow-lg"
                  initial="initial"
                  whileInView="animate"
                  transition={{ delay: index * 0.1 }}
                  variants={FADE_IN_ANIMATION_VARIANTS}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.03 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="flex text-primary">
                      {[...Array(5)].map((_, i) => (
                          <motion.div 
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ delay: (index * 0.1) + (i * 0.05) + 0.2 }}
                            viewport={{ once: true }}
                          >
                            <Star className="h-5 w-5 fill-current" />
                          </motion.div>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-gray-800 dark:to-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
                initial="initial"
                whileInView="animate"
                transition={{ staggerChildren: 0.2 }}
                viewport={{ once: true, amount: 0.5 }}
            >
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
                variants={FADE_IN_ANIMATION_VARIANTS}
              >
                Transform Your Style Today
              </motion.h2>
              <motion.p
                className="max-w-xl mx-auto text-gray-600 dark:text-gray-300 mt-2 mb-6"
                variants={FADE_IN_ANIMATION_VARIANTS}
              >
                Ready to take control of your closet and unlock your personal style? Get started with TryStyle for free.
              </motion.p>
              <motion.div variants={FADE_IN_ANIMATION_VARIANTS}>
                <motion.div
                  className="inline-block"
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" asChild className="text-base bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100">
                    <Link href="/register">
                      Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}