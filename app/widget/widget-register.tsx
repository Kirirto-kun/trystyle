"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTranslations } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, CheckCircle, Mail } from "lucide-react"
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import { toast } from "sonner"

interface WidgetRegisterProps {
  onRegisterSuccess: () => void
}

export default function WidgetRegister({ onRegisterSuccess }: WidgetRegisterProps) {
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
  const tAuth = useTranslations('auth')
  const t = useTranslations('common')

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      onRegisterSuccess()
    }
  }, [isLoading, isAuthenticated, onRegisterSuccess])

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
    const success = await register(email, username, password, verificationCode)
    setIsSubmitting(false)
    
    if (success) {
      onRegisterSuccess()
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        const success = await googleLogin(credentialResponse.credential)
        if (success) {
          // Небольшая задержка, чтобы токен успел сохраниться в cookies
          await new Promise(resolve => setTimeout(resolve, 100))
          onRegisterSuccess()
        }
      } catch (error) {
        toast.error(tAuth('errors.networkError'))
      }
    }
  }

  const handleGoogleError = () => {
    toast.error(tAuth('errors.networkError'))
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white p-4 overflow-auto">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {tAuth('register.title')}
          </h1>
          <p className="text-gray-600 text-sm">
            {tAuth('register.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />
            {emailVerified && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
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
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
              <p className="mt-2 text-sm text-gray-600 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {tAuth('register.verification.subtitle')} {email}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || isSendingCode || !email}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition-colors duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('buttons.creating')}
              </>
            ) : isSendingCode ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
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
      </div>
    </div>
  )
}

