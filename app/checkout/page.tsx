"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, Check, Truck, Building, Loader2 } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { trackPurchase } from "@/lib/fpixel"

interface TerritoryRate {
  toTerritoryName: string
  toTerritoryLevel: string
  homePrice: number
  pickupPrice: number
}

interface FormData {
  firstName: string
  lastName: string
  phone: string
  wilaya: string
  deliveryType: "domicile" | "bureau"
  bureau: string
}

interface FormErrors {
  firstName?: string
  phone?: string
  wilaya?: string
  deliveryType?: string
  bureau?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, subtotal } = useCart()
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    wilaya: "",
    deliveryType: "domicile",
    bureau: ""
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [territoryRates, setTerritoryRates] = useState<TerritoryRate[]>([])
  const [bureauxData, setBureauxData] = useState<Record<string, string[]>>({})

  useEffect(() => {
    const loadRates = async () => {
      try {
        const res = await fetch("/wilayas.txt")
        if (!res.ok) {
          console.error("Failed to fetch wilayas.txt:", res.status, res.statusText)
          return
        }
        const data = await res.json()
        
        // Extract only wilaya-level territories
        const wilayaRates: TerritoryRate[] = data.rates
          .filter((r: any) => r.toTerritoryLevel === "wilaya")
          .map((r: any) => ({
            toTerritoryName: r.toTerritoryName,
            toTerritoryLevel: "wilaya",
            homePrice: r.deliveryPrices.find((dp: any) => dp.deliveryType === "home")?.price ?? 0,
            pickupPrice: r.deliveryPrices.find((dp: any) => dp.deliveryType === "pickup-point")?.price ?? 0,
          }))

        // Get Boumerdes commune pricing from the first commune entry
        const boumerdesCommune = data.rates.find(
          (r: any) => r.toTerritoryName === "Boumerdes" && r.toTerritoryLevel === "commune"
        )
        const boumerdesHomePrice = boumerdesCommune?.deliveryPrices.find((dp: any) => dp.deliveryType === "home")?.price ?? 500
        const boumerdesPickupPrice = boumerdesCommune?.deliveryPrices.find((dp: any) => dp.deliveryType === "pickup-point")?.price ?? 420

        // Add Boumerdes as a wilaya option (collapsing all communes into one)
        const boumerdesEntry: TerritoryRate = {
          toTerritoryName: "Boumerdes",
          toTerritoryLevel: "wilaya",
          homePrice: boumerdesHomePrice,
          pickupPrice: boumerdesPickupPrice,
        }

        const rates = [...wilayaRates, boumerdesEntry]
          .filter((r) => r.toTerritoryName !== "Unknown")
          .sort((a, b) => a.toTerritoryName.localeCompare(b.toTerritoryName))

        console.log("Loaded wilaya rates:", rates.length)
        setTerritoryRates(rates)
      } catch (e) {
        console.error("Failed to load wilaya rates:", e)
      }
    }

    const loadBureaux = async () => {
      try {
        const res = await fetch("/wilayas-bureaux.txt")
        if (!res.ok) {
          console.error("Failed to fetch wilayas-bureaux.txt:", res.status, res.statusText)
          return
        }
        const text = await res.text()
        const lines = text.split("\n").filter(line => line.trim())
        const bureaux: Record<string, string[]> = {}
        for (const line of lines) {
          const parts = line.split(",").map(s => s.trim())
          if (parts.length >= 2) {
            const wilaya = parts[0]
            const bureauxList = parts.slice(1)
            const normalized = wilaya.toLowerCase()
            bureaux[normalized] = bureauxList
          }
        }
        console.log("Loaded bureaux data for", Object.keys(bureaux).length, "wilayas")
        setBureauxData(bureaux)
      } catch (e) {
        console.error("Failed to load bureaux data:", e)
      }
    }

    loadRates()
    loadBureaux()
  }, [])

  const selectedTerritory = useMemo(
    () => territoryRates.find((t) => t.toTerritoryName === formData.wilaya),
    [territoryRates, formData.wilaya]
  )

  const normalizedWilaya = formData.wilaya.toLowerCase().trim()
  const availableBureaux = bureauxData[normalizedWilaya] || []
  const showBureauSelect = formData.deliveryType === "bureau" && formData.wilaya && availableBureaux.length > 0

  const shipping = selectedTerritory
    ? (formData.deliveryType === "domicile" ? selectedTerritory.homePrice : selectedTerritory.pickupPrice)
    : 0
  const total = subtotal + shipping

  useEffect(() => {
    if (items.length === 0 && !isSuccess) {
      router.push("/")
    }
  }, [items, isSuccess, router])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est requis"
    } else if (!/^(0[5-7])\d{8}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Numéro de téléphone invalide (ex: 0555123456)"
    }
    if (!formData.wilaya.trim()) {
      newErrors.wilaya = "La wilaya est requise"
    }
    if (!formData.deliveryType) {
      newErrors.deliveryType = "Le type de livraison est requis"
    }
    if (showBureauSelect && !formData.bureau.trim()) {
      newErrors.bureau = "Veuillez sélectionner un bureau ZR Express"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      // Reset bureau when wilaya or deliveryType changes
      if (field === "wilaya" || field === "deliveryType") {
        return { ...prev, [field]: value, bureau: "" }
      }
      return { ...prev, [field]: value }
    })
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName || null,
          phone: formData.phone,
          wilaya: formData.wilaya,
          deliveryType: formData.deliveryType,
          bureau: formData.deliveryType === "bureau" ? formData.bureau : null,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        const errorMsg = result.errors?.[0]?.message || "Erreur lors de l'enregistrement de la commande."
        setSubmitError(errorMsg)
        return
      }

      // Fire before clearCart() — the cart is empty afterwards.
      trackPurchase(
        items.map(item => ({ id: item.id, quantity: item.quantity, price: item.price })),
        subtotal
      )

      setIsSuccess(true)
      clearCart()
    } catch (err) {
      console.error("Submission error:", err)
      setSubmitError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-28 pb-20">
          <div className="max-w-lg mx-auto px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl text-foreground mb-4">
              Commande confirmée ! 🎉
            </h1>
            <p className="text-muted-foreground mb-8">
              Merci pour votre commande ! Un membre de notre équipe vous contactera 
              au <strong>{formData.phone}</strong> dans les plus brefs délais pour confirmer votre commande.
            </p>
            <h1 className="font-serif text-3xl text-foreground mb-4">
              تم تسجيل طلبيتكم بنجاح 🎉
            </h1>
            <p className="text-muted-foreground mb-8">
              سيقوم أحد أعضاء فريقنا بالاتصال بكم في أقرب وقت لتأكيد طلبيتكم.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium hover:bg-primary/90 boty-transition"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground boty-transition mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour à la boutique
          </Link>

          <div className="grid lg:grid-cols-5 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-3">
              <h1 className="font-serif text-3xl text-foreground mb-8">Finaliser la commande</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom et Prénom */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      Prénom <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Votre prénom"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className={errors.firstName ? "border-destructive" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Votre nom"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Numéro de téléphone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="ex: 0555123456"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                {/* Wilaya */}
                <div className="space-y-2">
                  <Label htmlFor="wilaya">
                    Wilaya <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="wilaya"
                    value={formData.wilaya}
                    onChange={(e) => handleChange("wilaya", e.target.value)}
                    className={`flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.wilaya ? "border-destructive" : ""
                    }`}
                  >
                    <option value="">Sélectionnez votre wilaya</option>
                    {territoryRates
                      .sort((a, b) => a.toTerritoryName.localeCompare(b.toTerritoryName))
                      .map((territory) => (
                        <option key={territory.toTerritoryName} value={territory.toTerritoryName}>
                          {territory.toTerritoryName}
                        </option>
                      ))}
                  </select>
                  {errors.wilaya && (
                    <p className="text-xs text-destructive">{errors.wilaya}</p>
                  )}
                </div>

                {/* Type de livraison */}
                <div className="space-y-3">
                  <Label>
                    Type de livraison <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.deliveryType}
                    onValueChange={(value) => handleChange("deliveryType", value)}
                    className="grid sm:grid-cols-2 gap-3"
                  >
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer boty-transition ${
                        formData.deliveryType === "domicile"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-foreground/20"
                      }`}
                    >
                      <RadioGroupItem value="domicile" id="domicile" />
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground text-sm">À domicile</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedTerritory
                              ? `${selectedTerritory.homePrice} DZD`
                              : "Sélectionnez une wilaya"}
                          </p>
                        </div>
                      </div>
                    </label>
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer boty-transition ${
                        formData.deliveryType === "bureau"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-foreground/20"
                      }`}
                    >
                      <RadioGroupItem value="bureau" id="bureau" />
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground text-sm">Bureau ZR Express</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedTerritory
                              ? `${selectedTerritory.pickupPrice} DZD`
                              : "Sélectionnez une wilaya"}
                          </p>
                        </div>
                      </div>
                    </label>
                  </RadioGroup>
                  {errors.deliveryType && (
                    <p className="text-xs text-destructive">{errors.deliveryType}</p>
                  )}
                </div>

                {/* Bureau ZR Express selection */}
                {showBureauSelect && (
                  <div className="space-y-2">
                    <Label htmlFor="bureau">
                      Bureau ZR Express <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="bureau"
                      value={formData.bureau}
                      onChange={(e) => handleChange("bureau", e.target.value)}
                      className={`flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.bureau ? "border-destructive" : ""
                      }`}
                    >
                      <option value="">Sélectionnez un bureau</option>
                      {availableBureaux.map((bureau) => (
                        <option key={bureau} value={bureau}>
                          {bureau}
                        </option>
                      ))}
                    </select>
                    {errors.bureau && (
                      <p className="text-xs text-destructive">{errors.bureau}</p>
                    )}
                  </div>
                )}

                {submitError && (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
                    {submitError}
                  </div>
                )}

                {/* Submit Button (mobile) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full lg:hidden bg-primary text-primary-foreground py-4 rounded-full font-medium hover:bg-primary/90 boty-transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    `Valider la commande — ${total} DZD`
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-3xl p-6 boty-shadow sticky top-32">
                <h2 className="font-serif text-xl text-foreground mb-6">Récapitulatif</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-foreground mt-1">
                          {item.price * item.quantity} DZD
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm border-t border-border/50 pt-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sous-total</span>
                    <span>{subtotal} DZD</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span>{shipping === 0 ? "à définir" : `${shipping} DZD`}</span>
                  </div>
                  <div className="flex justify-between text-base font-medium text-foreground pt-2 border-t border-border/50">
                    <span>Total</span>
                    <span>{total} DZD</span>
                  </div>
                </div>

                {/* Submit Button (desktop) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="hidden lg:inline-flex w-full mt-6 bg-primary text-primary-foreground py-4 rounded-full font-medium hover:bg-primary/90 boty-transition disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    `Valider la commande — ${total} DZD`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

