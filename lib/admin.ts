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
  created_at: string
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
  "renewal-oil": 450,          // Glass skin masque collagène    — vend 1500
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
