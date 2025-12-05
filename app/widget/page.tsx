"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import WidgetRegister from "./widget-register"
import WidgetChat from "./widget-chat"

export default function WidgetPage() {
  const { isLoading, isAuthenticated } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowRegister(true)
    } else if (!isLoading && isAuthenticated) {
      setShowRegister(false)
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (showRegister || !isAuthenticated) {
    return <WidgetRegister onRegisterSuccess={() => setShowRegister(false)} />
  }

  return <WidgetChat />
}

