"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Package,
  LogOut,
  Loader2,
  AlertCircle,
  ChevronDown,
  ShoppingBag,
  Phone,
  MapPin,
  Truck,
  Building,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

// --- Types ---

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string | null
}

interface Order {
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

// --- Order money breakdown ---
// Only the grand total is stored, so the products subtotal is recomputed from
// the line items and delivery is what remains: total = subtotal + shipping.
// The discount term is added back for orders that record one; clamped at zero
// so a promo order can never render a negative delivery figure.

function lineTotal(item: OrderItem): number {
  return item.price * item.quantity
}

function orderSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0)
}

function orderShipping(order: Order): number {
  return Math.max(0, order.total - orderSubtotal(order.items) + (order.discount ?? 0))
}

// --- Status config ---

const STATUS_CONFIG: Record<
  string,
  { label: string; color: "default" | "secondary" | "destructive" | "outline" }
> = {
  "en attente": { label: "En attente", color: "outline" },
  confirmée: { label: "Confirmée", color: "default" },
  annulé: { label: "Annulé", color: "destructive" },
  "ne répond pas": { label: "Ne répond pas", color: "secondary" },
  "injoignable/éteint": { label: "Injoignable/Éteint", color: "destructive" },
}

const VALID_STATUSES = ["en attente", "confirmée", "annulé", "ne répond pas", "injoignable/éteint"] as const

// --- Login Page ---

function LoginPage({ onLogin }: { onLogin: (password: string) => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Verify password by attempting to fetch orders
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-key": password },
      })
      const result = await res.json()

      if (res.ok && result.success) {
        onLogin(password)
      } else {
        setError("Mot de passe incorrect")
      }
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-serif">Administration</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les commandes Gateline Cosmetics
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe administrateur</Label>
              <Input
                id="password"
                type="password"
                placeholder="Entrez le mot de passe"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                autoFocus
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading || !password.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Order Status Badge (clickable) ---

