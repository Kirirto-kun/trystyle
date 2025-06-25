"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

// This page can be a welcome screen or redirect to a default section like chat.
export default function DashboardRootPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard/chat")
  }, [router])

  return null // Or a loading spinner
}
