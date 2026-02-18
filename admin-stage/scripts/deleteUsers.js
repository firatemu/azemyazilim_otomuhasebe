#!/usr/bin/env node

/**
 * Kullanıcıları direkt olarak backend API'den silen script
 * Kullanım: ADMIN_TOKEN=your_token node scripts/deleteUsers.js email1@example.com email2@example.com
 * Veya: ADMIN_TOKEN=your_token node scripts/deleteUsers.js --all (admin hariç tüm kullanıcıları sil)
 * 
 * Admin token'ı almak için:
 * 1. info@azemyazilim.com ile giriş yap
 * 2. Browser console'da: localStorage.getItem('accessToken')
 * 3. Bu token'ı ADMIN_TOKEN olarak kullan
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.otomuhasebe.com';
const ADMIN_EMAILS = ['info@azemyazilim.com'];

// Silinecek kullanıcılar
const USERS_TO_DELETE = [
  'frtygtcn@gmail.com',
  'azem_firat@hotmail.com',
];

async function deleteUserByEmail(email, adminToken) {
  try {
    console.log(`[DELETE] Searching for user: ${email}`);
    
    // Kullanıcıyı bul
    const searchResponse = await axios.get(`${API_BASE_URL}/api/users`, {
      params: { search: email },
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    const users = Array.isArray(searchResponse.data) 
      ? searchResponse.data 
      : (searchResponse.data?.data || []);
    
    const user = users.find((u) => 
      u.email?.toLowerCase() === email.toLowerCase()
    );
    
    if (!user) {
      console.log(`[DELETE] ✅ User not found: ${email}`);
      return { success: true, message: 'User not found' };
    }
    
    console.log(`[DELETE] Found user: ${email} (ID: ${user.id})`);
    
    // Kullanıcıyı sil - birden fazla yöntem dene
    let deleted = false;
    
    // Yöntem 1: Normal delete
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      console.log(`[DELETE] ✅ Method 1 (normal delete) succeeded for: ${email}`);
      deleted = true;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`[DELETE] ℹ️ User already deleted (404): ${email}`);
        deleted = true;
      } else {
        console.warn(`[DELETE] ⚠️ Method 1 failed: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Yöntem 2: Force delete parametresi ile
    if (!deleted) {
      try {
        await axios.delete(`${API_BASE_URL}/api/users/${user.id}`, {
          params: { force: true },
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        });
        console.log(`[DELETE] ✅ Method 2 (force delete) succeeded for: ${email}`);
        deleted = true;
      } catch (error) {
        console.warn(`[DELETE] ⚠️ Method 2 failed: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Yöntem 3: Hard delete endpoint'i
    if (!deleted) {
      try {
        await axios.post(`${API_BASE_URL}/api/users/${user.id}/hard-delete`, {}, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        });
        console.log(`[DELETE] ✅ Method 3 (hard-delete endpoint) succeeded for: ${email}`);
        deleted = true;
      } catch (error) {
        console.warn(`[DELETE] ⚠️ Method 3 failed: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Silme işleminden sonra kontrol et
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const verifyResponse = await axios.get(`${API_BASE_URL}/api/users`, {
      params: { search: email },
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
    
    const verifyUsers = Array.isArray(verifyResponse.data) 
      ? verifyResponse.data 
      : (verifyResponse.data?.data || []);
    
    const stillExists = verifyUsers.some((u) => 
      u.email?.toLowerCase() === email.toLowerCase()
    );
    
    if (!stillExists) {
      console.log(`[DELETE] ✅ User successfully deleted: ${email}`);
      return { success: true, message: 'User deleted successfully' };
    } else {
      console.error(`[DELETE] ❌ User still exists: ${email}`);
      return { success: false, message: 'User still exists after delete attempts' };
    }
  } catch (error) {
    console.error(`[DELETE] ❌ Error deleting ${email}:`, error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
}

async function deleteAllNonAdminUsers(adminToken) {
  try {
    console.log('[CLEANUP] Fetching all users...');
    
    const response = await axios.get(`${API_BASE_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
    
    const users = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.data || []);
    
    console.log(`[CLEANUP] Found ${users.length} users total`);
    
    const nonAdminUsers = users.filter((user) => {
      const email = user.email?.toLowerCase() || '';
      return !ADMIN_EMAILS.some(adminEmail => 
        adminEmail.toLowerCase() === email
      );
    });
    
    console.log(`[CLEANUP] Found ${nonAdminUsers.length} non-admin users to delete`);
    
    const results = [];
    for (const user of nonAdminUsers) {
      const result = await deleteUserByEmail(user.email, adminToken);
      results.push({ email: user.email, ...result });
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  } catch (error) {
    console.error('[CLEANUP] Error:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Admin token'ı environment variable'dan veya direkt olarak al
  const adminToken = process.env.ADMIN_TOKEN || process.env.API_TOKEN;
  
  if (!adminToken) {
    console.error('❌ Error: ADMIN_TOKEN or API_TOKEN environment variable is required');
    console.log('Usage: ADMIN_TOKEN=your_token node scripts/deleteUsers.js');
    console.log('Or: ADMIN_TOKEN=your_token node scripts/deleteUsers.js --all');
    process.exit(1);
  }
  
  if (args.includes('--all')) {
    console.log('[CLEANUP] Deleting all non-admin users...');
    const results = await deleteAllNonAdminUsers(adminToken);
    console.log('\n[CLEANUP] Results:', results);
  } else if (args.length > 0) {
    // Belirtilen email'leri sil
    const emails = args;
    console.log(`[DELETE] Deleting ${emails.length} users...`);
    
    const results = [];
    for (const email of emails) {
      const result = await deleteUserByEmail(email, adminToken);
      results.push({ email, ...result });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n[DELETE] Results:', results);
  } else {
    // Varsayılan olarak USERS_TO_DELETE listesindeki kullanıcıları sil
    console.log(`[DELETE] Deleting default users: ${USERS_TO_DELETE.join(', ')}`);
    
    const results = [];
    for (const email of USERS_TO_DELETE) {
      const result = await deleteUserByEmail(email, adminToken);
      results.push({ email, ...result });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n[DELETE] Results:', results);
  }
}

// Script çalıştırıldığında main fonksiyonunu çağır
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { deleteUserByEmail, deleteAllNonAdminUsers };

