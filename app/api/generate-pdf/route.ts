import { NextRequest, NextResponse } from "next/server"

const PDF_GENERATOR_URL = process.env.PDF_GENERATOR_URL || "http://localhost:8020"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received request to generate PDF:", { email: body.email, outfitItemsCount: body.outfit?.items?.length })

    // Add timeout to fetch request (10 seconds)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch(`${PDF_GENERATOR_URL}/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("PDF generator response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
        console.error("PDF generator error:", errorData)
        return NextResponse.json(
          { error: errorData.detail || errorData.error || `Request failed with status ${response.status}` },
          { status: response.status }
        )
      }

      const data = await response.json().catch(() => ({}))
      console.log("PDF generator success:", data)
      return NextResponse.json(data, { status: 200 })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      // Handle specific connection errors
      if (fetchError.name === 'AbortError') {
        console.error("PDF generator request timeout")
        return NextResponse.json(
          { error: "Сервис генерации PDF не отвечает. Пожалуйста, попробуйте позже." },
          { status: 504 }
        )
      }
      
      if (fetchError.code === 'ECONNREFUSED' || fetchError.message?.includes('fetch failed')) {
        console.error("PDF generator service unavailable:", PDF_GENERATOR_URL)
        return NextResponse.json(
          { error: "Сервис генерации PDF недоступен. Убедитесь, что сервис запущен на " + PDF_GENERATOR_URL },
          { status: 503 }
        )
      }
      
      throw fetchError
    }
  } catch (error: any) {
    console.error("Error proxying PDF generation request:", error)
    return NextResponse.json(
      { error: error.message || "Не удалось сгенерировать PDF. Пожалуйста, попробуйте позже." },
      { status: 500 }
    )
  }
}

