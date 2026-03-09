import { getServerMenuItems } from '@/lib/serverMenu';
import ClientMainLayout from '@/components/Layout/ClientMainLayout';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const menuItems = await getServerMenuItems();

    return (
        <ClientMainLayout menuItems={menuItems}>
            {children}
        </ClientMainLayout>
    );
}
