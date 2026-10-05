// Order pricing data shared by the public checkout and the admin edit route, so
// an order re-costed by an admin uses exactly the same prices and shipping
// rates it was created with.

export interface CatalogProduct {
  id: string
  name: string
  nameAr: string
  price: number
  image: string
  // Withdrawn from the storefront but still priced, so historical orders keep
  // costing correctly. Not offered when adding a line to an order.
  archived?: boolean
  // Temporarily unavailable: still listed and browsable, but cannot be ordered.
  // Flip this one flag to put a product back on sale.
  soldOut?: boolean
}

// The catalogue an admin can add to an order, and the source of the price table.
export const PRODUCT_CATALOG: CatalogProduct[] = [
  { id: "radiance-serum", name: "Toner Pads 4% Niacinamide", nameAr: "تونر بادس نياسيناميد 4%", price: 1600, image: "/images/products/niacinamide_tonerpads.jpg" },
  { id: "hydrating-serum", name: "Toner Pads 5% AHA", nameAr: "تونر بادس AHA 5%", price: 1600, image: "/images/products/aha_tonerpads.jpg" },
  { id: "hydra-cream", name: "Contour des yeux à la caféine", nameAr: "محيط العين بالكافيين", price: 900, image: "/images/products/cafeine_contour.png" },
  { id: "gentle-cleanser", name: "Contour des yeux au collagène", nameAr: "محيط العين بالكولاجين", price: 900, image: "/images/products/collagene_contour.png" },
  { id: "night-cream", name: "Contour des yeux au rétinol", nameAr: "محيط العين بالريتينول", price: 900, image: "/images/products/retinol_contour.png" },
  { id: "renewal-oil", name: "Masque peel off au collagène", nameAr: "قناع الكولاجين المقشر", price: 1500, image: "/images/products/collagene_masque.png" },
  { id: "rosehip-oil", name: "Masque clear pore AHA", nameAr: "قناع تنظيف المسام AHA", price: 1200, image: "/images/products/aha_masque.png" },
  { id: "deodorant-fraicheur", name: "Déodorant 100% naturel - Fraîcheur", nameAr: "مزيل عرق طبيعي 100% - انتعاش", price: 750, image: "/images/products/deodorant_fraicheur.jpeg", archived: true },
  { id: "deodorant-vanille", name: "Déodorant 100% naturel - Vanille", nameAr: "مزيل عرق طبيعي 100% - فانيلا", price: 750, image: "/images/products/deodorant_vanille.jpeg", archived: true },
]


// --- Packs ---
// Each combination of choices is expanded into its own product id, so the cart,
// the checkout price table and the admin all treat a pack like any other
// product: identical choices merge into one line, different choices do not.

export interface PackSlot {
  label: string
  labelAr: string
  options: string[]
}

export interface Pack {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  price: number
  image: string
  includes: string[]   // always in the pack
  slots: PackSlot[]    // one choice each
}

export const PACKS: Pack[] = [
  {
    id: "pack-clear-pore",
    name: "Pack Trio",
    nameAr: "باك تريو",
    description: "Masque clear pore + 1 contour des yeux + 1 toner pads au choix",
    descriptionAr: "قناع تنظيف المسام + محيط عين + تونر بادس حسب اختيارك",
    price: 3400,
    image: "/images/products/pack_clear_pore.jpg",
    includes: ["rosehip-oil"],
    slots: [
      {
        label: "Votre contour des yeux",
        labelAr: "محيط العين",
        options: ["hydra-cream", "gentle-cleanser", "night-cream"],
      },
      {
        label: "Vos toner pads",
        labelAr: "تونر بادس",
        options: ["radiance-serum", "hydrating-serum"],
      },
    ],
  },
  {
    id: "pack-duo-toner",
    name: "Pack Duo Toner Pads",
    nameAr: "باك تونر بادس مزدوج",
    description: "Toner Pads 5% AHA + Toner Pads 4% Niacinamide",
    descriptionAr: "تونر بادس AHA 5% + تونر بادس نياسيناميد 4%",
    price: 3000,
    image: "/images/products/pack_duo_toner.jpg",
    includes: ["hydrating-serum", "radiance-serum"],
    slots: [],
  },
]

export interface PackVariant {
  id: string
  packId: string
  price: number
  components: string[]  // every product id inside, fixed ones first
  choices: string[]     // just the chosen ones
}

