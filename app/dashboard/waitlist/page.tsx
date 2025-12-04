"use client"

import React from "react"
import WaitlistContainer from "@/components/dashboard/waitlist/WaitlistContainer"
import { useTranslations } from "@/contexts/language-context"

export default function WaitlistPage() {
  const t = useTranslations('dashboard')

  return (
    <div className="p-4 md:p-6">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t('waitlist.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('waitlist.subtitle')}
        </p>
      </div>

      {/* Основной контейнер */}
      <WaitlistContainer />
    </div>
  )
} 