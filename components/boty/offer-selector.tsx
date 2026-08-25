"use client"

import Image from "next/image"
import { Check } from "lucide-react"
import {
  type Pack,
  type PackVariant,
  availableOptions,
  findPackVariant,
  packUndiscountedTotal,
  productName,
} from "@/lib/orders"

// What the visitor is buying on a product page: the product on its own, or one
// of the packs that contains it.
export type Offer =
  | { kind: "single" }
  | { kind: "pack"; packId: string; choices: string[] }

const COPY = {
  fr: { title: "Votre formule", single: "Seul", currency: "DZD" },
  ar: { title: "اختاري صيغتك", single: "بمفرده", currency: "دج" },
}

export function offerVariant(offer: Offer): PackVariant | undefined {
  return offer.kind === "pack" ? findPackVariant(offer.packId, offer.choices) : undefined
}

export function defaultChoices(pack: Pack, preselect: string): string[] {
  return pack.slots.map((slot) => {
    const options = availableOptions(slot)
    return options.includes(preselect) ? preselect : options[0] ?? ""
  })
}

export function OfferSelector({
  productId,
  productPrice,
  productImage,
  packs,
  value,
  onChange,
  locale = "fr",
}: {
  productId: string
  productPrice: number
  productImage: string
  packs: Pack[]
  value: Offer
  onChange: (offer: Offer) => void
  locale?: "fr" | "ar"
}) {
  const t = COPY[locale]
  if (packs.length === 0) return null

  const selectedPack = value.kind === "pack" ? packs.find((p) => p.id === value.packId) : undefined

  return (
    <div className="mb-6">
      <label className="text-sm font-medium text-foreground mb-3 block">{t.title}</label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* the product on its own */}
        <button
          type="button"
          onClick={() => onChange({ kind: "single" })}
          className={`relative rounded-2xl border-2 p-3 text-left boty-transition ${
            value.kind === "single"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-foreground/30"
          }`}
        >
          <span className="relative block w-full aspect-[4/3] rounded-xl overflow-hidden bg-background mb-2">
            <Image src={productImage} alt="" fill className="object-contain p-1" sizes="160px" />
          </span>
          <span className="block text-sm font-medium text-foreground">{t.single}</span>
          <span className="block text-base font-semibold text-foreground mt-1">
            {productPrice} {t.currency}
          </span>
          {value.kind === "single" && (
            <Check className="absolute top-2 right-2 z-10 w-4 h-4 text-primary" />
          )}
        </button>

        {packs.map((pack) => {
          const variant = findPackVariant(pack.id, defaultChoices(pack, productId))
          const saving = variant ? packUndiscountedTotal(variant) - pack.price : 0
          const active = value.kind === "pack" && value.packId === pack.id

          return (
            <button
              key={pack.id}
              type="button"
              onClick={() => onChange({ kind: "pack", packId: pack.id, choices: defaultChoices(pack, productId) })}
              className={`relative rounded-2xl border-2 p-3 text-left boty-transition ${
                active ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"
              }`}
            >
              {saving > 0 && (
                <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] whitespace-nowrap shadow">
                  −{saving} {t.currency}
                </span>
              )}
              <span className="relative block w-full aspect-[4/3] rounded-xl overflow-hidden bg-background mb-2">
                <Image
                  src={pack.image}
                  alt=""
                  fill
                  className="object-contain p-1"
                  sizes="160px"
                />
              </span>
              <span className="block text-sm font-medium text-foreground leading-snug">
                {locale === "ar" ? pack.nameAr : pack.name}
              </span>
              <span className="block text-base font-semibold text-foreground mt-1">
                {pack.price} {t.currency}
              </span>
              {active && <Check className="absolute top-2 right-2 z-10 w-4 h-4 text-primary" />}
            </button>
          )
        })}
      </div>

      {/* choices for the selected pack */}
      {selectedPack && selectedPack.slots.length > 0 && (
        <div className="mt-3 space-y-2 rounded-2xl bg-muted/40 p-3">
          {selectedPack.slots.map((slot, index) => (
            <div key={slot.label}>
              <label className="text-xs text-foreground/70 mb-1 block">
                {locale === "ar" ? slot.labelAr : slot.label}
              </label>
              <select
                value={(value as { choices: string[] }).choices[index] ?? ""}
                onChange={(e) =>
                  onChange({
                    kind: "pack",
                    packId: selectedPack.id,
                    choices: (value as { choices: string[] }).choices.map((c, i) =>
                      i === index ? e.target.value : c
                    ),
                  })
                }
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                {availableOptions(slot).map((id) => (
                  <option key={id} value={id}>
                    {productName(id, locale)}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-1">
            {selectedPack.includes.map((id) => productName(id, locale)).join(" + ")}
          </p>
        </div>
      )}
    </div>
  )
}
