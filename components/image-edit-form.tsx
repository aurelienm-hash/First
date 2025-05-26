"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { editImage } from "@/app/actions"
import { Loader2, Upload, Download } from "lucide-react"
import { BeforeAfterSlider } from "./before-after-slider"

const STONE_COLORS = [
  { value: "Light Grey", label: "Gris Clair", color: "#D1D5DB" },
  { value: "Dark Grey", label: "Gris Foncé", color: "#6B7280" },
  { value: "Beige", label: "Beige", color: "#D2B48C" },
]

export function ImageEditForm() {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState("Light Grey")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (4MB limit)
      if (file.size > 4 * 1024 * 1024) {
        setError("L'image doit faire moins de 4MB.")
        return
      }

      // Accept both PNG and JPEG (we'll convert to PNG)
      if (!file.type.includes("png") && !file.type.includes("jpeg") && !file.type.includes("jpg")) {
        setError("Veuillez uploader une image PNG ou JPEG.")
        return
      }

      setError(null)
      setResultImage(null)
      setImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image) return

    setLoading(true)
    setError(null)
    setResultImage(null)

    try {
      const formData = new FormData()
      formData.append("image", image)
      formData.append("stoneColor", selectedColor)

      const result = await editImage(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setResultImage(result.imageUrl)
      }
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors du traitement de l'image")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = () => {
    if (resultImage) {
      if (resultImage.startsWith("data:")) {
        // Base64 image
        const link = document.createElement("a")
        link.href = resultImage
        link.download = "terrasse-revetement.png"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // URL image
        window.open(resultImage, "_blank")
      }
    }
  }

  const resetImages = () => {
    setImage(null)
    setImagePreview(null)
    setResultImage(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Visualiseur de Revêtement</h1>
          <p className="text-gray-600 text-sm">Visualisez votre terrasse avec un revêtement résine-gravier</p>
        </div>

        {!imagePreview ? (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Photo de votre terrasse
                </label>
                <div className="relative">
                  <input
                    id="image"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageChange}
                    className="w-full file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <Upload className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">PNG ou JPEG, max 4MB</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Couleur des cailloux</label>
                <div className="grid grid-cols-3 gap-3">
                  {STONE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSelectedColor(color.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedColor === color.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full mx-auto mb-2 border"
                        style={{ backgroundColor: color.color }}
                      />
                      <span className="text-xs font-medium">{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </Card>
        ) : (
          <div className="space-y-4">
            {!resultImage ? (
              <Card className="p-4">
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 mb-4">
                  <img src={imagePreview || "/placeholder.svg"} alt="Original" className="w-full h-full object-cover" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Couleur sélectionnée:</span>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{
                          backgroundColor: STONE_COLORS.find((c) => c.value === selectedColor)?.color,
                        }}
                      />
                      <span className="text-sm">{STONE_COLORS.find((c) => c.value === selectedColor)?.label}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={resetImages} variant="outline" className="w-full">
                      Changer
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        "Appliquer"
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                <BeforeAfterSlider beforeImage={imagePreview} afterImage={resultImage} />

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={resetImages} variant="outline" className="w-full">
                    Nouvelle Photo
                  </Button>
                  <Button onClick={downloadImage} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="text-red-600 text-sm text-center">{error}</div>
          </Card>
        )}
      </div>
    </div>
  )
}
