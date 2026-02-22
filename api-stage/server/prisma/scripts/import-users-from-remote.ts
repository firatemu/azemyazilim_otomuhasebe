/**
 * Uzak Yedek Parça veritabanından export edilen kullanıcıları yerel DB'ye aktarır.
 * Önce "Yedek Parça" tenant'ı oluşturur, sonra remote-users.json'daki kullanıcıları bu tenant'a ekler.
 *
 * Kullanım: npx ts-node prisma/scripts/import-users-from-remote.ts
 * Önce remote users export: docker exec otomuhasebe-postgres psql "postgresql://..." -t -A -c "SELECT json_agg(...) FROM users"
 * Çıktıyı prisma/scripts/remote-users.json dosyasına kaydedin.
 */
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

type RemoteUser = {
  id: string;
  username: string;
  email: string | null;
  password: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const REMOTE_USERS_PATH = path.join(__dirname, 'remote-users.json');
const TENANT_NAME = 'Yedek Parça';
const TENANT_SUBDOMAIN = 'yedekparca';

function mapRole(role: string): 'ADMIN' | 'USER' | 'VIEWER' | 'TENANT_ADMIN' | 'SUPER_ADMIN' {
  const r = (role || 'USER').toUpperCase();
  if (r === 'ADMIN' || r === 'USER' || r === 'VIEWER' || r === 'TENANT_ADMIN' || r === 'SUPER_ADMIN') return r;
  if (r === 'MANAGER') return 'ADMIN';
  return 'USER';
}

async function main() {
  if (!fs.existsSync(REMOTE_USERS_PATH)) {
    console.error('remote-users.json bulunamadı:', REMOTE_USERS_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(REMOTE_USERS_PATH, 'utf-8');
  const users: RemoteUser[] = JSON.parse(raw);
  if (!Array.isArray(users) || users.length === 0) {
    console.error('remote-users.json boş veya geçersiz.');
    process.exit(1);
  }

  console.log('Tenant oluşturuluyor/güncelleniyor...');
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: TENANT_SUBDOMAIN },
    update: { name: TENANT_NAME, status: 'ACTIVE' },
    create: {
      name: TENANT_NAME,
      subdomain: TENANT_SUBDOMAIN,
      status: 'ACTIVE',
      tenantType: 'CORPORATE',
    },
  });
  console.log('Tenant:', tenant.name, '(' + tenant.id + ')');

  for (const u of users) {
    const email = u.email && u.email.trim() ? u.email.trim() : `${u.username}@imported.local`;
    const existing = await prisma.user.findUnique({ where: { id: u.id } });
    if (existing) {
      console.log('Zaten var, güncelleniyor:', u.username);
      await prisma.user.update({
        where: { id: u.id },
        data: {
          email,
          username: u.username,
          password: u.password,
          fullName: u.fullName,
          role: mapRole(u.role),
          status: u.isActive ? 'ACTIVE' : 'INACTIVE',
          isActive: u.isActive,
          tenantId: tenant.id,
          tokenVersion: 0,
          refreshToken: null,
          emailVerified: false,
          updatedAt: new Date(u.updatedAt),
        },
      });
    } else {
      await prisma.user.create({
        data: {
          id: u.id,
          uuid: randomUUID(),
          email,
          username: u.username,
          password: u.password,
          fullName: u.fullName,
          role: mapRole(u.role),
          status: u.isActive ? 'ACTIVE' : 'INACTIVE',
          isActive: u.isActive,
          tenantId: tenant.id,
          tokenVersion: 0,
          refreshToken: null,
          emailVerified: false,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        },
      });
      console.log('Oluşturuldu:', u.username, '(' + u.role + ')');
    }
  }

  console.log('Import tamamlandı. Toplam', users.length, 'kullanıcı.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
