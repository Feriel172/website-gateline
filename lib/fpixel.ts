export const FB_PIXEL_ID = "1354145546240046"

export const CURRENCY = "DZD"

type FbqArgs = [string, string, Record<string, unknown>?]

declare global {
  interface Window {
    fbq?: (...args: FbqArgs) => void
  }
}

interface PixelContent {
  id: string
  quantity: number
  price: number
}

function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return
  window.fbq("track", event, params)
}

function toContents(contents: PixelContent[]) {
  return {
    content_type: "product",
    content_ids: contents.map((c) => c.id),
    contents: contents.map((c) => ({
      id: c.id,
      quantity: c.quantity,
      item_price: c.price,
    })),
    value: contents.reduce((sum, c) => sum + c.price * c.quantity, 0),
    currency: CURRENCY,
  }
}

export function trackViewContent(product: { id: string; name: string; price: number }) {
  track("ViewContent", {
    content_type: "product",
    content_ids: [product.id],
    content_name: product.name,
    value: product.price,
    currency: CURRENCY,
  })
}

export function trackAddToCart(product: { id: string; name: string; price: number; quantity: number }) {
  track("AddToCart", {
    ...toContents([product]),
    content_name: product.name,
  })
}

export function trackInitiateCheckout(items: PixelContent[]) {
  track("InitiateCheckout", {
    ...toContents(items),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
  })
}

export function trackPurchase(items: PixelContent[], total: number) {
  track("Purchase", {
    ...toContents(items),
    value: total,
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
  })
}
