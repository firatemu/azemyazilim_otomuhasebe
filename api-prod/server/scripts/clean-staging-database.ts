/**
 * Staging veritabanındaki tüm verileri temizler
 * DİKKAT: Bu script tüm verileri kalıcı olarak siler!
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanStagingDatabase() {
  console.log('🚨 Staging veritabanı temizleme işlemi başlatılıyor...');
  console.log('⚠️  DİKKAT: Tüm veriler kalıcı olarak silinecek!');

  try {
    // Foreign key constraint'leri geçici olarak devre dışı bırak
    console.log('📋 Foreign key constraint\'leri kontrol ediliyor...');
    
    // Tüm tabloları CASCADE ile temizle
    // Prisma'nın tüm modellerini al ve tablo isimlerini çıkar
    const tableNames = [
      // Servis modülü tabloları (en alt seviye)
      'vehicle_maintenance_reminders',
      'manager_rejections',
      'manager_approvals',
      'solution_package_parts',
      'solution_packages',
      'diagnostic_notes',
      'technical_findings',
      'work_order_status_histories',
      'work_order_audit_logs',
      'work_order_lines',
      'work_orders',
      'technicians',
      'vehicles',
      
      // Diğer modüller
      'efatura_inbox',
      'hizli_tokens',
      'invitations',
      'user_licenses',
      'module_licenses',
      'modules',
      'satın_alma_irsaliyesi_logs',
      'satın_alma_irsaliyesi_kalemleri',
      'satın_alma_irsaliyeleri',
      'satın_alma_siparis_logs',
      'satın_alma_siparis_kalemleri',
      'satın_alma_siparisleri',
      'basit_siparisler',
      'purchase_order_items',
      'purchase_orders',
      'arac',
      'code_templates',
      'personel_odemeler',
      'personeller',
      'cek_senet_logs',
      'deleted_cek_senets',
      'cek_senets',
      'banka_havale_logs',
      'deleted_banka_havaleler',
      'banka_havaleler',
      'masraflar',
      'masraf_kategoriler',
      'stock_moves',
      'product_location_stocks',
      'product_barcodes',
      'locations',
      'warehouses',
      'urun_rafs',
      'rafs',
      'depos',
      'sayim_kalemleri',
      'sayimlar',
      'teklif_logs',
      'teklif_kalemleri',
      'teklifler',
      'satis_irsaliyesi_logs',
      'satis_irsaliyesi_kalemleri',
      'satis_irsaliyeleri',
      'siparis_hazirlik',
      'siparis_logs',
      'siparis_kalemleri',
      'siparisler',
      'efatura_xmls',
      'fatura_tahsilatlar',
      'tahsilatlar',
      'invoice_profits',
      'fatura_kalemleri',
      'fatura_logs',
      'faturalar',
      'kasa_hareketler',
      'firma_kredi_karti_hatirlaticilar',
      'firma_kredi_karti_hareketler',
      'firma_kredi_kartlari',
      'banka_hesap_hareketler',
      'banka_hesaplari',
      'kasalar',
      'cari_hareketler',
      'cariler',
      'stok_hareketler',
      'stok_esdegerler',
      'esdeger_gruplar',
      'stock_cost_histories',
      'price_cards',
      'stoklar',
      'sessions',
      'users',
      'audit_logs',
      'payments',
      'subscriptions',
      'plans',
      'system_parameters',
      'tenant_settings',
      'tenants',
    ];

    console.log(`📊 ${tableNames.length} tablo temizlenecek...`);

    // Foreign key constraint'leri geçici olarak devre dışı bırak
    await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

    // Tüm tabloları temizle
    for (const tableName of tableNames) {
      try {
        const result = await prisma.$executeRawUnsafe(
          `TRUNCATE TABLE "${tableName}" CASCADE;`
        );
        console.log(`✅ ${tableName} temizlendi`);
      } catch (error: any) {
        // Tablo yoksa veya başka bir hata varsa devam et
        if (error.message?.includes('does not exist')) {
          console.log(`⚠️  ${tableName} tablosu bulunamadı, atlanıyor`);
        } else {
          console.error(`❌ ${tableName} temizlenirken hata:`, error.message);
        }
      }
    }

    // Foreign key constraint'leri tekrar etkinleştir
    await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');

    // Sequence'leri sıfırla (ID'lerin 1'den başlaması için)
    console.log('🔄 Sequence\'ler sıfırlanıyor...');
    const sequences = await prisma.$queryRawUnsafe<Array<{ sequence_name: string }>>(
      `SELECT sequence_name 
       FROM information_schema.sequences 
       WHERE sequence_schema = 'public' 
       AND sequence_name NOT LIKE '\\_prisma\\_%';`
    );

    for (const seq of sequences) {
      try {
        await prisma.$executeRawUnsafe(
          `ALTER SEQUENCE "${seq.sequence_name}" RESTART WITH 1;`
        );
      } catch (error: any) {
        console.log(`⚠️  ${seq.sequence_name} sequence sıfırlanamadı:`, error.message);
      }
    }

    console.log('✅ Staging veritabanı başarıyla temizlendi!');
    console.log('📊 Tüm tablolar boşaltıldı ve sequence\'ler sıfırlandı.');

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
cleanStagingDatabase()
  .then(() => {
    console.log('✅ İşlem tamamlandı');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ İşlem başarısız:', error);
    process.exit(1);
  });
