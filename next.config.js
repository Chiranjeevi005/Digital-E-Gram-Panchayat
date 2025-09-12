/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress warnings during production build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript errors
  },
  webpack(config, { dev }) {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    
    // Suppress webpack warnings during production build
    if (!dev) {
      config.infrastructureLogging = { level: 'error' }
      config.stats = 'errors-only'
    }
    
    return config
  },

  // Add this for Vercel deployment
  serverExternalPackages: ['mongoose'],

  // Configure image optimization
  images: {
    unoptimized: true, // Disable image optimization for local development
  },

  // Security headers
  async headers() {
    // CSP (different for dev vs prod)
    const devCSP = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data:;
      font-src 'self';
      connect-src 'self' ws:;
    `.replace(/\s{2,}/g, ' ').trim()

    const prodCSP = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data:;
      font-src 'self';
      connect-src 'self' ws:;
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim()

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()"
          },
          {
            key: "Content-Security-Policy",
            value:
              process.env.NODE_ENV === "production"
                ? prodCSP
                : devCSP,
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig