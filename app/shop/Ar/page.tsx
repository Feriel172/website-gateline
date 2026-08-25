"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, SlidersHorizontal, X } from "lucide-react"
import { HeaderAr } from "@/components/boty/header-ar"
import { FooterAr } from "@/components/boty/footer-ar"
import { useCart } from "@/components/boty/cart-context"
import { PackCard } from "@/components/boty/pack-card"
import { PACKS, isSoldOut, packAvailable } from "@/lib/orders"

const products = [
  // Tonerpads
  {
    id: "radiance-serum",
    name: "تونر بادس نياسيناميد 4%",
    description: "ينقي البشرة ويقلل من حجم المسام",
    price: 1600,
    originalPrice: null,
    image: "/images/products/niacinamide_tonerpads.jpg",
    badge: "الأكثر مبيعاً",
    category: "tonerpads"
  },
  {
    id: "hydrating-serum",
    name: "تونر بادس AHA 5%",
    description: "تقشير كيميائي لطيف للبشرة",
    price: 1600,
    originalPrice: null,
    image: "/images/products/aha_tonerpads.jpg",
    badge: null,
    category: "tonerpads"
  },

  // Contour des yeux
  {
    id: "hydra-cream",
    name: "محيط العين بالكافيين",
    description: "يزيل الاحتقان ويرطب ويخفف الهالات السوداء",
    price: 900,
    originalPrice: null,
    image: "/images/products/cafeine_contour.png",
    badge: "الأكثر مبيعاً",
    category: "contour des yeux"
  },
  {
    id: "gentle-cleanser",
    name: "محيط العين بالكولاجين",
    description: "يرطب ويملأ البشرة وينعمها",
    price: 900,
    originalPrice: null,
    image: "/images/products/collagene_contour.png",
    badge: null,
    category: "contour des yeux"
  },
  {
    id: "night-cream",
    name: "محيط العين بالريتينول",
    description: "سيروم مضاد للشيخوخة يمنع التجاعيد الدقيقة",
    price: 900,
    originalPrice: null,
    image: "/images/products/retinol_contour.png",
    badge: null,
    category: "contour des yeux"
  },
  // masques
  {
    id: "renewal-oil",
    name: "قناع الكولاجين المقشر",
    description: "احصلي على بشرة زجاجية مع هذا القناع المغلف بالكولاجين",
    price: 1500,
    originalPrice: null,
    image: "/images/products/collagene_masque.png",
    badge: "جديد",
    category: "masques"
  },
  {
    id: "rosehip-oil",
    name: "قناع تنظيف المسام AHA",
    description: "ينظف المسام بعمق ويقشر البشرة بلطف",
    price: 1200,
    originalPrice: null,
    image: "/images/products/aha_masque.png",
    badge: null,
    category: "masques"
  }
]

const categories = [
  { key: "all", label: "الكل" },
  { key: "tonerpads", label: "تونر بادس" },
  { key: "contour des yeux", label: "محيط العين" },
  { key: "packs", label: "الباكات" },
  { key: "masques", label: "الأقنعة" }
]

export default function ShopPageAr() {
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
    <main dir="rtl" className="min-h-screen font-cairo">
      <HeaderAr />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block font-cairo">
              مجموعتنا
            </span>
            <h1 className="font-cairo text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance font-semibold">
              جميع منتجاتنا
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto font-cairo">
              اكتشفي أساسيات العناية بالبشرة
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/50">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden inline-flex items-center gap-2 text-sm text-foreground font-cairo"
            >
              <SlidersHorizontal className="w-4 h-4" />
              الفلاتر
            </button>

            {/* Desktop Categories */}
            <div className="hidden lg:flex items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-full text-sm boty-transition bg-popover font-cairo ${
                    selectedCategory === category.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground/70 hover:text-foreground boty-shadow"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <span className="text-sm text-muted-foreground font-cairo">
              {filteredProducts.length} {filteredProducts.length === 1 ? "منتج" : "منتجات"}
            </span>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-cairo text-2xl text-foreground font-semibold">الفلاتر</h2>
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
                      key={category.key}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.key)
                        setShowFilters(false)
                      }}
                      className={`w-full px-6 py-4 rounded-2xl text-right font-cairo boty-transition ${
                        selectedCategory === category.key
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground boty-shadow"
                      }`}
                    >
                      {category.label}
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

            {/* الباكات في نفس الشبكة، بنفس شكل المنتجات */}
            {(selectedCategory === "all" || selectedCategory === "packs") &&
              PACKS.filter(packAvailable).map((pack) => (
                <PackCard key={pack.id} pack={pack} locale="ar" />
              ))}
          </div>

        </div>
      </div>

      <FooterAr />
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
      href={`/product/${product.id}/Ar`}
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
              نفدت الكمية
            </span>
          ) : product.badge && (
            <span
              className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs tracking-wide font-cairo ${
                product.badge === "حرق"
                  ? "bg-destructive/10 text-destructive"
                  : product.badge === "جديد"
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
            className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 boty-transition boty-shadow"
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
            aria-label="أضف إلى السلة"
          >
            <ShoppingBag className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Info */}
        <div className="p-6">
          <h3 className="font-cairo text-xl text-foreground mb-1 font-semibold">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-4 font-cairo">{product.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-foreground">{product.price} دج</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {product.originalPrice} دج
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
