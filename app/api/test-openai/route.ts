import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY not configured",
          hasKey: false,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    // Test simple de l'API OpenAI
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      const hasGptImage1 = data.data?.some((model: any) => model.id === "gpt-image-1")

      return NextResponse.json({
        success: true,
        hasKey: true,
        hasGptImage1,
        message: "OpenAI API connection successful",
        timestamp: new Date().toISOString(),
      })
    } else {
      const errorData = await response.text()
      return NextResponse.json(
        {
          error: "Invalid API key or OpenAI error",
          hasKey: true,
          status: response.status,
          details: errorData,
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Connection error: " + error.message,
        hasKey: !!process.env.OPENAI_API_KEY,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
