import { PACK_VARIANTS } from "@/lib/orders"

// Shared types and money helpers for the admin pages (/admin and /admin/analytics).

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string | null
}

export interface Order {
  id: string
  first_name: string
  last_name: string | null
  phone: string
  wilaya: string
  delivery_type: string
  bureau: string | null
  items: OrderItem[]
  total: number
  promo_code?: string | null
  discount?: number | null
  status: "en attente" | "confirmée" | "annulé" | "ne répond pas" | "injoignable/éteint"
  // Optional so the admin still renders against a database where migration 005
  // has not been applied yet; missing means "not shipped".
  delivery_status?: DeliveryStatus
  swap_count?: number
  swap_cost?: number
  created_at: string
}

// --- Delivery pipeline ---
// Where a confirmed order is on its way to the customer. Independent of
// `status`, which records the outcome of the confirmation call.

// "swap" marks a parcel that was re-routed to another customer: it left on the
// original order and was handed to someone else, so it never reached this one.
// "retour" marks a parcel that came back unsold, which the courier charges for.
export const DELIVERY_STATUSES = [
  "Pas encore envoyée",
  "Envoyée",
  "livrée",
  "swap",
  "retour",
] as const

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number]

export const DEFAULT_DELIVERY_STATUS: DeliveryStatus = "Pas encore envoyée"

export function deliveryStatusOf(order: Order): DeliveryStatus {
  return order.delivery_status ?? DEFAULT_DELIVERY_STATUS
}

// --- Swap candidates ---
// A shipped order can be swapped with one that has not left yet, as long as it
// holds exactly the same products in exactly the same quantities.

// Quantities are merged per product and sorted, so two orders listing the same
// products in a different order — or splitting one product across two lines —
// still compare as identical.
export function itemsSignature(items: OrderItem[]): string {
  const byProduct = new Map<string, number>()
  for (const item of items) {
    byProduct.set(item.id, (byProduct.get(item.id) ?? 0) + item.quantity)
  }
  return [...byProduct.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, quantity]) => `${id}x${quantity}`)
    .join("|")
}

// A parcel may be re-routed at most twice before it has to come back.
export const SWAP_LIMIT = 2

// Courier fee for re-routing a parcel, in DZD.
export const SWAP_COST_SAME_WILAYA = 50
export const SWAP_COST_OTHER_WILAYA = 100

// The far-south and border wilayas: a parcel sitting in one of them is too
// expensive to move out, so it can only be re-routed to the same wilaya.
export const RESTRICTED_SWAP_WILAYAS = new Set([
  "Adrar",
  "Bechar",
  "Tamanrasset",
  "Ouargla",
  "El Bayadh",
  "Naama",
  "Timimoun",
  "Beni Abbes",
  "In Salah",
  "In Guezzam",
  "El Menia",
])

function normaliseWilaya(wilaya: string): string {
  return wilaya.trim().toLowerCase()
}

const RESTRICTED_NORMALISED = new Set([...RESTRICTED_SWAP_WILAYAS].map(normaliseWilaya))

export function isSameWilaya(a: Order, b: Order): boolean {
  return normaliseWilaya(a.wilaya) === normaliseWilaya(b.wilaya)
}

export function isRestrictedWilaya(wilaya: string): boolean {
  return RESTRICTED_NORMALISED.has(normaliseWilaya(wilaya))
}

// Either side being in a restricted wilaya pins the swap to that wilaya.
export function wilayasSwappable(a: Order, b: Order): boolean {
  if (isSameWilaya(a, b)) return true
  return !isRestrictedWilaya(a.wilaya) && !isRestrictedWilaya(b.wilaya)
}

export function swapCost(a: Order, b: Order): number {
  return isSameWilaya(a, b) ? SWAP_COST_SAME_WILAYA : SWAP_COST_OTHER_WILAYA
}

export function swapCountOf(order: Order): number {
  return order.swap_count ?? 0
}

export function swapCostOf(order: Order): number {
  return order.swap_cost ?? 0
}

export function canSwap(order: Order): boolean {
  return swapCountOf(order) < SWAP_LIMIT
}

export function swapCandidates(order: Order, orders: Order[]): Order[] {
  const signature = itemsSignature(order.items)

  return orders
    .filter(
      (other) =>
        other.id !== order.id &&
        other.status !== "annulé" &&
        deliveryStatusOf(other) === DEFAULT_DELIVERY_STATUS &&
        itemsSignature(other.items) === signature &&
        wilayasSwappable(order, other)
    )
    // Confirmed first, and within each of those the same wilaya before the
    // rest, so the four groups read: confirmée+même wilaya, confirmée+autre,
    // non confirmée+même wilaya, non confirmée+autre. Newest first inside each.
    .sort((a, b) => {
      const rank = (o: Order) =>
        (o.status === "confirmée" ? 0 : 2) + (isSameWilaya(order, o) ? 0 : 1)
      if (rank(a) !== rank(b)) return rank(a) - rank(b)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
}

// Swap fees are a cost to the shop: they come off both revenue and profit.
export function totalSwapCost(orders: Order[]): number {
  return orders.reduce((sum, order) => sum + swapCostOf(order), 0)
}

// --- Returns ---
// What the courier charges to bring an undelivered parcel back. Derived from
// the delivery status rather than stored, so clearing the status clears the fee.

export const RETURN_COST = 200

export function isReturned(order: Order): boolean {
  return deliveryStatusOf(order) === "retour"
}

export function returnCostOf(order: Order): number {
  return isReturned(order) ? RETURN_COST : 0
}

export function totalReturnCost(orders: Order[]): number {
  return orders.reduce((sum, order) => sum + returnCostOf(order), 0)
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(amount).replace("DZD", "DZD").trim()
}

// --- Order money breakdown ---
// Only the grand total is stored, so the products subtotal is recomputed from
// the line items and delivery is what remains: total = subtotal + shipping.
// The discount term is added back for orders that record one; clamped at zero
// so a promo order can never render a negative delivery figure.

export function lineTotal(item: OrderItem): number {
  return item.price * item.quantity
}

export function orderSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0)
}

