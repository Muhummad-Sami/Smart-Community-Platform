/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Vercel handles output automatically - do NOT set output: 'standalone'

  // Speed: Compress responses with gzip
  compress: true,

  // Speed: Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // ✅ Environment variables (also set these in Vercel dashboard)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  },

  // Disable type checking and linting during build for faster deploys
  // (run these separately in CI)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Speed: Experimental optimizations
  experimental: {
    scrollRestoration: true,
  },

  // Speed: HTTP headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

module.exports = nextConfig