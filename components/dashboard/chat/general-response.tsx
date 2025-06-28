"use client"
import { Card, CardContent } from "@/components/ui/card"

interface GeneralResult {
  response: string
}

interface GeneralResponseProps {
  result: GeneralResult
}

export default function GeneralResponse({ result }: GeneralResponseProps) {
  return (
    <Card className="w-full max-w-2xl border-l-4 border-l-primary/50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm leading-relaxed whitespace-pre-wrap m-0 text-gray-900 dark:text-white">
            {result.response}
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 