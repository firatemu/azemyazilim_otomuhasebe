import { NextResponse } from 'next/server';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/hizli
 * Hızlı API ana endpoint - Route'ların çalıştığını kontrol etmek için
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Hızlı API çalışıyor!',
    endpoints: {
      test: '/api/hizli/test',
      tokenStatus: '/api/hizli/token-status',
      incoming: '/api/hizli/incoming',
    },
    timestamp: new Date().toISOString(),
  });
}

