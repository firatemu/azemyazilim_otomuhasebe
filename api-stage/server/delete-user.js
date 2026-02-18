const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteUser() {
  const email = process.argv[2] || 'frtygtcn@gmail.com';
  
  try {
    console.log(`Kullanıcı aranıyor: ${email}`);
    
    // Kullanıcıyı bul (email ile arama - findFirst kullan)
    const user = await prisma.user.findFirst({
      where: { email },
      select: { id: true, email: true, username: true, fullName: true, tenantId: true }
    });
    
    if (!user) {
      console.log(`❌ Kullanıcı bulunamadı: ${email}`);
      process.exit(1);
    }
    
    console.log(`✅ Kullanıcı bulundu:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Ad Soyad: ${user.fullName}`);
    console.log(`   Tenant ID: ${user.tenantId || 'Yok'}`);
    console.log('');
    console.log('Kullanıcı siliniyor...');
    
    // Kullanıcıyı sil (id ile)
    await prisma.user.delete({
      where: { id: user.id }
    });
    
    console.log(`✅ Kullanıcı başarıyla silindi: ${email}`);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.code === 'P2025') {
      console.error('   Kullanıcı bulunamadı veya zaten silinmiş.');
    } else {
      console.error('   Detay:', error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();

