"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ChevronRight, Minus, Plus, ChevronDown, Truck, Award, Star, Check } from "lucide-react"
import { HeaderAr } from "@/components/boty/header-ar"
import { FooterAr } from "@/components/boty/footer-ar"
import { useCart } from "@/components/boty/cart-context"
import { trackViewContent } from "@/lib/fpixel"

const products: Record<string, {
  id: string
  name: string
  tagline: string
  description: string
  price: number
  originalPrice: number | null
  image: string
  sizes: string[]
  details: string
  howToUse: string
  ingredients: string
  delivery: string
}> = {
  "radiance-serum": {
    id: "radiance-serum",
    name: "تونر بادس نياسيناميد 4%",
    tagline: "يوحّد لون البشرة ويضيء الوجه، ويحسن مظهر المسام وينظم إفراز الزيوت.",
    description: "غني بالنياسيناميد ومستخلص عرق السوس، تستهدف هذه الأقراص وتقلل من ظهور البقع البنية وعلامات حب الشباب، وتساعد على تضييق المسام المتوسعة، وتضيء البشرة وتستعيد إشراقتها الطبيعية لبشرة موحدة ومتوهجة.",
    price: 1600,
    originalPrice: null,
    image: "/images/products/niacinamide_tonerpads.jpg",
    sizes: ["40 قرص"],
    details: "مناسب لجميع أنواع البشرة. يُحفظ في مكان بارد وجاف، بعيداً عن متناول الأطفال. يُحفظ بعيداً عن أشعة الشمس المباشرة.",
    howToUse: "بعد التنظيف، مرري القرص على كامل الوجه والرقبة مع تجنب منطقة العينين والشفتين. يترك لمدة 3 إلى 5 دقائق. يُستخدم يومياً صباحاً و/أو مساءً. لا يُشطف.",
    ingredients: "ماء الورد، ماء، نياسيناميد، جليسرين نباتي، ألوفيرا، مستخلص عرق السوس، بانثينول، مادة حافظة.",
    delivery: "تُسلّم جميع الطلبات بعد يومين من تأكيدها. سيتصل بك أحد أعضاء فريق Gateline Cosmetics لتأكيد طلبك في موعد أقصاه اليوم التالي لطلبك."
  },
  "hydrating-serum": {
    id: "hydrating-serum",
    name: "تونر بادس AHA 5%",
    tagline: "يقشر البشرة كيميائياً بلطف لبشرة أكثر نعومة ولون موحد.",
    description: "احصلي على بشرة نظيفة ومتوهجة مع أقراص تونر حمض الجليكوليك 5%. هذه التركيبة تقشر بلطف وتساعد ضد العيوب. تزيل الخلايا الميتة وتنعم ملمس البشرة لبشرة أكثر نعومة ولون موحد.",
    price: 1600,
    originalPrice: null,
    image: "/images/products/aha_tonerpads.jpg",
    sizes: ["40 قرص"],
    details: "مناسب لجميع أنواع البشرة. يُحفظ في مكان بارد وجاف، بعيداً عن متناول الأطفال. يُحفظ بعيداً عن أشعة الشمس المباشرة. استخدمي واقي الشمس في النهار.",
    howToUse: "بعد التنظيف، مرري القرص على كامل الوجه والرقبة مع تجنب منطقة العينين والشفتين. يُطبق فقط في المساء، 2 إلى 3 مرات في الأسبوع. لا يُشطف.",
    ingredients: "ماء الورد، ماء، جليسرين نباتي، ألوفيرا، حمض الجليكوليك، بانثينول، مادة حافظة.",
    delivery: "تُسلّم جميع الطلبات بعد يومين من تأكيدها. سيتصل بك أحد أعضاء فريق Gateline Cosmetics لتأكيد طلبك في موعد أقصاه اليوم التالي لطلبك."
  },
  "hydra-cream": {
    id: "hydra-cream",
    name: "محيط العين بالكافيين",
    tagline: "يزيل احتقان منطقة العين بفضل طرفه المعدني، ويرطب ويخفف تصبغ الهالات السوداء",
    description: "هذا الجل لمحيط العين يخفف الهالات السوداء المصطبغة والأوعية الدموية، ويقلل من حجم وانتقاخ الانتفاخات تحت العينين، ويرطب وينعم ويملأ محيط العين.",
    price: 900,
    originalPrice: null,
    image: "/images/products/cafeine_contour.png",
    sizes: ["17 مل"],
    details: "غني بالكافيين، يساعد هذا الجل لمحيط العين على تحفيز الدورة الدموية، وتنشيط النظر بتقليل ظهور الهالات السوداء، وإزالة احتقان محيط العين لتأثير منعش ومريح. حفظ جل محيط العين بالكافيين في الثلاجة يوفر إحساساً إضافياً بالانتعاش أثناء التطبيق ويساعد على تخفيف الانتفاخات تحت العينين.",
    howToUse: "ضعي كمية صغيرة على محيط العين صباحاً و/أو مساءً. دلكي المنطقة بالطرف.",
    ingredients: "جل ألوفيرا، زيت الأفوكادو، زيت القهوة الأساسي، حمض الهيالورونيك، فيتامين E، مادة حافظة.",
    delivery: "تُسلّم جميع الطلبات بعد يومين من تأكيدها. سيتصل بك أحد أعضاء فريق Gateline Cosmetics لتأكيد طلبك في موعد أقصاه اليوم التالي لطلبك."
  },
  "gentle-cleanser": {
    id: "gentle-cleanser",
    name: "محيط العين بالكولاجين",
    tagline: "غني بالكولاجين وحمض الهيالورونيك، هذا السيروم يرطب ويملأ محيط العين",
    description: "هذا السيروم يرطب ويغذي البشرة الحساسة حول العينين ويساعد على تقليل ظهور التجاعيد والخطوط الدقيقة. يمنح تغذية مكثفة وترطيباً عميقاً.",
    price: 900,
    originalPrice: null,
    image: "/images/products/collagene_contour.png",
    sizes: ["17 مل"],
    details: "حفظ جل محيط العين في الثلاجة يوفر إحساساً إضافياً بالانتعاش أثناء التطبيق ويساعد على تخفيف الانتفاخات تحت العينين.",
    howToUse: "ضعي كمية صغيرة على محيط العين صباحاً و/أو مساءً. دلكي المنطقة بالطرف.",
    ingredients: "ألوفيرا، زيت الأفوكادو، كولاجين، حمض الهيالورونيك، فيتامين E، مادة حافظة.",
    delivery: "تُسلّم جميع الطلبات بعد يومين من تأكيدها. سيتصل بك أحد أعضاء فريق Gateline Cosmetics لتأكيد طلبك في موعد أقصاه اليوم التالي لطلبك."
  },
  "night-cream": {
    id: "night-cream",
    name: "محيط العين بالريتينول",
    tagline: "غني بالريتينول، هذا السيروم هو حليفك المضاد للشيخوخة.",
    description: "هذا الجل لمحيط العين بالريتينول يساعد على تقليل ظهور التجاعيد والخطوط الدقيقة، ويحسن مرونة البشرة لمحيط عين أكثر نعومة وإشراقاً، ويساهم في تنشيط لمعان النظر.",
    price: 900,
    originalPrice: null,
    image: "/images/products/retinol_contour.png",
    sizes: ["17 مل"],
    details: "حفظ جل محيط العين في الثلاجة يوفر إحساساً إضافياً بالانتعاش أثناء التطبيق ويساعد على تخفيف الانتفاخات تحت العينين. للنساء الحوامل أو المرضعات، يُنصح باستشارة الطبيب قبل استخدام هذا المنتج.",
    howToUse: "يُستخدم في المساء، مرة إلى مرتين في الأسبوع، ثم زيدي التكرار تدريجياً حتى الاستخدام اليومي، حسب تحمل بشرتك. ضعي واقي الشمس في الصباح بعد الاستخدام.",
    ingredients: "جل ألوفيرا، زيت الأفوكادو، ريتينول، فيتامين E، مادة حافظة.",
    delivery: "تُسلّم جميع الطلبات بعد يومين من تأكيدها. سيتصل بك أحد أعضاء فريق Gateline Cosmetics لتأكيد طلبك في موعد أقصاه اليوم التالي لطلبك."
  },
  "renewal-oil": {
    id: "renewal-oil",
    name: "قناع البشرة الزجاجية",
    tagline: "غني بالكولاجين، هذا القناع المقشر يغلف روتينك ويوفر لك التهدئة والترطيب المثاليين.",
    description: "احصلي على بشرة زجاجية مع هذا القناع بالكولاجين والألوفيرا والبانثينول. ترطيبه القصّي يرطب بعمق، ويحسن مرونة البشرة وثباتها، ويضيء الوجه، ويخفف الخطوط الدقيقة ويقوي حاجز البشرة، لبشرة ممتلئة أكثر نعومة وإشراقاً.",
    price: 1500,
    originalPrice: null,
    image: "/images/products/collagene_masque.png",
    sizes: ["75 مل"],
    details: "مناسب للبشرة العادية والجافة والمجففة والحساسة. استخدميه 1 إلى 2 مرات في الأسبوع لبشرة أكثر نعومة وترطيباً وإشراقاً بشكل ملحوظ.",
    howToUse: "بعد روتين العناية المعتاد، ضعي طبقة موحدة من القناع مع تجنب محيط العينين والحاجبين والشفتين وجذور الشعر. اتركيه ليجف لمدة 15 إلى 20 دقيقة، ثم أزيلي القناع بلطف بدءاً من الحواف. لا يُشطف.",
    ingredients: "ماء، كحول بولي فينيل PVA، ألوفيرا، جليسرين نباتي، كولاجين بحري، بانثينول، مادة حافظة، عطر",
    delivery: "تُسلّم جميع الطلبات بعد يومين من تأكيدها. سيتصل بك أحد أعضاء فريق Gateline Cosmetics لتأكيد طلبك في موعد أقصاه اليوم التالي لطلبك."
  },
  "rosehip-oil": {
    id: "rosehip-oil",
    name: "قناع تنظيف المسام",
    tagline: "غني بحمض الجليكوليك ومزيج من الطين، يعمل هذا القناع كمقشر وقناع منقي ينظف بعمق.",
    description: "هذا القناع لتنظيف المسام يعتمد على الطين الأخضر والأبيض، ومدعم بـ AHA، ويساعد على تنقية وتنظيف البشرة بعمق وتحسين مظهر المسام. يقشر بلطف وينعم ملمس البشرة لبشرة أنظف وأكثر نعومة وتوحيداً.",
    price: 1200,
    originalPrice: null,
    image: "/images/products/aha_masque.png",
    sizes: ["75 مل"],
    details: "مناسب للبشرة المختلطة إلى الدهنية. استخدميه 1 إلى 2 مرات في الأسبوع.",
    howToUse: "ضعي طبقة موحدة على بشرة نظيفة وجافة، مع تجنب محيط العين. اتركيه 15 إلى 20 دقيقة ثم اشطفيه.",
    ingredients: "ماء الورد، طين أخضر، طين أبيض، دقيق الأرز، حمض الجليكوليك، ألوفيرا، جليسرين نباتي، زيت اللوز الحلو، مستخلص عرق السوس، نيلي أزرق، مادة حافظة.",
    delivery: "تُسلّم جميع الطلبات بعد يومين من تأكيدها. سيتصل بك أحد أعضاء فريق Gateline Cosmetics لتأكيد طلبك في موعد أقصاه اليوم التالي لطلبك."
  },
  "deodorant-fraicheur": {
    id: "deodorant-fraicheur",
    name: "مزيل عرق طبيعي 100% - انتعاش",
    tagline: "انتعاش يدوم 24 ساعة، بدون أملاح الألومنيوم ولا كحول.",
    description: "انتعاش يدوم 24 ساعة بفضل مزيل العرق هذا بمكونات طبيعية 100%، بدون ألومنيوم ولا كحول.",
    price: 750,
    originalPrice: null,
    image: "/images/products/deodorant_fraicheur.jpeg",
    sizes: ["50 مل"],
    details: "مناسب لجميع أنواع البشرة. بدون أملاح الألومنيوم ولا كحول. يُحفظ في مكان بارد وجاف، بعيداً عن متناول الأطفال. يُحفظ بعيداً عن أشعة الشمس المباشرة.",
    howToUse: "ضعي كمية صغيرة على منطقة الإبط النظيفة والجافة، ثم دلكي حتى الامتصاص الكامل. يُستخدم يومياً.",
    ingredients: "زيت جوز الهند، بيكربونات الصوديوم، نشا الذرة، زيت البلماروزا العطري والمريمية المسكية، فيتامين E، عطر.",
    delivery: "تُسلّم جميع الطلبات بعد يومين من تأكيدها. سيتصل بك أحد أعضاء فريق Gateline Cosmetics لتأكيد طلبك في موعد أقصاه اليوم التالي لطلبك."
  },
  "deodorant-vanille": {
    id: "deodorant-vanille",
    name: "مزيل عرق طبيعي 100% - فانيلا",
    tagline: "انتعاش يدوم 24 ساعة برائحة الفانيلا، بدون أملاح الألومنيوم ولا كحول.",
    description: "انتعاش يدوم 24 ساعة بفضل مزيل العرق هذا بمكونات طبيعية 100%، بدون ألومنيوم ولا كحول.",
    price: 750,
    originalPrice: null,
    image: "/images/products/deodorant_vanille.jpeg",
    sizes: ["50 مل"],
    details: "مناسب لجميع أنواع البشرة. بدون أملاح الألومنيوم ولا كحول. يُحفظ في مكان بارد وجاف، بعيداً عن متناول الأطفال. يُحفظ بعيداً عن أشعة الشمس المباشرة.",
    howToUse: "ضعي كمية صغيرة على منطقة الإبط النظيفة والجافة، ثم دلكي حتى الامتصاص الكامل. يُستخدم يومياً.",
    ingredients: "زيت جوز الهند، بيكربونات الصوديوم، نشا الذرة، زيت البلماروزا العطري والمريمية المسكية، فيتامين E، عطر.",
    delivery: "تُسلّم جميع الطلبات بعد يومين من تأكيدها. سيتصل بك أحد أعضاء فريق Gateline Cosmetics لتأكيد طلبك في موعد أقصاه اليوم التالي لطلبك."
  }
}

