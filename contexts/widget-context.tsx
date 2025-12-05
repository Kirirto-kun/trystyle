"use client"

import { createContext, useContext } from "react"

interface WidgetContextType {
  isWidget: boolean
  maxWidth?: string
}

const WidgetContext = createContext<WidgetContextType>({
  isWidget: false,
})

export function WidgetProvider({ 
  children, 
  isWidget = true 
}: { 
  children: React.ReactNode
  isWidget?: boolean 
}) {
  return (
    <WidgetContext.Provider value={{ isWidget, maxWidth: "100%" }}>
      {children}
    </WidgetContext.Provider>
  )
}

export function useIsWidget(): boolean {
  const context = useContext(WidgetContext)
  return context.isWidget
}

export function useWidgetContext(): WidgetContextType {
  const context = useContext(WidgetContext)
  return context
}

