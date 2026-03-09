import type { NextConfig } from 'next';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV !== 'production',
  runtimeCaching: [
    {
      urlPattern: /\/api\/work-orders/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'work-orders-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
        networkTimeoutSeconds: 5,
      },
    },
    {
      urlPattern: /\/api\/stok/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'stok-cache',
        expiration: { maxEntries: 500, maxAgeSeconds: 3600 },
      },
    },
    {
      urlPattern: /\.(png|jpg|jpeg|webp|avif|svg|gif|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 2592000 },
      },
    },
  ],
});

// API Proxy Target: Docker'da API_PROXY_TARGET (http://backend-staging:3000), local'de localhost:3020
const apiProxyTarget = (process.env.API_PROXY_TARGET || 'http://localhost:3020').replace(/\/$/, '');
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isStaging = (process.env.NODE_ENV as string) === 'staging';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Production optimizasyonları
  output: 'standalone', // Standalone build - daha küçük ve hızlı
  compress: true, // Gzip compression

  // External packages for server components
  serverExternalPackages: [
    '@prisma/client',
    'bcrypt',
    'exceljs',
    'pdfmake',
  ],

  // Experimental optimizasyonlar
  experimental: {
    // Package import optimizasyonu - tree-shaking için kritik
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-data-grid',
      'lodash',
      'date-fns',
      'recharts',
    ],
    // HMR: Server Components cache (Fast Refresh ile birlikte varsayılan açık)
    serverComponentsHmrCache: true,
  },

  // Compiler optimizasyonları
  compiler: {
    // Staging'de console log'ları göster (developer modu)
    removeConsole: isProduction ? { exclude: ['error', 'warn'] } : false,
    emotion: {
      // Emotion SSR için - staging'de source map açık
      sourceMap: isDevelopment || isStaging,
      autoLabel: 'dev-only',
      labelFormat: '[local]',
    },
  },

  // TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },

  // Staging için developer modu özellikleri
  ...(isStaging && {
    // Source maps staging'de açık
    productionBrowserSourceMaps: true,
    // React strict mode staging'de açık
    reactStrictMode: false,
  }),

  // Turbopack config (Next.js 16 default) – HMR/Fast Refresh varsayılan açık
  turbopack: {},

  // Images optimizasyonu
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'api.otomuhasebe.com',
      },
      {
        protocol: 'http',
        hostname: 'backend-staging',
      }
    ],
  },

  // Developer modu ayarları (NODE_ENV=development)
  ...(isDevelopment && {
    onDemandEntries: {
      maxInactiveAge: 60 * 1000,
      pagesBufferLength: 5,
    },
    // Build aktivite göstergesi (sol alt köşe)
    devIndicators: {
      appIsrStatus: true,
      buildActivity: true,
      buildActivityPosition: 'bottom-left',
    },
  }),

  // Webpack ayarları - sadece --webpack flag'i ile
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      if (!isServer) {
        config.devtool = 'eval-cheap-module-source-map';
      }

      // Development modunda filesystem cache'i aktif et (re-build hızını artırır)
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };

      if (config.resolve) {
        config.resolve.symlinks = false;
        if (!config.resolve.cacheWithContext) {
          config.resolve.cacheWithContext = false;
        }
      }

      if (!isServer) {
        const watchPolling = process.env.WATCHPACK_POLLING === 'true' || process.env.CHOKIDAR_USEPOLLING === 'true';
        config.watchOptions = config.watchOptions || {};
        config.watchOptions.poll = watchPolling ? 500 : false;
        config.watchOptions.aggregateTimeout = 200;
        config.watchOptions.ignored = [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/dist/**',
          '**/build/**',
        ];
      }
    } else {
      // Production modunda cache aktif
      if (!config.cache) {
        config.cache = {
          type: 'filesystem',
          buildDependencies: {
            config: [__filename],
          },
        };
      }
    }

    return config;
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/ik/bordro',
        destination: '/ik/maas-yonetimi',
        permanent: true,
      },
    ];
  },
};

export default withPWA(nextConfig);


