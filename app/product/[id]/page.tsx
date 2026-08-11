"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Minus, Plus, ChevronDown, Leaf, Heart, Award, Recycle, Star, Check, Truck, FlaskConical } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { trackViewContent } from "@/lib/fpixel"

const products: Record<string, {
  id: string
  name: string
  tagline: string
  description: string
  price: number
  originalPrice: number | null
  image: string
  sizes: string[]
  details: string
  howToUse: string
  ingredients: string
  delivery: string
}> = {
  "radiance-serum": {
    id: "radiance-serum",
    name: "Toner Pads 4% Niacinamide",
    tagline: "Illumine et unifie le teint, améliore l'aspect des pores et régule la production de sébum. ",
    description: " Enrichis en niacinamide et en extrait de réglisse, ces disques ciblent et réduisent l'apparence des taches brunes et des marques d'acné existantes, contribuent à resserrer les pores dilatés, Illuminent le teint et ravivent l’éclat naturel pour un teint unifié et éclatant.",
    price: 1600,
    originalPrice: null,
    image: "/images/products/niacinamide_tonerpads.jpg",
    sizes: ["40 pads"],
    details: "Convient à tous type de peau. Conserver dans un endroit frais et sec, hors de portée des enfants. Protéger de la lumière directe du soleil.",
    howToUse: " Après le nettoyage, passer le disque sur l'ensemble du visage et du cou en évitant le contour des yeux et des lèvres. Laisser poser 3 à 5 minutes. À utiliser quotidiennement matin et/ou soir. Ne pas rincer. ",
    ingredients: "hydrolat de rose, eau, niacinamide, glycérine végétale, aloe Véra, extrait de réglisse, panthénol, conservateur. ",
    delivery: "Toutes les commandes sont livrées 2 jours après leur validation. Un membre de l'équipe Gateline Cosmetics vous appelera afin de confirmer votre commande au maximum le lendemain de votre commande."
  },
  "hydrating-serum": {
    id: "hydrating-serum",
    name: "Toner Pads 5% AHA",
    tagline: "Exfolie chimiquement la peau en douceur pour une peau plus lisse et un teint unifié. ",
    description: "Obtenez une peau nette et éclatante avec les toner pads 5% d'acide glycolique. Cette formule exfolie en douceur, et aide contre les imperfections. Elle élimine les cellules mortes et affine le grain de peau pour une peau plus lisse et un teint uniforme.",
    price: 1600,
    originalPrice: null,
    image: "/images/products/aha_tonerpads.jpg",
    sizes: ["40 pads"],
    details: "Convient à tous type de peau. Conserver dans un endroit frais et sec, hors de portée des enfants. Protéger de la lumière directe du soleil. Utilisez de la crème solaire le jour. ",
    howToUse: " Après le nettoyage, passer le disque sur l'ensemble du visage et du cou en évitant le contour des yeux et des lèvres. À appliquer uniquement le soir, 2 à 3 fois par semaine. Ne pas rincer.  ",
    ingredients: "hydrolat de rose, eau, glycérine végétale, aloe Véra, acide glycolique, panthénol, conservateur.",
    delivery: "Toutes les commandes sont livrées 2 jours après leur validation. Un membre de l'équipe Gateline Cosmetics vous appelera afin de confirmer votre commande au maximum le lendemain de votre commande."
  },
  "hydra-cream": {
    id: "hydra-cream",
    name: "Contour des yeux à la caféine",
    tagline: "décongestionne le contour de l'oeil grâce à son embout métallique, hydrate et atténue la pigmentation des cernes",
    description: "ce gel contour des yeux atténue les cernes pigmentaires et vasculaires, réduit la taille et le volume des poches sous les yeux, hydrate, lisse et repulpe le contour des yeux.",
    price: 900,
    originalPrice: null,
    image: "/images/products/cafeine_contour.png",
    sizes: ["17ml"],
    details: "Enrichi en caféine, ce contour des yeux aide à stimuler la circulation sanguine, à raviver le regard en réduisant l’apparence des cernes et à décongestionner le contour de l’œil pour un effet frais et reposé. Conserver le gel contour des yeux à la caféine au réfrigérateur procure une sensation de fraîcheur supplémentaire lors de l'application et aide à atténuer les poches sous les yeux.",
    howToUse: "Appliquer une petite quantité sur le contour des yeux le matin et/ou le soir. masser la zone avec l'embout.",
    ingredients: "gel d’Aloe Vera, huile d’avocat, huile essentielle de café, acide hyaluronique , vitamine E, conservateur.",
    delivery: "Toutes les commandes sont livrées 2 jours après leur validation. Un membre de l'équipe Gateline Cosmetics vous appelera afin de confirmer votre commande au maximum le lendemain de votre commande."
  },
  "gentle-cleanser": {
    id: "gentle-cleanser",
    name: "Contour des yeux au collagène",
    tagline: "enrichi en collagène et acide hyaluronique, ce sérum hydrate et repulpe le contour de l'oeil",
    description: "ce sérum hydrate et nourrit la peau délicate du contour des yeux et aide à réduire l'apparence des rides et ridules. il apporte une nutrition intense et une hydratation profonde.",
    price: 900,
    originalPrice: null,
    image: "/images/products/collagene_contour.png",
    sizes: ["17ml"],
    details: " Conserver le gel contour des yeux au réfrigérateur procure une sensation de fraîcheur supplémentaire lors de l'application et aide à atténuer les poches sous les yeux.",
    howToUse: "Appliquer une petite quantité sur le contour des yeux le matin et/ou le soir. masser la zone avec l'embout.",
    ingredients: "aloe Véra, huile d’avocat, collagène, acide hyaluronique, vitamine E, conservateur.",
    delivery: "Toutes les commandes sont livrées 2 jours après leur validation. Un membre de l'équipe Gateline Cosmetics vous appelera afin de confirmer votre commande au maximum le lendemain de votre commande."
  },
  "night-cream": {
    id: "night-cream",
    name: "Contour des yeux au rétinol",
    tagline: "enrichi en rétinol, ce sérum est votre allié anti-âge. ",
    description: "ce gel contour des yeux au rétinol aide à réduire l’apparence des rides et ridules, améliore la fermeté de la peau pour un contour des yeux plus lisse et plus lumineux, il contribue à raviver l’éclat du regard.",
    price: 900,
    originalPrice: null,
    image: "/images/products/retinol_contour.png",
    sizes: ["17ml"],
    details: " Conserver le gel contour des yeux au réfrigérateur procure une sensation de fraîcheur supplémentaire lors de l'application et aide à atténuer les poches sous les yeux. Pour les femmes enceintes ou allaitantes, il est recommandé de consulter un médecin avant d'utiliser ce produit.",
    howToUse: "À utiliser le soir, une à deux fois par semaine, puis augmenter progressivement la fréquence jusqu'à une utilisation quotidienne, en fonction de la tolérance de votre peau. Appliquer la crème solaire le matin après utilisation.",
    ingredients: "gel d’Aloe Vera, huile d’avocat, rétinol , vitamine E, conservateur.",
    delivery: "Toutes les commandes sont livrées 2 jours après leur validation. Un membre de l'équipe Gateline Cosmetics vous appelera afin de confirmer votre commande au maximum le lendemain de votre commande."
  },
  "renewal-oil": {
    id: "renewal-oil",
    name: "Glass skin masque",
    tagline: "enrichi en collagène, ce masque peel-off enveloppe votre skincare et vous apporte l'apaisement et l'hydratation idéales.",
    description: "Obtenez une glass skin grâce à ce masque au collagène, aloé vera et panthénol. sa formule hydrate intensément, améliore l’élasticité et la fermeté de la peau, elle illumine le teint, atténue les ridules et renforce la barrière cutanée, pour une peau repulpée, plus lisse et plus lumineuse.",
    price: 1500,
    originalPrice: null,
    image: "/images/products/collagene_masque.png",
    sizes: ["75ml"],
    details: "Convient aux peaux normales, sèches, déshydratées et sensibles. Utiliser 1 à 2 fois par semaine pour une peau visiblement plus lisse, hydratée et lumineuse.",
    howToUse: "Après votre routine de soin habituelle, appliquer une couche uniforme du masque en évitant le contour des yeux, les sourcils, les lèvres et la racine des cheveux. Laisser sécher pendant 15 à 20 minutes, puis retirer délicatement le masque en commençant par les bords. Ne pas rincer. ",
    ingredients: "eau, PVA alcool polyvinylique, aloe Véra, glycérine végétale, collagène marin, panthénol, conservateur, fragrance",
    delivery: "Toutes les commandes sont livrées 2 jours après leur validation. Un membre de l'équipe Gateline Cosmetics vous appelera afin de confirmer votre commande au maximum le lendemain de votre commande."
  },
  "rosehip-oil": {
    id: "rosehip-oil",
    name: "clear pore masque",
    tagline: "enrichi en acide glycolique et d'un mélange d'argiles, ce masque agit comme un exfoliant et un masque purifiant qui nettoie en profondeur.",
    description: "Ce Clear Pore Mask à base d’argiles verte et blanche, enrichi en AHA, aide à purifier et nettoyer la peau en profondeur et à améliorer l'apparence des pores. Il exfolie en douceur et affine le grain de peau pour un teint plus net, plus lisse et plus uniforme.",
    price: 1200,
    originalPrice: null,
    image: "/images/products/aha_masque.png",
    sizes: ["75ml"],
    details: "Convient aux peaux mixtes à grasses. Utiliser 1 à 2 fois par semaine.",
    howToUse: "appliquer une couche uniforme sur peau propre et sèche, en évitant le contour des yeux. Laisser poser 15 à 20 minutes puis rincer.",
    ingredients: "hydrolat de rose, argile verte, argile blanche, farine de riz, acide glycolique, aloe Véra, glycérine végétale, huile d’amande douce, extrait de réglisse, indigo bleu, conservateur.",
    delivery: "Toutes les commandes sont livrées 2 jours après leur validation. Un membre de l'équipe Gateline Cosmetics vous appelera afin de confirmer votre commande au maximum le lendemain de votre commande."
  },
  "deodorant-fraicheur": {
    id: "deodorant-fraicheur",
    name: "Déodorant 100% naturel - Fraîcheur",
    tagline: "24h de fraîcheur, sans sels d'aluminium ni alcool.",
    description: "24h de fraicheur grâce à ce déodorant avec des ingrédients 100% naturels, sans aluminium ni alcool.",
    price: 750,
    originalPrice: null,
    image: "/images/products/deodorant_fraicheur.jpg",
    sizes: ["50ml"],
    details: "Convient à tous types de peau. Sans sels d'aluminium ni alcool. Conserver dans un endroit frais et sec, hors de portée des enfants. Protéger de la lumière directe du soleil.",
    howToUse: "Appliquer une petite quantité sur des aisselles propres et sèches, puis masser jusqu'à absorption complète. À utiliser quotidiennement.",
    ingredients: "huile de coco, bicarbonate de soude, fécule de maïs, huile essentielle de Palma rosa et sauge sclarée, vitamine E, fragrance.",
    delivery: "Toutes les commandes sont livrées 2 jours après leur validation. Un membre de l'équipe Gateline Cosmetics vous appelera afin de confirmer votre commande au maximum le lendemain de votre commande."
  },
  "deodorant-vanille": {
    id: "deodorant-vanille",
    name: "Déodorant 100% naturel - Vanille",
    tagline: "24h de fraîcheur au parfum vanille, sans sels d'aluminium ni alcool.",
    description: "24h de fraicheur grâce à ce déodorant avec des ingrédients 100% naturels, sans aluminium ni alcool.",
    price: 750,
    originalPrice: null,
    image: "/images/products/deodorant_vanille.jpg",
    sizes: ["50ml"],
    details: "Convient à tous types de peau. Sans sels d'aluminium ni alcool. Conserver dans un endroit frais et sec, hors de portée des enfants. Protéger de la lumière directe du soleil.",
    howToUse: "Appliquer une petite quantité sur des aisselles propres et sèches, puis masser jusqu'à absorption complète. À utiliser quotidiennement.",
    ingredients: "huile de coco, bicarbonate de soude, fécule de maïs, huile essentielle de Palma rosa et sauge sclarée, vitamine E, fragrance.",
    delivery: "Toutes les commandes sont livrées 2 jours après leur validation. Un membre de l'équipe Gateline Cosmetics vous appelera afin de confirmer votre commande au maximum le lendemain de votre commande."
  }
}

