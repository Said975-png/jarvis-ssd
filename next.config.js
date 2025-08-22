/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      '30a44bd93d7d408a992f57c81aa56f1d-34324368-cb59-4737-b6c8-7ad83d.fly.dev',
      '.fly.dev'
    ]
  },
  // Enable faster builds and better HMR
  swcMinify: true,
  // Optimize for development
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  }
}

module.exports = nextConfig
