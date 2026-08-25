"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingBag, Check } from "lucide-react"
import { useCart } from "./cart-context"
import {
  type Pack,
  availableOptions,
  findPackVariant,
  packUndiscountedTotal,
  packVariantName,
  productName,
} from "@/lib/orders"

const COPY = {
  fr: { badge: "PACK", add: "Ajouter", added: "Ajouté", save: (n: number) => `Économisez ${n} DZD` },
  ar: { badge: "باك", add: "أضف", added: "أُضيف", save: (n: number) => `توفّر ${n} دج` },
}

// Same shell as a product card so packs sit in the shop grid without standing out
export function PackCard({
  pack,
  locale = "fr",
  preselect,
}: {
  pack: Pack
  locale?: "fr" | "ar"
  // Product the visitor is already looking at: picked by default in any slot
  // that offers it, so the pack reads as "the same thing, plus more, for less"
  preselect?: string
}) {
  const t = COPY[locale]
  const rtl = locale === "ar"
  const { addItem } = useCart()

  const [choices, setChoices] = useState<string[]>(() =>
    pack.slots.map((slot) => {
      const options = availableOptions(slot)
      if (preselect && options.includes(preselect)) return preselect
      return options[0] ?? ""
    })
  )
  const [added, setAdded] = useState(false)

  const variant = findPackVariant(pack.id, choices)
  const fullPrice = variant ? packUndiscountedTotal(variant) : 0
  const saving = fullPrice - pack.price

  const handleAdd = () => {
    if (!variant) return
    addItem({
      id: variant.id,
      name: packVariantName(variant, locale),
      description: locale === "ar" ? pack.descriptionAr : pack.description,
      price: pack.price,
      image: pack.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div
      dir={rtl ? "rtl" : undefined}
      className={`group bg-card rounded-3xl overflow-hidden boty-shadow h-full flex flex-col ${rtl ? "font-cairo" : ""}`}
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        <Image
          src={pack.image}
          alt={locale === "ar" ? pack.nameAr : pack.name}
          fill
          className="object-cover boty-transition group-hover:scale-105"
        />
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-primary text-primary-foreground">
          {t.badge}
        </span>
      </div>

      <div className="p-3 sm:p-6 flex flex-col flex-1">
        <h3 className={`text-base sm:text-xl text-foreground mb-1 leading-snug ${rtl ? "font-semibold" : "font-serif"}`}>
          {locale === "ar" ? pack.nameAr : pack.name}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3">
          {locale === "ar" ? pack.descriptionAr : pack.description}
        </p>

        {pack.slots.map((slot, index) => (
          <select
            key={slot.label}
            value={choices[index] ?? ""}
            aria-label={locale === "ar" ? slot.labelAr : slot.label}
            onChange={(e) =>
              setChoices((current) => current.map((c, i) => (i === index ? e.target.value : c)))
            }
            className="mb-2 h-9 w-full rounded-lg border border-input bg-background px-2 text-xs sm:text-sm"
          >
            {availableOptions(slot).map((id) => (
              <option key={id} value={id}>
                {productName(id, locale)}
              </option>
            ))}
          </select>
        ))}

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-medium text-foreground">{pack.price} DZD</span>
            {saving > 0 && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">{fullPrice} DZD</span>
            )}
          </div>
          {saving > 0 && <p className="text-[11px] sm:text-xs text-primary mt-0.5">{t.save(saving)}</p>}

          <button
            type="button"
            onClick={handleAdd}
            disabled={!variant}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full text-xs sm:text-sm tracking-wide boty-transition hover:bg-primary/90 disabled:opacity-50"
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            {added ? t.added : t.add}
          </button>
        </div>
      </div>
    </div>
  )
}
