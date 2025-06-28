"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle, Mail } from "lucide-react"
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import { MobileHeader } from "@/components/ui/mobile-header"
import { toast } from "sonner"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [showVerificationField, setShowVerificationField] = useState(false)
  const { register, sendVerificationCode, isLoading, googleLogin, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
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
    
    // If email isn't verified yet, send verification code first
    if (!emailVerified) {
      await handleSendVerificationCode();
      return;
    }
    
    // If verification code isn't provided, show the field
    if (!verificationCode) {
      setShowVerificationField(true);
      return;
    }
    
    // Submit registration
    setIsSubmitting(true)
    await register(email, username, password, verificationCode)
    setIsSubmitting(false)
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        await googleLogin(credentialResponse.credential)
      } catch (error) {
        toast.error("Google registration failed. Please try again.")
      }
    }
  }

  const handleGoogleError = () => {
    toast.error("Google registration failed. Please try again.")
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
        <MobileHeader title="Register" showNav={false} />
      </div>

      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="w-full lg:w-2/5 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-lg space-y-10">
            {/* Back button */}
            <div className="flex items-center lg:hidden">
              <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
                <Link href="/" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Header */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Create account!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-xl lg:text-2xl leading-relaxed">
                Join TryStyle AI and revolutionize your style. Get started for free.
              </p>
            </div>

            {/* Single Form with Progressive Disclosure */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <div className="relative">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
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

              {/* Username Field - shows after email is entered */}
              {email && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="username" className="sr-only">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isSubmitting || isSendingCode}
                    className="w-full px-8 py-7 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              )}

              {/* Password Field - shows after username is entered */}
              {username && (
                <div className="relative animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="password" className="sr-only">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Create a password"
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

              {/* Verification Code Field - shows after email verification */}
              {showVerificationField && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="verificationCode" className="sr-only">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    required
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-8 py-7 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Verification code sent to {email}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || isSendingCode || !email || (!emailVerified && !username && !password)}
                className="w-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black py-6 rounded-full text-2xl font-medium transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Creating account...
                  </>
                ) : isSendingCode ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Sending code...
                  </>
                ) : !emailVerified ? (
                  "Send Verification Code"
                ) : !verificationCode ? (
                  "Enter Verification Code"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Google Login - only show initially */}
            {!emailVerified && (
              <>
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-lg">
                    <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">or continue with</span>
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
                        text="signup_with"
                      />
                    </div>
                  </GoogleOAuthProvider>
                </div>
              </>
            )}

            {/* Login Link */}
            <div className="text-center">
              <span className="text-gray-600 dark:text-gray-400 text-xl">Already have an account? </span>
              <Link 
                href="/login" 
                className="font-medium text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-xl"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 relative overflow-hidden">
          {/* Decorative elements - more pastel */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-100 dark:bg-gray-600 rounded-full opacity-30 dark:opacity-25"></div>
          <div className="absolute top-32 right-20 w-10 h-10 bg-purple-100 dark:bg-gray-500 rounded-full opacity-40 dark:opacity-30"></div>
          <div className="absolute bottom-20 left-16 w-16 h-16 bg-blue-150 dark:bg-gray-600 rounded-full opacity-35 dark:opacity-25"></div>
          <div className="absolute top-1/2 left-8 w-8 h-8 bg-purple-150 dark:bg-gray-500 rounded-full opacity-25 dark:opacity-20"></div>
          <div className="absolute bottom-32 right-12 w-12 h-12 bg-blue-200 dark:bg-gray-600 rounded-full opacity-30 dark:opacity-25"></div>
          
          {/* Main content */}
          <div className="flex flex-col items-center justify-center w-full p-12 text-center">
            {/* Illustration placeholder */}
            <div className="relative mb-10">
              <div className="w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-600 dark:to-gray-500 rounded-full flex items-center justify-center relative overflow-hidden">
                {/* Person illustration placeholder */}
                <div className="w-56 h-56 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center">
                  <div className="text-7xl">🎨</div>
                </div>
                
                {/* Floating elements around the person */}
                <div className="absolute top-10 right-10 w-16 h-16 bg-white/90 dark:bg-gray-800/90 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-sm font-semibold text-purple-500 dark:text-purple-400">Style</span>
                </div>
                
                <div className="absolute bottom-12 left-8 w-14 h-14 bg-white/90 dark:bg-gray-800/90 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-xs font-semibold text-blue-500 dark:text-blue-400">AI</span>
                </div>
                
                {/* User avatars */}
                <div className="absolute top-20 left-6 w-12 h-12 bg-pink-100 dark:bg-gray-600 rounded-full opacity-60"></div>
                <div className="absolute bottom-20 right-6 w-12 h-12 bg-blue-150 dark:bg-gray-500 rounded-full opacity-70"></div>
              </div>
            </div>
            
            {/* Bottom text */}
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