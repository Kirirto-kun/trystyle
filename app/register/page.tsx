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
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle, Mail } from "lucide-react"
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import { MobileHeader } from "@/components/ui/mobile-header"
import { toast } from "sonner"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [showVerificationField, setShowVerificationField] = useState(false)
  const { register, sendVerificationCode, isLoading, googleLogin, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const router = useRouter()
  const tAuth = useTranslations('auth')
  const t = useTranslations('common')

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard/chat")
    }
  }, [isLoading, isAuthenticated, router])

  const handleSendVerificationCode = async () => {
    if (!email) return;
    setIsSendingCode(true);
    const success = await sendVerificationCode(email);
    if (success) {
      setEmailVerified(true);
      setShowVerificationField(true);
    }
    setIsSendingCode(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailVerified) {
      await handleSendVerificationCode();
      return;
    }
    
    if (!verificationCode) {
      setShowVerificationField(true);
      return;
    }
    
    setIsSubmitting(true)
    await register(email, username, password, verificationCode)
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
      <div className="lg:hidden">
        <MobileHeader title={tAuth('register.title')} showNav={false} />
      </div>

      <div className="flex min-h-screen">
        <div className="w-full lg:w-2/5 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-lg space-y-10">
            <div className="flex items-center justify-between lg:justify-end">
              <Button variant="ghost" size="sm" asChild className="p-0 h-auto lg:hidden">
                <Link href="/" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('buttons.back')}
                </Link>
              </Button>
              <div className="lg:hidden">
                <LanguageSwitcher variant="ghost" size="sm" />
              </div>
            </div>

            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {tAuth('register.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-xl lg:text-2xl leading-relaxed">
                {tAuth('register.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative">
                <Label htmlFor="email" className="sr-only">{tAuth('register.form.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={tAuth('register.form.steps.email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting || isSendingCode || emailVerified}
                  className="w-full px-8 py-7 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {emailVerified && (
                  <div className="absolute inset-y-0 right-0 pr-8 flex items-center">
                    <CheckCircle className="h-7 w-7 text-green-500" />
                  </div>
                )}
              </div>

              {email && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <Input
                    placeholder={tAuth('register.form.steps.username')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isSubmitting || isSendingCode}
                    className="w-full px-8 py-7 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              )}

              {username && (
                <div className="relative animate-in slide-in-from-top-2 duration-300">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={tAuth('register.form.steps.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting || isSendingCode}
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
              )}

              {showVerificationField && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <Input
                    placeholder={tAuth('register.verification.code')}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-8 py-7 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    {tAuth('register.verification.subtitle')} {email}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || isSendingCode || !email}
                className="w-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black py-6 rounded-full text-2xl font-medium transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    {t('buttons.creating')}
                  </>
                ) : isSendingCode ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    {t('buttons.loading')}
                  </>
                ) : !emailVerified ? (
                  tAuth('register.verification.submit')
                ) : !verificationCode ? (
                  tAuth('register.verification.code')
                ) : (
                  tAuth('register.form.submit')
                )}
              </Button>
            </form>

            {!emailVerified && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-lg">
                    <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                      {tAuth('register.social.title')}
                    </span>
                  </div>
                </div>

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
                        text="signup_with"
                      />
                    </div>
                  </GoogleOAuthProvider>
                </div>
              </>
            )}

            <div className="text-center">
              <span className="text-gray-600 dark:text-gray-400 text-xl">{tAuth('register.login.text')} </span>
              <Link 
                href="/login" 
                className="font-medium text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-xl"
              >
                {tAuth('register.login.link')}
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 relative overflow-hidden">
          <div className="absolute top-4 right-4 z-10">
            <LanguageSwitcher variant="ghost" size="sm" />
          </div>

          <div className="flex flex-col items-center justify-center w-full p-12 text-center">
            <div className="relative mb-10">
              <div className="w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-600 dark:to-gray-500 rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="w-56 h-56 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center">
                  <div className="text-7xl">🎨</div>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
              Join the style revolution
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Create your perfect wardrobe with <strong>TryStyle AI</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 