const benefits = [
  { icon: Truck, label: "98% مكونات طبيعية" },
  { icon: Truck, label: "توصيل إلى جميع أنحاء الجزائر" },
  { icon: Award, label: "مختبر تحت إشراف جلدية" }
]

type AccordionSection = "details" | "howToUse" | "ingredients" | "delivery"

export default function ProductPageAr() {
  const params = useParams()
  const productId = params.id as string
  const product = products[productId] || products["radiance-serum"]

  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<AccordionSection | null>("details")
  const [isAdded, setIsAdded] = useState(false)
  const { addItem, setIsOpen } = useCart()
  const router = useRouter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])

  useEffect(() => {
    trackViewContent({ id: product.id, name: product.name, price: product.price })
  }, [product.id, product.name, product.price])

  const toggleAccordion = (section: AccordionSection) => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  const addToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image
      },
      quantity
    )
  }

  const handleAddToCart = () => {
    addToCart()
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  // Straight to checkout. addItem opens the cart drawer, which would otherwise
  // sit over the checkout page, so close it before navigating.
  const handleBuyNow = () => {
    addToCart()
    setIsOpen(false)
    router.push("/checkout/Ar")
  }

  const accordionItems: { key: AccordionSection; title: string; content: string }[] = [
    { key: "details", title: "التفاصيل", content: product.details },
    { key: "howToUse", title: "طريقة الاستخدام", content: product.howToUse },
    { key: "ingredients", title: "المكونات", content: product.ingredients },
    { key: "delivery", title: "التوصيل", content: product.delivery }
  ]

  return (
    <main dir="rtl" className="min-h-screen font-cairo">
      <HeaderAr />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/shop/Ar"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground boty-transition mb-8 font-cairo"
          >
            <ChevronRight className="w-4 h-4" />
            العودة إلى المتجر
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Product Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-card boty-shadow">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Header */}
              <div className="mb-8">
                <span className="text-sm tracking-[0.3em] uppercase text-primary mb-2 block font-cairo">
                  تونر بادس
                </span>
                <h1 className="font-cairo text-4xl md:text-5xl text-foreground mb-3 font-semibold">
                  {product.name}
                </h1>
                <p className="text-lg text-muted-foreground italic mb-4 font-cairo">
                  {product.tagline}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground font-cairo">(128 تقييم)</span>
                </div>

                <p className="text-foreground/80 leading-relaxed font-cairo">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl font-medium text-foreground">{product.price} دج</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {product.originalPrice} دج
                  </span>
                )}
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-3 block font-cairo">الحجم</label>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-full text-sm boty-transition boty-shadow font-cairo ${
                        selectedSize === size
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground hover:bg-card/80"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="text-sm font-medium text-foreground mb-3 block font-cairo">الكمية</label>
                <div className="inline-flex items-center gap-4 bg-card rounded-full px-2 py-2 boty-shadow">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                    aria-label="تقليل الكمية"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                    aria-label="زيادة الكمية"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm tracking-wide boty-transition boty-shadow font-cairo ${
                    isAdded
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      أُضيف إلى السلة
                    </>
                  ) : (
                    "أضف إلى السلة"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-foreground/20 text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5 font-cairo"
                >
                  اشترِ الآن
                </button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {benefits.slice(0, 3).map((benefit) => (
                  <div
                    key={benefit.label}
                    className="flex flex-col items-center justify-center gap-3 p-6 boty-shadow bg-transparent shadow-none rounded-xl"
                  >
                    <benefit.icon className="w-6 h-6 text-primary" />
                    <span className="text-xs text-muted-foreground text-center font-cairo">
                      {benefit.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Accordion */}
              <div className="border-t border-border/50">
                {accordionItems.map((item) => (
                  <div key={item.key} className="border-b border-border/50">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.key)}
                      className="w-full flex items-center justify-between py-5 text-right"
                    >
                      <span className="font-medium text-foreground font-cairo">{item.title}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground boty-transition ${
                          openAccordion === item.key ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden boty-transition ${
                        openAccordion === item.key ? "max-h-96 pb-5" : "max-h-0"
                      }`}
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed font-cairo">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterAr />
    </main>
  )
}
