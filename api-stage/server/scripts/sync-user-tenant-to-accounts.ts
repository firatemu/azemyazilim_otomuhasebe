/**
 * Cari hesaplardaki (Account) bir tenant_id ile mevcut kullanıcının tenant_id'sini eşitler.
 * Veri tabanından veri çekilmeme (tenant uyuşmazlığı) sorununu giderir.
 *
 * Kullanım: npx ts-node scripts/sync-user-tenant-to-accounts.ts [email]
 * Örnek:   npx ts-node scripts/sync-user-tenant-to-accounts.ts info@azemyazilim.com
 */
/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userEmail: string = (typeof process !== 'undefined' && process.argv[2]) || 'info@azemyazilim.com';

  // 1) Önce cari (accounts), yoksa fatura/invoice, yoksa ürün (products) tablosundan tenant_id al
  let targetTenantId: string | null = null;
  const accountWithTenant = await prisma.account.findFirst({
    where: { tenantId: { not: null } },
    select: { tenantId: true },
  });
  targetTenantId = accountWithTenant?.tenantId ?? null;
  if (!targetTenantId) {
    const inv = await prisma.invoice.findFirst({
      where: { tenantId: { not: null } },
      select: { tenantId: true },
    });
    targetTenantId = inv?.tenantId ?? null;
  }
  if (!targetTenantId) {
    const prod = await prisma.product.findFirst({
      where: { tenantId: { not: null } },
      select: { tenantId: true },
    });
    targetTenantId = prod?.tenantId ?? null;
  }
  if (!targetTenantId) {
    console.warn('Uyarı: accounts, invoices ve products tablolarında tenant_id olan kayıt yok. İşlem atlanıyor.');
    if (typeof process !== 'undefined') process.exit(0);
    return;
  }

  console.log('Cari hesaplardan alınan tenant_id:', targetTenantId);

  // 2) İlgili tenant bilgisi
  const tenant = await prisma.tenant.findUnique({
    where: { id: targetTenantId },
    select: { name: true, subdomain: true },
  });
  if (tenant) console.log('Tenant:', tenant.name, `(${tenant.subdomain})`);

  // 3) Kullanıcıyı bul ve tenant_id'yi eşitle
  const user = await prisma.user.findFirst({
    where: { email: userEmail },
    select: { id: true, email: true, tenantId: true },
  });

  if (!user) {
    console.warn('Kullanıcı bulunamadı:', userEmail);
    if (typeof process !== 'undefined') process.exit(1);
    return;
  }

  if (user.tenantId === targetTenantId) {
    console.log('Kullanıcı zaten bu tenant\'a bağlı. Değişiklik yapılmadı.');
    if (typeof process !== 'undefined') process.exit(0);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { tenantId: targetTenantId },
  });

  console.log('Güncellendi:', user.email, 'tenant_id:', user.tenantId, '->', targetTenantId);
}

main()
  .catch((e) => {
    console.error(e);
    if (typeof process !== 'undefined') process.exit(1);
  })
  .finally(() => prisma.$disconnect());
