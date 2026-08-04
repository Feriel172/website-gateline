"use client"

import { useState, useEffect, useCallback } from "react"

// The admin key lives in sessionStorage so it survives navigation between
// /admin and /admin/analytics without prompting for the password again.
const STORAGE_KEY = "admin_key"

export function useAdminAuth() {
  const [adminKey, setAdminKey] = useState<string | null>(null)
  // Distinguishes "not logged in" from "not read from storage yet", so the
  // login form does not flash before the stored key is restored.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setAdminKey(sessionStorage.getItem(STORAGE_KEY))
    setReady(true)
  }, [])

  const login = useCallback((password: string) => {
    setAdminKey(password)
    sessionStorage.setItem(STORAGE_KEY, password)
  }, [])

  const logout = useCallback(() => {
    setAdminKey(null)
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  return { adminKey, ready, login, logout }
}
