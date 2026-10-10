"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { format, startOfMonth } from "date-fns"
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
  BarChart3,
  Search,
  X,
  Pencil,
  Repeat,
  Undo2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { AdminLogin } from "@/components/admin/admin-login"
import { OrderEditDialog } from "@/components/admin/order-edit-dialog"
import { MonthPicker } from "@/components/admin/month-picker"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import {
  type Order,
  type OrderItem,
  deliveredOrders,
  formatCurrency,
  lineTotal,
  orderShipping,
  orderSubtotal,
  ordersInMonth,
  DELIVERY_STATUSES,
  type DeliveryStatus,
  deliveryStatusOf,
  swapCandidates,
  SWAP_LIMIT,
  canSwap,
  isSameWilaya,
  isRestrictedWilaya,
  swapCost,
  swapCountOf,
  isReturned,
  SWAP_COST_SAME_WILAYA,
  SWAP_COST_OTHER_WILAYA,
} from "@/lib/admin"

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

// --- Delivery Status Badge (clickable) ---

// There is no yellow badge variant, so "swap" carries its own colours; they win
// over the variant's because cn() merges Tailwind classes last-one-wins.
const SWAP_BADGE = "border-transparent bg-yellow-400 text-yellow-950 hover:bg-yellow-400/80"

const DELIVERY_CONFIG: Record<
  DeliveryStatus,
  { color: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  "Pas encore envoyée": { color: "outline" },
  Envoyée: { color: "secondary" },
  livrée: { color: "default" },
  swap: { color: "outline", className: SWAP_BADGE },
  retour: { color: "destructive" },
}

function DeliveryBadge({
  status,
  onClick,
}: {
  status: DeliveryStatus
  onClick: (newStatus: DeliveryStatus) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-1 cursor-pointer">
          <Badge
            variant={DELIVERY_CONFIG[status].color}
            className={`cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${
              DELIVERY_CONFIG[status].className ?? ""
            }`}
          >
            {status}
            <ChevronDown className="w-3 h-3" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {DELIVERY_STATUSES.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => onClick(s)}
            className={s === status ? "bg-accent" : ""}
          >
            <Badge
              variant={DELIVERY_CONFIG[s].color}
              className={`mr-2 ${DELIVERY_CONFIG[s].className ?? ""}`}
            >
              {s}
            </Badge>
          </DropdownMenuItem>
        ))}
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

// --- Summary Cards ---

