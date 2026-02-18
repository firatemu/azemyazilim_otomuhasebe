const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TURKIYE_API_BASE = 'https://turkiyeapi.dev/api/v1';

async function seed() {
    try {
        console.log('🚀 Adana Neighborhood seeding started...');

        // 1. Get Adana province
        console.log('Fetching Adana province...');
        const provincesResponse = await axios.get(`${TURKIYE_API_BASE}/provinces?name=Adana&fields=id,name`);
        const provinces = provincesResponse.data.data;

        if (!provinces || provinces.length === 0) {
            console.error('Adana province not found!');
            return;
        }

        const province = provinces[0];
        console.log(`Processing province: ${province.name} (${province.id})...`);

        // 2. Get districts for Adana
        const response = await axios.get(`${TURKIYE_API_BASE}/provinces/${province.id}?extend=districts`);
        const districtsData = response.data.data.districts;

        if (!districtsData || !Array.isArray(districtsData)) {
            console.log(`  No districts found for ${province.name}`);
            return;
        }

        let totalNeighborhoods = 0;

        for (const district of districtsData) {
            console.log(`  Processing district: ${district.name} (${district.id})...`);
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
                    totalNeighborhoods += neighborhoodRecords.length;
                    console.log(`    ✅ Added ${neighborhoodRecords.length} neighborhoods for ${district.name}`);
                }
            } catch (distError) {
                console.error(`    Error fetching neighborhoods for district ${district.name}:`, distError.message);
            }
        }

        console.log(`✅ Adana Seeding complete! Total neighborhoods indexed: ${totalNeighborhoods}`);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
