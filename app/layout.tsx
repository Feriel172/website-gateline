import React from "react"
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display, Cairo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/components/boty/cart-context'
import { FB_PIXEL_ID } from '@/lib/fpixel'
import './globals.css'


const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600']
});

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700']
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: '--font-cairo',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Gateline Cosmetics',
  description: 'Premium natural skincare and body care products. Glow gently with Boty.',
  generator: 'v0.app',
  keywords: ['skincare', 'natural', 'organic', 'beauty', 'body care', 'cruelty-free'],
  icons: {
    icon: [
      {
        url: '/logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#F7F4EF',
}

// Rendered as a raw inline <script> in <head> rather than via next/script.
// next/script mounts the snippet after hydration, so it never appears in the
// server-rendered HTML — Meta's pixel crawler fetches the HTML and reports
// "no pixel detected". This form ships the snippet in the document itself.
const fbPixelSnippet = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${FB_PIXEL_ID}');
fbq('track', 'PageView');
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: fbPixelSnippet }} />
      </head>
<body className={`${dmSans.variable} ${playfairDisplay.variable} ${cairo.variable} font-sans antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </body>
    </html>
  )
}
