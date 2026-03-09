import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { accessToken, refreshToken, tenantId } = await request.json();
        const cookieStore = await cookies();
        const isProduction = process.env.NODE_ENV === 'production';

        const options = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 hafta
        };

        if (accessToken) {
            cookieStore.set('accessToken', accessToken, options);
        }

        if (refreshToken) {
            cookieStore.set('refreshToken', refreshToken, options);
        }

        if (tenantId) {
            cookieStore.set('tenantId', tenantId, options);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API Auth Cookies] Error:', error);
        return NextResponse.json(
            { error: 'Failed to set cookies' },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('accessToken');
        cookieStore.delete('refreshToken');
        cookieStore.delete('tenantId');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to clear cookies' },
            { status: 500 }
        );
    }
}
