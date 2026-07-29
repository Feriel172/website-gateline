import { NextResponse } from "next/server"
import { createAdminClient, SupabaseConfigError } from "@/lib/supabase/admin"

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

export async function GET(request: Request) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase fetch orders error:", error)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la récupération des commandes" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (err) {
    console.error("Admin orders API error:", err)
    const code = err instanceof SupabaseConfigError ? "SERVER_MISCONFIGURED" : "INTERNAL_ERROR"
    return NextResponse.json(
      { success: false, code, error: "Une erreur interne est survenue" },
      { status: 500 }
    )
  }
}

