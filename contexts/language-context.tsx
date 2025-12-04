"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { type Locale, getTranslations, getTranslation } from '@/lib/translations'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, namespace?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Функция для определения языка браузера
function detectBrowserLanguage(): Locale {
  if (typeof window === 'undefined') return 'en'
  
  const browserLang = navigator.language || navigator.languages?.[0] || 'en'
  
  // Если язык русский, возвращаем 'ru', иначе 'en'
  if (browserLang.startsWith('ru')) {
    return 'ru'
  }
  
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [isInitialized, setIsInitialized] = useState(false)

  // Инициализация языка при загрузке
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        console.log('Initializing language...')
        // Проверяем сохраненный язык в cookies
        const savedLocale = Cookies.get('locale') as Locale
        
        let initialLocale: Locale
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'ru')) {
          initialLocale = savedLocale
        } else {
          // Автоматическое определение языка браузера
          initialLocale = detectBrowserLanguage()
          Cookies.set('locale', initialLocale, { expires: 365 })
        }
        
        console.log('Setting locale to:', initialLocale)
        setLocaleState(initialLocale)
        setIsInitialized(true)
        console.log('Language initialization complete')
      } catch (error) {
        console.error('Error initializing language:', error)
        // Fallback: используем английский
        setLocaleState('en')
        setIsInitialized(true)
      }
    }

    initializeLanguage()
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    Cookies.set('locale', newLocale, { expires: 365 })
  }

  const t = (key: string, namespace: string = 'common'): string => {
    return getTranslation(locale, namespace, key)
  }

  // Не рендерим детей пока не инициализирован язык
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Хук для удобного использования переводов
export function useTranslations(namespace: string = 'common') {
  const { t } = useLanguage()
  return (key: string) => t(key, namespace)
} 