const benefits = [
  { icon: Leaf, label: "98% d'ingrédients naturels" },
  { icon: Truck, label: "Livraison partout en Algérie" },
  { icon: Award, label: "testé sous contrôle dermatologique" }
]

type AccordionSection = "details" | "howToUse" | "ingredients" | "delivery"

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  const product = products[productId] || products["radiance-serum"]

  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<AccordionSection | null>("details")
  const [isAdded, setIsAdded] = useState(false)
  const { addItem, setIsOpen } = useCart()
  const router = useRouter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])

  useEffect(() => {
    trackViewContent({ id: product.id, name: product.name, price: product.price })
  }, [product.id, product.name, product.price])

  const toggleAccordion = (section: AccordionSection) => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  const addToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image
      },
      quantity
    )
  }

  const handleAddToCart = () => {
    addToCart()
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  // Straight to checkout. addItem opens the cart drawer, which would otherwise
  // sit over the checkout page, so close it before navigating.
  const handleBuyNow = () => {
    addToCart()
    setIsOpen(false)
    router.push("/checkout")
  }

  const accordionItems: { key: AccordionSection; title: string; content: string }[] = [
    { key: "details", title: "Details", content: product.details },
    { key: "howToUse", title: "Mode d'emploi", content: product.howToUse },
    { key: "ingredients", title: "Ingredients", content: product.ingredients },
    { key: "delivery", title: "Livraison", content: product.delivery }
  ]

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground boty-transition mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Product Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-card boty-shadow">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Header */}
              <div className="mb-8">
                <span className="text-sm tracking-[0.3em] uppercase text-primary mb-2 block">
                  Toner pads 
                </span>
                <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">
                  {product.name}
                </h1>
                <p className="text-lg text-muted-foreground italic mb-4">
                  {product.tagline}
                </p>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(128 reviews)</span>
                </div>

                <p className="text-foreground/80 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl font-medium text-foreground">{product.price} DZD</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {product.originalPrice} DZD
                  </span>
                )}
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-3 block">Size</label>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-full text-sm boty-transition boty-shadow ${
                        selectedSize === size
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground hover:bg-card/80"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="text-sm font-medium text-foreground mb-3 block">Quantity</label>
                <div className="inline-flex items-center gap-4 bg-card rounded-full px-2 py-2 boty-shadow">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm tracking-wide boty-transition boty-shadow ${
                    isAdded
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Ajouté au panier
                    </>
                  ) : (
                    "Ajouter au panier"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-foreground/20 text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5"
                >
                  Acheter maintenant
                </button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {benefits.slice(0, 3).map((benefit) => (
                  <div
                    key={benefit.label}
                    className="flex flex-col items-center justify-center gap-3 p-6 boty-shadow bg-transparent shadow-none rounded-xl"
                  >
                    <benefit.icon className="w-6 h-6 text-primary" />
                    <span className="text-xs text-muted-foreground text-center">
                      {benefit.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Accordion */}
              <div className="border-t border-border/50">
                {accordionItems.map((item) => (
                  <div key={item.key} className="border-b border-border/50">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.key)}
                      className="w-full flex items-center justify-between py-5 text-left"
                    >
                      <span className="font-medium text-foreground">{item.title}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground boty-transition ${
                          openAccordion === item.key ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden boty-transition ${
                        openAccordion === item.key ? "max-h-96 pb-5" : "max-h-0"
                      }`}
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
