/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for better development experience
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Better HMR configuration
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**']
      }
    }
    return config
  }
}

module.exports = nextConfig
