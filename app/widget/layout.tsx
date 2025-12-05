"use client"

import type React from "react"
import { useEffect } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/components/theme-provider"
import { WidgetProvider } from "@/contexts/widget-context"
import { SelectedItemsProvider } from "@/contexts/selected-items-context"
import { Toaster } from "sonner"

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Принудительно убираем класс dark из html элемента и следим за его отсутствием
  useEffect(() => {
    if (typeof document !== "undefined") {
      const removeDark = () => {
        document.documentElement.classList.remove("dark")
        // Убеждаемся, что класс light установлен
        if (!document.documentElement.classList.contains("light")) {
          document.documentElement.classList.add("light")
        }
      }
      
      // Удаляем сразу
      removeDark()
      
      // Следим за изменениями и удаляем dark если он появится
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (document.documentElement.classList.contains("dark")) {
              removeDark()
            }
          }
        })
      })
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })
      
      return () => observer.disconnect()
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
        <WidgetProvider isWidget={true}>
          <AuthProvider>
            <SelectedItemsProvider>
              <div className="w-full h-full min-h-screen bg-white">
                {children}
              </div>
              <Toaster />
            </SelectedItemsProvider>
          </AuthProvider>
        </WidgetProvider>
      </ThemeProvider>
    </LanguageProvider>
  )
}

