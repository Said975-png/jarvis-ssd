/** @type {import('next').NextConfig} */
const nextConfig = {
  // Improved configuration for better development experience
  experimental: {
    optimizePackageImports: ['lucide-react']
  },

  // Better error handling and performance
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  webpack: (config, { dev, isServer }) => {
    // Optimize Three.js build
    config.module.rules.push({
      test: /\.glb$|\.gltf$/,
      use: {
        loader: 'file-loader',
      }
    })

    if (dev && !isServer) {
      // Optimized HMR configuration
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**']
      }

      // Reduce memory usage and improve build performance
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }
    }

    // Production optimizations
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'three',
            chunks: 'all',
          },
        },
      }
    }

    // Handle potential module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    return config
  },

  // Disable source maps in production to improve build time
  productionBrowserSourceMaps: false,

  // Images optimization for better Vercel deployment
  images: {
    domains: ['cdn.builder.io'],
    formats: ['image/webp', 'image/avif'],
  },

  // Disable automatic static optimization for better SSR compatibility
  target: 'server',
}

module.exports = nextConfig
