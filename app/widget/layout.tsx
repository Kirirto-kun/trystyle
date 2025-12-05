"use client"

import type React from "react"
import { useEffect } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Принудительно убираем класс dark из html элемента
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark")
      document.documentElement.classList.add("light")
    }
  }, [])

  return (
    <LanguageProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        enableSystem={false}
        disableTransitionOnChange
        storageKey="widget-theme"
      >
        <AuthProvider>
          <div className="w-full h-full min-h-screen bg-white">
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  )
}

