"use client"

import { useEffect, useState, type RefObject } from "react"
import Image from "next/image"
import { Check, Minus, Plus } from "lucide-react"

interface ProductStickyBarProps {
  name: string
  price: number
  image: string
  quantity: number
  onQuantityChange: (quantity: number) => void
  onAddToCart: () => void
  soldOut: boolean
  isAdded: boolean
  /** The bar appears once this element — the main buy box — scrolls out of view. */
  triggerRef: RefObject<HTMLElement | null>
}

export function ProductStickyBar({
  name,
  price,
  image,
  quantity,
  onQuantityChange,
  onAddToCart,
  soldOut,
  isAdded,
  triggerRef,
}: ProductStickyBarProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = triggerRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only once the buy box has scrolled off the top, never before it
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0)
      },
      { threshold: 0 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [triggerRef])

  return (
    <div
      aria-hidden={!visible}
      className={`fixed bottom-0 inset-x-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur-md boty-transition ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-card flex-shrink-0">
          <Image src={image} alt="" fill className="object-cover" sizes="48px" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{name}</p>
          <p className="text-sm text-muted-foreground">{price} DZD</p>
        </div>

        {/* The quantity stepper is a nicety; it gives way to the button on phones */}
        <div className="hidden sm:inline-flex items-center gap-2 bg-card rounded-full p-1">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
            aria-label="Diminuer la quantité"
            tabIndex={visible ? 0 : -1}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-6 text-center text-sm font-medium text-foreground">{quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
            aria-label="Augmenter la quantité"
            tabIndex={visible ? 0 : -1}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={soldOut}
          tabIndex={visible ? 0 : -1}
          className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm tracking-wide boty-transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
            isAdded
              ? "bg-primary/80 text-primary-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {soldOut ? (
            "Rupture de stock"
          ) : isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouté</span>
            </>
          ) : (
            "Ajouter au panier"
          )}
        </button>
      </div>
    </div>
  )
}
