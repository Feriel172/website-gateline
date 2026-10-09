"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Expand } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

interface ProductGalleryProps {
  images: string[]
  alt: string
  badge?: string | null
  /** Mirrors the layout for the Arabic page. */
  rtl?: boolean
}

const STRINGS = {
  fr: { zoom: "Agrandir l'image", thumb: "Voir l'image" },
  ar: { zoom: "تكبير الصورة", thumb: "عرض الصورة" },
} as const

export function ProductGallery({ images, alt, badge, rtl = false }: ProductGalleryProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const t = rtl ? STRINGS.ar : STRINGS.fr

  // Follow the carousel, however it was moved: swipe, drag or a thumbnail
  useEffect(() => {
    if (!api) return
    const onSelect = () => setIndex(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  // A different product reuses this component, so start its gallery at the top
  const key = images.join("|")
  useEffect(() => {
    api?.scrollTo(0, true)
    setIndex(0)
  }, [key, api])

  if (images.length === 0) return null

  const clamped = Math.min(index, images.length - 1)

  return (
    <div>
      <div className="relative rounded-3xl overflow-hidden bg-card boty-shadow">
        {/* Embla gives drag and swipe; the frame stays square either way */}
        <Carousel
          opts={{ loop: images.length > 1, direction: rtl ? "rtl" : "ltr" }}
          setApi={setApi}
        >
          <CarouselContent className="ml-0">
            {images.map((image, i) => (
              <CarouselItem key={image} className="pl-0">
                <div className="relative aspect-square">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={i === clamped ? alt : ""}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    priority={i === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

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
              onClick={() => api?.scrollTo(i)}
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
