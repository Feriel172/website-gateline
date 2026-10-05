"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, SlidersHorizontal, X } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { PackCard } from "@/components/boty/pack-card"
import { PACKS, isSoldOut, packAvailable } from "@/lib/orders"

const products = [
  // Tonerpads
  {
    id: "radiance-serum",
    name: "Toner Pads 4% Niacinamide",
    description: "Purifie et minimise les pores",
    price: 1600,
    originalPrice: null,
    image: "/images/products/niacinamide_tonerpads.jpg",
    badge: "Bestseller",
    category: "tonerpads"
  },
  {
    id: "hydrating-serum",
    name: "Toner Pads 5% AHA",
    description: "exfolie chimiquement en douceur",
    price: 1600,
    originalPrice: null,
    image: "/images/products/aha_tonerpads.jpg",
    badge: null,
    category: "tonerpads"
  },
  
  // Contour des yeux
  {
    id: "hydra-cream",
    name: "Contour des yeux à la caféine",
    description: "décongestionne, hydrate et atténue les cernes pigmentaires",
    price: 900,
    originalPrice: null,
    image: "/images/products/cafeine_contour.png",
    badge: "Bestseller",
    category: "contour des yeux"
  },
  {
    id: "gentle-cleanser",
    name: "Contour des yeux au collagène",
    description: "hydrate, repulpe et lisse la peau ",
    price: 900,
    originalPrice: null,
    image: "/images/products/collagene_contour.png",
    badge: null,
    category: "contour des yeux"
  },
  {
    id: "night-cream",
    name: "Contour des yeux au rétinol",
    description: "sérum anti-âge, lisse et prévient les ridules",
    price: 900,
    originalPrice: null,
    image: "/images/products/retinol_contour.png",
    badge: null,
    category: "contour des yeux"
  },
  // masques
  {
    id: "renewal-oil",
    name: "Glass skin masque",
    description: "obtiens une glass skin grâce à ce masque enveloppant au collagène",
    price: 1500,
    originalPrice: null,
    image: "/images/products/collagene_masque.png",
    badge: "New",
    category: "masques"
  },
  {
    id: "rosehip-oil",
    name: "Masque clear pore AHA",
    description: "nettoie les pores en profondeur et exfolie la peau en douceur",
    price: 1200,
    originalPrice: null,
    image: "/images/products/aha_masque.png",
    badge: null,
    category: "masques"
  }
]

const categories = ["all", "packs", "tonerpads", "contour des yeux", "masques"]

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const filteredProducts = selectedCategory === "all"
    ? products
    : selectedCategory === "packs"
    ? []
    : products.filter(p => p.category === selectedCategory)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (gridRef.current) {
      observer.observe(gridRef.current)
    }

    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current)
      }
    }
  }, [])

  // Reset animation when category changes
  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [selectedCategory])

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">
              Notre Collection
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance">
              Tous Nos Produits
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              découvrez l'essentiel de la skincare
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/50">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden inline-flex items-center gap-2 text-sm text-foreground"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            {/* Desktop Categories */}
            <div className="hidden lg:flex items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm capitalize boty-transition bg-popover ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground/70 hover:text-foreground boty-shadow"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </span>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-2xl text-foreground">Filters</h2>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="p-2 text-foreground/70 hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category)
                        setShowFilters(false)
                      }}
                      className={`w-full px-6 py-4 rounded-2xl text-left capitalize boty-transition ${
                        selectedCategory === category
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground boty-shadow"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div 
            ref={gridRef}
            className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
          >
            {filteredProducts.map((product, index) => (
              <ProductCard 
                key={product.id}
                product={product}
                index={index}
                isVisible={isVisible}
              />
            ))}

            {/* Packs sit at the end of the same grid, styled like any product */}
            {(selectedCategory === "all" || selectedCategory === "packs") &&
              PACKS.filter(packAvailable).map((pack) => (
                <PackCard key={pack.id} pack={pack} />
              ))}
          </div>

        </div>
      </div>

      <Footer />
    </main>
  )
}

function ProductCard({ 
  product, 
  index, 
  isVisible 
}: { 
  product: typeof products[0]
  index: number
  isVisible: boolean
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { addItem } = useCart()

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group h-full transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="bg-card rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02] h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {/* Skeleton */}
          <div 
            className={`absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse transition-opacity duration-500 ${
              imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
          
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className={`object-cover boty-transition group-hover:scale-105 transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Badge */}
          {isSoldOut(product.id) ? (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-destructive/10 text-destructive">
              Rupture de stock
            </span>
          ) : product.badge && (
            <span
              className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide ${
                product.badge === "Sale"
                  ? "bg-destructive/10 text-destructive"
                  : product.badge === "New"
                  ? "bg-primary/10 text-primary"
                  : "bg-accent text-accent-foreground"
              }`}
            >
              {product.badge}
            </span>
          )}
          {/* Quick add button */}
          <button
            type="button"
            className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 boty-transition boty-shadow"
            disabled={isSoldOut(product.id)}
            onClick={(e) => {
              e.preventDefault()
              if (isSoldOut(product.id)) return
              addItem({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image
              })
            }}
            aria-label={isSoldOut(product.id) ? "Rupture de stock" : "Add to cart"}
          >
            <ShoppingBag className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Info */}
        <div className="p-3 sm:p-6 flex flex-col flex-1">
          <h3 className="font-serif text-base sm:text-xl text-foreground mb-1 leading-snug">{product.name}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-2 mt-auto">
            <span className="text-base sm:text-lg font-medium text-foreground">{product.price} DZD</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {product.originalPrice} DZD
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
