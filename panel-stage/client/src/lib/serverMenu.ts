import { cookies } from 'next/headers';
import { menuItems } from '@/config/menuItems';

/**
 * Server-side utility to get filtered menu items based on user role/permissions in cookies.
 * This prevents the Client from even receiving the configuration for restricted pages.
 */
export async function getServerMenuItems() {
    const cookieStore = await cookies();
    const userDataStr = cookieStore.get('user')?.value;

    let isAdmin = false;
    if (userDataStr) {
        try {
            const user = JSON.parse(decodeURIComponent(userDataStr));
            isAdmin = !!user.isAdmin;
        } catch (e) {
            console.error('Failed to parse user cookie for menu filtering:', e);
        }
    }

    // Filter out admin-only items if user is not admin
    return menuItems.filter(item => !(item as any).adminOnly || isAdmin);
}
