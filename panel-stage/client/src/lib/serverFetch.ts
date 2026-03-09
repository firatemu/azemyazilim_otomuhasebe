import { cookies } from 'next/headers';

type FetchOptions = RequestInit & {
    revalidate?: number;
    tags?: string[];
};

export async function serverFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    const tenantId = cookieStore.get('tenantId')?.value;

    const headers = new Headers(options.headers as any || {});
    headers.set('Content-Type', 'application/json');

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // ✅ Multi-Tenant Isolation: Crucial for backend SaaS boundary
    if (tenantId) {
        headers.set('x-tenant-id', tenantId);
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const url = `${baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Merge custom Next.js caching controls
    const nextConfig: RequestInit['next'] = {};
    if (options.revalidate !== undefined) {
        nextConfig.revalidate = options.revalidate;
    }
    if (options.tags) {
        nextConfig.tags = options.tags;
    }

    const response = await fetch(url, {
        ...options,
        headers,
        next: nextConfig,
    });

    if (!response.ok) {
        // Optionally handle 401 token refresh server-side here in the future
        const text = await response.text();
        throw new Error(`Server fetch failed: ${response.status} ${text}`);
    }

    return response.json() as Promise<T>;
}
