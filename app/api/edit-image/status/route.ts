import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const FAL_BASE_URL = "https://queue.fal.run"

export async function GET(request: NextRequest) {
  try {
    const falKey = process.env.FAL_KEY
    if (!falKey) {
      return NextResponse.json({ error: "Fal AI API key is not configured" }, { status: 500 })
    }

    const requestId = request.nextUrl.searchParams.get("id")
    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
    }

    // Check status
    const statusResponse = await fetch(
      `${FAL_BASE_URL}/fal-ai/nano-banana-2/edit/requests/${requestId}/status`,
      {
        headers: { Authorization: `Key ${falKey}` },
      },
    )

    if (!statusResponse.ok) {
      const errText = await statusResponse.text()
      console.error("Status check error:", statusResponse.status, errText)
      return NextResponse.json({ error: "Failed to check status" }, { status: 502 })
    }

    const statusResult = await statusResponse.json()

    if (statusResult.status === "COMPLETED") {
      // Fetch the actual result
      const resultResponse = await fetch(
        `${FAL_BASE_URL}/fal-ai/nano-banana-2/edit/requests/${requestId}`,
        {
          headers: { Authorization: `Key ${falKey}` },
        },
      )

      if (!resultResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch result" }, { status: 502 })
      }

      const result = await resultResponse.json()
      const imageUrl = result.images?.[0]?.url

      if (!imageUrl) {
        return NextResponse.json({ error: "No image in result" }, { status: 502 })
      }

      return NextResponse.json({ status: "COMPLETED", imageUrl })
    }

    if (statusResult.status === "FAILED") {
      return NextResponse.json({ status: "FAILED", error: "Image processing failed" })
    }

    return NextResponse.json({
      status: statusResult.status || "IN_PROGRESS",
    })
  } catch (error: any) {
    console.error("Error checking status:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
