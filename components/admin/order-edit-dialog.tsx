"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Loader2, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type Order, type OrderItem, formatCurrency } from "@/lib/admin"
import { ALLOWED_WILAYAS, calculateShipping } from "@/lib/orders"

const WILAYAS = [...ALLOWED_WILAYAS].sort((a, b) => a.localeCompare(b, "fr"))

interface Props {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (orderId: string, payload: Record<string, unknown>) => Promise<string | null>
}

export function OrderEditDialog({ order, open, onOpenChange, onSave }: Props) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [wilaya, setWilaya] = useState("")
  const [deliveryType, setDeliveryType] = useState<"domicile" | "bureau">("domicile")
  const [bureau, setBureau] = useState("")
  const [items, setItems] = useState<OrderItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refill the form whenever a different order is opened
  useEffect(() => {
    if (!order) return
    setFirstName(order.first_name ?? "")
    setLastName(order.last_name ?? "")
    setPhone(order.phone ?? "")
    setWilaya(order.wilaya ?? "")
    setDeliveryType(order.delivery_type === "À domicile" ? "domicile" : "bureau")
    setBureau(order.bureau ?? "")
    setItems(order.items.map((item) => ({ ...item })))
    setError(null)
  }, [order])

  if (!order) return null

  // Mirrors the server: subtotal from line items, shipping from the rate table
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = calculateShipping(wilaya, deliveryType)
  const total = subtotal + shipping

  const setQuantity = (index: number, quantity: number) => {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, quantity: Math.min(99, Math.max(1, quantity)) } : item))
    )
  }

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const message = await onSave(order.id, {
      firstName,
      lastName,
      phone,
      wilaya,
      deliveryType,
      bureau,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        image: item.image ?? null,
      })),
    })

    setSaving(false)
    if (message) setError(message)
    else onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Modifier la commande</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">Prénom *</Label>
              <Input id="edit-firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Nom</Label>
              <Input id="edit-lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Téléphone *</Label>
              <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0555123456" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-wilaya">Wilaya *</Label>
              <select
                id="edit-wilaya"
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-delivery">Type de livraison *</Label>
              <select
                id="edit-delivery"
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as "domicile" | "bureau")}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="domicile">À domicile</option>
                <option value="bureau">Bureau ZR Express</option>
              </select>
            </div>
            {deliveryType === "bureau" && (
              <div className="space-y-2">
                <Label htmlFor="edit-bureau">Bureau ZR Express *</Label>
                <Input id="edit-bureau" value={bureau} onChange={(e) => setBureau(e.target.value)} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Produits</Label>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex items-center gap-2 rounded-xl border border-border/50 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} / unité</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setQuantity(index, item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="outline" size="sm" onClick={() => setQuantity(index, item.quantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="w-24 text-right text-sm font-medium shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                  {items.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeItem(index)} aria-label="Retirer">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-muted/50 p-4 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total produits</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Livraison ({wilaya || "—"})</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t border-border/50">
              <span>Nouveau total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {total !== order.total && (
              <p className="text-xs text-muted-foreground pt-1">
                Ancien total : {formatCurrency(order.total)}
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
