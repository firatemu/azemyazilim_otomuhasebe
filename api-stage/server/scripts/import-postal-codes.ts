#!/usr/bin/env node

/**
 * Posta Kodu Verilerini Import Etme Scripti
 * 
 * Bu script, JSON formatındaki posta kodu verilerini veritabanına yükler.
 * 
 * Kullanım:
 *   npm run import-postal-codes <json-file-path>
 * 
 * JSON Formatı:
 * [
 *   {
 *     "city": "İstanbul",
 *     "district": "Kadıköy",
 *     "neighborhood": "Fenerbahçe",
 *     "postalCode": "34726"
 *   },
 *   ...
 * ]
 * 
 * Veri Kaynakları:
 * - https://github.com/furkanipek/turkiye-veritabani
 * - https://github.com/coderemre/tr-il-ilce-mahalle
 * - https://github.com/hozakar/postakod
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface PostalCodeData {
  city: string;
  district: string;
  neighborhood: string;
  postalCode: string;
}

async function importPostalCodes(jsonFilePath: string) {
  try {
    const filePath = path.resolve(process.cwd(), jsonFilePath);
    console.log(`📂 Reading postal codes from: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const postalCodes: PostalCodeData[] = JSON.parse(fileContent);
    
    console.log(`📊 Found ${postalCodes.length} postal code records`);
    console.log('🚀 Starting import...\n');
    
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (let i = 0; i < postalCodes.length; i++) {
      const pc = postalCodes[i];
      
      // Validation
      if (!pc.city || !pc.district || !pc.neighborhood || !pc.postalCode) {
        console.warn(`⚠️  Skipping invalid record at index ${i}:`, pc);
        skipped++;
        continue;
      }
      
      // Normalize postal code (5 digits, pad with zeros if needed)
      const normalizedPostalCode = pc.postalCode
        .toString()
        .trim()
        .replace(/\D/g, '') // Remove non-digits
        .padStart(5, '0')
        .substring(0, 5);
      
      if (normalizedPostalCode.length !== 5) {
        console.warn(`⚠️  Invalid postal code format at index ${i}: ${pc.postalCode}`);
        skipped++;
        continue;
      }
      
      try {
        const existing = await prisma.postalCode.findUnique({
          where: {
            city_district_neighborhood: {
              city: pc.city.trim(),
              district: pc.district.trim(),
              neighborhood: pc.neighborhood.trim(),
            },
          },
        });
        
        if (existing) {
          if (existing.postalCode !== normalizedPostalCode) {
            await prisma.postalCode.update({
              where: { id: existing.id },
              data: { postalCode: normalizedPostalCode },
            });
            updated++;
          }
        } else {
          await prisma.postalCode.create({
            data: {
              city: pc.city.trim(),
              district: pc.district.trim(),
              neighborhood: pc.neighborhood.trim(),
              postalCode: normalizedPostalCode,
            },
          });
          created++;
        }
        
        // Progress indicator
        if ((i + 1) % 1000 === 0) {
          const progress = ((i + 1) / postalCodes.length * 100).toFixed(1);
          console.log(`⏳ Progress: ${i + 1}/${postalCodes.length} (${progress}%)`);
        }
      } catch (error) {
        console.error(`❌ Error processing record at index ${i}:`, error);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📈 Import Summary');
    console.log('='.repeat(50));
    console.log(`Total records:     ${postalCodes.length}`);
    console.log(`✅ Created:         ${created}`);
    console.log(`🔄 Updated:         ${updated}`);
    console.log(`⏭️  Skipped:          ${skipped}`);
    console.log(`❌ Errors:           ${errors}`);
    console.log('='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('❌ Error importing postal codes:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Usage: npm run import-postal-codes <json-file-path>');
    console.error('   Example: npm run import-postal-codes data/postal-codes.json');
    console.error('\n📚 Data Sources:');
    console.error('   - https://github.com/furkanipek/turkiye-veritabani');
    console.error('   - https://github.com/coderemre/tr-il-ilce-mahalle');
    console.error('   - https://github.com/hozakar/postakod');
    process.exit(1);
  }
  
  const jsonFilePath = args[0];
  
  try {
    await importPostalCodes(jsonFilePath);
    console.log('✅ Import completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { importPostalCodes };
