import { NextResponse, after } from "next/server"
import { createAdminClient, SupabaseConfigError } from "@/lib/supabase/admin"
import { sendNewOrderEmail } from "@/lib/email"

// Known product prices for server-side validation and total recalculation
const PRODUCT_PRICES: Record<string, number> = {
  "radiance-serum": 1600,
  "hydrating-serum": 1600,
  "hydra-cream": 900,
  "gentle-cleanser": 900,
  "night-cream": 900,
  "renewal-oil": 1500,
  "rosehip-oil": 1200,
}

// Allowed wilayas list (from public/wilayas-list.txt)
const ALLOWED_WILAYAS = new Set([
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
const PHONE_REGEX = /^(0[5-7])\d{8}$/

// Known promo codes: code (case-insensitive) → discount percentage
const PROMO_CODES: Record<string, number> = {
  "été10": 10,
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CheckoutBody {
  firstName: string
  lastName?: string
  phone: string
  wilaya: string
  deliveryType: "domicile" | "bureau"
  bureau?: string
  items: CartItem[]
  promoCode?: string
}

interface ValidationError {
  field: string
  message: string
}

function validate(body: unknown): { valid: boolean; errors: ValidationError[]; data?: CheckoutBody } {
  const errors: ValidationError[] = []
  const data = body as Record<string, unknown>

  // firstName
  if (typeof data.firstName !== "string" || !data.firstName.trim()) {
    errors.push({ field: "firstName", message: "Le prénom est requis" })
  } else if (data.firstName.trim().length > 100) {
    errors.push({ field: "firstName", message: "Le prénom est trop long (max 100 caractères)" })
  } else if (/[<>{}\\]/.test(data.firstName.trim())) {
    errors.push({ field: "firstName", message: "Le prénom contient des caractères non autorisés" })
  }

  // lastName (optional)
  if (data.lastName !== undefined && data.lastName !== null && data.lastName !== "") {
    if (typeof data.lastName !== "string" || data.lastName.trim().length > 100) {
      errors.push({ field: "lastName", message: "Le nom est trop long (max 100 caractères)" })
    } else if (/[<>{}\\]/.test(data.lastName.trim())) {
      errors.push({ field: "lastName", message: "Le nom contient des caractères non autorisés" })
    }
  }

  // phone
  if (typeof data.phone !== "string" || !data.phone.trim()) {
    errors.push({ field: "phone", message: "Le numéro de téléphone est requis" })
  } else {
    const cleanPhone = data.phone.replace(/\s/g, "")
    if (!PHONE_REGEX.test(cleanPhone)) {
      errors.push({ field: "phone", message: "Numéro de téléphone invalide (ex: 0555123456)" })
    }
  }

  // wilaya
  if (typeof data.wilaya !== "string" || !data.wilaya.trim()) {
    errors.push({ field: "wilaya", message: "La wilaya est requise" })
  } else if (!ALLOWED_WILAYAS.has(data.wilaya.trim())) {
    errors.push({ field: "wilaya", message: "Wilaya invalide" })
  }

  // deliveryType
  if (data.deliveryType !== "domicile" && data.deliveryType !== "bureau") {
    errors.push({ field: "deliveryType", message: "Type de livraison invalide" })
  }

  // bureau (required if deliveryType is "bureau")
  if (data.deliveryType === "bureau") {
    if (typeof data.bureau !== "string" || !data.bureau.trim()) {
      errors.push({ field: "bureau", message: "Veuillez sélectionner un bureau ZR Express" })
    } else if (/[<>{}\\]/.test(data.bureau.trim())) {
      errors.push({ field: "bureau", message: "Le bureau contient des caractères non autorisés" })
    }
  }

  // items
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push({ field: "items", message: "Le panier est vide" })
  } else {
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i] as Record<string, unknown>
      if (typeof item.id !== "string" || !item.id) {
        errors.push({ field: `items[${i}].id`, message: "ID de produit invalide" })
      }
      if (typeof item.name !== "string" || !item.name.trim()) {
        errors.push({ field: `items[${i}].name`, message: "Nom de produit invalide" })
      }
      if (typeof item.quantity !== "number" || item.quantity < 1 || item.quantity > 99) {
        errors.push({ field: `items[${i}].quantity`, message: "Quantité invalide (1-99)" })
      }
      // Validate price matches known product price
      const itemId = item.id as string
      const knownPrice = PRODUCT_PRICES[itemId]
      if (knownPrice === undefined) {
        errors.push({ field: `items[${i}].id`, message: `Produit inconnu: ${itemId}` })
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    errors: [],
    data: {
      firstName: (data.firstName as string).trim(),
      lastName: typeof data.lastName === "string" ? data.lastName.trim() : undefined,
      phone: (data.phone as string).replace(/\s/g, ""),
      wilaya: (data.wilaya as string).trim(),
      deliveryType: data.deliveryType as "domicile" | "bureau",
      bureau: data.deliveryType === "bureau" ? (data.bureau as string).trim() : undefined,
      items: (data.items as CartItem[]).map((item) => ({
        id: item.id,
        name: item.name,
        price: PRODUCT_PRICES[item.id]!, // Use server-side price, not client-provided
        quantity: item.quantity,
        image: item.image,
      })),
      promoCode: typeof data.promoCode === "string" ? data.promoCode.trim() : undefined,
    },
  }
}

function calculateShipping(wilaya: string, deliveryType: string): number {
  // This is a simplified server-side shipping calculation.
  // In production, you should fetch this from the wilayas.txt data or a database.
  const wilayaShippingRates: Record<string, { home: number; pickup: number }> = {
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

  const rates = wilayaShippingRates[wilaya]
  if (!rates) return 0

  return deliveryType === "domicile" ? rates.home : rates.pickup
}

function applyPromoCode(promoCode: string | undefined, subtotal: number): { code: string | null; discount: number } {
  if (!promoCode) {
    return { code: null, discount: 0 }
  }

  const normalizedCode = promoCode.toLowerCase().trim()
  const discountPercent = PROMO_CODES[normalizedCode]

  if (discountPercent === undefined) {
    return { code: null, discount: 0 }
  }

  const discount = Math.round(subtotal * discountPercent / 100)
  return { code: normalizedCode, discount }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { valid, errors, data } = validate(body)

    if (!valid || !data) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      )
    }

    // Recalculate subtotal from known prices
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Calculate shipping server-side
    const shipping = calculateShipping(data.wilaya, data.deliveryType)

    // Apply promo code
    const { code: appliedPromoCode, discount } = applyPromoCode(data.promoCode, subtotal)
    const total = subtotal + shipping - discount

    const deliveryLabel = data.deliveryType === "domicile" ? "À domicile" : "Bureau ZR Express"

// Insert order using service role key (bypasses RLS)
    const supabase = createAdminClient()
    const { data: inserted, error: insertError } = await supabase
      .from("orders")
      .insert({
        first_name: data.firstName,
        last_name: data.lastName || null,
        phone: data.phone,
        wilaya: data.wilaya,
        delivery_type: deliveryLabel,
        bureau: data.bureau || null,
        items: data.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || null,
        })),
        total,
      })
      .select("id, created_at")
      .single()

    if (insertError) {
      console.error("Supabase insert error:", insertError)
      return NextResponse.json(
        { success: false, errors: [{ field: "server", message: "Erreur lors de l'enregistrement de la commande" }] },
        { status: 500 }
      )
    }

    // Notify the shop owner after the response is flushed, so a slow or failing
    // email provider never delays or breaks a checkout that already succeeded.
    after(async () => {
      await sendNewOrderEmail({
        id: inserted?.id,
        createdAt: inserted?.created_at,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        wilaya: data.wilaya,
        deliveryType: deliveryLabel,
        bureau: data.bureau,
        items: data.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal,
        shipping,
        discount,
        promoCode: appliedPromoCode,
        total,
      })
    })

    return NextResponse.json({
      success: true,
      data: { phone: data.phone },
    })
  } catch (err) {
    console.error("Checkout API error:", err)
    // Surface a non-sensitive code so a misconfigured deployment is diagnosable
    // from the response alone. The message stays generic for shoppers.
    const code = err instanceof SupabaseConfigError ? "SERVER_MISCONFIGURED" : "INTERNAL_ERROR"
    return NextResponse.json(
      { success: false, code, errors: [{ field: "server", message: "Une erreur interne est survenue" }] },
      { status: 500 }
    )
  }
}
