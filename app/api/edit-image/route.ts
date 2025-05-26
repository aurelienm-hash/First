import { type NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import os from "os"

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    const formData = await request.formData()
    const image = formData.get("image") as File
    const prompt = (formData.get("prompt") as string) || "Replace the floor by small stones"

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    // Convert File to Buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a temporary file path
    const tempDir = os.tmpdir()
    const imagePath = join(tempDir, `${uuidv4()}.png`)

    // Write the image to a temporary file
    await writeFile(imagePath, buffer)

    // Initialize OpenAI client with the dangerouslyAllowBrowser option
    // This is safe in this context because we're in a server environment
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Safe in this context as we're in a server environment
    })

    // Call the OpenAI API
    const response = await openai.images.edits({
      image: await openai.files.content(
        await openai.files.create({
          file: buffer,
          purpose: "assistants",
        }),
      ),
      prompt: prompt,
      model: "gpt-image-1",
      n: 1,
      size: "auto",
      quality: "medium",
      background: "auto",
      moderation: "auto",
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Error editing image:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while processing the image" },
      { status: 500 },
    )
  }
}
