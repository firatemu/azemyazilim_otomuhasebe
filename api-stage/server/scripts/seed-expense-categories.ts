import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Seeding Expense Categories...');

    const categories = [
        { name: 'Ofis Giderleri', description: 'Kırtasiye, temizlik, ofis malzemeleri vb.' },
        { name: 'Kira Giderleri', description: 'Ofis, depo veya dükkan kira ödemeleri' },
        { name: 'Elektrik, Su, Doğalgaz', description: 'Sabit fatura giderleri' },
        { name: 'Yeminli Mali Müşavir Giderleri', description: 'Muhasebe ve müşavirlik hizmetleri' },
        { name: 'Akaryakıt Giderleri', description: 'Şirket araçları yakıt giderleri' },
        { name: 'Personel Maaşları', description: 'Çalışan maaş ve huzur hakkı ödemeleri' },
        { name: 'Yemek ve Mutfak Giderleri', description: 'Personel yemeği, çay, kahve vb. mutfak harcamaları' },
        { name: 'Pazarlama ve Reklam Giderleri', description: 'Dijital reklamlar, afiş, broşür vb.' },
        { name: 'Vergi ve Harçlar', description: 'KDV, Muhtasar, Damga Vergisi vb.' },
        { name: 'Kargo ve Posta Giderleri', description: 'Gönderim ve kurye masrafları' },
        { name: 'Danışmanlık Giderleri', description: 'Hukuk, yazılım veya teknik danışmanlık hizmetleri' },
        { name: 'Tamir ve Bakım Giderleri', description: 'Ofis veya araç tamir/bakım masrafları' },
        { name: 'Seyahat ve Konaklama', description: 'İş seyahatleri, otel ve ulaşım giderleri' }
    ];

    for (const cat of categories) {
        try {
            await prisma.masrafKategori.upsert({
                where: { kategoriAdi: cat.name },
                update: { aciklama: cat.description },
                create: {
                    kategoriAdi: cat.name,
                    aciklama: cat.description
                }
            });
            console.log(`  ✅ Upserted category: ${cat.name}`);
        } catch (error) {
            console.error(`  ❌ Error seeding category ${cat.name}:`, error.message);
        }
    }

    console.log('✅ Expense Categories seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
