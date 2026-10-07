"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface ProductGalleryProps {
  images: string[]
  alt: string
  badge?: string | null
  /** Mirrors the layout for the Arabic page. */
  rtl?: boolean
}

const STRINGS = {
  fr: { previous: "Image précédente", next: "Image suivante", zoom: "Agrandir l'image", thumb: "Voir l'image" },
  ar: { previous: "الصورة السابقة", next: "الصورة التالية", zoom: "تكبير الصورة", thumb: "عرض الصورة" },
} as const

export function ProductGallery({ images, alt, badge, rtl = false }: ProductGalleryProps) {
  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const t = rtl ? STRINGS.ar : STRINGS.fr

  // A different product reuses this component, so start its gallery at the top
  useEffect(() => {
    setIndex(0)
  }, [images])

  if (images.length === 0) return null

  const clamped = Math.min(index, images.length - 1)
  const step = (delta: number) =>
    setIndex((current) => (current + delta + images.length) % images.length)

  // In RTL the on-screen arrows swap meaning: the "previous" control sits right
  const prevDelta = rtl ? 1 : -1

  return (
    <div>
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-card boty-shadow group">
        <Image
          src={images[clamped] || "/placeholder.svg"}
          alt={alt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />

        {badge && (
          <span className="absolute top-4 start-4 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground">
            {badge}
          </span>
        )}

        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={t.zoom}
          className="absolute top-4 end-4 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground boty-transition"
        >
          <Expand className="w-4 h-4" />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(prevDelta)}
              aria-label={t.previous}
              className="absolute start-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground boty-transition opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => step(-prevDelta)}
              aria-label={t.next}
              className="absolute end-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground boty-transition opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="grid gap-3 mt-3"
          style={{ gridTemplateColumns: `repeat(${images.length}, minmax(0, 1fr))` }}
        >
          {images.map((image, i) => (
            <button
              key={image}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${t.thumb} ${i + 1}`}
              aria-current={i === clamped}
              className={`relative aspect-square rounded-2xl overflow-hidden bg-card boty-transition ${
                i === clamped ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={image} alt="" fill className="object-cover" sizes="20vw" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={zoomed} onOpenChange={setZoomed}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-card">
            <Image src={images[clamped]} alt={alt} fill className="object-contain" sizes="100vw" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
