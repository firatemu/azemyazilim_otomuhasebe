'use server';

import { cookies } from 'next/headers';

export async function setAuthCookies(accessToken: string, refreshToken: string, tenantId?: string) {
    const cookieStore = await cookies();
    const secure = process.env.NODE_ENV === 'production';
    const options = { httpOnly: true, secure, sameSite: 'lax' as const, path: '/' };

    cookieStore.set('accessToken', accessToken, options);
    if (refreshToken) {
        cookieStore.set('refreshToken', refreshToken, options);
    }
    if (tenantId) {
        cookieStore.set('tenantId', tenantId, options);
    } else {
        cookieStore.delete('tenantId');
    }
}

export async function clearAuthCookies() {
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    cookieStore.delete('tenantId');
}
