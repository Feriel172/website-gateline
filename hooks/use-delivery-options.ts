"use client"

import { useEffect, useState } from "react"

export interface TerritoryRate {
  toTerritoryName: string
  homePrice: number
  pickupPrice: number
}

// Loads the ZR Express wilaya rates and multi-office lists from /public, the
// same way the checkout pages do, so a landing page prices delivery identically.
export function useDeliveryOptions() {
  const [territoryRates, setTerritoryRates] = useState<TerritoryRate[]>([])
  const [bureauxData, setBureauxData] = useState<Record<string, string[]>>({})

  useEffect(() => {
    const loadRates = async () => {
      try {
        const res = await fetch("/wilayas.txt")
        if (!res.ok) return
        const data = await res.json()

        const wilayaRates: TerritoryRate[] = data.rates
          .filter((r: any) => r.toTerritoryLevel === "wilaya")
          .map((r: any) => ({
            toTerritoryName: r.toTerritoryName,
            homePrice: r.deliveryPrices.find((dp: any) => dp.deliveryType === "home")?.price ?? 0,
            pickupPrice: r.deliveryPrices.find((dp: any) => dp.deliveryType === "pickup-point")?.price ?? 0,
          }))

        // Boumerdes is only listed per commune; collapse it into one wilaya entry
        const boumerdes = data.rates.find(
          (r: any) => r.toTerritoryName === "Boumerdes" && r.toTerritoryLevel === "commune"
        )
        const boumerdesEntry: TerritoryRate = {
          toTerritoryName: "Boumerdes",
          homePrice: boumerdes?.deliveryPrices.find((dp: any) => dp.deliveryType === "home")?.price ?? 500,
          pickupPrice: boumerdes?.deliveryPrices.find((dp: any) => dp.deliveryType === "pickup-point")?.price ?? 420,
        }

        setTerritoryRates(
          [...wilayaRates, boumerdesEntry]
            .filter((r) => r.toTerritoryName !== "Unknown")
            .sort((a, b) => a.toTerritoryName.localeCompare(b.toTerritoryName))
        )
      } catch (e) {
        console.error("Failed to load wilaya rates:", e)
      }
    }

    const loadBureaux = async () => {
      try {
        const res = await fetch("/wilayas-bureaux.txt")
        if (!res.ok) return
        const text = await res.text()
        const bureaux: Record<string, string[]> = {}
        for (const line of text.split("\n")) {
          const parts = line.split(",").map((s) => s.trim())
          if (parts.length >= 2) bureaux[parts[0].toLowerCase()] = parts.slice(1)
        }
        setBureauxData(bureaux)
      } catch (e) {
        console.error("Failed to load bureaux data:", e)
      }
    }

    loadRates()
    loadBureaux()
  }, [])

  return { territoryRates, bureauxData }
}
