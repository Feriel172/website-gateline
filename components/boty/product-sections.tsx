"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Aperture,
  ChevronDown,
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
import type { Active, BenefitIcon, FaqItem, ProductContent, Stat, Step, Testimonial } from "@/lib/product-content"

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

function BeforeAfter({ image }: { image: string }) {
  return (
    <div className="relative aspect-[2/1] rounded-3xl overflow-hidden bg-card">
      {/* Composite shot: the Avant / Après labels are part of the image */}
      <Image
        src={image}
        alt="Avant et après 4 semaines d'utilisation"
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
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

export function ProductResults({ results }: { results: ProductContent["results"] }) {
  if (!results) return null

  return (
    <section>
      <SectionTitle title="Des résultats réels" lead="Des milliers de clientes ont déjà vu la différence." />
      <div className="grid lg:grid-cols-2 gap-6">
        <BeforeAfter image={results.image} />
        <StatList stats={results.stats} note={results.note} />
      </div>
    </section>
  )
}

// --- The actives doing the work ---

export function ProductActives({ actives }: { actives: Active[] }) {
  if (actives.length === 0) return null

  return (
    <section>
      <SectionTitle title="Des actifs puissants pour une peau plus saine" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {actives.map((active) => (
          <article key={active.name} className="rounded-3xl overflow-hidden bg-card boty-shadow">
            <div className="relative aspect-[16/10]">
              <Image
                src={active.image}
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="p-6">
              <h3 className="font-serif text-xl text-foreground mb-2">{active.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{active.description}</p>
            </div>
          </article>
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
  if (testimonials.length === 0) return null

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">Témoignages clients</h2>
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((item) => (
          <figure key={item.name} className="rounded-3xl overflow-hidden bg-card boty-shadow">
            <div className="relative aspect-[2/1]">
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <figcaption className="p-5">
              <div className="flex mb-2">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-sm text-foreground/80 leading-relaxed mb-3">
                “{item.quote}”
              </blockquote>
              <cite className="text-xs text-muted-foreground not-italic">{item.name}</cite>
            </figcaption>
          </figure>
        ))}
      </div>
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
      <div className="px-8 py-12 text-center">
        <h2 className="font-serif text-3xl text-foreground mb-2">Gateline Cosmetics</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Des soins simples pour une peau plus belle, au naturel.
        </p>
      </div>
    </section>
  )
}
