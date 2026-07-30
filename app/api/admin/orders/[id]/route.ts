import { NextResponse } from "next/server"
import { createAdminClient, SupabaseConfigError } from "@/lib/supabase/admin"

const VALID_STATUSES = ["en attente", "confirmée", "annulé", "ne répond pas", "injoignable/éteint"] as const

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

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)

    if (error) {
      console.error("Supabase update order error:", error)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la mise à jour de la commande" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { id, status },
    })
  } catch (err) {
    console.error("Admin order update API error:", err)
    const code = err instanceof SupabaseConfigError ? "SERVER_MISCONFIGURED" : "INTERNAL_ERROR"
    return NextResponse.json(
      { success: false, code, error: "Une erreur interne est survenue" },
      { status: 500 }
    )
  }
}

