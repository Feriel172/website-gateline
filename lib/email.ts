// Order notification emails, sent through the Resend REST API.
//
// Deliberately dependency-free (plain fetch) and deliberately non-throwing:
// a notification that fails to send must never turn a successful order into a
// failed checkout. Callers get a result object and the reason is logged.

const RESEND_ENDPOINT = "https://api.resend.com/emails"
const DEFAULT_FROM = "Gatelin <onboarding@resend.dev>"

export interface OrderEmailItem {
  name: string
  price: number
  quantity: number
}

export interface OrderEmailPayload {
  id?: string
  firstName: string
  lastName?: string
  phone: string
  wilaya: string
  deliveryType: string
  bureau?: string
  items: OrderEmailItem[]
  subtotal: number
  shipping: number
  total: number
  createdAt?: string
}

export type SendResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "request_failed"; detail?: string }

function formatDA(amount: number): string {
  // Group thousands with a narrow space, matching the storefront's fr-DZ style.
  const rounded = Math.round(amount)
  return `${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} DA`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function customerName(order: OrderEmailPayload): string {
  return [order.firstName, order.lastName].filter(Boolean).join(" ").trim()
}

function formatDate(iso?: string): string {
  const date = iso ? new Date(iso) : new Date()
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Algiers",
  })
}

function buildText(order: OrderEmailPayload): string {
  const lines = [
    "NOUVELLE COMMANDE",
    "",
    `Client      : ${customerName(order)}`,
    `Téléphone   : ${order.phone}`,
    `Wilaya      : ${order.wilaya}`,
    `Livraison   : ${order.deliveryType}`,
  ]

  if (order.bureau) lines.push(`Bureau      : ${order.bureau}`)

  lines.push("", "ARTICLES")
  for (const item of order.items) {
    lines.push(`  ${item.quantity} x ${item.name} — ${formatDA(item.price * item.quantity)}`)
  }

  lines.push(
    "",
    `Sous-total  : ${formatDA(order.subtotal)}`,
    `Livraison   : ${formatDA(order.shipping)}`,
    `TOTAL       : ${formatDA(order.total)}`,
    "",
    `Date        : ${formatDate(order.createdAt)}`
  )

  if (order.id) lines.push(`Commande    : ${order.id}`)

  return lines.join("\n")
}

function buildHtml(order: OrderEmailPayload): string {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">
            ${escapeHtml(item.name)}
            <span style="color:#888;">× ${item.quantity}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">
            ${formatDA(item.price * item.quantity)}
          </td>
        </tr>`
    )
    .join("")

  const detail = (label: string, value: string) => `
    <tr>
      <td style="padding:4px 16px 4px 0;color:#888;white-space:nowrap;">${label}</td>
      <td style="padding:4px 0;font-weight:500;">${value}</td>
    </tr>`

  const details = [
    detail("Client", escapeHtml(customerName(order))),
    detail(
      "Téléphone",
      `<a href="tel:${encodeURIComponent(order.phone)}" style="color:#111;">${escapeHtml(order.phone)}</a>`
    ),
    detail("Wilaya", escapeHtml(order.wilaya)),
    detail("Livraison", escapeHtml(order.deliveryType)),
    order.bureau ? detail("Bureau", escapeHtml(order.bureau)) : "",
    detail("Date", escapeHtml(formatDate(order.createdAt))),
  ].join("")

  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111;">
    <table role="presentation" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;">
      <tr><td>
        <h1 style="margin:0 0 4px;font-size:20px;">Nouvelle commande</h1>
        <p style="margin:0 0 20px;color:#888;font-size:14px;">${formatDA(order.total)}</p>

        <table role="presentation" style="width:100%;font-size:14px;border-collapse:collapse;">
          ${details}
        </table>

        <table role="presentation" style="width:100%;margin-top:24px;font-size:14px;border-collapse:collapse;">
          ${rows}
          <tr>
            <td style="padding:8px 0;color:#888;">Sous-total</td>
            <td style="padding:8px 0;text-align:right;">${formatDA(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:0 0 8px;color:#888;">Livraison</td>
            <td style="padding:0 0 8px;text-align:right;">${formatDA(order.shipping)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-top:2px solid #111;font-weight:600;">Total</td>
            <td style="padding:8px 0;border-top:2px solid #111;text-align:right;font-weight:600;">${formatDA(order.total)}</td>
          </tr>
        </table>

        ${order.id ? `<p style="margin:24px 0 0;color:#bbb;font-size:12px;">Commande ${escapeHtml(order.id)}</p>` : ""}
      </td></tr>
    </table>
  </body>
</html>`
}

export async function sendNewOrderEmail(order: OrderEmailPayload): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.ORDER_NOTIFICATION_TO
  const from = process.env.ORDER_NOTIFICATION_FROM || DEFAULT_FROM

  if (!apiKey || !to) {
    const missing = [!apiKey && "RESEND_API_KEY", !to && "ORDER_NOTIFICATION_TO"].filter(Boolean)
    console.warn(`Order notification email skipped: ${missing.join(", ")} not set.`)
    return { sent: false, reason: "not_configured", detail: missing.join(", ") }
  }

  const name = customerName(order)
  const subject = `Nouvelle commande — ${name} (${formatDA(order.total)})`

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        // Comma-separated ORDER_NOTIFICATION_TO lets you notify several people.
        to: to.split(",").map((address) => address.trim()).filter(Boolean),
        subject,
        text: buildText(order),
        html: buildHtml(order),
      }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => "")
      console.error(`Order notification email failed (${response.status}):`, detail)
      return { sent: false, reason: "request_failed", detail: `${response.status} ${detail}` }
    }

    return { sent: true }
  } catch (err) {
    console.error("Order notification email failed:", err)
    return {
      sent: false,
      reason: "request_failed",
      detail: err instanceof Error ? err.message : String(err),
    }
  }
}
