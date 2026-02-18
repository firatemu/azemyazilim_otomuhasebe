const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllUsers() {
  try {
    console.log('========================================');
    console.log('Kullanıcıları Listeleme ve Silme İşlemi');
    console.log('========================================\n');

    // Önce tüm kullanıcıları listele
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (users.length === 0) {
      console.log('✅ Veritabanında kullanıcı bulunamadı.');
      return;
    }

    console.log(`📊 Toplam ${users.length} kullanıcı bulundu:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Kullanıcı Adı: ${user.username}`);
      console.log(`   Ad Soyad: ${user.fullName}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Tenant ID: ${user.tenantId || 'Yok'}`);
      console.log(`   Oluşturulma: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    console.log('⚠️  DİKKAT: Tüm kullanıcılar silinecektir!');
    console.log('⚠️  Bu işlem geri alınamaz!\n');

    // Silme işlemini başlat
    console.log('Silme işlemi başlatılıyor...\n');

    let deletedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        await prisma.user.delete({
          where: { id: user.id },
        });
        console.log(`✅ Silindi: ${user.email}`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Hata (${user.email}):`, error.message);
        errorCount++;
      }
    }

    console.log('\n========================================');
    console.log('Silme İşlemi Tamamlandı');
    console.log('========================================');
    console.log(`✅ Başarıyla silinen: ${deletedCount}`);
    if (errorCount > 0) {
      console.log(`❌ Hata oluşan: ${errorCount}`);
    }
    console.log(`📊 Toplam: ${users.length}`);

  } catch (error) {
    console.error('❌ Genel Hata:', error.message);
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

// Script'i çalıştır
deleteAllUsers()
  .then(() => {
    console.log('\n✅ İşlem tamamlandı.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ İşlem başarısız:', error);
    process.exit(1);
  });

