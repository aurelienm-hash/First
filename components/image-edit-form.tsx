"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { fal } from "@fal-ai/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Upload, Download, Eye, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { BeforeAfterSlider } from "./before-after-slider"

fal.config({ proxyUrl: "/api/fal/proxy" })

const DEMOS = [
  { before: "/demo-avant.jpg", after: "/demo-apres.png", label: "Allée de garage" },
  { before: "/demo-avant-2.png", after: "/demo-apres-2.png", label: "Terrasse jardin" },
  { before: "/demo-avant-3.jpg", after: "/demo-apres-3.png", label: "Terrasse complète" },
]

// Image used for "Je n'ai pas de photo" quick test
const QUICK_TEST_DEMO = {
  before: "/demo-avant-3.jpg",
  after: "/demo-apres-3.png",
}

const STONE_COLORS = [
  {
    value: "Blanc cassé",
    label: "Blanc cassé",
    color: "#F0EDE8",
    description: "off-white smooth render finish, warm white with very slight cream undertone, uniform matte texture",
  },
  {
    value: "Gris clair",
    label: "Gris clair",
    color: "#C8CBCC",
    description: "light grey smooth render finish, soft neutral grey, clean and modern matte texture",
  },
  {
    value: "Gris anthracite",
    label: "Gris anthracite",
    color: "#4A4E52",
    description: "dark anthracite grey smooth render finish, deep charcoal grey, contemporary matte texture",
  },
  {
    value: "Beige sable",
    label: "Beige sable",
    color: "#D6C9A8",
    description: "warm sand beige smooth render finish, natural sandy tone, elegant matte texture",
  },
  {
    value: "Ocre doré",
    label: "Ocre doré",
    color: "#C8A05A",
    description: "golden ochre smooth render finish, warm yellow-orange Mediterranean tone, matte texture",
  },
  {
    value: "Terre cuite",
    label: "Terre cuite",
    color: "#B8623A",
    description: "terracotta smooth render finish, warm reddish-orange earthy tone, matte texture",
  },
  {
    value: "Ton pierre",
    label: "Ton pierre",
    color: "#A89880",
    description: "natural stone-grey smooth render finish, warm taupe-grey tone, matte texture resembling limestone",
  },
]

function buildPrompt(color: typeof STONE_COLORS[number]) {
  return `Edit this photo of a house exterior to apply a new professional render (crépi) finish on the facade walls only.

CRITICAL RULES:
- ONLY modify the exterior wall surfaces (facade, rendered walls)
- DO NOT alter windows, doors, shutters, roof, gutters, ground, sky, vegetation, or any other elements
- Preserve the exact same perspective, lighting, and shadows from the original photo
- The new render must blend naturally with the existing architectural elements and lighting conditions

RENDER FINISH — THIS IS THE MOST IMPORTANT PART:
- Material: Professional exterior render/crépi (enduit de façade)
- The finish is SMOOTH and UNIFORM — this is a modern thin-coat render, not rustic rough-cast
- The texture is fine and consistent across the entire wall surface
- Render color: ${color.description}
- The overall appearance is matte and elegant, with a subtle fine grain that catches light uniformly
- NO brush strokes, NO uneven patches, NO rough or pebble-dash texture
- The render covers the entire existing wall surface seamlessly, hiding the old material underneath

LIGHTING:
- Match the sun direction and shadow angles from the original photo
- The smooth render surface should have a subtle, uniform sheen where direct sunlight hits
- Maintain natural shadow gradients at wall edges and architectural details

The goal is a photorealistic visualization of a house facade renovated with a ${color.value} smooth exterior render finish (crépi).`
}

