"use client"

import { useMemo, useState } from "react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Order, dailyStats, dayKey, formatCurrency } from "@/lib/admin"

const WEEK_STARTS_ON = 1 // Monday

// Class names must be literal for Tailwind to emit them, so shading uses
// discrete buckets rather than a computed opacity.
function heatClass(revenue: number, peak: number): string {
  if (revenue <= 0) return ""
  const share = revenue / peak
  if (share > 0.75) return "bg-primary/25"
  if (share > 0.5) return "bg-primary/15"
  if (share > 0.25) return "bg-primary/10"
  return "bg-primary/5"
}

export function OrdersCalendar({ orders }: { orders: Order[] }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))

  const stats = useMemo(() => dailyStats(orders), [orders])

  const days = useMemo(() => {
    // Pad to whole weeks so the grid always has 7 aligned columns
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: WEEK_STARTS_ON })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: WEEK_STARTS_ON })
    return eachDayOfInterval({ start, end })
  }, [month])

  const monthDays = days.filter((day) => isSameMonth(day, month))
  const monthOrders = monthDays.reduce((sum, day) => sum + (stats.get(dayKey(day))?.orders ?? 0), 0)
  const monthRevenue = monthDays.reduce((sum, day) => sum + (stats.get(dayKey(day))?.revenue ?? 0), 0)
  // Shading is relative to the busiest day of the month on screen
  const peak = Math.max(1, ...monthDays.map((day) => stats.get(dayKey(day))?.revenue ?? 0))

  const weekdays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: WEEK_STARTS_ON })
    return eachDayOfInterval({ start, end: endOfWeek(start, { weekStartsOn: WEEK_STARTS_ON }) })
  }, [])

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Commandes par jour
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Commandes = toutes les commandes du jour · Revenu = commandes confirmées uniquement
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setMonth(subMonths(month, 1))} aria-label="Mois précédent">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium capitalize min-w-[8.5rem] text-center">
            {format(month, "LLLL yyyy", { locale: fr })}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setMonth(addMonths(month, 1))} aria-label="Mois suivant">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mb-4 text-sm">
          <span className="text-muted-foreground">
            {monthOrders} {monthOrders === 1 ? "commande" : "commandes"} ce mois
          </span>
          <span className="font-semibold">{formatCurrency(monthRevenue)}</span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[42rem]">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekdays.map((day) => (
                <div
                  key={day.toISOString()}
                  className="text-[11px] uppercase tracking-wide text-muted-foreground text-center py-1"
                >
                  {format(day, "EEE", { locale: fr })}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const stat = stats.get(dayKey(day))
                const outside = !isSameMonth(day, month)

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[4.5rem] rounded-lg border p-2 flex flex-col gap-0.5 ${
                      outside ? "opacity-40 border-transparent" : "border-border/50"
                    } ${isToday(day) ? "ring-1 ring-primary" : ""} ${
                      outside ? "" : heatClass(stat?.revenue ?? 0, peak)
                    }`}
                  >
                    <span className={`text-xs ${isToday(day) ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      {format(day, "d")}
                    </span>

                    {stat && !outside && (
                      <>
                        <span className="text-sm font-semibold text-foreground leading-tight">
                          {stat.orders}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight">
                          {formatCurrency(stat.revenue)}
                        </span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
