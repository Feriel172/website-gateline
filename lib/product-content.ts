// Rich content for the product pages: everything below the price and the two
// buttons. One entry per product id (see `products` in app/product/[id]/page.tsx).
//
// Most of it is the copy already published elsewhere on the site, restated:
// `actives` comes from the ingredient list, `steps` from the directions and
// `faq` answers from the directions, the precautions and the delivery promise.
// Nothing here should claim more than those sources do.
//
// Two blocks are deliberately empty for most products:
//   `results`      measured figures — only where a real test backs them up
//   testimonials   read from lib/reviews.ts, never written here
// A section with no content does not render, so a product can be filled in
// gradually without leaving a gap on the page.

// Keys, not components, so this file stays free of imports; ICONS in
// components/boty/product-sections.tsx maps them to lucide icons.
export type BenefitIcon =
  | "spark"
  | "pores"
  | "sebum"
  | "soothe"
  | "hydrate"
  | "firm"
  | "exfoliate"
  | "eyes"
  | "antiage"
  | "purify"

export interface Stat {
  value: string
  label: string
}

export interface Active {
  name: string
  description: string
  image: string
}

export interface Step {
  title: string
  detail: string
  image: string
}

export interface Testimonial {
  name: string
  quote: string
  /** Avatar. Kept on the existing entries but no longer shown on the card. */
  image?: string
  rating: number
  /** Relative date under the name, e.g. "Il y a 2 semaines". */
  since?: string
  /** Before / after shot attached to the review, shown under the quote. */
  photo?: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface ProductContent {
  /** Eyebrow above the product name; was hard-coded to "Toner pads" before. */
  category: string
  badge: string | null
  /** First entry is the main shot; the others fill the thumbnail strip. */
  gallery: string[]
  promise: { title: string; subtitle: string } | null
  benefits: { icon: BenefitIcon; label: string }[]
  lifestyle: { image: string; caption: string } | null
  /**
   * Before / after shots, one per carousel slide. `labelsInImage` is for older
   * composites that already have the Avant / Après pills printed on them;
   * without it the section draws its own.
   */
  results: {
    /**
     * `panels` is how many stages a shot is cut into (2 unless set), and
     * `labelsInImage` marks one that already has the pills printed on it.
     */
    images: { src: string; panels?: number; labelsInImage?: boolean }[]
    stats: Stat[]
    note: string
  } | null
  actives: Active[]
  steps: Step[]
  skinTypes: { label: string; image: string | null }[]
  faq: FaqItem[]
  /**
   * Customer before / after photos, shown as cards in a carousel. The images are
   * served exactly as they were supplied — never cropped — so each card is as
   * tall as its own photo.
   */
  milestones?: { src: string; title: string; description: string; tags: string[] }[]
  testimonials: Testimonial[]
  /** Product shot for the closing brand card. */
  brandScene: string | null
}

const DELIVERY_ANSWER =
  "24h à 48h après votre commande"

export const PRODUCT_CONTENT: Record<string, ProductContent> = {
  "radiance-serum": {
    category: "Toner pads",
    badge: "Bestseller",
    // Product shots first, then the branded visuals
    gallery: [
      "/images/products/niacinamide_tonerpads.jpg",
      "/images/products/niacinamide/gallery-cure.png",
      "/images/products/niacinamide/gallery-pres.png",
      "/images/products/niacinamide/gallery-comparatif.png",
    ],

    promise: null,
    benefits: [
      { icon: "spark", label: "Réduit les taches et unifie le teint" },
      { icon: "pores", label: "Minimise les pores" },
      { icon: "sebum", label: "Régule l'excès de sébum" },
      { icon: "soothe", label: "Apaise et hydrate en profondeur" },
    ],
    lifestyle: null,
    results: {
      images: [
        { src: "/images/products/niacinamide/before-after-2.jpg" },
        { src: "/images/products/niacinamide/before-after-3.png" },
        { src: "/images/products/niacinamide/before-after-4.jpg" },
        
      ],
      stats: [
        { value: "89%", label: "peau plus lumineuse" },
        { value: "85%", label: "pores moins visibles" },
        { value: "90%", label: "teint plus uniforme" },
      ],
      note: "Résultats visibles après 4 semaines d'utilisation. Des milliers de clientes ont déjà vu la différence ; Une peau plus nette, plus lumineuse et un teint unifié dès quelques semaines d'utilisation. ",
    },
    actives: [
      {
        name: "4% Niacinamide",
        description: "Réduit les taches, unifie le teint et minimise les pores.",
        image: "/images/products/niacinamide/active-niacinamide.png",
      },
      {
        name: "Extrait de réglisse",
        description: "Apaise, illumine et aide à prévenir les marques.",
        image: "/images/products/niacinamide/active-licorice.png",
      },
      {
        name: "Panthénol",
        description: "Hydrate et renforce la barrière cutanée.",
        image: "/images/products/niacinamide/active-panthenol.png",
      },
    ],
    steps: [
      {
        title: "Prélevez un pad",
        detail: "Sur une peau propre, après le nettoyage.",
        image: "/images/products/niacinamide/step-1.png",
      },
      {
        title: "Passez sur le visage",
        detail: "Visage et cou, en évitant le contour des yeux et des lèvres.",
        image: "/images/products/niacinamide/step-2.png",
      },
      {
        title: "Laissez poser 3 à 5 minutes",
        detail: "Ne pas rincer, puis poursuivez votre routine habituelle.",
        image: "/images/products/niacinamide/step-3.png",
      },
    ],
    skinTypes: [
      { label: "Peaux sèches", image: "/images/products/niacinamide/skin-dry.png" },
      { label: "Peaux mixtes", image: "/images/products/niacinamide/skin-combination.png" },
      { label: "Peaux grasses", image: "/images/products/niacinamide/skin-oily.png" },
      { label: "Peaux sensibles", image: "/images/products/niacinamide/skin-sensitive.png" },
    ],
    faq: [
      {
        question: "À quelle fréquence l'utiliser ?",
        answer: "Quotidiennement, matin et/ou soir, après le nettoyage du visage.",
      },
      {
        question: "Convient-il à tous les types de peau ?",
        answer: "Oui. La formule convient à tous les types de peau, y compris les peaux sensibles.",
      },
      {
        question: "Faut-il rincer après application ?",
        answer: "Non. Laissez poser 3 à 5 minutes et enchaînez avec le reste de votre routine.",
      },
      {
        question: "Y a-t-il un risque de sécheresse ?",
        answer:
          "La formule associe aloe vera, glycérine végétale et panthénol, qui hydratent et renforcent la barrière cutanée pendant que la niacinamide agit.",
      },
      { question: "Quels sont les délais de livraison ?", answer: DELIVERY_ANSWER },
    ],
    // Customer photos, served exactly as supplied. Titles name what each one
    // shows rather than a duration, since no timings were given.
    milestones: [
      {
        src: "/images/products/niacinamide/resultat-1.png",
        title: "Points noirs",
        description:
          "Les points noirs du nez sont nettement moins visibles et les pores paraissent resserrés.",
        tags: ["Pores désobstrués", "Nez plus net", "Sébum régulé"],
      },
      
      
      {
        src: "/images/products/niacinamide/resultat-4.jpg",
        title: "Pores dilatés",
        description:
          "Les pores de la joue paraissent minimisés et la peau reflète mieux la lumière.",
        tags: ["Pores minimisés", "Peau plus nette", "Éclat retrouvé"],
      },
      {
        src: "/images/products/niacinamide/resultat-5.jpg",
        title: "Marques d'acné",
        description:
          "Les marques rouges laissées par les boutons s'estompent et le teint redevient uniforme.",
        tags: ["Marques atténuées", "Teint unifié", "Peau apaisée"],
      },
      
    ],
    testimonials: [
      {
        name: "Mouna L.",
        since: "Il y a 2 semaines",
        quote: "syit la boite jaune m3blich wla rani ntkhayl ms tellement wihi rah fih le golw w rtab mamntch hba n93od nchouf fih.",
        image: "/images/products/niacinamide/avis-sarah.png",
        photo:"/images/products/niacinamide/avis-1.jpeg",
        rating: 5,
      },
      {
        name: "Zahira C.",
        since: "Il y a 1 mois",
        quote: "J’ai recommander 4 boîtes du toner à la niacinamide et 1 à l'AHA Pour moi et mes copines parce qu'elles ont toute remarquer la différence que ça a fait sur ma peau et veulent l'essayer aussi ",
        image: "/images/products/niacinamide/avis-ines.png",
        rating: 5,
      },
      {
        name: "Nesrine B.",
        since: "Il y a 1 semaine",
        quote: "والله خرج عليا هايل انشاء اللّٰه توفرهولنا فكوسميتيك",
        image: "/images/products/niacinamide/avis-nour.png",
        photo:"/images/products/niacinamide/avis-2.jpeg",
        rating: 5,
      },
      {
        name: "Rayane B.",
        since: "Il y a 3 semaines",
        quote: "Les patchs gateline tres efficace, j'ai adoré",
        image: "/images/products/niacinamide/avis-amel.png",
        rating: 5,
      },
      {
        name: "Assia C.",
        since: "Il y a 3 semaines",
        quote: "J'ai essayé votre produit je l'aime trop Ms vraiment c'est une découverte votre marque",
        image: "/images/products/niacinamide/avis-amel.png",
        rating: 5,
      },
      {
        name: "marwa Z.",
        since: "Il y a 3 semaines",
        quote: "أنا حبيت منتجكم لانو تونر وينظف فنفس الوقت لقيتو خيار ملائم جدا بش نمسح بيه وجهي صباحا قبل مندير روتينيي الصباحي أنا ندير سيروم فيتامين سي ومرطب وواقي شمسي",
        image: "/images/products/niacinamide/avis-amel.png",
        rating: 5,
      },
      {
        name: "Assma B.",
        since: "Il y a 3 semaines",
        quote: "without compliments your product amazing walah",
        image: "/images/products/niacinamide/avis-amel.png",
        rating: 5,
      },
      {
        name: "Douaa G.",
        since: "Il y a 4 semaines",
        quote: "نشكركم لانو مدة وانا نحوس على منتج هكذا يكون تونر وينظف ويغذي وخفيف ومواد تاوعو خفيفة ماتضرش وشرف ليا لقيتو منتوج بلادي",
        image: "/images/products/niacinamide/avis-amel.png",
        rating: 5,
      },
    ],
    brandScene: null,
  },

  "hydrating-serum": {
    category: "Toner pads",
    badge: null,
    // Product shot first, then the branded visuals. No model photos.
    gallery: [
      "/images/products/aha_tonerpads.jpg",
      "/images/products/aha/gallery-cure.png",
      "/images/products/aha/gallery-rituel.png",
      "/images/products/aha/gallery-benefices.png",
      "/images/products/aha/gallery-comparatif.png",
    ],
    
    // No promise or lifestyle block on this page: the sections skip themselves
    promise: null,
    lifestyle: null,
    benefits: [
      { icon: "exfoliate", label: "Exfolie chimiquement en douceur" },
      { icon: "spark", label: "Affine le grain de peau" },
      { icon: "purify", label: "Aide contre les imperfections" },
      { icon: "hydrate", label: "Unifie et lisse le teint" },
    ],
    
    // Customer before / after photos. The figures below are still the
    // Niacinamide ones — there is no AHA test yet; replace them when there is.
    results: {
      images: [
        { src: "/images/products/aha/before-after-1.png" },
        { src: "/images/products/aha/before-after-2.jpg" },
        // Three stages of the same cheek, so it gets two separators
        { src: "/images/products/aha/before-after-3.jpg", panels: 3 },
        { src: "/images/products/aha/before-after-4.jpg" },
      ],
      stats: [
        { value: "89%", label: "moins de tâches" },
        { value: "85%", label: "moins de cicatrices" },
        { value: "90%", label: "teint plus uniforme" },
      ],
      note: "Résultats visibles après 4 semaines d'utilisation. Des milliers de clientes ont déjà vu la différence ; Une peau plus nette, plus lumineuse et un teint unifié dès quelques semaines d'utilisation. ",
    },
    // Shared with the Niacinamide set: both are 40-pad toners, and panthénol is
    // literally the same ingredient. Swap in AHA photography when it exists.
    actives: [
      {
        name: "5% Acide glycolique",
        description: "Élimine les cellules mortes et affine le grain de peau.",
        image: "/images/products/niacinamide/active-niacinamide.png",
      },
      {
        name: "Aloe vera",
        description: "Apaise la peau pendant l'exfoliation.",
        image: "/images/products/niacinamide/active-licorice.png",
      },
      {
        name: "Panthénol",
        description: "Hydrate et renforce la barrière cutanée.",
        image: "/images/products/niacinamide/active-panthenol.png",
      },
    ],
    steps: [
      {
        title: "Prélevez un pad",
        detail: "Le soir, sur une peau propre et sèche.",
        image: "/images/products/niacinamide/step-1.png",
      },
      {
        title: "Passez sur le visage",
        detail: "Visage et cou, en évitant le contour des yeux et des lèvres.",
        image: "/images/products/niacinamide/step-2.png",
      },
      {
        title: "Laissez agir",
        detail: "Ne pas rincer. 2 à 3 fois par semaine, avec un SPF le matin.",
        image: "/images/products/niacinamide/step-3.png",
      },
    ],
    skinTypes: [
      { label: "Peaux sèches", image: null },
      { label: "Peaux mixtes", image: null },
      { label: "Peaux grasses", image: null },
      { label: "Peaux sensibles", image: null },
    ],
    faq: [
      {
        question: "À quelle fréquence l'utiliser ?",
        answer: "Uniquement le soir, 2 à 3 fois par semaine.",
      },
      {
        question: "Faut-il une protection solaire ?",
        answer:
          "Oui. L'acide glycolique sensibilise la peau au soleil : appliquez une crème solaire le jour.",
      },
      {
        question: "Peut-on l'associer aux toner pads niacinamide ?",
        answer:
          "Oui, la niacinamide le matin, l'AHA le soir",
      },
      {
        question: "Faut-il rincer après application ?",
        answer: "Non. Laissez agir et poursuivez votre routine.",
      },
      { question: "Quels sont les délais de livraison ?", answer: DELIVERY_ANSWER },
    ],
    // Photos exactly as supplied. Titles name the zone each one shows rather
    // than a duration, since no timings were given for them.
    milestones: [
      {
        src: "/images/products/aha/resultat-1.jpg",
        title: "Taches pigmentaires",
        description:
          "Les taches brunes et les marques laissées par les imperfections s'estompent, et le teint retrouve de l'uniformité.",
        tags: ["Taches atténuées", "Teint unifié", "Peau lumineuse"],
      },
      {
        src: "/images/products/aha/resultat-2.jpg",
        title: "Boutons dans le dos",
        description:
          "L'exfoliation élimine les cellules mortes en surface : le teint est visiblement plus homogène.",
        tags: ["plus d'acné", "cicatrices estompés", "teint unifié"],
      },
      {
        src: "/images/products/aha/resultat-3.jpg",
        title: "Grain de peau",
        description:
          "Les boutons sous la peau s'atténuent, laissant une peau plus lisse au toucher.",
        tags: ["Pores purifiés", "Peau plus lisse", "Moins d'imperfections"],
      },
      {
        src: "/images/products/aha/resultat-4.jpg",
        title: "Tâches d'hyperpigmentation",
        description:
          "Les Tâches et cicatrices d'acné se réduisent nettement, pour une peau plus nette.",
        tags: ["Imperfections réduites", "Peau plus nette"],
      },
      {
        src: "/images/products/aha/resultat-5.png",
        title: "Zones de frottement",
        description:
          "Les zones sombres et épaissies s'éclaircissent progressivement et la texture s'affine.",
        tags: ["Peau plus claire", "Texture affinée"],
      },
      {
        src: "/images/products/aha/resultat-6.jpg",
        title: "Peau de fraise",
        description:
          "la peau de fraise et la sensation granuleuse s'estompent : la peau est nettement plus lisse et plus douce au toucher.",
        tags: ["peau lissées", "Peau plus douce", "Rougeurs apaisées"],
      },
    ],
    // Placeholder copy, like the Niacinamide ones: same customers, same photos,
    // quotes written for this product. Replace with real reviews.
    testimonials: [
      {
        name: "Sarah L.",
        since: "Il y a 2 semaines",
        quote: "Andi 15j mli cherit had 2 produit dyalkom Kan 3endi klef 3ejb Rahli 70%",
        image: "/images/products/niacinamide/avis-sarah.png",
        rating: 5,
      },
      {
        name: "Oum Maram.",
        since: "Il y a 1 mois",
        quote: "وحدا ف 10 جوان و وحدا ف 27 جوان",
        image: "/images/products/niacinamide/avis-ines.png",
        photo: "/images/products/aha/avis-1.jpeg",
        rating: 5,
      },
      {
        name: "Nour B.",
        since: "Il y a 1 semaine",
        quote: "Wellah les produits magnifique surtout les pads bleu kano 3ndi des cicatrices hadi moda twila ki sta3mlt les pads khafo bzf inchallah ytwafro f kml les cosmétiques",
        image: "/images/products/niacinamide/avis-nour.png",
        rating: 5,
      },
      {
        name: "Lylia B.",
        since: "Il y a 3 semaines",
        quote: "نحير كي نشوف واش ينحي دبوغية! يديا مغسولين يعني ماشي وسخ",
        image: "/images/products/niacinamide/avis-amel.png",
        photo: "/images/products/aha/avis-2.jpeg",
        rating: 5,
      },
      {
        name: "Dounia B.",
        since: "Il y a 3 semaines",
        quote: "seyit les pads nta3kom un coup de coeur",
        image: "/images/products/niacinamide/avis-amel.png",
        rating: 5,
      },
      {
        name: "Warda E.",
        since: "Il y a 3 semaines",
        quote: "Habit n9olkom merci 3la had magnifique produits vraiment hayel deja rah nzid commande",
        image: "/images/products/niacinamide/avis-amel.png",
        rating: 5,
      },
      {
        name: "Yassmine T.",
        since: "Il y a 3 semaines",
        quote: "Toner pads c'est mon coup de cœur vraiment rien a dire",
        image: "/images/products/niacinamide/avis-amel.png",
        rating: 5,
      },
      {
        name: "Nora K.",
        since: "Il y a 4 semaines",
        quote: "المنتوج تاعكم جربتtoner pads حسيت وجهي نقي و رطب مازال ماكملتش الشهر",
        image: "/images/products/niacinamide/avis-amel.png",
        rating: 5,
      },
      {
        name: "Nadjet S.",
        since: "Il y a 4 semaines",
        quote: "لبارح في ليل جربت الغليكوليك وبزاف عجبني صح حسيت بشرتي تنقات ولقيت Glow جميل يعطيكم الصحة راح نبدا نداوم عليهم ونمدلكم النتيجة ولي تواصلت معايا في التلفون وفهمتني في طريقة الاستعمال ماشاء اللّٰه هايلة ومؤدبة يعطيها الصحة ",
        image: "/images/products/niacinamide/avis-amel.png",
        rating: 5,
      },
    ],
    brandScene: null,
  },

  "hydra-cream": {
    category: "Contour des yeux",
    badge: "Bestseller",
    gallery: [
      "/images/products/cafeine_contour.png",
      "/images/bento-skin-model.jpg",
      "/images/hero-model.jpg",
      "/images/skincare-ritual.jpg",
    ],
    promise: {
      title: "Un regard décongestionné dès l'application",
      subtitle: "L'embout métallique rafraîchit pendant que la caféine agit.",
    },
    benefits: [
      { icon: "eyes", label: "Atténue les cernes pigmentaires et vasculaires" },
      { icon: "soothe", label: "Réduit les poches sous les yeux" },
      { icon: "hydrate", label: "Hydrate et repulpe le contour" },
      { icon: "spark", label: "Ravive l'éclat du regard" },
    ],
    lifestyle: {
      image: "/images/hero-model.jpg",
      caption: "Un regard frais et reposé, matin et soir.",
    },
    results: null,
    actives: [
      {
        name: "Caféine",
        description: "Stimule la circulation et décongestionne le contour de l'œil.",
        image: "/images/products/eye-serum-bottles.png",
      },
      {
        name: "Acide hyaluronique",
        description: "Hydrate, lisse et repulpe la peau délicate du contour.",
        image: "/images/products/serum.jpg",
      },
      {
        name: "Huile d'avocat et vitamine E",
        description: "Nourrissent et protègent une zone fragile.",
        image: "/images/natural-leaf.jpg",
      },
    ],
    steps: [
      {
        title: "Une petite quantité suffit",
        detail: "Matin et/ou soir, sur le contour des yeux.",
        image: "/images/skincare-ritual.jpg",
      },
      {
        title: "Massez avec l'embout",
        detail: "L'embout métallique décongestionne la zone.",
        image: "/images/bento-skin-model.jpg",
      },
      {
        title: "Conservez-le au frais",
        detail: "Au réfrigérateur, l'effet fraîcheur est renforcé.",
        image: "/images/hero-model.jpg",
      },
    ],
    skinTypes: [
      { label: "Peaux sèches", image: null },
      { label: "Peaux mixtes", image: null },
      { label: "Peaux grasses", image: null },
      { label: "Peaux sensibles", image: null },
    ],
    faq: [
      {
        question: "Matin ou soir ?",
        answer: "L'un, l'autre ou les deux : appliquez une petite quantité matin et/ou soir.",
      },
      {
        question: "Pourquoi le conserver au réfrigérateur ?",
        answer:
          "Le froid apporte une sensation de fraîcheur à l'application et aide à atténuer les poches.",
      },
      {
        question: "Agit-il sur tous les types de cernes ?",
        answer:
          "Il cible les cernes pigmentaires et vasculaires, ainsi que la taille et le volume des poches.",
      },
      {
        question: "À quoi sert l'embout métallique ?",
        answer: "Il permet de masser la zone et renforce l'effet décongestionnant.",
      },
      { question: "Quels sont les délais de livraison ?", answer: DELIVERY_ANSWER },
    ],
    testimonials: [],
    brandScene: null,
  },

  "gentle-cleanser": {
    category: "Contour des yeux",
    badge: null,
    gallery: [
      "/images/products/collagene_contour.png",
      "/images/bento-skin-model.jpg",
      "/images/hero-model.jpg",
      "/images/skincare-ritual.jpg",
    ],
    promise: {
      title: "Hydrater et repulper le contour de l'œil",
      subtitle: "Collagène et acide hyaluronique sur une peau particulièrement fine.",
    },
    benefits: [
      { icon: "hydrate", label: "Hydratation profonde" },
      { icon: "firm", label: "Repulpe et lisse la peau" },
      { icon: "antiage", label: "Réduit l'apparence des rides et ridules" },
      { icon: "soothe", label: "Nourrit une zone fragile" },
    ],
    lifestyle: {
      image: "/images/hero-model.jpg",
      caption: "Un contour de l'œil lisse et confortable.",
    },
    results: null,
    actives: [
      {
        name: "Collagène",
        description: "Repulpe et aide à lisser les ridules.",
        image: "/images/products/eye-serum-bottles.png",
      },
      {
        name: "Acide hyaluronique",
        description: "Retient l'eau et hydrate en profondeur.",
        image: "/images/products/serum.jpg",
      },
      {
        name: "Huile d'avocat et vitamine E",
        description: "Nourrissent et protègent la peau du contour.",
        image: "/images/natural-leaf.jpg",
      },
    ],
    steps: [
      {
        title: "Une petite quantité suffit",
        detail: "Matin et/ou soir, sur le contour des yeux.",
        image: "/images/skincare-ritual.jpg",
      },
      {
        title: "Massez avec l'embout",
        detail: "Faites pénétrer en massant doucement la zone.",
        image: "/images/bento-skin-model.jpg",
      },
      {
        title: "Conservez-le au frais",
        detail: "Au réfrigérateur, l'effet fraîcheur est renforcé.",
        image: "/images/hero-model.jpg",
      },
    ],
    skinTypes: [
      { label: "Peaux sèches", image: null },
      { label: "Peaux mixtes", image: null },
      { label: "Peaux grasses", image: null },
      { label: "Peaux sensibles", image: null },
    ],
    faq: [
      {
        question: "Matin ou soir ?",
        answer: "Appliquez une petite quantité matin et/ou soir, selon votre routine.",
      },
      {
        question: "Quelle différence avec le contour à la caféine ?",
        answer:
          "Celui-ci cible l'hydratation et les ridules grâce au collagène ; la version caféine vise les cernes et les poches.",
      },
      {
        question: "Pourquoi le conserver au réfrigérateur ?",
        answer:
          "Le froid apporte une sensation de fraîcheur et aide à atténuer les poches sous les yeux.",
      },
      {
        question: "Convient-il aux peaux sensibles ?",
        answer:
          "Sa formule hydratante est pensée pour la peau délicate du contour des yeux. En cas de doute, testez d'abord sur une petite zone.",
      },
      { question: "Quels sont les délais de livraison ?", answer: DELIVERY_ANSWER },
    ],
    testimonials: [],
    brandScene: null,
  },

  "night-cream": {
    category: "Contour des yeux",
    badge: null,
    gallery: [
      "/images/products/retinol_contour.png",
      "/images/bento-skin-model.jpg",
      "/images/hero-model.jpg",
      "/images/skincare-ritual.jpg",
    ],
    promise: {
      title: "L'allié anti-âge du regard",
      subtitle: "Le rétinol, introduit progressivement, selon la tolérance de votre peau.",
    },
    benefits: [
      { icon: "antiage", label: "Réduit l'apparence des rides et ridules" },
      { icon: "firm", label: "Améliore la fermeté de la peau" },
      { icon: "spark", label: "Ravive l'éclat du regard" },
      { icon: "hydrate", label: "Lisse le contour de l'œil" },
    ],
    lifestyle: {
      image: "/images/hero-model.jpg",
      caption: "Un contour de l'œil plus lisse et plus lumineux.",
    },
    results: null,
    actives: [
      {
        name: "Rétinol",
        description: "Lisse les ridules et améliore la fermeté.",
        image: "/images/products/eye-serum-bottles.png",
      },
      {
        name: "Gel d'aloe vera",
        description: "Apaise et hydrate pendant que le rétinol agit.",
        image: "/images/natural-leaf.jpg",
      },
      {
        name: "Huile d'avocat et vitamine E",
        description: "Nourrissent et protègent la zone.",
        image: "/images/products/serum.jpg",
      },
    ],
    steps: [
      {
        title: "Le soir uniquement",
        detail: "Commencez par une à deux applications par semaine.",
        image: "/images/skincare-ritual.jpg",
      },
      {
        title: "Augmentez progressivement",
        detail: "Jusqu'à une utilisation quotidienne, selon la tolérance de votre peau.",
        image: "/images/bento-skin-model.jpg",
      },
      {
        title: "Crème solaire le matin",
        detail: "Indispensable après chaque utilisation de rétinol.",
        image: "/images/hero-model.jpg",
      },
    ],
    skinTypes: [
      { label: "Peaux sèches", image: null },
      { label: "Peaux mixtes", image: null },
      { label: "Peaux grasses", image: null },
      { label: "Peaux sensibles", image: null },
    ],
    faq: [
      {
        question: "À quelle fréquence commencer ?",
        answer:
          "Une à deux fois par semaine le soir, puis augmentez progressivement selon la tolérance de votre peau.",
      },
      {
        question: "Faut-il une protection solaire ?",
        answer: "Oui. Appliquez une crème solaire le matin après chaque utilisation.",
      },
      {
        question: "Enceinte ou allaitante, puis-je l'utiliser ?",
        answer:
          "Il est recommandé de consulter un médecin avant d'utiliser ce produit pendant la grossesse ou l'allaitement.",
      },
      {
        question: "Pourquoi le conserver au réfrigérateur ?",
        answer:
          "Le froid apporte une sensation de fraîcheur et aide à atténuer les poches sous les yeux.",
      },
      { question: "Quels sont les délais de livraison ?", answer: DELIVERY_ANSWER },
    ],
    testimonials: [],
    brandScene: null,
  },

  "renewal-oil": {
    category: "Masques",
    badge: "New",
    gallery: [
      "/images/products/collagene_masque.png",
      "/images/hero-model.jpg",
      "/images/bento-skin-model.jpg",
      "/images/skincare-ritual.jpg",
    ],
    promise: {
      title: "L'effet glass skin, en 15 minutes",
      subtitle: "Un masque peel-off au collagène, 1 à 2 fois par semaine.",
    },
    benefits: [
      { icon: "hydrate", label: "Hydrate intensément" },
      { icon: "firm", label: "Améliore l'élasticité et la fermeté" },
      { icon: "spark", label: "Illumine le teint" },
      { icon: "antiage", label: "Atténue les ridules" },
    ],
    lifestyle: {
      image: "/images/hero-model.jpg",
      caption: "Une peau repulpée, plus lisse et plus lumineuse.",
    },
    results: null,
    actives: [
      {
        name: "Collagène marin",
        description: "Améliore l'élasticité et la fermeté de la peau.",
        image: "/images/products/mask.jpg",
      },
      {
        name: "Aloe vera",
        description: "Apaise et hydrate en profondeur.",
        image: "/images/natural-leaf.jpg",
      },
      {
        name: "Panthénol",
        description: "Renforce la barrière cutanée.",
        image: "/images/products/serum.jpg",
      },
    ],
    steps: [
      {
        title: "Après votre routine habituelle",
        detail:
          "Appliquez une couche uniforme en évitant les yeux, les sourcils, les lèvres et la racine des cheveux.",
        image: "/images/skincare-ritual.jpg",
      },
      {
        title: "Laissez sécher 15 à 20 minutes",
        detail: "Le masque fige doucement sur la peau.",
        image: "/images/bento-skin-model.jpg",
      },
      {
        title: "Retirez par les bords",
        detail: "Décollez délicatement, sans rincer.",
        image: "/images/hero-model.jpg",
      },
    ],
    skinTypes: [
      { label: "Peaux sèches", image: null },
      { label: "Peaux déshydratées", image: null },
      { label: "Peaux normales", image: null },
      { label: "Peaux sensibles", image: null },
    ],
    faq: [
      {
        question: "À quelle fréquence l'utiliser ?",
        answer: "1 à 2 fois par semaine.",
      },
      {
        question: "Faut-il rincer après l'avoir retiré ?",
        answer: "Non. Retirez le masque en commençant par les bords, sans rincer.",
      },
      {
        question: "À quel moment de la routine ?",
        answer: "Après vos soins habituels, sur une peau propre.",
      },
      {
        question: "Convient-il aux peaux sensibles ?",
        answer:
          "Oui. Il convient aux peaux normales, sèches, déshydratées et sensibles.",
      },
      { question: "Quels sont les délais de livraison ?", answer: DELIVERY_ANSWER },
    ],
    testimonials: [],
    brandScene: null,
  },

  "rosehip-oil": {
    category: "Masques",
    badge: null,
    gallery: [
      "/images/products/aha_masque.png",
      "/images/bento-skin-model.jpg",
      "/images/skincare-ritual.jpg",
      "/images/hero-model.jpg",
    ],
    promise: {
      title: "Des pores nettoyés en profondeur",
      subtitle: "Deux argiles et un AHA, 1 à 2 fois par semaine.",
    },
    benefits: [
      { icon: "purify", label: "Purifie et nettoie en profondeur" },
      { icon: "pores", label: "Améliore l'apparence des pores" },
      { icon: "exfoliate", label: "Exfolie en douceur" },
      { icon: "spark", label: "Affine le grain de peau" },
    ],
    lifestyle: {
      image: "/images/bento-skin-model.jpg",
      caption: "Un teint plus net, plus lisse et plus uniforme.",
    },
    results: null,
    actives: [
      {
        name: "Argiles verte et blanche",
        description: "Purifient et nettoient la peau en profondeur.",
        image: "/images/products/mask.jpg",
      },
      {
        name: "Acide glycolique",
        description: "Exfolie en douceur et affine le grain de peau.",
        image: "/images/products/toner.jpg",
      },
      {
        name: "Extrait de réglisse",
        description: "Apaise et aide à unifier le teint.",
        image: "/images/natural-leaf.jpg",
      },
    ],
    steps: [
      {
        title: "Sur peau propre et sèche",
        detail: "Appliquez une couche uniforme en évitant le contour des yeux.",
        image: "/images/skincare-ritual.jpg",
      },
      {
        title: "Laissez poser 15 à 20 minutes",
        detail: "Les argiles absorbent et l'AHA exfolie.",
        image: "/images/bento-skin-model.jpg",
      },
      {
        title: "Rincez à l'eau tiède",
        detail: "Poursuivez avec votre routine habituelle.",
        image: "/images/hero-model.jpg",
      },
    ],
    skinTypes: [
      { label: "Peaux mixtes", image: null },
      { label: "Peaux grasses", image: null },
      { label: "Peaux à imperfections", image: null },
      { label: "Pores dilatés", image: null },
    ],
    faq: [
      {
        question: "À quelle fréquence l'utiliser ?",
        answer: "1 à 2 fois par semaine.",
      },
      {
        question: "Faut-il rincer ?",
        answer: "Oui. Laissez poser 15 à 20 minutes puis rincez.",
      },
      {
        question: "Pour quelles peaux ?",
        answer: "Il convient aux peaux mixtes à grasses.",
      },
      {
        question: "Peut-on l'associer aux toner pads AHA ?",
        answer:
          "Évitez de les utiliser le même soir : les deux contiennent de l'acide glycolique. Espacez-les dans la semaine.",
      },
      { question: "Quels sont les délais de livraison ?", answer: DELIVERY_ANSWER },
    ],
    testimonials: [],
    brandScene: null,
  },
}

export function contentFor(productId: string): ProductContent | null {
  return PRODUCT_CONTENT[productId] ?? null
}
