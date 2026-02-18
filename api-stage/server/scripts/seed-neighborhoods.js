const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

const TURKIYE_API_BASE = 'https://turkiyeapi.dev/api/v1';

async function seed() {
    try {
        console.log('🚀 Neighborhood seeding started...');

        // 1. Get all provinces
        console.log('Fetching provinces...');
        const provincesResponse = await axios.get(`${TURKIYE_API_BASE}/provinces?fields=id,name`);
        const provinces = provincesResponse.data.data;
        console.log(`Found ${provinces.length} provinces.`);

        let totalNeighborhoods = 0;

        for (const province of provinces) {
            console.log(`Processing province: ${province.name} (${province.id})...`);

            try {
                // 2. Get districts for this province
                const response = await axios.get(`${TURKIYE_API_BASE}/provinces/${province.id}?extend=districts`);
                const districtsData = response.data.data.districts;

                if (!districtsData || !Array.isArray(districtsData)) {
                    console.log(`  No districts found for ${province.name}`);
                    continue;
                }

                let provinceNeighborhoodCount = 0;

                for (const district of districtsData) {
                    try {
                        // Fetch neighborhoods for each district specifically
                        const distResponse = await axios.get(`${TURKIYE_API_BASE}/districts/${district.id}?extend=neighborhoods`);
                        const neighborhoods = distResponse.data.data.neighborhoods;

                        if (!neighborhoods || !Array.isArray(neighborhoods)) continue;

                        const neighborhoodRecords = neighborhoods.map(neighborhood => ({
                            id: `neighborhood-${neighborhood.id}`,
                            city: province.name,
                            district: district.name,
                            neighborhood: neighborhood.name,
                            postalCode: String(neighborhood.id).substring(0, 5),
                            updatedAt: new Date()
                        }));

                        if (neighborhoodRecords.length > 0) {
                            await prisma.postalCode.createMany({
                                data: neighborhoodRecords,
                                skipDuplicates: true
                            });
                            provinceNeighborhoodCount += neighborhoodRecords.length;
                        }
                    } catch (distError) {
                        console.error(`    Error fetching neighborhoods for district ${district.name}:`, distError.message);
                    }
                }

                console.log(`  ✅ Added ${provinceNeighborhoodCount} neighborhoods for ${province.name}`);
                totalNeighborhoods += provinceNeighborhoodCount;

            } catch (error) {
                console.error(`  Error processing province ${province.name}:`, error.message);
            }
        }

        console.log(`✅ Seeding complete! Total neighborhoods indexed: ${totalNeighborhoods}`);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
