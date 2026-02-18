import type { NextConfig } from 'next';

// API Proxy Target - staging ortamında backend URL'i
const apiProxyTarget = (process.env.API_PROXY_TARGET || 'https://staging-api.otomuhasebe.com').replace(/\/$/, '');
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isStaging = (process.env.NODE_ENV as string) === 'staging' || process.env.STAGING_DEV_MODE === 'true';

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

  // Turbopack config (Next.js 16 default)
  turbopack: {},

  // Images optimizasyonu
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },



  // Developer modu ayarları
  ...(isDevelopment && {
    onDemandEntries: {
      maxInactiveAge: 60 * 1000,
      pagesBufferLength: 5,
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

      if (!isServer && !config.watchOptions) {
        config.watchOptions = {
          poll: false,
          aggregateTimeout: 200, // Daha hızlı refresh için timeout'u azalt
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/.next/**',
            '**/dist/**',
            '**/build/**',
          ],
        };
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

export default nextConfig;

