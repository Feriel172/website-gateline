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
  ChevronLeft,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminLogin } from "@/components/admin/admin-login"
import { ProductBreakdown } from "@/components/admin/product-breakdown"
import { OrdersCalendar } from "@/components/admin/orders-calendar"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import {
  type Order,
  confirmedOrders,
  formatCurrency,
  orderProductionCost,
  orderSubtotal,
  ordersInMonth,
  totalReturnCost,
  totalSwapCost,
  unpricedItems,
} from "@/lib/admin"

export default function AdminAnalyticsPage() {
  const { adminKey, ready, login, logout } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState(() => startOfMonth(new Date()))

  const fetchOrders = useCallback(async () => {
    if (!adminKey) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-key": adminKey },
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        if (res.status === 401) {
          logout()
          return
        }
        setError(result.error || "Erreur lors du chargement des commandes")
        return
      }

      setOrders(result.data as Order[])
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }, [adminKey, logout])

  useEffect(() => {
    if (adminKey) fetchOrders()
  }, [adminKey, fetchOrders])

  // Wait for sessionStorage to be read so the login form does not flash
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!adminKey) {
    return <AdminLogin onLogin={login} />
  }

  // Every figure on the page is scoped to the month picked in the calendar
  const monthOrders = ordersInMonth(orders, month)
  const earning = confirmedOrders(monthOrders)
  const grossRevenue = earning.reduce((sum, o) => sum + o.total, 0)
  const productRevenue = earning.reduce((sum, o) => sum + orderSubtotal(o.items), 0)
  const delivery = grossRevenue - productRevenue
  const productionCost = earning.reduce((sum, o) => sum + orderProductionCost(o), 0)
  // Courier fees paid out of pocket: re-routing a parcel to another customer,
  // and bringing an undelivered one back. Both come off revenue and profit.
  const swapCosts = totalSwapCost(earning)
  const returnCosts = totalReturnCost(earning)
  const revenue = grossRevenue - swapCosts - returnCosts
  // Delivery is charged to the customer and paid straight back out to the
  // courier, so it nets out: profit is what the products earned less what they
  // cost to make, less the swap and return fees.
  const profit = productRevenue - productionCost - swapCosts - returnCosts
  const missingCosts = unpricedItems(monthOrders)

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
              <p className="text-xs text-muted-foreground">Statistiques</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Commandes</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchOrders} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-4 rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <Button variant="outline" size="sm" onClick={fetchOrders} className="ml-auto">
              Réessayer
            </Button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Aucune commande pour le moment.
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              <span className="capitalize">{format(month, "LLLL yyyy", { locale: fr })}</span> · calculé
              sur les {earning.length} commandes confirmées du mois.
            </p>
            {/* Reads left to right as the calculation: total, less delivery,
                less production cost, less swap and return fees, leaves profit. */}
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <p className="text-xl font-bold whitespace-nowrap">
                    {formatCurrency(revenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Revenu total{swapCosts + returnCosts > 0 ? " (net des frais)" : ""}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <p className="text-xl font-bold whitespace-nowrap text-muted-foreground">
                    −{formatCurrency(delivery)}
                  </p>
                  <p className="text-xs text-muted-foreground">Frais de livraison</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <p className="text-xl font-bold whitespace-nowrap">
                    {formatCurrency(productRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">Revenu produits</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <p className="text-xl font-bold whitespace-nowrap text-muted-foreground">
                    −{formatCurrency(productionCost)}
                  </p>
                  <p className="text-xs text-muted-foreground">Coût de production</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <p className="text-xl font-bold whitespace-nowrap text-muted-foreground">
                    −{formatCurrency(swapCosts)}
                  </p>
                  <p className="text-xs text-muted-foreground">Frais de swap</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <p className="text-xl font-bold whitespace-nowrap text-muted-foreground">
                    −{formatCurrency(returnCosts)}
                  </p>
                  <p className="text-xs text-muted-foreground">Frais de retour</p>
                </CardContent>
              </Card>
              <Card className="col-span-2 lg:col-span-1 border-primary/40 bg-primary/5">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <p className="text-xl font-bold whitespace-nowrap text-primary">
                    {formatCurrency(profit)}
                  </p>
                  <p className="text-xs font-medium">Bénéfice</p>
                </CardContent>
              </Card>
            </div>

            {missingCosts.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-4 rounded-xl mb-8">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Coût de production manquant pour : {missingCosts.join(", ")}. Ces produits
                  comptent comme sans coût, le bénéfice est donc surévalué.
                </span>
              </div>
            )}

            <OrdersCalendar orders={orders} month={month} onMonthChange={setMonth} />

            <ProductBreakdown orders={monthOrders} />
          </>
        )}
      </main>
    </div>
  )
}
