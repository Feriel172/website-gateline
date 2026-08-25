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
  fr: {
    badge: "PACK",
    includes: "Inclus",
    add: "Ajouter au panier",
    added: "Ajouté au panier",
    save: (amount: number) => `Vous économisez ${amount} DZD`,
    instead: (amount: number) => `au lieu de ${amount} DZD`,
  },
  ar: {
    badge: "باك",
    includes: "يشمل",
    add: "أضف إلى السلة",
    added: "أُضيف إلى السلة",
    save: (amount: number) => `توفّر ${amount} دج`,
    instead: (amount: number) => `بدلاً من ${amount} دج`,
  },
}

export function PackCard({ pack, locale = "fr" }: { pack: Pack; locale?: "fr" | "ar" }) {
  const t = COPY[locale]
  const rtl = locale === "ar"
  const { addItem } = useCart()

  // One selection per slot, defaulting to its first in-stock option
  const [choices, setChoices] = useState<string[]>(() =>
    pack.slots.map((slot) => availableOptions(slot)[0] ?? "")
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
      className={`bg-background rounded-3xl overflow-hidden boty-shadow flex flex-col ${rtl ? "font-cairo" : ""}`}
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <Image src={pack.image} alt={locale === "ar" ? pack.nameAr : pack.name} fill className="object-cover" />
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-primary text-primary-foreground">
          {t.badge}
        </span>
      </div>

      <div className="p-6 flex flex-col gap-4 flex-1">
        <div>
          <h3 className={`text-xl text-foreground mb-1 ${rtl ? "font-cairo font-semibold" : "font-serif"}`}>
            {locale === "ar" ? pack.nameAr : pack.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {locale === "ar" ? pack.descriptionAr : pack.description}
          </p>
        </div>

        {pack.includes.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {t.includes} :{" "}
            {pack.includes.map((id) => productName(id, locale)).join(" + ")}
          </p>
        )}

        {pack.slots.map((slot, index) => (
          <div key={slot.label} className="space-y-1">
            <label className="text-xs text-foreground/70">
              {locale === "ar" ? slot.labelAr : slot.label}
            </label>
            <select
              value={choices[index] ?? ""}
              onChange={(e) =>
                setChoices((current) => current.map((c, i) => (i === index ? e.target.value : c)))
              }
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              {availableOptions(slot).map((id) => (
                <option key={id} value={id}>
                  {productName(id, locale)}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-medium text-foreground">{pack.price} DZD</span>
            {saving > 0 && (
              <span className="text-sm text-muted-foreground line-through">{t.instead(fullPrice)}</span>
            )}
          </div>
          {saving > 0 && <p className="text-xs text-primary mb-3">{t.save(saving)}</p>}

          <button
            type="button"
            onClick={handleAdd}
            disabled={!variant}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm tracking-wide boty-transition hover:bg-primary/90 disabled:opacity-50"
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            {added ? t.added : t.add}
          </button>
        </div>
      </div>
    </div>
  )
}