function DashboardCards({ orders }: { orders: Order[] }) {
  const total = orders.length
  const pending = orders.filter((o) => o.status === "en attente").length
  const confirmed = orders.filter((o) => o.status === "confirmée").length
  const cancelled = orders.filter((o) => o.status === "annulé").length
  const swapped = orders.filter((o) => deliveryStatusOf(o) === "swap").length
  const returned = orders.filter((o) => isReturned(o)).length
  // Paid on delivery, so only delivered orders count as revenue
  const earning = deliveredOrders(orders)
  const revenue = earning.reduce((sum, o) => sum + o.total, 0)
  const productRevenue = earning.reduce((sum, o) => sum + orderSubtotal(o.items), 0)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-10 gap-4 mb-8">
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
          <Repeat className="w-5 h-5 text-yellow-500 mb-1" />
          <p className="text-2xl font-bold">{swapped}</p>
          <p className="text-xs text-muted-foreground">Swap</p>
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
          <Undo2 className="w-5 h-5 text-destructive mb-1" />
          <p className="text-2xl font-bold">{returned}</p>
          <p className="text-xs text-muted-foreground">Retour</p>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <p className="text-xl font-bold whitespace-nowrap">{formatCurrency(revenue)}</p>
          <p className="text-xs text-muted-foreground">Revenu</p>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <p className="text-xl font-bold whitespace-nowrap">{formatCurrency(productRevenue)}</p>
          <p className="text-xs text-muted-foreground">Revenu hors livraison</p>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Main Page ---

export default function AdminPage() {
  const { adminKey, ready, login: handleLogin, logout } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<Order | null>(null)
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState<string | null>(null)
  // The order whose swap picker is open
  const [swapFor, setSwapFor] = useState<Order | null>(null)
  const [swappingId, setSwappingId] = useState<string | null>(null)

  // Cards and list are both scoped to the picked month
  const monthOrders = ordersInMonth(orders, month)

  // Name search, accent- and case-insensitive; phone is included because it is
  // how a customer is identified on the confirmation call.
  const normalise = (value: string) =>
    value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  const needle = normalise(query.trim())
  // Kept in the order the API returns them — newest first. The list is read
  // chronologically, so status must not reshuffle it.
  const filteredOrders = needle
    ? monthOrders.filter((o) =>
        normalise(`${o.first_name} ${o.last_name ?? ""} ${o.phone}`).includes(needle)
      )
    : monthOrders

  const handleLogout = useCallback(() => {
    logout()
    setOrders([])
  }, [logout])

  // Nothing to load until the stored key has been read
  useEffect(() => {
    if (ready && !adminKey) setLoading(false)
  }, [ready, adminKey])

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

  // Update where the order is in the shipping pipeline
  const updateDeliveryStatus = useCallback(
    async (orderId: string, newStatus: DeliveryStatus) => {
      if (!adminKey) return

      setUpdatingDeliveryId(orderId)

      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey,
          },
          body: JSON.stringify({ deliveryStatus: newStatus }),
        })
        const result = await res.json()

        if (res.ok && result.success) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, delivery_status: newStatus } : o))
          )
        } else {
          setError(result.error || "Erreur lors de la mise à jour de la livraison")
        }
      } catch (err) {
        console.error("Error updating delivery status:", err)
        setError("Erreur de connexion au serveur")
      } finally {
        setUpdatingDeliveryId(null)
      }
    },
    [adminKey]
  )

  // Re-route a shipped parcel to another customer with an identical order: the
  // chosen order becomes "Envoyée" and the courier fee is booked on the one
  // that was re-routed.
  const performSwap = useCallback(
    async (source: Order, target: Order) => {
      if (!adminKey) return

      setSwappingId(target.id)
      setError(null)

      try {
        const res = await fetch(`/api/admin/orders/${source.id}/swap`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey,
          },
          body: JSON.stringify({ targetId: target.id }),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          setError(result.error || "Erreur lors du swap")
          return
        }

        setOrders((prev) =>
          prev.map((o) => {
            if (o.id === target.id) return { ...o, delivery_status: "Envoyée" as DeliveryStatus }
            if (o.id === source.id) {
              return {
                ...o,
                delivery_status: "swap" as DeliveryStatus,
                swap_count: result.data.source.swap_count,
                swap_cost: result.data.source.swap_cost,
              }
            }
            return o
          })
        )
        setSwapFor(null)
      } catch (err) {
        console.error("Error swapping order:", err)
        setError("Erreur de connexion au serveur")
      } finally {
        setSwappingId(null)
      }
    },
    [adminKey]
  )

  // Save a full edit. Returns an error message, or null when it succeeded, so
  // the dialog can keep itself open and show what went wrong.
  const saveOrder = useCallback(
    async (orderId: string, payload: Record<string, unknown>): Promise<string | null> => {
      if (!adminKey) return "Session expirée"

      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey,
          },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          return result.error || "Erreur lors de la mise à jour de la commande"
        }

        // The server re-costs the order, so take its version rather than ours
        setOrders((prev) => prev.map((o) => (o.id === orderId ? (result.data as Order) : o)))
        return null
      } catch {
        return "Erreur de connexion au serveur"
      }
    },
    [adminKey]
  )

  // Wait for sessionStorage to be read so the login form does not flash
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // If not logged in, show login
  if (!adminKey) {
    return <AdminLogin onLogin={handleLogin} />
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
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/analytics">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Link>
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
        {!loading && orders.length > 0 && (
          <>
            <div className="flex justify-end mb-4">
              <MonthPicker month={month} onChange={setMonth} />
            </div>
            <DashboardCards orders={monthOrders} />
          </>
        )}

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
                  ({filteredOrders.length}
                  {filteredOrders.length !== monthOrders.length ? ` / ${monthOrders.length}` : ""} commande
                  {filteredOrders.length > 1 ? "s" : ""} en{" "}
                  <span className="capitalize">{format(month, "LLLL yyyy", { locale: fr })}</span>)
                </span>
              )}
            </CardTitle>

            <div className="relative mt-4 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par nom ou téléphone..."
                className="pl-9 pr-9"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Effacer la recherche"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
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
            ) : filteredOrders.length === 0 ? (
              // Empty state
              <div className="text-center py-16 px-6">
                <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {query
                    ? "Aucun résultat"
                    : orders.length > 0
                      ? "Aucune commande ce mois"
                      : "Aucune commande pour le moment"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {query
                    ? `Aucune commande ne correspond à « ${query} ».`
                    : orders.length > 0
                      ? `Aucune commande en ${format(month, "LLLL yyyy", { locale: fr })}.`
                      : "Les nouvelles commandes apparaîtront ici automatiquement."}
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
                      <TableHead className="w-[160px]">Mode de livraison</TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead className="w-[100px] text-right">Total</TableHead>
                      <TableHead className="w-[150px]">Statut</TableHead>
                      <TableHead className="w-[110px]">Actions</TableHead>
                      <TableHead className="w-[230px]">Livraison</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
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
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setEditing(order)}>
                            <Pencil className="w-4 h-4" />
                            Modifier
                          </Button>
                        </TableCell>
                        {/* Shipping pipeline — only meaningful once the order is confirmed */}
                        <TableCell>
                          {order.status !== "confirmée" ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : updatingDeliveryId === order.id ? (
                            <Badge variant="outline" className="animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              Mise à jour...
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-2">
                              <DeliveryBadge
                                status={deliveryStatusOf(order)}
                                onClick={(newStatus) => updateDeliveryStatus(order.id, newStatus)}
                              />
                              {deliveryStatusOf(order) === "Envoyée" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={!canSwap(order)}
                                  onClick={() => setSwapFor(order)}
                                  title={
                                    canSwap(order)
                                      ? "Échanger cette commande"
                                      : `Limite de ${SWAP_LIMIT} swaps atteinte`
                                  }
                                >
                                  <Repeat className="w-3.5 h-3.5" />
                                  Swap
                                  {swapCountOf(order) > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      {swapCountOf(order)}/{SWAP_LIMIT}
                                    </span>
                                  )}
                                </Button>
                              )}
                            </div>
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
                {filteredOrders.map((order) => (
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

                      {order.status === "confirmée" && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">Livraison</span>
                          {updatingDeliveryId === order.id ? (
                            <Badge variant="outline" className="animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ...
                            </Badge>
                          ) : (
                            <>
                              <DeliveryBadge
                                status={deliveryStatusOf(order)}
                                onClick={(newStatus) => updateDeliveryStatus(order.id, newStatus)}
                              />
                              {deliveryStatusOf(order) === "Envoyée" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-auto"
                                  disabled={!canSwap(order)}
                                  onClick={() => setSwapFor(order)}
                                >
                                  <Repeat className="w-3.5 h-3.5" />
                                  Swap
                                  {swapCountOf(order) > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      {swapCountOf(order)}/{SWAP_LIMIT}
                                    </span>
                                  )}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setEditing(order)}
                      >
                        <Pencil className="w-4 h-4" />
                        Modifier la commande
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Swap picker: orders holding exactly the same products and quantities
          that have not been shipped yet. Searched across every order, not just
          the month on screen. */}
      <Dialog open={swapFor !== null} onOpenChange={(open) => !open && setSwapFor(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Swap de commande</DialogTitle>
            <DialogDescription>
              {swapFor && (
                <>
                  Commandes identiques à celle de {swapFor.first_name}
                  {swapFor.last_name ? ` ${swapFor.last_name}` : ""} (
                  {swapFor.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}) qui
                  ne sont pas encore envoyées.
                  {isRestrictedWilaya(swapFor.wilaya) && (
                    <span className="text-foreground">
                      {" "}
                      {swapFor.wilaya} est une wilaya éloignée : seules les commandes de la même
                      wilaya peuvent être échangées.
                    </span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {(() => {
            if (!swapFor) return null
            const candidates = swapCandidates(swapFor, orders)

            if (candidates.length === 0) {
              return (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Pas de commande éligible au swap
                </p>
              )
            }

            return (
              <div className="space-y-3">
                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    même wilaya · {formatCurrency(SWAP_COST_SAME_WILAYA)} de frais
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    autre wilaya · {formatCurrency(SWAP_COST_OTHER_WILAYA)} de frais
                  </span>
                </p>

                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 rounded-xl border border-border/50"
                  >
                    {/* Green while the parcel stays in its wilaya, yellow when it travels */}
                    <span
                      aria-hidden="true"
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        isSameWilaya(swapFor, candidate) ? "bg-green-500" : "bg-yellow-400"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-medium text-foreground">
                          {candidate.first_name}
                          {candidate.last_name ? ` ${candidate.last_name}` : ""}
                        </span>
                        <Badge
                          variant={
                            STATUS_CONFIG[candidate.status]?.color ?? "outline"
                          }
                        >
                          {STATUS_CONFIG[candidate.status]?.label ?? candidate.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(candidate.created_at)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {candidate.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {candidate.wilaya}
                        </span>
                        <span className="flex items-center gap-1">
                          {candidate.delivery_type === "À domicile" ? (
                            <Truck className="w-3 h-3" />
                          ) : (
                            <Building className="w-3 h-3" />
                          )}
                          {candidate.delivery_type === "À domicile" ? "Domicile" : "Bureau"}
                          {candidate.bureau ? ` · ${candidate.bureau}` : ""}
                        </span>
                      </div>
                    </div>
                    <span className="font-medium whitespace-nowrap">
                      {formatCurrency(candidate.total)}
                    </span>
                    <Button
                      size="sm"
                      disabled={swappingId !== null}
                      onClick={() => performSwap(swapFor, candidate)}
                    >
                      {swappingId === candidate.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Repeat className="w-3.5 h-3.5" />
                      )}
                      Swap −{formatCurrency(swapCost(swapFor, candidate))}
                    </Button>
                  </div>
                ))}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      <OrderEditDialog
        order={editing}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        onSave={saveOrder}
      />
    </div>
  )
}

