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
