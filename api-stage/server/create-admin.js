const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@otomuhasebe.com' },
          { username: 'admin' },
        ]
      }
    });

    if (existingAdmin) {
      console.log('✅ Admin kullanıcı zaten mevcut:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Username:', existingAdmin.username);
      console.log('   Role:', existingAdmin.role);
      console.log('   ID:', existingAdmin.id);
      await prisma.$disconnect();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@otomuhasebe.com',
        username: 'admin',
        password: hashedPassword,
        fullName: 'Super Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true,
      }
    });

    console.log('✅ Admin kullanıcı oluşturuldu:');
    console.log('   Email: admin@otomuhasebe.com');
    console.log('   Username: admin');
    console.log('   Password: Admin123!');
    console.log('   Role: SUPER_ADMIN');
    console.log('   ID:', adminUser.id);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdminUser();
