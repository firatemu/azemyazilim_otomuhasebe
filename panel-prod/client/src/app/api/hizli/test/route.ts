import { NextResponse } from 'next/server';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/hizli/test
 * Test endpoint - Route'ların çalıştığını kontrol etmek için
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Hızlı API route çalışıyor!',
    timestamp: new Date().toISOString(),
  });
}

