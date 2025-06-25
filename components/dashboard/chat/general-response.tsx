"use client"
import { MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface GeneralResult {
  response: string
}

interface GeneralResponseProps {
  result: GeneralResult
}

export default function GeneralResponse({ result }: GeneralResponseProps) {
  return (
    <Card className="w-full max-w-2xl border-l-4 border-l-primary/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap m-0">
                {result.response}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 