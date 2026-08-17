// Order pricing data shared by the public checkout and the admin edit route, so
// an order re-costed by an admin uses exactly the same prices and shipping
// rates it was created with.

// Known product prices for server-side validation and total recalculation
export const PRODUCT_PRICES: Record<string, number> = {
  "radiance-serum": 1600,
  "hydrating-serum": 1600,
  "hydra-cream": 900,
  "gentle-cleanser": 900,
  "night-cream": 900,
  "renewal-oil": 1500,
  "rosehip-oil": 1200,
  "deodorant-fraicheur": 750,
  "deodorant-vanille": 750,
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
