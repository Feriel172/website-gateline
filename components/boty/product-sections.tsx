"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Aperture,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Droplets,
  Eye,
  Gem,
  Hourglass,
  Leaf,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Wind,
} from "lucide-react"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import type { BenefitIcon, FaqItem, ProductContent, Stat, Step, Testimonial } from "@/lib/product-content"

const ICONS: Record<BenefitIcon, React.ComponentType<{ className?: string }>> = {
  spark: Sparkles,
  pores: Aperture,
  sebum: Droplets,
  soothe: Leaf,
  hydrate: Droplet,
  firm: Gem,
  exfoliate: Wind,
  eyes: Eye,
  antiage: Hourglass,
  purify: ShieldCheck,
}

/** Shared section heading, so every block below the fold lines up. */
function SectionTitle({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-3xl md:text-4xl text-foreground">{title}</h2>
      {lead && <p className="text-muted-foreground mt-2">{lead}</p>}
    </div>
  )
}

// --- The promise strip, straight under the buy box ---

export function ProductPromise({ promise }: { promise: ProductContent["promise"] }) {
  if (!promise) return null

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card boty-shadow px-6 py-8 sm:px-10 flex items-center gap-5">
      <Sun className="w-8 h-8 text-primary flex-shrink-0" />
      <div>
        <h2 className="font-serif text-2xl md:text-3xl text-foreground">{promise.title}</h2>
        <p className="text-muted-foreground mt-1">{promise.subtitle}</p>
      </div>
    </div>
  )
}

// --- Full-width lifestyle image ---

