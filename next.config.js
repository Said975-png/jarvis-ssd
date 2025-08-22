/** @type {import('next').NextConfig} */
const nextConfig = {
  // Improve HMR and development experience
  experimental: {
    turbo: false // Disable turbopack for better compatibility
  },
  // Optimize webpack for development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Better HMR configuration
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**']
      }

      // Ensure proper module resolution
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  }
}

module.exports = nextConfig
