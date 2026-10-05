"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  ArrowUp,
  Building,
  Check,
  ChevronDown,
  Droplets,
  Flower2,
  HandCoins,
  Leaf,
  Loader2,
  Minus,
  Moon,
  Plus,
  ShieldCheck,
  Sparkles,
  Sun,
  Truck,
  type LucideIcon,
} from "lucide-react"
import { FooterAr } from "@/components/boty/footer-ar"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useDeliveryOptions } from "@/hooks/use-delivery-options"
import { PRODUCT_PRICES, isSoldOut } from "@/lib/orders"
import { trackInitiateCheckout, trackPurchase, trackViewContent } from "@/lib/fpixel"

// Sales landing page for one product, in the style of a cash-on-delivery
// funnel: long-scroll pitch, then an inline order form that posts straight to
// the checkout API. No cart, no site navigation — one product, one action.

const PRODUCT = {
  id: "hydrating-serum",
  name: "تونر بادس AHA 5%",
  nameFr: "Toner Pads 5% AHA",
  image: "/images/products/aha_tonerpads.jpg",
  size: "40 قرص",
}

const PRICE = PRODUCT_PRICES[PRODUCT.id]
const MAX_QUANTITY = 5

// --- Content ---

const PROBLEMS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Droplets, title: "ملمس خشن وغير منتظم", text: "بشرة تبدو محبّبة عند اللمس رغم التنظيف اليومي" },
  { icon: Sun, title: "لون غير موحّد", text: "بقع وآثار حبوب قديمة تجعل البشرة تبدو متعبة" },
  { icon: Sparkles, title: "مسام مسدودة", text: "رؤوس سوداء وحبوب صغيرة تتكرر في نفس المناطق" },
  { icon: Moon, title: "بشرة باهتة", text: "لا إشراقة، حتى مع كريمات الترطيب" },
]

const CAUSES: { icon: LucideIcon; title: string }[] = [
  { icon: Leaf, title: "تراكم الخلايا الميتة على سطح البشرة" },
  { icon: Droplets, title: "انسداد المسام بالدهون والأوساخ" },
  { icon: Sun, title: "آثار الحبوب والتعرّض للشمس" },
  { icon: ShieldCheck, title: "تقشير قاسٍ بحبيبات خشنة" },
  { icon: Flower2, title: "منتجات تجفّف البشرة وتزيد إفراز الدهون" },
  { icon: Moon, title: "روتين غير منتظم" },
]

const INGREDIENTS: { name: string; role: string }[] = [
  { name: "حمض الجليكوليك 5%", role: "يذيب الروابط بين الخلايا الميتة فتنفصل بلطف، ليكشف عن بشرة أنعم ولون أكثر توحّداً" },
  { name: "ألوفيرا وبانثينول", role: "يهدّئان البشرة ويرطّبانها بعد التقشير" },
  { name: "ماء الورد", role: "ينعش ويوازن البشرة" },
  { name: "جليسرين نباتي", role: "يحافظ على ترطيب البشرة ونعومتها" },
]

const BENEFITS: string[] = [
  "تقشير كيميائي لطيف بدون حبيبات خشنة",
  "يزيل الخلايا الميتة ويُنعّم ملمس البشرة",
  "يساعد على توحيد لون البشرة وتخفيف آثار الحبوب",
  "مسام أنظف وحبوب أقل مع الاستعمال المنتظم",
  "بشرة أكثر إشراقاً وصفاءً",
]

const TIMELINE: { when: string; what: string }[] = [
  { when: "أول استعمال", what: "بشرة أنظف وملمس أنعم من الليلة الأولى" },
  { when: "بعد 2 إلى 3 أسابيع", what: "مسام أنظف، حبوب أقل، ولون يبدأ بالتوحّد" },
  { when: "مع الاستعمال المنتظم", what: "بشرة أكثر صفاءً وإشراقاً وآثار حبوب أخف" },
]

const STEPS: { step: string; title: string; text: string }[] = [
  { step: "1", title: "نظّفي بشرتك", text: "ابدئي ببشرة نظيفة وجافة في المساء" },
  { step: "2", title: "مرّري القرص", text: "على كامل الوجه والرقبة، مع تجنّب محيط العينين والشفتين" },
  { step: "3", title: "لا تشطفي", text: "اتركيه يعمل طوال الليل، وضعي واقي الشمس في الصباح" },
]