export function ProductLifestyle({ lifestyle }: { lifestyle: ProductContent["lifestyle"] }) {
  if (!lifestyle) return null

  return (
    <section className="relative aspect-[4/5] sm:aspect-[21/9] rounded-3xl overflow-hidden">
      <Image
        src={lifestyle.image}
        alt=""
        fill
        className="object-cover"
        sizes="(min-width: 1280px) 1152px, 100vw"
      />
      {/* Gradient keeps the caption readable whatever the photo underneath */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
      <p className="absolute bottom-0 left-0 right-0 p-8 font-serif text-2xl sm:text-3xl text-background max-w-md">
        {lifestyle.caption}
      </p>
    </section>
  )
}

// --- Measured results: a draggable before / after, then the figures ---

function BeforeAfterSlide({
  image,
  panels = 2,
  labelsInImage,
  sizes,
}: {
  image: string
  panels?: number
  labelsInImage?: boolean
  sizes: string
}) {
  // One seam between each pair of stages: 50% for a before/after, 33% and 67%
  // for a three-stage progression.
  const seams = Array.from({ length: Math.max(0, panels - 1) }, (_, i) => ((i + 1) / panels) * 100)

  return (
    <div className="relative aspect-[2/1] sm:rounded-3xl overflow-hidden bg-card">
      <Image
        src={image}
        alt="Avant et après utilisation"
        fill
        className="object-cover"
        sizes={sizes}
        /* Skin detail falls apart at Next's default quality of 75 */
        quality={95}
      />
      {/* Older composites have the pills and the seam printed on them already */}
      {!labelsInImage && (
        <>
          {/* The panels are butted at even fractions, so each separator and its
              badge sit exactly on a seam. */}
          {seams.map((left) => (
            <span
              key={left}
              aria-hidden="true"
              className="absolute inset-y-0 -translate-x-1/2 w-1 bg-white"
              style={{ left: `${left}%` }}
            />
          ))}
          <span className="absolute top-3 left-3 rounded-full bg-foreground/85 text-background text-xs px-3 py-1">
            Avant
          </span>
          <span className="absolute top-3 right-3 rounded-full bg-background/90 text-foreground text-xs px-3 py-1">
            Après
          </span>
          {seams.map((left) => (
            <span
              key={left}
              aria-hidden="true"
              style={{ left: `${left}%` }}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-foreground flex items-center justify-center shadow-sm"
            >
              <ChevronLeft className="w-3 h-3 -mr-0.5" />
              <ChevronRight className="w-3 h-3 -ml-0.5" />
            </span>
          ))}
        </>
      )}
    </div>
  )
}

// One slide per photo, advancing on its own from left to right. A single photo
// renders as a plain card, with no arrows, dots or motion.
function BeforeAfterCarousel({
  images,
  sizes,
}: {
  images: { src: string; panels?: number; labelsInImage?: boolean }[]
  sizes: string
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  useEffect(() => {
    if (!api || paused) return
    // Someone who has asked for less motion gets the arrows and dots instead
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const timer = setInterval(() => api.scrollNext(), 4000)
    return () => clearInterval(timer)
  }, [api, paused])

  if (images.length === 0) return null
  if (images.length === 1) {
    return (
      <BeforeAfterSlide
        image={images[0].src}
        panels={images[0].panels}
        labelsInImage={images[0].labelsInImage}
        sizes={sizes}
      />
    )
  }

  return (
    <div
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setPaused(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setPaused(false)
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onTouchCancel={() => setPaused(false)}
    >
      <Carousel opts={{ loop: true, align: "start" }} setApi={setApi}>
        <CarouselContent className="-ml-0">
          {images.map((image) => (
            <CarouselItem key={image.src} className="pl-0">
              <BeforeAfterSlide
                image={image.src}
                panels={image.panels}
                labelsInImage={image.labelsInImage}
                sizes={sizes}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex items-center justify-center gap-2 mt-3">
        {images.map((image, i) => (
          <button
            key={image.src}
            type="button"
            onClick={() => api?.scrollTo(i)}
            aria-label={`Photo ${i + 1} sur ${images.length}`}
            aria-current={i === current}
            className={`h-1.5 rounded-full boty-transition ${
              i === current ? "w-6 bg-primary" : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function StatList({ stats, note }: { stats: Stat[]; note: string }) {
  return (
    <div className="rounded-3xl bg-card boty-shadow p-8 flex flex-col justify-center">
      <dl className="space-y-5">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-4">
            <dt className="font-serif text-4xl md:text-5xl text-foreground tabular-nums">
              {stat.value}
            </dt>
            <dd className="text-muted-foreground">{stat.label}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground mt-8 leading-relaxed">{note}</p>
    </div>
  )
}

// Compact variant for the narrow buy column, directly under the buttons: the
// same before/after shot and the same measured figures as the full section
// further down, stacked instead of side by side.
export function ProductResultsCompact({ results }: { results: ProductContent["results"] }) {
  if (!results) return null

  return (
    <section
      aria-labelledby="results-compact-title"
      className="sm:rounded-3xl bg-card/60 px-5 py-6 sm:p-6"
    >
      <h2 id="results-compact-title" className="font-serif text-2xl text-foreground mb-1">
        Des résultats visibles dès les premières semaines <br></br>
      </h2>
      <div className="-mx-5 sm:mx-0">
        <BeforeAfterCarousel
          images={results.images}
          sizes="(min-width: 1024px) 848px, 100vw"
        />
      </div>

      <dl className="grid grid-cols-3 gap-3 mt-3">
        {results.stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-background p-4 text-center flex flex-col items-center"
          >
            <dt className="font-serif text-2xl text-foreground tabular-nums">{stat.value}</dt>
            <dd className="text-xs text-muted-foreground leading-snug mt-1">{stat.label}</dd>
          </div>
        ))}
      </dl>

      <p className="text-[11px] text-muted-foreground leading-relaxed mt-4">{results.note}</p>
    </section>
  )
}



// --- Stage by stage results ---

interface MilestoneCard {
  src: string
  title: string
  description: string
  tags: string[]
}

export function ProductMilestones({ milestones }: { milestones?: MilestoneCard[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  useEffect(() => {
    if (!api || paused) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const timer = setInterval(() => api.scrollNext(), 4000)
    return () => clearInterval(timer)
  }, [api, paused])

  if (!milestones || milestones.length === 0) return null

  return (
    <section aria-labelledby="milestones-title">
      <h2
        id="milestones-title"
        className="font-serif text-3xl md:text-4xl text-foreground text-center mb-10"
      >
        Votre peau, semaine après semaine
      </h2>

      {/* Rotates on its own; stops as soon as someone interacts with it */}
      <div
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setPaused(true)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setPaused(false)
        }}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        onTouchCancel={() => setPaused(false)}
      >
        <Carousel opts={{ loop: true, align: "start" }} setApi={setApi}>
          <CarouselContent className="-ml-0">
            {milestones.map((stage) => (
              <CarouselItem key={stage.src} className="pl-0">
              <article>
                <div className="rounded-3xl overflow-hidden bg-card">
                  {/* Served at its own size and shape: cropping these loses the
                      detail that makes the result readable. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stage.src} alt={stage.title} loading="lazy" className="w-full h-auto" />
                </div>

                {/* Under the photo, never over it — on a before / after shot the
                    corner they used to sit in is the result itself. */}
                {stage.tags.length > 0 && (
                  <ul className="flex flex-wrap gap-2 mt-4">
                    {stage.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full bg-card text-foreground text-xs px-3 py-1.5"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
                <h3 className="font-serif text-xl md:text-2xl text-foreground mt-4 mb-2">
                  {stage.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{stage.description}</p>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
        </Carousel>
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {milestones.map((stage, i) => (
          <button
            key={stage.src}
            type="button"
            onClick={() => api?.scrollTo(i)}
            aria-label={`Photo ${i + 1} sur ${milestones.length}`}
            aria-current={i === current}
            className={`h-1.5 rounded-full boty-transition ${
              i === current ? "w-6 bg-primary" : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
            }`}
          />
        ))}
      </div>
    </section>
  )
}

// --- How to use it ---

export function ProductSteps({ steps }: { steps: Step[] }) {
  if (steps.length === 0) return null

  return (
    <section>
      <SectionTitle title="Comment l'utiliser ?" />
      <ol className="grid sm:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <li key={step.title} className="flex sm:flex-col items-start sm:items-center gap-5 sm:text-center">
            <div className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-full overflow-hidden flex-shrink-0 bg-card">
              <Image src={step.image} alt="" fill className="object-cover" sizes="144px" />
            </div>
            <div className="sm:mt-2">
              <div className="flex items-center sm:justify-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <h3 className="font-medium text-foreground">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

// --- Who it is for ---

export function ProductSkinTypes({ skinTypes }: { skinTypes: ProductContent["skinTypes"] }) {
  if (skinTypes.length === 0) return null

  return (
    <section>
      <SectionTitle title="Convient à tous les types de peau" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {skinTypes.map((type) => (
          <div key={type.label} className="flex flex-col items-center text-center gap-3">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {type.image ? (
                <Image src={type.image} alt="" fill className="object-cover" sizes="96px" />
              ) : (
                <Sparkles className="w-7 h-7 text-primary" />
              )}
            </div>
            <span className="text-sm text-foreground/80">{type.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// --- Why it is worth adopting ---

export function ProductBenefits({ benefits }: { benefits: ProductContent["benefits"] }) {
  if (benefits.length === 0) return null

  return (
    <section>
      <SectionTitle title="Pourquoi l'adopter ?" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {benefits.map((benefit) => {
          const Icon = ICONS[benefit.icon]
          return (
            <div
              key={benefit.label}
              className="flex items-center gap-4 lg:flex-col lg:text-center rounded-2xl bg-card boty-shadow p-6"
            >
              <Icon className="w-6 h-6 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground/80 leading-snug">{benefit.label}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// --- Frequently asked questions ---

export function ProductFaq({ faq }: { faq: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(null)

  if (faq.length === 0) return null

  return (
    <section>
      <SectionTitle title="Questions fréquentes" />
      <div className="border-t border-border/50">
        {faq.map((item) => {
          const isOpen = open === item.question
          return (
            <div key={item.question} className="border-b border-border/50">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.question)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-medium text-foreground">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 boty-transition ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div className={`overflow-hidden boty-transition ${isOpen ? "max-h-96 pb-5" : "max-h-0"}`}>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// --- What customers say ---

export function ProductTestimonials({
  testimonials,
  rating,
  reviewCount,
}: {
  testimonials: Testimonial[]
  rating: number
  reviewCount: number
}) {
  const [showAll, setShowAll] = useState(false)

  if (testimonials.length === 0) return null

  // One full row, then the rest behind the button
  const VISIBLE = 4
  const shown = showAll ? testimonials : testimonials.slice(0, VISIBLE)

  return (
    <section className="rounded-[2rem] bg-card/50 p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mb-8">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">
            Avis clients
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {rating.toLocaleString("fr-FR", { minimumFractionDigits: 1 })}/5 ({reviewCount} avis)
            </span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {shown.map((item) => (
          <figure key={item.name} className="rounded-3xl bg-background p-5 flex flex-col">
            <div className="mb-4">
              <div className="flex mb-1">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>
              <figcaption className="font-medium text-foreground leading-tight">
                {item.name}
              </figcaption>
              {item.since && <p className="text-xs text-muted-foreground mt-0.5">{item.since}</p>}
            </div>
            <blockquote className="text-sm text-muted-foreground leading-relaxed">
              “{item.quote}”
            </blockquote>

            {/* Photo the customer sent in with her review, served exactly as she
                sent it: no crop, no resize, no labels over it. */}
            {item.photo && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={item.photo}
                alt={`Avant et après partagés par ${item.name}`}
                loading="lazy"
                className="w-full h-auto rounded-xl mt-4"
              />
            )}
          </figure>
        ))}
      </div>

      {/* Sits under the last visible card and reveals the rest in place */}
      {testimonials.length > VISIBLE && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            aria-expanded={showAll}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm text-foreground hover:bg-foreground/5 boty-transition"
          >
            {showAll ? "Voir moins" : `Voir plus d'avis (${testimonials.length - VISIBLE})`}
            <ChevronDown className={`w-4 h-4 boty-transition ${showAll ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </section>
  )
}

// --- Closing brand note ---

export function ProductBrandBlock({ scene }: { scene: string | null }) {
  return (
    <section className="rounded-3xl bg-card boty-shadow overflow-hidden grid sm:grid-cols-2 items-center">
      {scene && (
        <div className="relative aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[260px]">
          <Image src={scene} alt="" fill className="object-cover" sizes="(min-width: 640px) 50vw, 100vw" />
        </div>
      )}
      
    </section>
  )
}
