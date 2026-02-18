const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminDevUser() {
  try {
    const email = 'info@azemyazilim.com';
    const username = email.split('@')[0]; // 'info'
    const password = '1212';
    const fullName = 'Admin & Developer';
    
    console.log('========================================');
    console.log('Admin ve Geliştirici Kullanıcı Oluşturma');
    console.log('========================================\n');

    // Kullanıcı kontrolü
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username },
        ],
      },
    });

    if (existingUser) {
      console.log('✅ Kullanıcı zaten mevcut. Güncelleniyor...\n');
      
      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Kullanıcıyı güncelle
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: email,
          username: username,
          password: hashedPassword,
          fullName: fullName,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          isActive: true,
          emailVerified: true,
        },
      });

      console.log('✅ Kullanıcı güncellendi:');
      console.log('   Email:', updatedUser.email);
      console.log('   Username:', updatedUser.username);
      console.log('   Şifre:', password);
      console.log('   Rol: SUPER_ADMIN (Admin & Developer)');
      console.log('   Durum: ACTIVE');
      console.log('   ID:', updatedUser.id);
      
    } else {
      console.log('📝 Yeni kullanıcı oluşturuluyor...\n');
      
      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Yeni kullanıcı oluştur
      const newUser = await prisma.user.create({
        data: {
          email: email,
          username: username,
          password: hashedPassword,
          fullName: fullName,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          isActive: true,
          emailVerified: true,
        },
      });

      console.log('✅ Kullanıcı oluşturuldu:');
      console.log('   Email:', newUser.email);
      console.log('   Username:', newUser.username);
      console.log('   Şifre:', password);
      console.log('   Rol: SUPER_ADMIN (Admin & Developer)');
      console.log('   Durum: ACTIVE');
      console.log('   ID:', newUser.id);
    }
    
    console.log('\n========================================');
    console.log('✅ İşlem tamamlandı!');
    console.log('========================================');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.code === 'P2002') {
      console.error('   Bu email veya kullanıcı adı zaten kullanılıyor.');
    } else {
      console.error('   Detay:', error);
    }
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdminDevUser();

