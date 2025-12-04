"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTranslations } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LanguageSwitcher } from "@/components/language-switcher"
import Link from "next/link"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import { MobileHeader } from "@/components/ui/mobile-header"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, googleLogin, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const tAuth = useTranslations('auth')
  const t = useTranslations('common')

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard/chat")
    }
  }, [isLoading, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await login(email, password)
    setIsSubmitting(false)
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        await googleLogin(credentialResponse.credential)
      } catch (error) {
        toast.error(tAuth('errors.networkError'))
      }
    }
  }

  const handleGoogleError = () => {
    toast.error(tAuth('errors.networkError'))
  }

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <MobileHeader title={tAuth('login.title')} showNav={false} />
      </div>

      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="w-full lg:w-2/5 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-lg space-y-10">
            {/* Language Switcher */}
            <div className="flex justify-end lg:hidden">
              <LanguageSwitcher variant="ghost" size="sm" />
            </div>

            {/* Header */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {tAuth('login.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-xl lg:text-2xl leading-relaxed">
                {tAuth('login.subtitle')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <Label htmlFor="email" className="sr-only">{tAuth('login.form.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder={tAuth('login.form.email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting || isLoading}
                  className="w-full px-8 py-7 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="relative">
                <Label htmlFor="password" className="sr-only">{tAuth('login.form.password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder={tAuth('login.form.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting || isLoading}
                  className="w-full px-8 py-7 pr-20 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-8 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>

              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  {tAuth('login.form.forgotPassword')}
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black py-6 rounded-full text-2xl font-medium transition-colors duration-200"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    {t('buttons.loading')}
                  </>
                ) : (
                  tAuth('login.form.submit')
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-lg">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  {tAuth('login.social.title')}
                </span>
              </div>
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                <div className="w-full max-w-xs">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    size="large"
                    width="100%"
                    theme="outline"
                    shape="rectangular"
                    text="signin_with"
                  />
                </div>
              </GoogleOAuthProvider>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <span className="text-gray-600 dark:text-gray-400 text-xl">{tAuth('login.register.text')} </span>
              <Link 
                href="/register" 
                className="font-medium text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-xl"
              >
                {tAuth('login.register.link')}
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-green-100 to-emerald-50 dark:from-gray-800 dark:to-gray-700 relative overflow-hidden">
          {/* Language Switcher for Desktop */}
          <div className="absolute top-4 right-4 z-10">
            <LanguageSwitcher variant="ghost" size="sm" />
          </div>

          {/* Decorative elements - more pastel */}
          <div className="absolute top-10 left-10 w-16 h-16 bg-green-100 dark:bg-gray-600 rounded-full opacity-40 dark:opacity-30"></div>
          <div className="absolute top-32 right-20 w-8 h-8 bg-emerald-200 dark:bg-gray-500 rounded-full opacity-50 dark:opacity-40"></div>
          <div className="absolute bottom-20 left-16 w-12 h-12 bg-green-150 dark:bg-gray-600 rounded-full opacity-45 dark:opacity-35"></div>
          <div className="absolute top-1/2 left-8 w-6 h-6 bg-emerald-300 dark:bg-gray-500 rounded-full opacity-30 dark:opacity-25"></div>
          
          {/* Main content */}
          <div className="flex flex-col items-center justify-center w-full p-12 text-center">
            {/* Illustration placeholder */}
            <div className="relative mb-8">
              <div className="w-80 h-80 bg-gradient-to-br from-green-100 to-emerald-150 dark:from-gray-600 dark:to-gray-500 rounded-full flex items-center justify-center relative overflow-hidden">
                {/* Person illustration placeholder */}
                <div className="w-48 h-48 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center">
                  <div className="text-6xl">🧘‍♀️</div>
                </div>
                
                {/* Floating elements around the person */}
                <div className="absolute top-8 right-8 w-12 h-12 bg-white/90 dark:bg-gray-800/90 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Design</span>
                </div>
                
                {/* User avatars */}
                <div className="absolute top-16 left-4 w-10 h-10 bg-green-200 dark:bg-gray-600 rounded-full opacity-60"></div>
                <div className="absolute bottom-16 right-4 w-10 h-10 bg-emerald-200 dark:bg-gray-500 rounded-full opacity-70"></div>
              </div>
            </div>
            
            {/* Bottom text */}
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Make your work easier and organized
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              with <strong>TryStyle's App</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 