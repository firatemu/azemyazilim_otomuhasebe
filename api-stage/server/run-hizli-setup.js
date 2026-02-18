#!/usr/bin/env node

/**
 * Hızlı Teknoloji Entegrasyonu Kurulum Scripti
 * Tüm adımları otomatik olarak tamamlar
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SERVER_DIR = __dirname;
const ENV_FILE = path.join(SERVER_DIR, '.env');

console.log('==========================================');
console.log('🔧 Hızlı Teknoloji Entegrasyonu Kurulumu');
console.log('==========================================');
console.log('');

// 1. Environment Variables
console.log('📋 1/5 Environment Variables kontrol ediliyor...');
if (fs.existsSync(ENV_FILE)) {
  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  const requiredVars = [
    'HIZLI_API_KEY',
    'HIZLI_SECRET_KEY',
    'HIZLI_USERNAME',
    'HIZLI_PASSWORD',
    'HIZLI_WSDL',
  ];

  let missingVars = [];
  requiredVars.forEach((varName) => {
    if (!envContent.includes(`${varName}=`)) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.log('⚠️  Eksik environment variables:', missingVars.join(', '));
    console.log('');
    console.log('Aşağıdaki değerleri .env dosyasına ekleyin:');
    console.log('');
    console.log('# Hızlı Teknoloji Entegrasyonu');
    console.log('HIZLI_API_KEY=9785bcc39536');
    console.log('HIZLI_SECRET_KEY=9785bcc3953673cfb92246398b25449ad25e');
    console.log('HIZLI_USERNAME=hizlitest');
    console.log('HIZLI_PASSWORD=Test.1234');
    console.log('HIZLI_WSDL=https://econnecttest.hizliteknoloji.com.tr/Services/HizliService.svc?wsdl');
    console.log('');
    console.log('Devam etmek için Enter\'a basın...');
    process.stdin.read();
  } else {
    console.log('✅ Tüm environment variables mevcut');
  }
} else {
  console.log('⚠️  .env dosyası bulunamadı!');
  console.log('Lütfen .env dosyasını oluşturun ve yukarıdaki değişkenleri ekleyin');
  process.exit(1);
}

// 2. NPM Install
console.log('');
console.log('📦 2/5 NPM dependencies yükleniyor...');
try {
  execSync('npm install', { cwd: SERVER_DIR, stdio: 'inherit' });
  console.log('✅ Dependencies yüklendi');
} catch (error) {
  console.error('❌ npm install başarısız!');
  process.exit(1);
}

// 3. Prisma Generate & Migration
console.log('');
console.log('🗄️  3/5 Prisma migration çalıştırılıyor...');

try {
  console.log('   → Prisma Client generate ediliyor...');
  execSync('npx prisma generate', { cwd: SERVER_DIR, stdio: 'inherit' });
  console.log('✅ Prisma Client generate edildi');
} catch (error) {
  console.error('❌ Prisma generate başarısız!');
  process.exit(1);
}

try {
  console.log('   → Migration uygulanıyor...');
  // Migration dosyası zaten hazır, deploy et
  execSync('npx prisma migrate deploy', { cwd: SERVER_DIR, stdio: 'inherit' });
  console.log('✅ Migration uygulandı');
} catch (error) {
  console.log('⚠️  Migration deploy başarısız, migrate dev deneniyor...');
  try {
    execSync('npx prisma migrate dev --name add_hizli_models', {
      cwd: SERVER_DIR,
      stdio: 'inherit',
    });
    console.log('✅ Migration oluşturuldu ve uygulandı');
  } catch (error2) {
    console.error('❌ Migration başarısız!');
    console.error('Manuel olarak şu komutu çalıştırın:');
    console.error('npx prisma migrate dev --name add_hizli_models');
    process.exit(1);
  }
}

// 4. Build
console.log('');
console.log('🔨 4/5 TypeScript build yapılıyor...');
try {
  execSync('npm run build', { cwd: SERVER_DIR, stdio: 'inherit' });
  console.log('✅ Build tamamlandı');
} catch (error) {
  console.error('❌ Build başarısız!');
  process.exit(1);
}

// 5. PM2 Restart
console.log('');
console.log('🔄 5/5 PM2 restart ediliyor...');
try {
  execSync('pm2 restart api-stage', { cwd: SERVER_DIR, stdio: 'inherit' });
  console.log('✅ PM2 restart edildi');
} catch (error) {
  console.log('⚠️  PM2 restart başarısız, manuel restart yapılmalı');
  console.log('Komut: pm2 restart api-stage');
}

console.log('');
console.log('==========================================');
console.log('✅ Kurulum tamamlandı!');
console.log('==========================================');
console.log('');
console.log('🧪 Test Endpoint\'leri:');
console.log('');
console.log('1. Login:');
console.log('   curl -X POST http://localhost:3000/api/hizli/login');
console.log('');
console.log('2. Token Status:');
console.log('   curl http://localhost:3000/api/hizli/token-status');
console.log('');
console.log('3. Incoming Documents:');
console.log('   curl http://localhost:3000/api/hizli/incoming');
console.log('');
console.log('4. Frontend:');
console.log('   http://localhost:3001/efatura/gelen');
console.log('');

