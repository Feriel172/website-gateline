/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
    // 95 is for the before/after photos: the sources are small, so Next's
    // default of 75 re-encodes away what little skin detail they have.
    qualities: [75, 95],
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

          // No Content-Security-Policy by design. It kept breaking third-party
          // marketing tags — it blocked the Vercel Blob hero videos via media-src
          // and silently dropped Meta Pixel ecommerce events via form-action.
          // Clickjacking is still covered by X-Frame-Options above.
        ],
      },
    ]
  },
}

export default nextConfig