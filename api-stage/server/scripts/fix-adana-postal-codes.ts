import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Fixing Adana Postal Codes...');

    const updates = [
        { city: 'Adana', district: 'Çukurova', neighborhood: 'Güzelyalı Mah.', postalCode: '01170' },
        { city: 'Adana', district: 'Seyhan', neighborhood: 'Aydınlar Mah.', postalCode: '01190' },
        { city: 'Adana', district: 'Çukurova', neighborhood: 'Toros Mah.', postalCode: '01360' },
        { city: 'Adana', district: 'Çukurova', neighborhood: 'Huzurevleri Mah.', postalCode: '01360' },
        { city: 'Adana', district: 'Seyhan', neighborhood: 'Barış Mah.', postalCode: '01190' },
        { city: 'Adana', district: 'Seyhan', neighborhood: 'Fevzipaşa Mah.', postalCode: '01190' }
    ];

    for (const update of updates) {
        try {
            // Trim and normalize names to match how they are stored (without 'Mah.' for comparison if needed)
            const normalizedNeighborhood = update.neighborhood.replace(' Mah.', '').trim();

            const records = await prisma.postalCode.findMany({
                where: {
                    city: { equals: update.city, mode: 'insensitive' },
                    district: { equals: update.district, mode: 'insensitive' },
                    neighborhood: { contains: normalizedNeighborhood, mode: 'insensitive' }
                }
            });

            console.log(`Found ${records.length} records for ${update.city}/${update.district}/${update.neighborhood}`);

            for (const record of records) {
                await prisma.postalCode.update({
                    where: { id: record.id },
                    data: { postalCode: update.postalCode }
                });
                console.log(`  ✅ Updated ${record.neighborhood} to ${update.postalCode}`);
            }
        } catch (error) {
            console.error(`  ❌ Error updating ${update.neighborhood}:`, error.message);
        }
    }

    console.log('✅ Adana Postal Codes updated successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
