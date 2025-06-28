"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { useLanguage, type Locale } from '@/contexts/language-context'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
}

export function LanguageSwitcher({ 
  variant = 'ghost', 
  size = 'default',
  showText = true 
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLanguage()

  const languages = [
    { code: 'en' as Locale, name: t('language.english'), flag: '🇺🇸' },
    { code: 'ru' as Locale, name: t('language.russian'), flag: '🇷🇺' }
  ]

  const currentLanguage = languages.find(lang => lang.code === locale)

  const handleLanguageChange = async (newLocale: Locale) => {
    if (newLocale !== locale) {
      await setLocale(newLocale)
    }
  }

  if (showText) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">
              {currentLanguage?.flag} {currentLanguage?.name}
            </span>
            <span className="sm:hidden">
              {currentLanguage?.flag}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`cursor-pointer ${
                locale === language.code 
                  ? 'bg-gray-100 dark:bg-gray-800' 
                  : ''
              }`}
            >
              <span className="mr-2">{language.flag}</span>
              {language.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Компактная версия - только флаги
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="icon">
          <span className="text-base">{currentLanguage?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${
              locale === language.code 
                ? 'bg-gray-100 dark:bg-gray-800' 
                : ''
            }`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 