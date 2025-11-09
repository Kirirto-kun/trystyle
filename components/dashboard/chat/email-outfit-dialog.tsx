"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Loader2 } from "lucide-react"
import { SuggestedOutfit } from "@/lib/chat-types"
import { toast } from "sonner"

interface EmailOutfitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  outfit: SuggestedOutfit | null
}

export default function EmailOutfitDialog({ open, onOpenChange, outfit }: EmailOutfitDialogProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!outfit) {
      toast.error("Ошибка: образ не найден")
      return
    }

    if (!email.trim()) {
      toast.error("Пожалуйста, введите email")
      return
    }

    if (!validateEmail(email)) {
      toast.error("Пожалуйста, введите корректный email")
      return
    }

    setIsLoading(true)

    try {
      const requestBody = {
        email: email.trim(),
        outfit: outfit,
      }
      
      console.log("Sending outfit to email:", {
        email: requestBody.email,
        outfitDescription: requestBody.outfit?.outfit_description,
        itemsCount: requestBody.outfit?.items?.length,
        fullOutfit: requestBody.outfit
      })

      // Отправляем email и полный JSON аутфита через Next.js API route (прокси)
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        const errorMessage = errorData.error || errorData.detail || `Request failed with status ${response.status}`
        console.error("PDF generation error response:", errorData)
        throw new Error(errorMessage)
      }

      const result = await response.json().catch(() => ({}))
      console.log("PDF generation response:", result)
      
      toast.success("Образ успешно отправлен на почту!")
      setEmail("")
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error sending outfit to email:", error)
      
      // Более понятное сообщение об ошибке
      let errorMessage = "Не удалось отправить образ на почту"
      if (error.message) {
        if (error.message.includes("PDF.__init__")) {
          errorMessage = "Ошибка на сервере генерации PDF. Пожалуйста, попробуйте позже или обратитесь в поддержку."
        } else if (error.message.includes("Ошибка генерации PDF")) {
          errorMessage = "Ошибка генерации PDF на сервере. Пожалуйста, попробуйте позже."
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(`Ошибка отправки: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setEmail("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Отправить образ на почту
          </DialogTitle>
          <DialogDescription>
            Введите email адрес, на который хотите отправить этот образ. Мы отправим полную информацию об образе.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email адрес</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Отправить
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

