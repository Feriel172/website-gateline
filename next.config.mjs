/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },

          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",

              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.facebook.com",

              "style-src 'self' 'unsafe-inline'",

              "img-src 'self' data: blob: https://www.facebook.com https://connect.facebook.net",

              "font-src 'self' data:",

              "connect-src 'self' https://*.supabase.co https://*.vercel-insights.com https://connect.facebook.net https://www.facebook.com https://graph.facebook.com https://*.facebook.com",

              "frame-ancestors 'none'",

              "form-action 'self'",

              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

export default nextConfig