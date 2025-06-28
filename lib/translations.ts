// Статические импорты переводов
import enCommon from '@/public/locales/en/common.json'
import enLanding from '@/public/locales/en/landing.json'
import enAuth from '@/public/locales/en/auth.json'
import enDashboard from '@/public/locales/en/dashboard.json'

import ruCommon from '@/public/locales/ru/common.json'
import ruLanding from '@/public/locales/ru/landing.json'
import ruAuth from '@/public/locales/ru/auth.json'
import ruDashboard from '@/public/locales/ru/dashboard.json'

export type Locale = 'en' | 'ru'

// Структура переводов
export const translations = {
  en: {
    common: enCommon,
    landing: enLanding,
    auth: enAuth,
    dashboard: enDashboard
  },
  ru: {
    common: ruCommon,
    landing: ruLanding,
    auth: ruAuth,
    dashboard: ruDashboard
  }
} as const

// Функция для получения переводов
export function getTranslations(locale: Locale) {
  return translations[locale] || translations.en
}

// Функция для получения конкретного перевода
export function getTranslation(locale: Locale, namespace: string, key: string): string {
  const namespaceTranslations = translations[locale]?.[namespace as keyof typeof translations[typeof locale]]
  
  if (!namespaceTranslations) {
    return key
  }

  const keys = key.split('.')
  let value: any = namespaceTranslations

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key
    }
  }

  return typeof value === 'string' ? value : key
} 