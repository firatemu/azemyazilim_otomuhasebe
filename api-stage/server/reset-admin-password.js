const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'admin' },
          { email: 'admin@otomuhasebe.com' }
        ]
      }
    });

    if (!adminUser) {
      console.log('❌ Admin kullanıcı bulunamadı. Oluşturuluyor...');
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@otomuhasebe.com',
          username: 'admin',
          password: hashedPassword,
          fullName: 'Super Admin',
          role: 'ADMIN',
          isActive: true,
          emailVerified: true,
        }
      });
      console.log('✅ Admin kullanıcı oluşturuldu:');
      console.log('   Email:', newAdmin.email);
      console.log('   Username:', newAdmin.username);
      console.log('   Password: Admin123!');
    } else {
      console.log('✅ Admin kullanıcı bulundu. Şifre sıfırlanıyor...');
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          password: hashedPassword,
          isActive: true,
        }
      });
      console.log('✅ Şifre sıfırlandı:');
      console.log('   Email:', adminUser.email);
      console.log('   Username:', adminUser.username);
      console.log('   Password: Admin123!');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

resetAdminPassword();
