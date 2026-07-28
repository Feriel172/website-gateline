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

// The pixel snippet loads with strategy="afterInteractive", so fbq can still be
// undefined when a mount effect fires on a cold load. Hold events until it exists
// instead of dropping them, otherwise ViewContent is lost on ad landings.
const queued: Array<[string, Record<string, unknown> | undefined]> = []
let waitTimer: ReturnType<typeof setInterval> | null = null
const MAX_WAIT_MS = 10000

function stopWaiting() {
  if (waitTimer !== null) {
    clearInterval(waitTimer)
    waitTimer = null
  }
}

function flush() {
  const fbq = window.fbq
  if (typeof fbq !== "function") return
  while (queued.length > 0) {
    const [event, params] = queued.shift()!
    fbq("track", event, params)
  }
  stopWaiting()
}

function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return

  queued.push([event, params])

  if (typeof window.fbq === "function") {
    flush()
    return
  }

  if (waitTimer !== null) return

  let waited = 0
  waitTimer = setInterval(() => {
    waited += 200
    if (typeof window.fbq === "function") {
      flush()
    } else if (waited >= MAX_WAIT_MS) {
      // Blocked by an extension, or the script failed to load — drop the events.
      queued.length = 0
      stopWaiting()
    }
  }, 200)
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
