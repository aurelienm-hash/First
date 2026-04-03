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

const CREPI_TYPES = [
  {
    value: "Gratté",
    label: "Gratté",
    description: "scraped render texture (crépi gratté): uniform fine-scratched surface with a consistent linear grain, achieved by scraping the render while still fresh. Small aggregates visible, giving a slightly rough but regular texture.",
    subtitle: "Surface striée fine et régulière",
  },
  {
    value: "Ecrasé",
    label: "Ecrasé",
    description: "crushed render texture (crépi écrasé): irregular rough surface with visible crushed aggregates, natural rustic appearance with uneven relief and varied grain sizes.",
    subtitle: "Relief irrégulier et rustique",
  },
  {
    value: "Taloché",
    label: "Taloché",
    description: "floated render texture (crépi taloché): semi-smooth surface with a fine uniform circular pattern, achieved by floating the render. Slightly grainy but even, between smooth and rough finish.",
    subtitle: "Aspect semi-lisse et uniforme",
  },
  {
    value: "Projeté",
    label: "Projeté",
    description: "spray-applied render texture (crépi projeté): irregular bumpy surface with randomly distributed small aggregates, applied by spraying. Uniform coverage with a natural rough relief.",
    subtitle: "Bosses aléatoires projetées",
  },
  {
    value: "Lissé",
    label: "Lissé",
    description: "smooth render finish (crépi lissé): perfectly flat and smooth surface with no visible grain or texture, clean and modern appearance.",
    subtitle: "Surface parfaitement plate",
  },
  {
    value: "Ribbé",
    label: "Ribbé",
    description: "ribbed render texture (crépi ribbé): regular parallel horizontal grooves creating a striped pattern, achieved with a comb tool. Uniform directional texture.",
    subtitle: "Rainures parallèles régulières",
  },
]

function TexturePreview({ type }: { type: string }) {
  const size = 64
  switch (type) {
    case "Gratté":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className="rounded-lg">
          <rect width="64" height="64" fill="#e8e0d4" />
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={i} x1="0" y1={i * 3.2 + Math.sin(i) * 0.5} x2="64" y2={i * 3.2 + Math.cos(i) * 0.5} stroke="#cdc3b4" strokeWidth="0.8" opacity="0.7" />
          ))}
          {Array.from({ length: 40 }).map((_, i) => (
            <circle key={`d${i}`} cx={Math.random() * 64} cy={Math.random() * 64} r="0.5" fill="#b8ad9c" opacity="0.5" />
          ))}
        </svg>
      )
    case "Ecrasé":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className="rounded-lg">
          <rect width="64" height="64" fill="#d4c9b8" />
          {Array.from({ length: 25 }).map((_, i) => (
            <ellipse key={i} cx={8 + (i % 5) * 12 + Math.sin(i * 3) * 4} cy={6 + Math.floor(i / 5) * 13 + Math.cos(i * 2) * 3} rx={4 + Math.sin(i) * 2} ry={3 + Math.cos(i) * 1.5} fill="#c4b8a4" stroke="#b0a48e" strokeWidth="0.5" opacity="0.8" />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <path key={`p${i}`} d={`M${10 + i * 4},${20 + Math.sin(i) * 15} q${3},${-2} ${5},${1}`} fill="none" stroke="#a89880" strokeWidth="0.6" opacity="0.5" />
          ))}
        </svg>
      )
    case "Taloché":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className="rounded-lg">
          <rect width="64" height="64" fill="#e2dbd0" />
          {Array.from({ length: 12 }).map((_, i) => (
            <circle key={i} cx={10 + (i % 4) * 16} cy={10 + Math.floor(i / 4) * 18} r={8 + Math.sin(i) * 2} fill="none" stroke="#c8bfb2" strokeWidth="0.6" opacity="0.5" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={`a${i}`} d={`M${5 + i * 8},${32} a${10},${10} 0 0,1 ${12},${-4}`} fill="none" stroke="#d0c6b8" strokeWidth="0.8" opacity="0.4" />
          ))}
        </svg>
      )
    case "Projeté":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className="rounded-lg">
          <rect width="64" height="64" fill="#c8a050" />
          {Array.from({ length: 80 }).map((_, i) => (
            <circle key={i} cx={Math.random() * 64} cy={Math.random() * 64} r={0.8 + Math.random() * 1.8} fill={Math.random() > 0.5 ? "#b8903c" : "#d4ad5e"} opacity={0.4 + Math.random() * 0.4} />
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <circle key={`s${i}`} cx={Math.random() * 64} cy={Math.random() * 64} r={0.3 + Math.random() * 0.6} fill="#a07830" opacity="0.6" />
          ))}
        </svg>
      )
    case "Lissé":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className="rounded-lg">
          <defs>
            <linearGradient id="lisse" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f0e8d8" />
              <stop offset="50%" stopColor="#ece4d2" />
              <stop offset="100%" stopColor="#f2eade" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill="url(#lisse)" />
          <rect width="64" height="64" fill="#e8dfd0" opacity="0.3" />
        </svg>
      )
    case "Ribbé":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className="rounded-lg">
          <rect width="64" height="64" fill="#e0dcd6" />
          {Array.from({ length: 16 }).map((_, i) => (
            <rect key={i} x="0" y={i * 4} width="64" height="2" fill="#ccc8c0" rx="0.5" opacity="0.7" />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <rect key={`s${i}`} x="0" y={i * 4 + 2} width="64" height="1.5" fill="#d8d4cc" rx="0.5" opacity="0.4" />
          ))}
        </svg>
      )
    default:
      return null
  }
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

