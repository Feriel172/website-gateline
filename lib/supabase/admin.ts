import { createClient } from "@supabase/supabase-js"

// Thrown when the deployment is missing Supabase credentials, so callers can
// tell a misconfigured server apart from a genuine runtime failure.
export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SupabaseConfigError"
  }
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    const missing = [
      !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
      !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
    ].filter(Boolean)

    throw new SupabaseConfigError(
      `Missing Supabase admin credentials: ${missing.join(", ")} not set in environment variables.`
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

