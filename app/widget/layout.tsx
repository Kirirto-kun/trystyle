"use client"

import type React from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LanguageProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        disableTransitionOnChange
        storageKey="closetmind-theme"
      >
        <AuthProvider>
          <div className="w-full h-full min-h-screen bg-white dark:bg-gray-900">
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  )
}