// Rotating tips, facts, and client reviews
const LOADING_MESSAGES = [
  // Client reviews
  { type: "review" as const, text: "On ne reconnaît plus notre maison, c'est comme une construction neuve !", author: "Marie", location: "Liège" },
  { type: "review" as const, text: "Le résultat est exactement ce qu'on avait vu sur la visualisation. Bluffant.", author: "Paul", location: "Luxembourg" },
  { type: "review" as const, text: "Nos voisins nous demandent tous l'adresse de l'entreprise ! Merci Resilux.", author: "Sophie", location: "Namur" },
  { type: "review" as const, text: "Façade refaite en deux jours, propre et sans poussière. Top.", author: "Thomas", location: "Arlon" },
  { type: "review" as const, text: "On hésitait entre plusieurs coloris. L'outil de visualisation nous a tout de suite convaincus.", author: "Catherine", location: "Bruxelles" },
  { type: "review" as const, text: "5 ans après la pose, toujours comme neuf. Le crépi tient parfaitement.", author: "Marc", location: "Wavre" },
  { type: "review" as const, text: "On a choisi Gris anthracite, c'est sublime. La maison a pris 20 ans de moins.", author: "Isabelle", location: "Esch-sur-Alzette" },
  { type: "review" as const, text: "Fini les façades jaunies et fissuréees. Le crépi a tout transformé.", author: "Jean-Pierre", location: "Mons" },
  // Product facts
  { type: "fact" as const, text: "Le crépi extérieur protège vos murs contre les intempéries, l'humidité et le gel." },
  { type: "fact" as const, text: "Résistant aux UV et aux variations thermiques — votre façade reste belle année après année." },
  { type: "fact" as const, text: "Un enduit de façade bien posé peut durer 20 à 30 ans sans intervention majeure." },
  { type: "fact" as const, text: "Rénover sa façade peut augmenter la valeur d'un bien immobilier jusqu'à 15%." },
  { type: "fact" as const, text: "Le crépi est disponible en finition lisse, gratté ou taloché selon le style souhaité." },
  { type: "fact" as const, text: "Plus de 50 coloris disponibles pour s'adapter à tous les styles architecturaux." },
  { type: "fact" as const, text: "Compatible avec tous les supports : béton, brique, parpaing, ancien crépi..." },
  { type: "fact" as const, text: "Un enduit minéral ou silicoxane assure une excellente résistance aux moisissures." },
  // Tips
  { type: "tip" as const, text: "Astuce : prenez votre photo en plein jour pour un résultat encore plus réaliste." },
  { type: "tip" as const, text: "Vous pouvez tester plusieurs coloris sur la même photo — essayez-les tous !" },
  { type: "tip" as const, text: "Envie d'un devis ? Contactez-nous avec votre visualisation préférée." },
]