const TRUST: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ShieldCheck, title: "بدون حبيبات خشنة", text: "تقشير كيميائي لطيف بالأحماض" },
  { icon: Leaf, title: "ماء الورد والألوفيرا", text: "مكوّنات مهدّئة ومرطّبة" },
  { icon: Check, title: "لجميع أنواع البشرة", text: "2 إلى 3 مرات في الأسبوع حسب تحمّل بشرتك" },
  { icon: Sparkles, title: "40 قرصاً جاهزة", text: "بدون قطن ولا شطف" },
]

const FAQ: { q: string; a: string }[] = [
  { q: "كيف أستعمله؟", a: "بعد التنظيف، مرّري القرص على كامل الوجه والرقبة مع تجنّب منطقة العينين والشفتين. لا يُشطف." },
  { q: "كم مرة في الأسبوع؟", a: "يُطبّق فقط في المساء، 2 إلى 3 مرات في الأسبوع. إذا كانت بشرتك حساسة، ابدئي بمرة واحدة أسبوعياً ثم زيدي تدريجياً." },
  { q: "هل أحتاج واقي شمس؟", a: "نعم. حمض الجليكوليك يجعل البشرة أكثر حساسية للشمس، لذلك استعملي واقي الشمس في النهار." },
  { q: "متى تظهر النتائج؟", a: "ملمس أنعم من أول استعمال، وتحسّن تدريجي في اللون والمسام خلال الأسابيع الأولى مع الاستعمال المنتظم." },
  { q: "هل يمكن استعماله مع تونر بادس النياسيناميد؟", a: "نعم: النياسيناميد صباحاً و/أو في المساءات التي لا تستعملين فيها AHA. تجنّبي استعمال الاثنين في نفس الليلة." },
  { q: "كيف أستلم طلبي؟", a: "الدفع عند الاستلام. يتصل بك فريق Gateline Cosmetics لتأكيد الطلب في موعد أقصاه اليوم التالي، ويُسلّم بعد يومين من التأكيد إلى منزلك أو إلى أقرب مكتب ZR Express." },
]

// --- Small building blocks ---

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="text-center mb-10">
      <h2 className="inline-block bg-foreground text-background px-6 py-3 rounded-2xl text-2xl md:text-3xl font-bold">
        {children}
      </h2>
      {sub && <p className="text-muted-foreground mt-4 text-base md:text-lg">{sub}</p>}
    </div>
  )
}

function OrderButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="#order"
      className={`inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-base font-semibold boty-transition hover:bg-primary/90 ${className}`}
    >
      اطلبي الآن
    </a>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-background rounded-2xl boty-shadow">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-right"
        aria-expanded={open}
      >
        <span className="font-semibold text-foreground">{q}</span>
        <ChevronDown className={`w-5 h-5 text-primary shrink-0 boty-transition ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden boty-transition ${open ? "max-h-60 pb-5" : "max-h-0"}`}>
        <p className="px-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

// --- Page ---

