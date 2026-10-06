import { NextResponse } from "next/server"
import { createAdminClient, SupabaseConfigError } from "@/lib/supabase/admin"
import { DELIVERY_STATUSES } from "@/lib/admin"
import {
  ALLOWED_WILAYAS,
  PHONE_REGEX,
  PRODUCT_PRICES,
  calculateShipping,
  deliveryLabel,
} from "@/lib/orders"

const VALID_STATUSES = ["en attente", "confirmée", "annulé", "ne répond pas", "injoignable/éteint"] as const

const DELIVERY_LABELS = ["À domicile", "Bureau ZR Express"] as const

// Taken from the shared list so this route can never fall behind the dropdown
const VALID_DELIVERY_STATUSES = DELIVERY_STATUSES

// Simple admin authentication using a shared secret
function isAuthenticated(request: Request): boolean {
  const authHeader = request.headers.get("x-admin-key")
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.warn("ADMIN_PASSWORD environment variable is not set. Admin access would be blocked.")
    return false
  }

  return authHeader === adminPassword
}

interface EditableItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string | null
}

// Builds the row to persist from an edit payload, re-costing it exactly the way
// checkout does: prices and shipping come from the server, never from the client.
function buildOrderUpdate(body: Record<string, unknown>):
  | { ok: true; update: Record<string, unknown> }
  | { ok: false; error: string } {
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : ""
  if (!firstName) return { ok: false, error: "Le prénom est requis" }
  if (firstName.length > 100) return { ok: false, error: "Le prénom est trop long (max 100 caractères)" }
  if (/[<>{}\\]/.test(firstName)) return { ok: false, error: "Le prénom contient des caractères non autorisés" }

  const lastNameRaw = typeof body.lastName === "string" ? body.lastName.trim() : ""
  if (lastNameRaw.length > 100) return { ok: false, error: "Le nom est trop long (max 100 caractères)" }
  if (/[<>{}\\]/.test(lastNameRaw)) return { ok: false, error: "Le nom contient des caractères non autorisés" }

  const phone = typeof body.phone === "string" ? body.phone.replace(/\s/g, "") : ""
  if (!PHONE_REGEX.test(phone)) return { ok: false, error: "Numéro de téléphone invalide (ex: 0555123456)" }

  const wilaya = typeof body.wilaya === "string" ? body.wilaya.trim() : ""
  if (!ALLOWED_WILAYAS.has(wilaya)) return { ok: false, error: "Wilaya invalide" }

  // The stored column holds the display label, not the checkout's short form
  const delivery = typeof body.deliveryType === "string" ? body.deliveryType.trim() : ""
  const deliveryType =
    delivery === "domicile" || delivery === "À domicile" ? "domicile" : "bureau"
  if (!DELIVERY_LABELS.includes(deliveryLabel(deliveryType) as (typeof DELIVERY_LABELS)[number])) {
    return { ok: false, error: "Type de livraison invalide" }
  }

  const bureauRaw = typeof body.bureau === "string" ? body.bureau.trim() : ""
  if (deliveryType === "bureau" && !bureauRaw) {
    return { ok: false, error: "Veuillez indiquer un bureau ZR Express" }
  }
  if (/[<>{}\\]/.test(bureauRaw)) return { ok: false, error: "Le bureau contient des caractères non autorisés" }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { ok: false, error: "La commande doit contenir au moins un produit" }
  }

  const items: EditableItem[] = []
  for (const raw of body.items as Record<string, unknown>[]) {
    const id = typeof raw.id === "string" ? raw.id : ""
    const price = PRODUCT_PRICES[id]
    if (price === undefined) return { ok: false, error: `Produit inconnu: ${id || "(sans id)"}` }

    const quantity = typeof raw.quantity === "number" ? raw.quantity : 0
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return { ok: false, error: "Quantité invalide (1-99)" }
    }

    items.push({
      id,
      name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : id,
      price, // server price, never the client's
      quantity,
      image: typeof raw.image === "string" ? raw.image : null,
    })
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = calculateShipping(wilaya, deliveryType)
  const discount = typeof body.discount === "number" && body.discount > 0 ? Math.round(body.discount) : 0
  const total = subtotal + shipping - discount

  if (total <= 0) return { ok: false, error: "Le total doit être positif" }

  return {
    ok: true,
    update: {
      first_name: firstName,
      last_name: lastNameRaw || null,
      phone,
      wilaya,
      delivery_type: deliveryLabel(deliveryType),
      bureau: deliveryType === "bureau" ? bureauRaw : null,
      items,
      total,
    },
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de commande manquant" },
        { status: 400 }
      )
    }

    const body = await request.json()

    // A status-only body keeps the original contract used by the status dropdown
    const isStatusOnly = Object.keys(body).length === 1 && "status" in body

    // Likewise for the delivery dropdown, which never touches the order itself
    if (Object.keys(body).length === 1 && "deliveryStatus" in body) {
      const { deliveryStatus } = body

      if (!deliveryStatus || !VALID_DELIVERY_STATUSES.includes(deliveryStatus)) {
        return NextResponse.json(
          {
            success: false,
            error: `Statut de livraison invalide. Les valeurs acceptées sont: ${VALID_DELIVERY_STATUSES.join(", ")}`,
          },
          { status: 400 }
        )
      }

      const supabase = createAdminClient()
      const { error } = await supabase
        .from("orders")
        .update({ delivery_status: deliveryStatus })
        .eq("id", id)

      if (error) {
        console.error("Supabase update delivery status error:", error)
        return NextResponse.json(
          { success: false, error: "Erreur lors de la mise à jour de la livraison" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data: { id, delivery_status: deliveryStatus } })
    }

    if (isStatusOnly) {
      const { status } = body

      if (!status || !VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Statut invalide. Les valeurs acceptées sont: ${VALID_STATUSES.join(", ")}`,
          },
          { status: 400 }
        )
      }

      const supabase = createAdminClient()
      const { error } = await supabase.from("orders").update({ status }).eq("id", id)

      if (error) {
        console.error("Supabase update order error:", error)
        return NextResponse.json(
          { success: false, error: "Erreur lors de la mise à jour de la commande" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data: { id, status } })
    }

    const built = buildOrderUpdate(body)
    if (!built.ok) {
      return NextResponse.json({ success: false, error: built.error }, { status: 400 })
    }

    // Status may ride along with a full edit
    if (typeof body.status === "string") {
      if (!VALID_STATUSES.includes(body.status as (typeof VALID_STATUSES)[number])) {
        return NextResponse.json({ success: false, error: "Statut invalide" }, { status: 400 })
      }
      built.update.status = body.status
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("orders")
      .update(built.update)
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      console.error("Supabase update order error:", error)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la mise à jour de la commande" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("Admin order update API error:", err)
    const code = err instanceof SupabaseConfigError ? "SERVER_MISCONFIGURED" : "INTERNAL_ERROR"
    return NextResponse.json(
      { success: false, code, error: "Une erreur interne est survenue" },
      { status: 500 }
    )
  }
}
