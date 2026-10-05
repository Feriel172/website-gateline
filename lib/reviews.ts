// Customer reviews shown on each product page. Edit this file to add, change
// or remove a review — there is no form on the site and no database.
//
// Keys are product ids (see PRODUCT_CATALOG in lib/orders.ts). Put photos in
// public/images/reviews/ and reference them as "/images/reviews/<file>".
// A product with no entry, or an empty list, shows no review section at all.

export interface Review {
  author: string
  // ISO date, e.g. "2026-08-14"; shown formatted in the page's language
  date: string
  // French text; shown on the Arabic page too unless bodyAr is provided
  body: string
  bodyAr?: string
  images?: string[]
}

export const REVIEWS: Record<string, Review[]> = {
  // Example — copy this block and fill it in:
  //
  // "radiance-serum": [
  //   {
  //     author: "Amina",
  //     date: "2026-08-14",
  //     body: "Mes taches se sont beaucoup atténuées en trois semaines.",
  //     bodyAr: "خفّت البقع كثيرًا خلال ثلاثة أسابيع.",
  //     images: ["/images/reviews/amina-1.jpg", "/images/reviews/amina-2.jpg"],
  //   },
  // ],
}

export function reviewsFor(productId: string): Review[] {
  return REVIEWS[productId] ?? []
}
