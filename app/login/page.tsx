"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Loader2, ArrowLeft, Bot, Sparkles } from "lucide-react"
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import { MobileHeader } from "@/components/ui/mobile-header"
import { FloatingNatureElements, LargeNatureDecoration, NaturePattern } from "@/components/ui/nature-decorations"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading, googleLogin, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isLoading, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await login(email, password)
    setIsSubmitting(false)
  }

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-cream-50 via-nature-50 to-cream-100 dark:from-background dark:via-background dark:to-muted">
      <NaturePattern />
      <FloatingNatureElements />
      <LargeNatureDecoration position="top-right" />
      <LargeNatureDecoration position="bottom-left" />
      
      <MobileHeader title="Sign In" showNav={false} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-8 relative z-10">
        <div className="w-full max-w-md space-y-6 animate-fade-in-up">
          {/* Back to home link - mobile friendly */}
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild className="p-0 h-auto backdrop-blur-sm">
              <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-all duration-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <Card className="border-0 shadow-2xl card-nature backdrop-blur-lg animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="space-y-1 pb-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Bot className="h-12 w-12 text-primary animate-gentle-bounce" />
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-gentle"></div>
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-nature-400 animate-float" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Welcome back!
              </CardTitle>
              <CardDescription className="text-center text-base text-muted-foreground">
                Sign in to access your AI style assistant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">Email</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="you@example.com or your_name"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting || isLoading}
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting || isLoading}
                    className="h-12 text-base"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium" 
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card/80 px-3 py-1 text-muted-foreground backdrop-blur-sm rounded-full">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                  <div className="w-full">
                    <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        if (credentialResponse.credential) {
                          await googleLogin(credentialResponse.credential)
                        }
                      }}
                      onError={() => {
                        // Error handling
                      }}
                      useOneTap={false}
                      size="large"
                      width="100%"
                    />
                  </div>
                </GoogleOAuthProvider>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <div className="text-sm text-center">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link href="/register" className="font-medium text-primary hover:underline transition-colors duration-300 hover:text-primary/80">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}