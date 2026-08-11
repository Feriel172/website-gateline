"use client"

import { Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type Order, formatCurrency, productStats } from "@/lib/admin"

export function ProductBreakdown({ orders }: { orders: Order[] }) {
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
            (hors livraison, commandes confirmées uniquement)
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