function buildPrompt(color: typeof STONE_COLORS[number], type: typeof CREPI_TYPES[number]) {
  return `Edit this photo of a house exterior to apply a new professional render (crépi) finish on the facade walls only.

CRITICAL RULES:
- ONLY modify the exterior wall surfaces (facade, rendered walls)
- DO NOT alter windows, doors, shutters, roof, gutters, ground, sky, vegetation, or any other elements
- Preserve the exact same perspective, lighting, and shadows from the original photo
- The new render must blend naturally with the existing architectural elements and lighting conditions

RENDER FINISH — THIS IS THE MOST IMPORTANT PART:
- Material: Professional exterior render/crépi (enduit de façade)
- Texture type: ${type.description}
- Color: ${color.description}
- The render covers the entire existing wall surface seamlessly, hiding the old material underneath
- The texture must be consistent and uniform across the entire facade

LIGHTING:
- Match the sun direction and shadow angles from the original photo
- The render surface texture should interact naturally with the light direction
- Maintain natural shadow gradients at wall edges and architectural details

The goal is a photorealistic visualization of a house facade renovated with a ${color.value} ${type.value.toLowerCase()} exterior render finish (crépi ${type.value.toLowerCase()}).`
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
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
        {msg.type === "review" ? (
          <div>
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-blue-100 italic mb-2">"{msg.text}"</p>
            <p className="text-xs text-blue-300/60">— {msg.author}, {msg.location}</p>
          </div>
        ) : msg.type === "fact" ? (
          <div className="flex gap-3 items-start">
            <span className="text-lg flex-shrink-0">💡</span>
            <p className="text-sm text-blue-100">{msg.text}</p>
          </div>
        ) : (
          <div className="flex gap-3 items-start">
            <span className="text-lg flex-shrink-0">✨</span>
            <p className="text-sm text-blue-100">{msg.text}</p>
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
                    i === currentIndex ? "bg-blue-500" : "bg-gray-300"
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
  const [selectedType, setSelectedType] = useState(CREPI_TYPES[0].value)
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
    const type = CREPI_TYPES.find((t) => t.value === selectedType) || CREPI_TYPES[0]

    try {
      const base64 = processedImageData.split(",")[1]
      const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
      const blob = new Blob([byteArray], { type: "image/jpeg" })
      const file = new File([blob], "facade.jpg", { type: "image/jpeg" })

      const imageUrl = await fal.storage.upload(file)

      const result = await fal.subscribe("fal-ai/nano-banana-2/edit", {
        input: {
          prompt: buildPrompt(color, type),
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
      link.download = "facade-crepi.png"
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
  const selectedTypeObj = CREPI_TYPES.find((t) => t.value === selectedType)

  // === QUICK TEST LOADING STATE ===
  if (quickTestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center">
            <img src="/logo-resiluxai.png" alt="Logo ResiluxAI" className="mx-auto mb-1 w-28 h-28 object-contain" />
            <GlowAnimation />
            <p className="text-blue-200 text-sm">L'IA qui sublime votre façade en un clic</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4">
            <SweepLoader image={QUICK_TEST_DEMO.before} />
            <div className="flex items-center justify-center gap-2 mt-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-300" />
              <span className="text-sm text-blue-100">Génération de l'exemple...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // === LOADING STATE: sweep animation + demo carousel ===
  if (loading && imagePreview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center">
            <img src="/logo-resiluxai.png" alt="Logo ResiluxAI" className="mx-auto mb-1 w-28 h-28 object-contain" />
            <GlowAnimation />
            <p className="text-blue-200 text-sm">L'IA qui sublime votre façade en un clic</p>
          </div>

          {/* Sweep animation on uploaded image */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4">
            <SweepLoader image={imagePreview} />
            <div className="flex items-center justify-center gap-2 mt-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-300" />
              <span className="text-sm text-blue-100">
                Application du crépi <strong>{selectedTypeObj?.label}</strong> — <strong>{selectedColorObj?.label}</strong>...
              </span>
            </div>
          </div>

          {/* Rotating messages: reviews, facts, tips */}
          <RotatingMessages />

          {/* Demo carousel while waiting */}
          <div>
            <p className="text-xs text-blue-300/60 text-center mb-2">
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center">
            <img src="/logo-resiluxai.png" alt="Logo ResiluxAI" className="mx-auto mb-1 w-28 h-28 object-contain" />
            <p className="text-blue-200 text-sm">L'IA qui sublime votre façade en un clic</p>
          </div>

          {/* Success banner */}
          <div className="flex items-center justify-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl py-2.5 px-4 backdrop-blur-sm">
            <Check className="h-4 w-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-200">Votre visualisation est prête !</span>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-3">
            <BeforeAfterSlider beforeImage={imagePreview} afterImage={resultImage} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={resetAll} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              Nouvelle Photo
            </Button>
            <Button onClick={downloadImage} className="w-full bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25">
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="text-center">
          <img src="/logo-resiluxai.png" alt="Logo ResiluxAI" className="mx-auto mb-1 w-28 h-28 object-contain" />
          {processing && <GlowAnimation />}
          <p className="text-blue-200 text-sm">L'IA qui sublime votre façade en un clic</p>
        </div>

        {/* Demo carousel (toggled) */}
        {showDemo && (
          <div className="space-y-3">
            <DemoCarousel />
            <Button onClick={() => setShowDemo(false)} variant="outline" className="w-full text-sm border-white/20 text-white hover:bg-white/10">
              Fermer les exemples
            </Button>
          </div>
        )}

        {/* Image upload / preview */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-5">
          {!imagePreview ? (
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-3">
                Photo de votre façade
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
                className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
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
                className="w-full mt-3 text-sm text-blue-300/70 hover:text-white transition-colors flex items-center justify-center gap-1.5 py-1.5"
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
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black/20 mb-3">
                <img src={imagePreview} alt="Original" className="w-full h-full object-cover" />
              </div>
              <Button onClick={resetAll} variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10">
                Changer de photo
              </Button>
            </div>
          )}
        </div>

        {/* Finish type selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-5">
          <label className="block text-sm font-medium text-blue-100 mb-3">
            Type de finition
          </label>
          <div className="grid grid-cols-3 gap-3">
            {CREPI_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedType(type.value)}
                className={`rounded-xl border-2 transition-all overflow-hidden ${
                  selectedType === type.value
                    ? "border-blue-400 ring-2 ring-blue-400/30"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <div className="w-full flex justify-center pt-2 px-2">
                  <TexturePreview type={type.value} />
                </div>
                <div className="p-2 text-center">
                  <span className={`text-xs font-semibold block ${selectedType === type.value ? "text-white" : "text-blue-200"}`}>{type.label}</span>
                </div>
              </button>
            ))}
          </div>
          {selectedTypeObj && (
            <p className="mt-3 text-[11px] text-blue-300/60 leading-snug text-center">{selectedTypeObj.subtitle}</p>
          )}
        </div>

        {/* Color selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-5">
          <label className="block text-sm font-medium text-blue-100 mb-3">
            Coloris du crépi
          </label>
          <div className="grid grid-cols-4 gap-2">
            {STONE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSelectedColor(color.value)}
                className={`p-2 rounded-xl border-2 transition-all ${
                  selectedColor === color.value
                    ? "border-blue-400 bg-blue-500/30"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-1.5 border border-white/20 shadow-inner"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-[10px] leading-tight font-medium block text-center text-blue-100">
                  {color.label}
                </span>
              </button>
            ))}
          </div>

          {selectedColorObj && (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-200">
              <div
                className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                style={{ backgroundColor: selectedColorObj.color }}
              />
              <span>{selectedColorObj.label}</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !processedImageData}
          className="w-full h-12 text-base bg-blue-500 hover:bg-blue-400 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-40 disabled:shadow-none"
        >
          Appliquer le crépi
        </Button>

        {/* Demo link */}
        {!imagePreview && !showDemo && (
          <button
            onClick={() => setShowDemo(true)}
            className="w-full flex items-center justify-center gap-2 text-sm text-blue-300/60 hover:text-white transition-colors py-2"
          >
            <Eye className="h-4 w-4" />
            Voir des exemples avant / après
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-red-200 text-sm text-center">{error}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function GlowAnimation() {
  return (
    <div className="relative flex justify-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8">
        <span className="block w-full h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-500 blur-2xl opacity-70 animate-glow" />
      </div>
    </div>
  )
}