function expandPack(pack: Pack): PackVariant[] {
  // cartesian product of the slot options; a pack with no slots yields one variant
  let combinations: string[][] = [[]]
  for (const slot of pack.slots) {
    combinations = combinations.flatMap((combo) => slot.options.map((option) => [...combo, option]))
  }

  return combinations.map((choices) => ({
    id: [pack.id, ...choices].join("+"),
    packId: pack.id,
    price: pack.price,
    components: [...pack.includes, ...choices],
    choices,
  }))
}

export const PACK_VARIANTS: PackVariant[] = PACKS.flatMap(expandPack)

export function findPackVariant(packId: string, choices: string[]): PackVariant | undefined {
  const id = [packId, ...choices].join("+")
  return PACK_VARIANTS.find((variant) => variant.id === id)
}

// Known product prices for server-side validation and total recalculation.
// Derived from the catalogue so a price can never be changed in one place only.
export const PRODUCT_PRICES: Record<string, number> = Object.fromEntries([
  ...PRODUCT_CATALOG.map((product) => [product.id, product.price] as const),
  ...PACK_VARIANTS.map((variant) => [variant.id, variant.price] as const),
])

// Offered when adding a line to an existing order
export const SELLABLE_PRODUCTS = PRODUCT_CATALOG.filter(
  (product) => !product.archived && !product.soldOut
)

const SOLD_OUT_IDS = new Set(
  PRODUCT_CATALOG.filter((product) => product.soldOut).map((product) => product.id)
)

export function isSoldOut(productId: string): boolean {
  return SOLD_OUT_IDS.has(productId)
}

// --- Pack display and availability ---

// Packs a product can be bought inside, whether it is always included or one of
// the options — used to upsell the pack from the product's own page.
export function packsContaining(productId: string): Pack[] {
  return PACKS.filter(
    (pack) =>
      packAvailable(pack) &&
      (pack.includes.includes(productId) ||
        pack.slots.some((slot) => availableOptions(slot).includes(productId)))
  )
}

export function productName(productId: string, locale: "fr" | "ar" = "fr"): string {
  const product = PRODUCT_CATALOG.find((item) => item.id === productId)
  if (!product) return productId
  return locale === "ar" ? product.nameAr : product.name
}

// A pack cannot be bought while any product inside it is out of stock
export function packVariantAvailable(variant: PackVariant): boolean {
  return variant.components.every((id) => !isSoldOut(id))
}

export function availableOptions(slot: PackSlot): string[] {
  return slot.options.filter((id) => !isSoldOut(id))
}

// A pack is offered while its fixed products are in stock and every slot still
// has something to choose from
export function packAvailable(pack: Pack): boolean {
  return (
    pack.includes.every((id) => !isSoldOut(id)) &&
    pack.slots.every((slot) => availableOptions(slot).length > 0)
  )
}

// "Pack Clear Pore — Contour caféine + Toner 5% AHA", so the choices travel with
// the order into the cart, the confirmation email and the admin.
export function packVariantName(variant: PackVariant, locale: "fr" | "ar" = "fr"): string {
  const pack = PACKS.find((item) => item.id === variant.packId)
  const base = pack ? (locale === "ar" ? pack.nameAr : pack.name) : variant.packId
  if (variant.choices.length === 0) return base
  return `${base} — ${variant.choices.map((id) => productName(id, locale)).join(" + ")}`
}

// What the same products would cost bought separately
export function packUndiscountedTotal(variant: PackVariant): number {
  return variant.components.reduce((sum, id) => sum + (PRODUCT_PRICES[id] ?? 0), 0)
}

// Allowed wilayas list (from public/wilayas-list.txt)
export const ALLOWED_WILAYAS = new Set([
  "Adrar", "Alger", "Annaba", "Batna", "Bechar", "Bejaia", "Beni Abbes",
  "Biskra", "Blida", "Bordj Bou Arreridj", "Bouira", "Chlef", "Constantine",
  "Djelfa", "El Bayadh", "El Meghaier", "El Menia", "El Oued", "El Tarf",
  "Ghardaia", "Guelma", "In Guezzam", "In Salah", "Jijel", "Khenchela",
  "Laghouat", "Mascara", "Medea", "Mila", "Mostaganem", "MSila", "Naama",
  "Oran", "Ouargla", "Ouled Djellal", "Oum El Bouaghi", "Relizane",
  "Saida", "Setif", "Sidi Bel Abbes", "Skikda", "Souk Ahras",
  "Tamanrasset", "Tebessa", "Tiaret", "Timimoun", "Tipaza", "Tissemsilt",
  "Tizi Ouzou", "Tlemcen", "Touggourt", "Ain Defla", "Ain Temouchent",
  "Boumerdes",
])