function RotatingMessages() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * LOADING_MESSAGES.length))
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % LOADING_MESSAGES.length)
        setVisible(true)
      }, 400)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const msg = LOADING_MESSAGES[index]

  return (
    <div className={`transition-opacity duration-400 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        {msg.type === "review" ? (
          <div>
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-orange-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-700 italic mb-2">"{msg.text}"</p>
            <p className="text-xs text-gray-400">— {msg.author}, {msg.location}</p>
          </div>
        ) : msg.type === "fact" ? (
          <div className="flex gap-3 items-start">
            <span className="text-lg flex-shrink-0">💡</span>
            <p className="text-sm text-gray-600">{msg.text}</p>
          </div>
        ) : (
          <div className="flex gap-3 items-start">
            <span className="text-lg flex-shrink-0">✨</span>
            <p className="text-sm text-gray-600">{msg.text}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Sweep loading animation over the uploaded image
function SweepLoader({ image }: { image: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
      <img src={image} alt="En cours de traitement" className="w-full h-full object-cover" />
      <div className="absolute inset-0 sweep-overlay" />
    </div>
  )
}

// Demo carousel that auto-plays
function DemoCarousel({ autoPlay = false }: { autoPlay?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % DEMOS.length)
  }, [])

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + DEMOS.length) % DEMOS.length)
  }, [])

  useEffect(() => {
    if (!autoPlay) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [autoPlay, next])

  const demo = DEMOS[currentIndex]

  return (
    <div className="space-y-3">
      <Card className="p-3 overflow-hidden">
        <BeforeAfterSlider beforeImage={demo.before} afterImage={demo.after} />
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={prev}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>
          <div className="text-center">
            <span className="text-xs font-medium text-gray-600">{demo.label}</span>
            <div className="flex gap-1.5 justify-center mt-1.5">
              {DEMOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === currentIndex ? "bg-orange-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={next}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </Card>
    </div>
  )
}

export function ImageEditForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [processedImageData, setProcessedImageData] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState(STONE_COLORS[0].value)
  const [showDemo, setShowDemo] = useState(false)
  const [resultReady, setResultReady] = useState(false)
  const [quickTestLoading, setQuickTestLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleQuickTest = async () => {
    setQuickTestLoading(true)
    setError(null)
    setShowDemo(false)

    // Fake loading for 3 seconds to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setImagePreview(QUICK_TEST_DEMO.before)
    setResultImage(QUICK_TEST_DEMO.after)
    setResultReady(true)
    setQuickTestLoading(false)
  }

  const processImageForAPI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        const maxSize = 1024
        let width = img.width
        let height = img.height

        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }

        canvas.width = width
        canvas.height = height

        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, width, height)
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
          resolve(dataUrl)
        } else {
          reject(new Error("Failed to get canvas context"))
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      const reader = new FileReader()
      reader.onload = () => { img.src = reader.result as string }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 20 * 1024 * 1024) { setError("L'image doit faire moins de 20MB."); return }
      if (!file.type.includes("png") && !file.type.includes("jpeg") && !file.type.includes("jpg")) {
        setError("Veuillez uploader une image PNG ou JPEG."); return
      }

      setError(null)
      setResultImage(null)
      setProcessing(true)
      setShowDemo(false)
      setResultReady(false)

      try {
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
        const processedData = await processImageForAPI(file)
        setProcessedImageData(processedData)
      } catch (err: any) {
        setError("Erreur lors du traitement de l'image: " + err.message)
      } finally {
        setProcessing(false)
      }
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!processedImageData) return

    setLoading(true)
    setError(null)
    setResultImage(null)
    setResultReady(false)

    const color = STONE_COLORS.find((c) => c.value === selectedColor) || STONE_COLORS[0]

    try {
      const base64 = processedImageData.split(",")[1]
      const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
      const blob = new Blob([byteArray], { type: "image/jpeg" })
      const file = new File([blob], "terrace.jpg", { type: "image/jpeg" })

      const imageUrl = await fal.storage.upload(file)

      const result = await fal.subscribe("fal-ai/nano-banana-2/edit", {
        input: {
          prompt: buildPrompt(color),
          image_urls: [imageUrl],
          output_format: "png",
        },
        logs: true,
      })

      const outputUrl = (result.data as any)?.images?.[0]?.url
      if (!outputUrl) throw new Error("Aucune image retournée par Fal AI")

      const imgResponse = await fetch(outputUrl)
      const imgBlob = await imgResponse.blob()
      const blobUrl = URL.createObjectURL(imgBlob)
      setResultImage(blobUrl)
      setResultReady(true)
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Une erreur s'est produite lors du traitement de l'image")
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = () => {
    if (resultImage) {
      const link = document.createElement("a")
      link.href = resultImage
      link.download = "terrasse-revetement.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const resetAll = () => {
    setImagePreview(null)
    setProcessedImageData(null)
    setResultImage(null)
    setError(null)
    setShowDemo(false)
    setResultReady(false)
  }

  const selectedColorObj = STONE_COLORS.find((c) => c.value === selectedColor)

  // === QUICK TEST LOADING STATE ===
  if (quickTestLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center">
            <img src="/logo-resiluxai.png" alt="Logo ResiluxAI" className="mx-auto mb-1 w-28 h-28 object-contain" />
            <GlowAnimation />
            <p className="text-gray-500 text-sm">L'IA qui sublime votre façade en un clic</p>
          </div>
          <Card className="p-4">
            <SweepLoader image={QUICK_TEST_DEMO.before} />
            <div className="flex items-center justify-center gap-2 mt-3">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
              <span className="text-sm text-gray-600">Génération de l'exemple...</span>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // === LOADING STATE: sweep animation + demo carousel ===
  if (loading && imagePreview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center">
            <img src="/logo-resiluxai.png" alt="Logo ResiluxAI" className="mx-auto mb-1 w-28 h-28 object-contain" />
            <GlowAnimation />
            <p className="text-gray-500 text-sm">L'IA qui sublime votre façade en un clic</p>
          </div>

          {/* Sweep animation on uploaded image */}
          <Card className="p-4">
            <SweepLoader image={imagePreview} />
            <div className="flex items-center justify-center gap-2 mt-3">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
              <span className="text-sm text-gray-600">
                Application du revêtement <strong>{selectedColorObj?.label}</strong>...
              </span>
            </div>
          </Card>

          {/* Rotating messages: reviews, facts, tips */}
          <RotatingMessages />

          {/* Demo carousel while waiting */}
          <div>
            <p className="text-xs text-gray-400 text-center mb-2">
              Découvrez nos réalisations en attendant
            </p>
            <DemoCarousel autoPlay />
          </div>
        </div>
      </div>
    )
  }

  // === RESULT READY STATE ===
  if (resultReady && resultImage && imagePreview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center">
            <img src="/logo-resiluxai.png" alt="Logo ResiluxAI" className="mx-auto mb-1 w-28 h-28 object-contain" />
            <p className="text-gray-500 text-sm">L'IA qui sublime votre façade en un clic</p>
          </div>

          {/* Success banner */}
          <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-lg py-2.5 px-4">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Votre visualisation est prête !</span>
          </div>

          <Card className="p-3">
            <BeforeAfterSlider beforeImage={imagePreview} afterImage={resultImage} />
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={resetAll} variant="outline" className="w-full">
              Nouvelle Photo
            </Button>
            <Button onClick={downloadImage} className="w-full bg-orange-600 hover:bg-orange-700">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // === MAIN FORM STATE ===
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Header */}
        <div className="text-center">
          <img src="/logo-resiluxai.png" alt="Logo ResiluxAI" className="mx-auto mb-1 w-28 h-28 object-contain" />
          {processing && <GlowAnimation />}
          <p className="text-gray-500 text-sm">L'IA qui sublime votre façade en un clic</p>
        </div>

        {/* Demo carousel (toggled) */}
        {showDemo && (
          <div className="space-y-3">
            <DemoCarousel />
            <Button onClick={() => setShowDemo(false)} variant="outline" className="w-full text-sm">
              Fermer les exemples
            </Button>
          </div>
        )}

        {/* Image upload / preview */}
        <Card className="p-5">
          {!imagePreview ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Photo de votre terrasse
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageChange}
                disabled={processing}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                className="w-full flex items-center justify-center gap-2"
              >
                {processing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
                {processing ? "Traitement..." : "Prendre ou choisir une photo"}
              </Button>
              <button
                onClick={handleQuickTest}
                disabled={quickTestLoading}
                className="w-full mt-3 text-sm text-gray-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-1.5 py-1.5"
              >
                {quickTestLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Chargement de l'exemple...
                  </>
                ) : (
                  "Je n'ai pas de photo — essayer avec un exemple"
                )}
              </button>
            </div>
          ) : (
            <div>
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100 mb-3">
                <img src={imagePreview} alt="Original" className="w-full h-full object-cover" />
              </div>
              <Button onClick={resetAll} variant="outline" size="sm" className="w-full">
                Changer de photo
              </Button>
            </div>
          )}
        </Card>

        {/* Color selection */}
        <Card className="p-5">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Coloris du revêtement
          </label>
          <div className="grid grid-cols-4 gap-2">
            {STONE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSelectedColor(color.value)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  selectedColor === color.value
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-1.5 border border-gray-200"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-[10px] leading-tight font-medium block text-center text-gray-700">
                  {color.label}
                </span>
              </button>
            ))}
          </div>

          {selectedColorObj && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <div
                className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                style={{ backgroundColor: selectedColorObj.color }}
              />
              <span>{selectedColorObj.label}</span>
            </div>
          )}
        </Card>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !processedImageData}
          className="w-full h-12 text-base bg-orange-600 hover:bg-orange-700"
        >
          Appliquer le revêtement
        </Button>

        {/* Demo link */}
        {!imagePreview && !showDemo && (
          <button
            onClick={() => setShowDemo(true)}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors py-2"
          >
            <Eye className="h-4 w-4" />
            Voir des exemples avant / après
          </button>
        )}

        {/* Error */}
        {error && (
          <Card className="p-3 bg-red-50 border-red-200">
            <div className="text-red-600 text-sm text-center">{error}</div>
          </Card>
        )}
      </div>
    </div>
  )
}

function GlowAnimation() {
  return (
    <div className="relative flex justify-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8">
        <span className="block w-full h-full rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500 blur-2xl opacity-70 animate-glow" />
      </div>
    </div>
  )
}
