"use client"

import { useState, useRef, useEffect } from "react"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
}

export function BeforeAfterSlider({ beforeImage, afterImage }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      e.preventDefault()
      handleMove(e.touches[0].clientX)
    }
  }

  const handleStart = (clientX: number) => {
    setIsDragging(true)
    handleMove(clientX)
  }

  const handleEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleEnd)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleEnd)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleEnd)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleEnd)
    }
  }, [isDragging])

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 cursor-ew-resize select-none"
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      >
        {/* After Image (Background) */}
        <img
          src={afterImage || "/placeholder.svg"}
          alt="Après"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Before Image (Clipped) */}
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
          <img src={beforeImage || "/placeholder.svg"} alt="Avant" className="w-full h-full object-cover" />
        </div>

        {/* Slider Line */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10" style={{ left: `${sliderPosition}%` }}>
          {/* Slider Handle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-300 flex items-center justify-center">
            <div className="w-1 h-4 bg-gray-400 rounded-full" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium">
          AVANT
        </div>
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium">
          APRÈS
        </div>
      </div>

      <div className="text-center text-sm text-gray-600">Faites glisser pour comparer avant/après</div>
    </div>
  )
}
