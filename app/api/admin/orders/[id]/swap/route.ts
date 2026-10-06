import { NextResponse } from "next/server"
import { createAdminClient, SupabaseConfigError } from "@/lib/supabase/admin"
import {
  type Order,
  SWAP_LIMIT,
  itemsSignature,
  swapCost,
  swapCountOf,
  swapCostOf,
  wilayasSwappable,
} from "@/lib/admin"

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

// Re-routes a shipped parcel to another customer holding an identical order.
// Every rule the picker applies in the browser is re-checked here, because the
// admin page works from a list that may be minutes old.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const targetId = typeof body.targetId === "string" ? body.targetId : ""

    if (!id || !targetId) {
      return NextResponse.json({ success: false, error: "Commande manquante" }, { status: 400 })
    }
    if (id === targetId) {
      return NextResponse.json(
        { success: false, error: "Une commande ne peut pas être échangée avec elle-même" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data: rows, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .in("id", [id, targetId])

    if (fetchError) {
      console.error("Supabase fetch swap orders error:", fetchError)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la lecture des commandes" },
        { status: 500 }
      )
    }

    const source = (rows as Order[])?.find((o) => o.id === id)
    const target = (rows as Order[])?.find((o) => o.id === targetId)

    if (!source || !target) {
      return NextResponse.json({ success: false, error: "Commande introuvable" }, { status: 404 })
    }

    if (source.delivery_status !== "Envoyée") {
      return NextResponse.json(
        { success: false, error: "Seule une commande envoyée peut être échangée" },
        { status: 400 }
      )
    }
    if (swapCountOf(source) >= SWAP_LIMIT) {
      return NextResponse.json(
        { success: false, error: `Cette commande a déjà été échangée ${SWAP_LIMIT} fois` },
        { status: 400 }
      )
    }
    if (target.status === "annulé") {
      return NextResponse.json(
        { success: false, error: "La commande choisie est annulée" },
        { status: 400 }
      )
    }
    if ((target.delivery_status ?? "Pas encore envoyée") !== "Pas encore envoyée") {
      return NextResponse.json(
        { success: false, error: "La commande choisie a déjà été envoyée" },
        { status: 400 }
      )
    }
    if (itemsSignature(source.items) !== itemsSignature(target.items)) {
      return NextResponse.json(
        { success: false, error: "Les deux commandes ne contiennent pas les mêmes produits" },
        { status: 400 }
      )
    }
    if (!wilayasSwappable(source, target)) {
      return NextResponse.json(
        {
          success: false,
          error: `Une commande à ${source.wilaya} ne peut être échangée que dans la même wilaya`,
        },
        { status: 400 }
      )
    }

    const cost = swapCost(source, target)

    // The parcel now goes to the other customer
    const { error: targetError } = await supabase
      .from("orders")
      .update({ delivery_status: "Envoyée" })
      .eq("id", target.id)

    if (targetError) {
      console.error("Supabase swap target update error:", targetError)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la mise à jour de la commande choisie" },
        { status: 500 }
      )
    }

    // The re-routed order is marked as swapped and carries the courier fee
    const { error: sourceError } = await supabase
      .from("orders")
      .update({
        delivery_status: "swap",
        swap_count: swapCountOf(source) + 1,
        swap_cost: swapCostOf(source) + cost,
      })
      .eq("id", source.id)

    if (sourceError) {
      // Roll the parcel back so the two orders never disagree
      console.error("Supabase swap source update error:", sourceError)
      await supabase
        .from("orders")
        .update({ delivery_status: "Pas encore envoyée" })
        .eq("id", target.id)
      return NextResponse.json(
        { success: false, error: "Erreur lors de l'enregistrement du swap" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        cost,
        source: {
          id: source.id,
          delivery_status: "swap",
          swap_count: swapCountOf(source) + 1,
          swap_cost: swapCostOf(source) + cost,
        },
        target: { id: target.id, delivery_status: "Envoyée" },
      },
    })
  } catch (err) {
    console.error("Admin swap API error:", err)
    const code = err instanceof SupabaseConfigError ? "SERVER_MISCONFIGURED" : "INTERNAL_ERROR"
    return NextResponse.json(
      { success: false, code, error: "Une erreur interne est survenue" },
      { status: 500 }
    )
  }
}
