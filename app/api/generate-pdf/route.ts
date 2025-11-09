import { NextRequest, NextResponse } from "next/server"

const PDF_GENERATOR_URL = "https://www.closetmind.studio"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received request to generate PDF:", { email: body.email, outfitItemsCount: body.outfit?.items?.length })

    const response = await fetch(`${PDF_GENERATOR_URL}/generate-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

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
  } catch (error: any) {
    console.error("Error proxying PDF generation request:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF" },
      { status: 500 }
    )
  }
}

