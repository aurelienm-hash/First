"use server"

export async function editImage(formData: FormData) {
  try {
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      return {
        error: "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.",
      }
    }

    const image = formData.get("image") as File
    const stoneColor = formData.get("stoneColor") as string

    if (!image || !stoneColor) {
      return {
        error: "Image and stone color are required",
      }
    }

    // Validate image size
    if (image.size > 4 * 1024 * 1024) {
      return {
        error: "Image must be less than 4MB",
      }
    }

    // Create the detailed prompt with the selected stone color
    const prompt = `You are given a photo of a terrace (can be flat concrete, asphalt, or similar). Your task is to digitally overlay a realistic resin-bound gravel surface on the terrace floor only, without altering the walls, background, or perspective of the original photo.

The texture must simulate a resin and gravel finish, typical of modern outdoor terraces. The gravel should consist of small pebbles that are tightly packed together.

Use the following parameters:
• Stone color: ${stoneColor}

The resulting surface must reflect the correct lighting and shadows of the original image. Do not add furniture or additional elements. The rest of the terrace and the surrounding environment (walls, sky, trees) should remain untouched.

The goal is to help clients visualize what their terrace would look like once resurfaced with this specific stone-resin finish.`

    // Process the image to ensure it meets OpenAI requirements
    const processedImageBuffer = await processImageForOpenAI(image)

    // Create FormData for the API request
    const apiFormData = new FormData()

    // Create a new File object from the processed buffer
    const processedFile = new File([processedImageBuffer], "image.png", {
      type: "image/png",
    })

    apiFormData.append("image", processedFile)
    apiFormData.append("prompt", prompt)
    apiFormData.append("model", "gpt-image-1")
    apiFormData.append("n", "1")
    apiFormData.append("size", "1024x1024")

    console.log("Making API request to OpenAI with model gpt-image-1...")
    console.log("Stone color:", stoneColor)

    // Make a direct API call to OpenAI
    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: apiFormData,
    })

    console.log("API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API error response:", errorText)

      let errorMessage = "API request failed"
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error?.message || `Image processing error: ${errorData.error?.type || "Unknown error"}`
      } catch {
        errorMessage = `API request failed with status ${response.status}: ${errorText}`
      }

      return {
        error: errorMessage,
      }
    }

    const result = await response.json()
    console.log("Full API response:", JSON.stringify(result, null, 2))

    // Extract the image URL (default format for image editing API)
    const imageUrl = result.data[0]?.url
    const imageB64 = result.data[0]?.b64_json

    if (!imageUrl && !imageB64) {
      console.error("No image URL or b64_json found in response:", result)
      return {
        error: "No image data returned from OpenAI",
      }
    }

    console.log("Image data received:", imageUrl ? "URL" : "Base64")

    // Return the image URL or convert base64 to data URL
    return {
      imageUrl: imageUrl || `data:image/png;base64,${imageB64}`,
      apiResponse: {
        created: result.created,
        usage: result.usage || null,
        model: "gpt-image-1",
        stoneColor: stoneColor,
      },
    }
  } catch (error: any) {
    console.error("Error editing image:", error)
    return {
      error: error.message || "An error occurred while processing the image",
    }
  }
}

async function processImageForOpenAI(file: File): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Set canvas to square dimensions (1024x1024 max)
      const size = Math.min(1024, Math.max(img.width, img.height))
      canvas.width = size
      canvas.height = size

      // Fill with white background
      if (ctx) {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, size, size)

        // Calculate scaling and positioning to center the image
        const scale = Math.min(size / img.width, size / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        const x = (size - scaledWidth) / 2
        const y = (size - scaledHeight) / 2

        // Draw the image centered on the canvas
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              blob.arrayBuffer().then((buffer) => {
                resolve(Buffer.from(buffer))
              })
            } else {
              reject(new Error("Failed to convert canvas to blob"))
            }
          },
          "image/png",
          1.0,
        )
      } else {
        reject(new Error("Failed to get canvas context"))
      }
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }

    // Convert file to data URL
    const reader = new FileReader()
    reader.onload = () => {
      img.src = reader.result as string
    }
    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }
    reader.readAsDataURL(file)
  })
}