// Phone validation: Algerian mobile numbers starting with 05, 06, or 07
export const PHONE_REGEX = /^(0[5-7])\d{8}$/

const WILAYA_SHIPPING_RATES: Record<string, { home: number; pickup: number }> = {
  "Adrar": { home: 1450, pickup: 1070 },
  "Alger": { home: 600, pickup: 520 },
  "Annaba": { home: 900, pickup: 570 },
  "Batna": { home: 900, pickup: 570 },
  "Bechar": { home: 1200, pickup: 770 },
  "Bejaia": { home: 900, pickup: 570 },
  "Beni Abbes": { home: 1400, pickup: 1070 },
  "Biskra": { home: 950, pickup: 670 },
  "Blida": { home: 700, pickup: 520 },
  "Bordj Bou Arreridj": { home: 850, pickup: 570 },
  "Bouira": { home: 750, pickup: 570 },
  "Boumerdes": { home: 500, pickup: 420 },
  "Chlef": { home: 850, pickup: 570 },
  "Constantine": { home: 850, pickup: 570 },
  "Djelfa": { home: 950, pickup: 670 },
  "El Bayadh": { home: 1100, pickup: 670 },
  "El Meghaier": { home: 950, pickup: 0 },
  "El Menia": { home: 1100, pickup: 670 },
  "El Oued": { home: 1000, pickup: 670 },
  "El Tarf": { home: 900, pickup: 570 },
  "Ghardaia": { home: 950, pickup: 670 },
  "Guelma": { home: 850, pickup: 570 },
  "In Guezzam": { home: 1650, pickup: 0 },
  "In Salah": { home: 1650, pickup: 1270 },
  "Jijel": { home: 900, pickup: 570 },
  "Khenchela": { home: 900, pickup: 570 },
  "Laghouat": { home: 950, pickup: 670 },
  "Mascara": { home: 900, pickup: 570 },
  "Medea": { home: 850, pickup: 570 },
  "Mila": { home: 900, pickup: 570 },
  "Mostaganem": { home: 900, pickup: 570 },
  "MSila": { home: 900, pickup: 570 },
  "Naama": { home: 1200, pickup: 670 },
  "Oran": { home: 850, pickup: 570 },
  "Ouargla": { home: 1000, pickup: 670 },
  "Ouled Djellal": { home: 950, pickup: 670 },
  "Oum El Bouaghi": { home: 800, pickup: 570 },
  "Relizane": { home: 900, pickup: 570 },
  "Saida": { home: 900, pickup: 620 },
  "Setif": { home: 850, pickup: 570 },
  "Sidi Bel Abbes": { home: 900, pickup: 570 },
  "Skikda": { home: 900, pickup: 570 },
  "Souk Ahras": { home: 900, pickup: 570 },
  "Tamanrasset": { home: 1650, pickup: 1270 },
  "Tebessa": { home: 950, pickup: 570 },
  "Tiaret": { home: 850, pickup: 520 },
  "Timimoun": { home: 1450, pickup: 1070 },
  "Tipaza": { home: 800, pickup: 570 },
  "Tissemsilt": { home: 900, pickup: 520 },
  "Tizi Ouzou": { home: 750, pickup: 570 },
  "Tlemcen": { home: 900, pickup: 570 },
  "Touggourt": { home: 950, pickup: 670 },
  "Ain Defla": { home: 900, pickup: 570 },
  "Ain Temouchent": { home: 900, pickup: 570 },
  }

export function calculateShipping(wilaya: string, deliveryType: string): number {
  const rates = WILAYA_SHIPPING_RATES[wilaya]
  if (!rates) return 0

  return deliveryType === "domicile" ? rates.home : rates.pickup
}

export function deliveryLabel(deliveryType: string): string {
  return deliveryType === "domicile" ? "À domicile" : "Bureau ZR Express"
}
