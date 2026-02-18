import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// SABİT PORT NUMARALARI - ASLA DEĞİŞMEMELİ
const DEV_SERVER_PORT = 3001;
const PREVIEW_SERVER_PORT = 3001;

// SABİT API BASE URL - ASLA DEĞİŞMEMELİ
const API_BASE_URL = 'https://api.otomuhasebe.com';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    minify: 'terser',
    // Cache busting için her build'de farklı hash
    rollupOptions: {
      output: {
        // Her dosya için hash ekle (cache busting)
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-charts': ['recharts'],
          'vendor-table': ['@tanstack/react-table'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // Cache'i tamamen devre dışı bırak
    emptyOutDir: true,
  },
  // Cache'i tamamen kapat - Developer mode için
  // cacheDir kullanmıyoruz, her zaman temiz başlıyoruz
  optimizeDeps: {
    // Force reload deps - Her zaman yeniden yükle
    force: true,
    // Cache'i devre dışı bırak
    disabled: false,
  },
  // Development mode için cache'i tamamen kapat
  esbuild: {
    // Her build'de temizle
    legalComments: 'none',
  },
  server: {
    // SABİT PORT - ASLA DEĞİŞMEMELİ
    port: DEV_SERVER_PORT,
    strictPort: true, // Port kullanılıyorsa hata ver, başka porta geçme
    host: true, // Tüm network interface'lerinden erişilebilir
    open: false, // Otomatik browser açma
    // Development mode'da cache'i tamamen kapat
    hmr: false, // Hot Module Replacement devre dışı
    // Cache'i tamamen devre dışı bırak
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString(),
    },
    // Middleware ile tüm response'lara no-cache header'ı ekle
    middlewareMode: false,
    // Watch mode - dosya değişikliklerini izleme (hot reload kapalı)
    watch: null,
    // 404 hatalarını önlemek için fallback
    fs: {
      strict: false, // Dosya sistemi kontrollerini gevşet
      allow: ['..'], // Üst dizinlere erişime izin ver
    },
    proxy: {
      '/api': {
        // SABİT API URL - ASLA DEĞİŞMEMELİ
        target: API_BASE_URL,
        changeOrigin: true,
        secure: false,
        headers: {
          'Cache-Control': 'no-cache',
        },
        // Proxy ayarları sabit
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
        },
      },
    },
  },
  preview: {
    // SABİT PREVIEW PORT - ASLA DEĞİŞMEMELİ
    port: PREVIEW_SERVER_PORT,
    strictPort: true, // Port kullanılıyorsa hata ver, başka porta geçme
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString(),
    },
  },
  // Clear cache on restart
  clearScreen: false,
});