interface FormState {
  name: string
  phone: string
  wilaya: string
  deliveryType: "domicile" | "bureau"
  bureau: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

export default function TonerPadsAhaLanding() {
  const soldOut = isSoldOut(PRODUCT.id)
  const { territoryRates, bureauxData } = useDeliveryOptions()

  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    wilaya: "",
    deliveryType: "domicile",
    bureau: "",
  })
  const [quantity, setQuantity] = useState(1)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const startedCheckout = useRef(false)

  const orderRef = useRef<HTMLElement>(null)
  const [orderInView, setOrderInView] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    trackViewContent({ id: PRODUCT.id, name: PRODUCT.nameFr, price: PRICE })
  }, [])

  // Hide the floating order bar while the form itself is on screen
  useEffect(() => {
    const el = orderRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setOrderInView(entry.isIntersecting), {
      threshold: 0.15,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const territory = useMemo(
    () => territoryRates.find((t) => t.toTerritoryName === form.wilaya),
    [territoryRates, form.wilaya]
  )
  // Wilayas with several ZR Express offices are listed in the file; every other
  // wilaya has a single office named after the wilaya itself.
  const bureaux = bureauxData[form.wilaya.toLowerCase()] ?? (form.wilaya ? [form.wilaya] : [])
  const isBureau = form.deliveryType === "bureau" && Boolean(form.wilaya)
  const resolvedBureau = bureaux.length === 1 ? bureaux[0] : form.bureau
  const showBureauSelect = isBureau && bureaux.length > 1

  const subtotal = PRICE * quantity
  const shipping = territory ? (form.deliveryType === "domicile" ? territory.homePrice : territory.pickupPrice) : 0
  const total = subtotal + shipping

  const update = (field: keyof FormState, value: string) => {
    if (!startedCheckout.current) {
      startedCheckout.current = true
      trackInitiateCheckout([{ id: PRODUCT.id, quantity, price: PRICE }])
    }
    setForm((prev) =>
      field === "wilaya" || field === "deliveryType"
        ? { ...prev, [field]: value, bureau: "" }
        : { ...prev, [field]: value }
    )
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const next: FormErrors = {}
    if (!form.name.trim()) next.name = "الاسم مطلوب"
    const phone = form.phone.replace(/\s/g, "")
    if (!phone) next.phone = "رقم الهاتف مطلوب"
    else if (!/^(0[5-7])\d{8}$/.test(phone)) next.phone = "رقم الهاتف غير صالح (مثال: 0555123456)"
    if (!form.wilaya) next.wilaya = "الولاية مطلوبة"
    if (isBureau && !resolvedBureau.trim()) next.bureau = "يرجى اختيار مكتب ZR Express"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (soldOut || submitting || !validate()) return

    setSubmitting(true)
    setSubmitError(null)

    // The checkout API takes first + last name; a single name field is enough
    // for a phone-confirmed order, so split on the first space.
    const [firstName, ...rest] = form.name.trim().split(/\s+/)

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName: rest.join(" ") || null,
          phone: form.phone.replace(/\s/g, ""),
          wilaya: form.wilaya,
          deliveryType: form.deliveryType,
          bureau: form.deliveryType === "bureau" ? resolvedBureau : null,
          items: [{ id: PRODUCT.id, name: PRODUCT.nameFr, price: PRICE, quantity, image: PRODUCT.image }],
        }),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        setSubmitError(result.errors?.[0]?.message || "حدث خطأ أثناء تسجيل الطلب.")
        return
      }

      trackPurchase([{ id: PRODUCT.id, quantity, price: PRICE }], subtotal)
      setSuccess(true)
    } catch {
      setSubmitError("حدث خطأ ما. يرجى المحاولة مرة أخرى.")
    } finally {
      setSubmitting(false)
    }
  }

  const closeSuccess = () => {
    setSuccess(false)
    setForm({ name: "", phone: "", wilaya: "", deliveryType: "domicile", bureau: "" })
    setQuantity(1)
    startedCheckout.current = false
  }

  const selectClass =
    "flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-cairo"
  const inputClass =
    "flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-cairo"

  return (
    <main dir="rtl" className="min-h-screen font-cairo bg-background">
      {/* Sticky header: brand + one action */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <span className="font-semibold text-foreground tracking-wide">Gateline Cosmetics</span>
          <a
            href="#order"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold boty-transition hover:bg-primary/90"
          >
            اطلبي الآن
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 lg:px-8 pt-10 md:pt-16 pb-14">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-xs tracking-[0.25em] text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-5">
              تقشير كيميائي لطيف
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              بشرة أنعم
              <br />
              ولون أكثر توحّداً
            </h1>
            <p className="text-lg text-muted-foreground mb-2">{PRODUCT.name} · {PRODUCT.size}</p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              أقراص تونر بحمض الجليكوليك 5% تزيل الخلايا الميتة بلطف، تُنعّم ملمس البشرة وتساعد
              على توحيد لونها، بدون حبيبات خشنة وبدون شطف.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {["بدون شطف", "2 إلى 3 مرات أسبوعياً", "لجميع أنواع البشرة"].map((chip) => (
                <span key={chip} className="text-xs bg-card px-3 py-1.5 rounded-full text-foreground">
                  {chip}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <span className="text-3xl font-bold text-foreground">{PRICE} دج</span>
              <OrderButton />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><HandCoins className="w-4 h-4 text-primary" /> الدفع عند الاستلام</span>
              <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /> توصيل لكل الولايات</span>
            </div>
          </div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-card boty-shadow">
            <Image src={PRODUCT.image} alt={PRODUCT.name} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="bg-card/60 py-16">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <SectionTitle>هل تعانين أنتِ أيضاً من هذه المشاكل؟</SectionTitle>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROBLEMS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-background rounded-2xl p-6 text-center boty-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Causes */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <SectionTitle sub="الأسباب الأكثر شيوعاً وراء خشونة البشرة وبهتانها">لماذا تبدو البشرة خشنة وباهتة؟</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {CAUSES.map(({ icon: Icon, title }) => (
              <div key={title} className="bg-card/60 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                <Icon className="w-7 h-7 text-primary" />
                <p className="text-sm font-medium text-foreground">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="bg-card/60 py-16">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <SectionTitle sub="تقشير لطيف بالأحماض للوجه والرقبة">الحل: {PRODUCT.name}</SectionTitle>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-background boty-shadow order-first md:order-last">
              <Image src={PRODUCT.image} alt={PRODUCT.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <ul className="space-y-4">
              {INGREDIENTS.map(({ name, role }) => (
                <li key={name} className="bg-background rounded-2xl p-5 boty-shadow">
                  <h3 className="font-bold text-foreground mb-1">{name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{role}</p>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            المكوّنات: ماء الورد، ماء، جليسرين نباتي، ألوفيرا، حمض الجليكوليك، بانثينول، مادة حافظة.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                5 فوائد
              </h2>
              <span className="inline-block bg-foreground text-background px-4 py-2 rounded-xl font-bold mb-8">
                {PRODUCT.name}
              </span>
              <ul className="space-y-4">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-foreground font-medium">
                    <span className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-card boty-shadow">
              <Image src="/images/skincare-ritual.jpg" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Results timeline */}
      <section className="bg-card/60 py-16">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <SectionTitle sub="تحسّن تدريجي مع كل استعمال">مراحل النتائج مع الاستعمال</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4">
            {TIMELINE.map(({ when, what }, index) => (
              <div key={when} className="bg-background rounded-2xl p-6 boty-shadow relative">
                <span className="absolute top-4 start-4 text-xs text-muted-foreground">{index + 1}/3</span>
                {/* Replace this block with your own before/after photo:
                    <Image src="/images/reviews/..." alt="" fill className="object-cover" /> */}
                <div className="aspect-[4/3] rounded-xl bg-card mb-5 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary/40" />
                </div>
                <span className="inline-block bg-foreground text-background px-4 py-1.5 rounded-lg font-bold mb-2">
                  {when}
                </span>
                <p className="text-sm text-muted-foreground">{what}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <SectionTitle sub="ثلاث خطوات في المساء، 2 إلى 3 مرات في الأسبوع">طريقة الاستعمال</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map(({ step, title, text }) => (
              <div key={step} className="bg-card/60 rounded-2xl p-6">
                <span className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                  {step}
                </span>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            تجنّبي محيط العينين والشفتين · لا تستعمليه على بشرة متهيّجة · استعملي واقي الشمس في النهار
          </p>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-card/60 py-16">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <SectionTitle>تركيبة تستحق ثقتك</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-background rounded-2xl p-6 text-center boty-shadow">
                <Icon className="w-7 h-7 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <SectionTitle>الأسئلة الأكثر شيوعاً</SectionTitle>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <FaqItem key={item.q} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Order */}
      <section id="order" ref={orderRef} className="bg-card/60 py-16 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <SectionTitle sub="بشرة أنعم ولون موحّد، والدفع عند الاستلام">اطلبي الآن — الدفع عند الاستلام</SectionTitle>

          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto mb-10">
            {[
              { icon: Leaf, label: "مكوّنات مهدّئة" },
              { icon: HandCoins, label: "الدفع عند الاستلام" },
              { icon: Truck, label: "توصيل لكل الولايات" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-background rounded-2xl p-4 text-center boty-shadow">
                <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium text-foreground">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Form */}
            <form onSubmit={submit} className="lg:col-span-3 bg-background rounded-3xl p-6 md:p-8 boty-shadow space-y-5" noValidate>
              <div className="flex items-center gap-4 pb-5 border-b border-border/50">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-card shrink-0">
                  <Image src={PRODUCT.image} alt={PRODUCT.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{PRODUCT.name}</h3>
                  <p className="text-sm text-muted-foreground">{PRODUCT.size}</p>
                </div>
                <span className="text-xl font-bold text-foreground">{PRICE} دج</span>
              </div>

              {soldOut && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
                  هذا المنتج غير متوفر حالياً.
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium">الاسم الكامل <span className="text-destructive">*</span></label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="الاسم"
                  autoComplete="name"
                  className={`${inputClass} ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium">رقم الهاتف <span className="text-destructive">*</span></label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="0555123456"
                  autoComplete="tel"
                  className={`${inputClass} text-right ${errors.phone ? "border-destructive" : ""}`}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="wilaya" className="text-sm font-medium">الولاية <span className="text-destructive">*</span></label>
                <select
                  id="wilaya"
                  value={form.wilaya}
                  onChange={(e) => update("wilaya", e.target.value)}
                  className={`${selectClass} ${errors.wilaya ? "border-destructive" : ""}`}
                >
                  <option value="">اختاري ولايتك</option>
                  {territoryRates.map((t) => (
                    <option key={t.toTerritoryName} value={t.toTerritoryName}>{t.toTerritoryName}</option>
                  ))}
                </select>
                {errors.wilaya && <p className="text-xs text-destructive">{errors.wilaya}</p>}
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">نوع التوصيل <span className="text-destructive">*</span></span>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(
                    [
                      { value: "domicile", icon: Truck, label: "إلى المنزل", price: territory?.homePrice },
                      { value: "bureau", icon: Building, label: "مكتب ZR Express", price: territory?.pickupPrice },
                    ] as const
                  ).map(({ value, icon: Icon, label, price }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer boty-transition ${
                        form.deliveryType === value ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        value={value}
                        checked={form.deliveryType === value}
                        onChange={() => update("deliveryType", value)}
                        className="accent-primary"
                      />
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{price !== undefined ? `${price} دج` : "اختاري ولاية"}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {showBureauSelect && (
                <div className="space-y-1.5">
                  <label htmlFor="bureau" className="text-sm font-medium">مكتب ZR Express <span className="text-destructive">*</span></label>
                  <select
                    id="bureau"
                    value={form.bureau}
                    onChange={(e) => update("bureau", e.target.value)}
                    className={`${selectClass} ${errors.bureau ? "border-destructive" : ""}`}
                  >
                    <option value="">اختاري مكتباً</option>
                    {bureaux.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  {errors.bureau && <p className="text-xs text-destructive">{errors.bureau}</p>}
                </div>
              )}
              {isBureau && !showBureauSelect && resolvedBureau && (
                <div className="space-y-1.5">
                  <span className="text-sm font-medium">مكتب ZR Express</span>
                  <div className="flex h-12 items-center rounded-xl border border-input bg-muted/50 px-4 text-sm">{resolvedBureau}</div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">الكمية</span>
                <div className="flex items-center border border-border rounded-full">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="أقل"
                    className="w-11 h-11 flex items-center justify-center text-foreground disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-semibold">{String(quantity).padStart(2, "0")}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                    disabled={quantity >= MAX_QUANTITY}
                    aria-label="أكثر"
                    className="w-11 h-11 flex items-center justify-center text-foreground disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {submitError && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm">{submitError}</div>
              )}

              <button
                type="submit"
                disabled={submitting || soldOut}
                className="w-full bg-primary text-primary-foreground py-4 rounded-full font-semibold text-base boty-transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جارٍ المعالجة...
                  </>
                ) : (
                  `اطلبي الآن — ${total} دج`
                )}
              </button>
              <p className="text-xs text-center text-muted-foreground">
                الدفع عند الاستلام · سنتصل بك لتأكيد الطلب قبل الشحن
              </p>
            </form>

            {/* Summary */}
            <aside className="lg:col-span-2 bg-background rounded-3xl p-6 boty-shadow lg:sticky lg:top-24">
              <h3 className="font-bold text-foreground mb-5">ملخص الطلب</h3>
              <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-card shrink-0">
                  <Image src={PRODUCT.image} alt={PRODUCT.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{PRODUCT.name}</p>
                  <p className="text-xs text-muted-foreground">x{quantity}</p>
                </div>
                <span className="text-sm font-medium">{subtotal} دج</span>
              </div>
              <div className="space-y-2 text-sm pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>التوصيل</span>
                  <span>{territory ? `${shipping} دج` : "حسب الولاية"}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border/50">
                  <span>المجموع</span>
                  <span>{total} دج</span>
                </div>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> تأكيد بالهاتف في موعد أقصاه اليوم التالي</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> التسليم بعد يومين من التأكيد</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> الدفع نقداً عند الاستلام</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <FooterAr />

      {/* Floating order bar (mobile), hidden while the form is on screen */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 p-3 bg-background/90 backdrop-blur-md border-t border-border/50 lg:hidden boty-transition ${
          orderInView ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <a
          href="#order"
          className="flex items-center justify-between bg-primary text-primary-foreground px-6 py-3.5 rounded-full font-semibold"
        >
          <span>اطلبي الآن</span>
          <span>{PRICE} دج</span>
        </a>
      </div>

      {/* Scroll to top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="العودة إلى الأعلى"
        className={`fixed bottom-24 lg:bottom-6 start-5 z-30 w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg boty-transition ${
          showTop ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* Success */}
      <Dialog open={success} onOpenChange={(open) => !open && closeSuccess()}>
        <DialogContent dir="rtl" className="font-cairo text-center sm:max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">تم تسجيل طلبك بنجاح 🎉</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            طلبك قيد التحضير. سيتصل بك فريق Gateline Cosmetics قريباً لتأكيده ✅
          </DialogDescription>
          <button
            type="button"
            onClick={closeSuccess}
            className="mt-4 w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold boty-transition hover:bg-primary/90"
          >
            موافق
          </button>
        </DialogContent>
      </Dialog>
    </main>
  )
}
