import { serverFetch } from '@/lib/serverFetch';
import DashboardClientContent from '@/components/dashboard/DashboardClientContent';
import MainLayout from '@/components/Layout/MainLayout';

export default async function DashboardPage() {
  // 1. Initial Data Fetching (Server-Side)
  // This happens on the server, before the browser even receives the page.
  let initialData = {
    stats: { toplamStok: 0, cariSayisi: 0, aylikSatis: 0, karMarji: 0 },
    salesChart: [],
    collectionStats: {
      currentMonthCollection: 0,
      currentMonthPayment: 0,
      previousMonthCollection: 0,
      previousMonthPayment: 0,
    },
    collectionChart: [],
    inventory: {
      criticalStock: [],
      categoryDistribution: [],
    },
    transactions: {
      invoices: [],
      payments: [],
    },
  };

  let initialTenantSettings = null;

  try {
    // Parallel fetch for initial payload
    const [settingsRes, stokRes, cariRes] = await Promise.all([
      serverFetch('/tenants/settings').catch(() => null),
      serverFetch('/product?page=1&limit=5').catch(() => ({ data: [], meta: { total: 0 } })),
      serverFetch('/account?page=1&limit=1').catch(() => ({ data: [], meta: { total: 0 } })),
    ]);

    initialTenantSettings = settingsRes;

    // Partially populate initialData for the first paint
    initialData.stats = {
      toplamStok: (stokRes as any)?.meta?.total || 0,
      cariSayisi: (cariRes as any)?.meta?.total || 0,
      aylikSatis: 0, // Simplified for pilot
      karMarji: 0,
    };

    initialData.inventory.criticalStock = ((stokRes as any)?.data || [])
      .filter((s: any) => Number(s.stokMiktari) < 10)
      .map((s: any) => ({
        id: s.id, name: s.urunAdi, stock: Number(s.stokMiktari), minStock: 10, unit: s.birim || 'Adet'
      }));

  } catch (error) {
    console.error('Initial server-side fetch failed for Dashboard:', error);
  }

  return (
    <MainLayout>
      <DashboardClientContent
        initialData={initialData}
        initialTenantSettings={initialTenantSettings}
      />
    </MainLayout>
  );
}