export function orderShipping(order: Order): number {
  return Math.max(0, order.total - orderSubtotal(order.items) + (order.discount ?? 0))
}

// --- Revenue scope ---
// Every revenue figure counts confirmed orders only. Pending, unreachable and
// cancelled orders are not money earned, so they must not inflate the totals.

export function isConfirmed(order: Order): boolean {
  return order.status === "confirmée"
}

export function confirmedOrders(orders: Order[]): Order[] {
  return orders.filter(isConfirmed)
}

// --- Production costs ---
// Unit cost in DZD, taken from the Skincare Business Manager, keyed by the same
// product ids the checkout route prices. A product missing from here is treated
// as costing nothing, which would overstate profit — surfaceUnpricedItems()
// reports any such id so it cannot pass unnoticed.

export const PRODUCTION_COSTS: Record<string, number> = {
  "radiance-serum": 430,       // Toner Pads 4% Niacinamide      — vend 1600
  "hydrating-serum": 500,      // Toner Pads 5% AHA glycolique   — vend 1600
  "hydra-cream": 310,          // Contour des yeux à la caféine  — vend 900
  "gentle-cleanser": 310,      // Contour des yeux au collagène  — vend 900
  "night-cream": 270,          // Contour des yeux au rétinol    — vend 900
  "renewal-oil": 630,          // Glass skin masque collagène    — vend 1500
  "rosehip-oil": 500,          // Clear pore masque              — vend 1200
  "deodorant-fraicheur": 300,  // Déodorant                      — vend 750
  "deodorant-vanille": 300,    // Déodorant                      — vend 750
}

// Every pack combination costs the sum of what is inside it
const PACK_PRODUCTION_COSTS: Record<string, number> = Object.fromEntries(
  PACK_VARIANTS.map((variant) => [
    variant.id,
    variant.components.reduce((sum, id) => sum + (PRODUCTION_COSTS[id] ?? 0), 0),
  ])
)

function unitCost(productId: string): number {
  return PRODUCTION_COSTS[productId] ?? PACK_PRODUCTION_COSTS[productId] ?? 0
}

export function orderProductionCost(order: Order): number {
  return order.items.reduce(
    (sum, item) => sum + unitCost(item.id) * item.quantity,
    0
  )
}

// Ids sold but absent from PRODUCTION_COSTS, so the profit figure can warn
// rather than quietly count them as pure margin.
export function unpricedItems(orders: Order[]): string[] {
  const missing = new Set<string>()

  for (const order of confirmedOrders(orders)) {
    for (const item of order.items) {
      if (PRODUCTION_COSTS[item.id] === undefined && PACK_PRODUCTION_COSTS[item.id] === undefined) {
        missing.add(item.id)
      }
    }
  }

  return [...missing]
}

// --- Daily breakdown ---

export interface DayStat {
  orders: number          // every order placed that day, whatever its status
  confirmed: number       // how many of those are confirmed
  revenue: number         // confirmed revenue, delivery included
  productRevenue: number  // confirmed revenue excluding delivery
}

// created_at is stored in UTC. Keying on the browser's local calendar day keeps
// the grouping aligned with the shop's own day rather than splitting an evening
// order into the next date.
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

// Orders placed within the given calendar month, using the same local-day
// grouping as dayKey so the two never disagree at a month boundary.
export function ordersInMonth(orders: Order[], month: Date): Order[] {
  const prefix = dayKey(month).slice(0, 7) // "YYYY-MM"
  return orders.filter((order) => dayKey(new Date(order.created_at)).startsWith(prefix))
}

export function dailyStats(orders: Order[]): Map<string, DayStat> {
  const byDay = new Map<string, DayStat>()

  for (const order of orders) {
    const key = dayKey(new Date(order.created_at))
    const stat = byDay.get(key) ?? { orders: 0, confirmed: 0, revenue: 0, productRevenue: 0 }

    stat.orders += 1
    if (isConfirmed(order)) {
      stat.confirmed += 1
      stat.revenue += order.total
      stat.productRevenue += orderSubtotal(order.items)
    }

    byDay.set(key, stat)
  }

  return byDay
}

// --- Per-product breakdown ---

export interface ProductStat {
  id: string
  name: string
  orders: number
  quantity: number
  revenue: number
}

// Aggregates the line items of every confirmed order, so the revenue column
// agrees with the dashboard figures. "orders" counts each order once even when
// it contains several units of the product.
export function productStats(orders: Order[]): ProductStat[] {
  const stats = new Map<string, ProductStat>()

  for (const order of orders) {
    if (!isConfirmed(order)) continue
    const seen = new Set<string>()

    for (const item of order.items) {
      const key = item.id || item.name
      const stat = stats.get(key) ?? { id: key, name: item.name, orders: 0, quantity: 0, revenue: 0 }

      if (!seen.has(key)) {
        stat.orders += 1
        seen.add(key)
      }
      stat.quantity += item.quantity
      stat.revenue += lineTotal(item)
      stats.set(key, stat)
    }
  }

  return [...stats.values()].sort((a, b) => b.revenue - a.revenue)
}
