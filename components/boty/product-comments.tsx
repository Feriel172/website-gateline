"use client"

import { useState } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { fr, arDZ } from "date-fns/locale"
import { MessageCircle } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { reviewsFor } from "@/lib/reviews"

type Locale = "fr" | "ar"

const STRINGS = {
  fr: { title: "Avis clients", photoAlt: "Photo de l'avis" },
  ar: { title: "آراء العملاء", photoAlt: "صورة الرأي" },
} as const

const DATE_LOCALES = { fr, ar: arDZ } as const

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase()
}

// Read-only: the reviews come from lib/reviews.ts, edited by hand
export function ProductComments({ productId, locale }: { productId: string; locale: Locale }) {
  const reviews = reviewsFor(productId)
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (reviews.length === 0) return null

  const t = STRINGS[locale]
  const dateLocale = DATE_LOCALES[locale]
  const rtl = locale === "ar"

  return (
    <section
      dir={rtl ? "rtl" : "ltr"}
      className={`mt-10 ${rtl ? "font-cairo" : ""}`}
      aria-labelledby="product-comments-title"
    >
      <div className="border-t border-border/50 pt-8">
        <h2
          id="product-comments-title"
          className={`${rtl ? "font-cairo font-semibold" : "font-serif"} text-xl md:text-2xl text-foreground mb-6 flex items-center gap-3`}
        >
          <MessageCircle className="w-5 h-5 text-primary" />
          {t.title}
          <span className="text-base font-sans font-normal text-muted-foreground">({reviews.length})</span>
        </h2>

        <ul className="space-y-8">
          {reviews.map((review, index) => {
            const body = rtl && review.bodyAr ? review.bodyAr : review.body
            const images = review.images ?? []

            return (
              <li key={index} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium shrink-0">
                  {initial(review.author)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                    <span className="font-medium text-foreground">{review.author}</span>
                    <time dateTime={review.date} className="text-xs text-muted-foreground">
                      {format(new Date(review.date), "d MMMM yyyy", { locale: dateLocale })}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line break-words">
                    {body}
                  </p>
                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {images.map((src) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setLightbox(src)}
                          className="relative w-24 h-24 rounded-lg overflow-hidden border border-border/50 boty-transition hover:opacity-90"
                        >
                          <Image src={src} alt={t.photoAlt} fill sizes="96px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <Dialog open={lightbox !== null} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="max-w-3xl p-2 bg-background">
          <DialogTitle className="sr-only">{t.photoAlt}</DialogTitle>
          {lightbox && (
            <div className="relative w-full h-[80vh]">
              <Image src={lightbox} alt={t.photoAlt} fill sizes="100vw" className="object-contain rounded-lg" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