function StatusBadge({
  status,
  onClick,
}: {
  status: string
  onClick: (newStatus: string) => void
}) {
  const config = STATUS_CONFIG[status] || { label: status, color: "outline" as const }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-1 cursor-pointer">
          <Badge variant={config.color} className="cursor-pointer hover:opacity-80 transition-opacity">
            {config.label}
            <ChevronDown className="w-3 h-3" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {VALID_STATUSES.map((s) => {
          const itemConfig = STATUS_CONFIG[s]
          return (
            <DropdownMenuItem
              key={s}
              onClick={() => onClick(s)}
              className={s === status ? "bg-accent" : ""}
            >
              <Badge variant={itemConfig.color} className="mr-2">
                {itemConfig.label}
              </Badge>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// --- Format helpers ---

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "dd MMM yyyy HH:mm", { locale: fr })
  } catch {
    return dateStr
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(amount).replace("DZD", "DZD").trim()
}

// --- Summary Cards ---

function DashboardCards({ orders }: { orders: Order[] }) {
  const total = orders.length
  const pending = orders.filter((o) => o.status === "en attente").length
  const confirmed = orders.filter((o) => o.status === "confirmée").length
  const cancelled = orders.filter((o) => o.status === "annulé").length
  const active = orders.filter((o) => o.status !== "annulé")
  const revenue = active.reduce((sum, o) => sum + o.total, 0)
  const productRevenue = active.reduce((sum, o) => sum + orderSubtotal(o.items), 0)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
      <Card>
        <CardContent className="p-4 flex flex-col items-center text-center">
          <ShoppingBag className="w-5 h-5 text-primary mb-1" />
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center text-center">
          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground mb-1" />
          <p className="text-2xl font-bold">{pending}</p>
          <p className="text-xs text-muted-foreground">En attente</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center text-center">
          <div className="w-5 h-5 rounded-full bg-primary mb-1" />
          <p className="text-2xl font-bold">{confirmed}</p>
          <p className="text-xs text-muted-foreground">Confirmées</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center text-center">
          <div className="w-5 h-5 rounded-full bg-destructive mb-1" />
          <p className="text-2xl font-bold">{cancelled}</p>
          <p className="text-xs text-muted-foreground">Annulées</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center text-center">
          <p className="text-xl font-bold whitespace-nowrap">{formatCurrency(revenue)}</p>
          <p className="text-xs text-muted-foreground">Revenu</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center text-center">
          <p className="text-xl font-bold whitespace-nowrap">{formatCurrency(productRevenue)}</p>
          <p className="text-xs text-muted-foreground">Revenu hors livraison</p>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Per-product breakdown ---

interface ProductStat {
  id: string
  name: string
  orders: number
  quantity: number
  revenue: number
}

// Aggregates the line items of every non-cancelled order. "orders" counts each
// order once even when it contains several units of the product.
function productStats(orders: Order[]): ProductStat[] {
  const stats = new Map<string, ProductStat>()

  for (const order of orders) {
    if (order.status === "annulé") continue
    const seen = new Set<string>()

    for (const item of order.items as OrderItem[]) {
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

function ProductBreakdown({ orders }: { orders: Order[] }) {
  const stats = productStats(orders)
  if (stats.length === 0) return null

  const totalQuantity = stats.reduce((sum, s) => sum + s.quantity, 0)
  const totalRevenue = stats.reduce((sum, s) => sum + s.revenue, 0)

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-serif flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Ventes par produit
          <span className="text-sm font-sans font-normal text-muted-foreground">
            (hors livraison, commandes annulées exclues)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Commandes</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Revenu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium">{stat.name}</TableCell>
                  <TableCell className="text-right">{stat.orders}</TableCell>
                  <TableCell className="text-right">{stat.quantity}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {formatCurrency(stat.revenue)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2">
                <TableCell className="font-semibold">Total</TableCell>
                <TableCell className="text-right text-muted-foreground">—</TableCell>
                <TableCell className="text-right font-semibold">{totalQuantity}</TableCell>
                <TableCell className="text-right font-semibold whitespace-nowrap">
                  {formatCurrency(totalRevenue)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main Page ---

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Handle login
  const handleLogin = useCallback((password: string) => {
    setAdminKey(password)
    // Store in sessionStorage so it persists on navigation
    sessionStorage.setItem("admin_key", password)
  }, [])

  const handleLogout = useCallback(() => {
    setAdminKey(null)
    sessionStorage.removeItem("admin_key")
    setOrders([])
  }, [])

  // Check sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_key")
    if (stored) {
      setAdminKey(stored)
    } else {
      setLoading(false)
    }
  }, [])

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!adminKey) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-key": adminKey },
      })
      const result = await res.json()

      if (res.ok && result.success) {
        setOrders(result.data)
      } else {
        if (res.status === 401) {
          // Password is wrong or expired
          handleLogout()
          return
        }
        setError(result.error || "Erreur lors du chargement des commandes")
      }
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }, [adminKey, handleLogout])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Update order status
  const updateStatus = useCallback(
    async (orderId: string, newStatus: string) => {
      if (!adminKey) return

      setUpdatingId(orderId)

      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey,
          },
          body: JSON.stringify({ status: newStatus }),
        })
        const result = await res.json()

        if (res.ok && result.success) {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderId
                ? { ...o, status: newStatus as Order["status"] }
                : o
            )
          )
        } else {
          console.error("Failed to update status:", result.error)
        }
      } catch (err) {
        console.error("Error updating status:", err)
      } finally {
        setUpdatingId(null)
      }
    },
    [adminKey]
  )

  // If not logged in, show login
  if (!adminKey) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-lg text-foreground leading-tight">
                Gateline Cosmetics
              </h1>
              <p className="text-xs text-muted-foreground">Administration des commandes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchOrders}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Dashboard Cards */}
        {!loading && orders.length > 0 && <DashboardCards orders={orders} />}

        {/* Per-product breakdown */}
        {!loading && orders.length > 0 && <ProductBreakdown orders={orders} />}

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-4 rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <Button variant="outline" size="sm" onClick={fetchOrders} className="ml-auto">
              Réessayer
            </Button>
          </div>
        )}

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Commandes
              {orders.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({orders.length} commande{orders.length > 1 ? "s" : ""})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              // Loading skeleton
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-20" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              // Empty state
              <div className="text-center py-16 px-6">
                <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Aucune commande pour le moment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Les nouvelles commandes apparaîtront ici automatiquement.
                </p>
              </div>
            ) : (
              // Table - Desktop
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="w-[130px]">Téléphone</TableHead>
                      <TableHead className="w-[130px]">Wilaya</TableHead>
                      <TableHead className="w-[160px]">Livraison</TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead className="w-[100px] text-right">Total</TableHead>
                      <TableHead className="w-[150px]">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.first_name}
                          {order.last_name ? ` ${order.last_name}` : ""}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`tel:${order.phone}`}
                            className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            {order.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {order.wilaya}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="flex items-center gap-1">
                            {order.delivery_type === "À domicile" ? (
                              <Truck className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <Building className="w-3 h-3 text-muted-foreground" />
                            )}
                            {order.delivery_type === "À domicile"
                              ? "Domicile"
                              : "Bureau"}
                          </span>
                          {order.bureau && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {order.bureau}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-0.5 max-w-[240px]">
                            {(order.items as OrderItem[]).map((item, idx) => (
                              <div key={idx} className="flex justify-between gap-2">
                                <span className="truncate">
                                  {item.name} x{item.quantity}
                                </span>
                                <span className="whitespace-nowrap text-muted-foreground">
                                  {formatCurrency(lineTotal(item))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="font-medium">{formatCurrency(order.total)}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Produits {formatCurrency(orderSubtotal(order.items))}
                          </div>
                          {(order.discount ?? 0) > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Remise −{formatCurrency(order.discount ?? 0)}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Livraison {formatCurrency(orderShipping(order))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {updatingId === order.id ? (
                            <Badge variant="outline" className="animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              Mise à jour...
                            </Badge>
                          ) : (
                            <StatusBadge
                              status={order.status}
                              onClick={(newStatus) => updateStatus(order.id, newStatus)}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Mobile / Tablet Cards */}
            {orders.length > 0 && (
              <div className="lg:hidden space-y-4 p-4">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      {/* Top row: Date + Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.created_at)}
                        </span>
                        {updatingId === order.id ? (
                          <Badge variant="outline" className="animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ...
                          </Badge>
                        ) : (
                          <StatusBadge
                            status={order.status}
                            onClick={(newStatus) => updateStatus(order.id, newStatus)}
                          />
                        )}
                      </div>

                      {/* Customer info */}
                      <div>
                        <p className="font-medium text-foreground">
                          {order.first_name}
                          {order.last_name ? ` ${order.last_name}` : ""}
                        </p>
                        <a
                          href={`tel:${order.phone}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          {order.phone}
                        </a>
                      </div>

                      {/* Delivery info */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {order.wilaya}
                        </span>
                        <span className="flex items-center gap-1">
                          {order.delivery_type === "À domicile" ? (
                            <Truck className="w-3 h-3" />
                          ) : (
                            <Building className="w-3 h-3" />
                          )}
                          {order.delivery_type === "À domicile"
                            ? "Domicile"
                            : "Bureau"}
                        </span>
                      </div>
                      {order.bureau && (
                        <p className="text-xs text-muted-foreground -mt-2">
                          Bureau: {order.bureau}
                        </p>
                      )}

                      {/* Items */}
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {(order.items as OrderItem[]).map((item, idx) => (
                          <div key={idx} className="flex justify-between gap-2">
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span className="whitespace-nowrap">
                              {formatCurrency(lineTotal(item))}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Totals */}
                      <div className="pt-2 border-t border-border/50 space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Produits (hors livraison)</span>
                          <span>{formatCurrency(orderSubtotal(order.items))}</span>
                        </div>
                        {(order.discount ?? 0) > 0 && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Remise{order.promo_code ? ` (${order.promo_code})` : ""}</span>
                            <span>−{formatCurrency(order.discount ?? 0)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Livraison</span>
                          <span>{formatCurrency(orderShipping(order))}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm text-muted-foreground">Total</span>
                          <span className="font-semibold text-foreground">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

