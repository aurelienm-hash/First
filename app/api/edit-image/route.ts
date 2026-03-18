import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const FAL_BASE_URL = "https://queue.fal.run"

export async function POST(request: NextRequest) {
  try {
    const falKey = process.env.FAL_KEY
    if (!falKey) {
      return NextResponse.json({ error: "Fal AI API key is not configured" }, { status: 500 })
    }

    const { imageData, stoneColor } = await request.json()

    if (!imageData || !stoneColor) {
      return NextResponse.json({ error: "Image data and stone color are required" }, { status: 400 })
    }

    const prompt = `Edit this photo of a terrace to apply a realistic resin-bound gravel surface on the terrace floor only.

IMPORTANT RULES:
- ONLY modify the terrace floor/ground surface
- DO NOT alter walls, background, sky, trees, furniture, or any other elements
- Preserve the exact same perspective, lighting, and shadows from the original photo
- The new surface must blend naturally with the existing lighting conditions

SURFACE DETAILS:
- Material: Resin-bound gravel finish (small tightly-packed pebbles embedded in resin)
- Stone color: ${stoneColor}
- Texture: Natural, slightly irregular pebble pattern typical of modern outdoor terraces
- Finish: Smooth, professional installation look

The goal is a photorealistic visualization of a terrace resurfaced with ${stoneColor} stone-resin finish.`

    console.log("Submitting job to Fal AI Nano Banana 2 edit...")

    // Submit the job to the queue (returns immediately with request_id)
    const submitResponse = await fetch(`${FAL_BASE_URL}/fal-ai/nano-banana-2/edit`, {
      method: "POST",
      headers: {
        Authorization: `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_urls: [imageData],
        output_format: "png",
      }),
    })

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text()
      console.error("Fal AI submit error:", submitResponse.status, errorText)
      return NextResponse.json(
        { error: `Erreur Fal AI: ${errorText}` },
        { status: submitResponse.status },
      )
    }

    const result = await submitResponse.json()
    console.log("Fal AI response keys:", Object.keys(result))

    // If sync result with images
    if (result.images?.[0]?.url) {
      return NextResponse.json({
        imageUrl: result.images[0].url,
        status: "COMPLETED",
      })
    }

    // If async, return request_id for client polling
    if (result.request_id) {
      return NextResponse.json({
        requestId: result.request_id,
        status: "IN_QUEUE",
      })
    }

    console.error("Unexpected response:", result)
    return NextResponse.json({ error: "Unexpected Fal AI response" }, { status: 502 })
  } catch (error: any) {
    console.error("Error editing image:", error)
    return NextResponse.json(
      { error: error.message || "Une erreur s'est produite" },
      { status: 500 },
    )
  }
}
