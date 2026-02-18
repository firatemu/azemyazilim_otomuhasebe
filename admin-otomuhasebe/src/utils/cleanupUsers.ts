import api from '@/lib/axios';

const ADMIN_EMAILS = ['info@azemyazilim.com'];

/**
 * Admin kullanıcısı dışındaki tüm kullanıcıları temizler (hard delete)
 */
export const cleanupNonAdminUsers = async () => {
  try {
    console.log('[CLEANUP] Fetching all users...');
    
    // Tüm kullanıcıları getir (aktif ve pasif)
    const response = await api.get('/users', { params: { includeDeleted: true } }).catch(() => {
      // Eğer includeDeleted parametresi desteklenmiyorsa normal istek yap
      return api.get('/users');
    });
    
    const users = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.data || []);
    
    console.log(`[CLEANUP] Found ${users.length} users total`);
    
    // Admin kullanıcılarını filtrele
    const nonAdminUsers = users.filter((user: any) => {
      const email = user.email?.toLowerCase() || '';
      return !ADMIN_EMAILS.some(adminEmail => 
        adminEmail.toLowerCase() === email
      );
    });
    
    console.log(`[CLEANUP] Found ${nonAdminUsers.length} non-admin users to delete`);
    
    if (nonAdminUsers.length === 0) {
      console.log('[CLEANUP] No users to delete');
      return { deleted: 0, errors: [] };
    }
    
    // Her kullanıcıyı sil (hard delete için force parametresi ekle)
    const errors: Array<{ email: string; error: string }> = [];
    let deleted = 0;
    
    for (const user of nonAdminUsers) {
      try {
        // Önce normal delete dene
        try {
          await api.delete(`/users/${user.id}`);
        } catch (deleteError: any) {
          // Eğer 404 alırsak kullanıcı zaten silinmiş
          if (deleteError?.response?.status === 404) {
            console.log(`[CLEANUP] ℹ️ User already deleted: ${user.email || user.username || user.id}`);
            deleted++;
            continue;
          }
          // Hard delete için force parametresi ile dene
          try {
            await api.delete(`/users/${user.id}`, { params: { force: true } });
          } catch (forceError: any) {
            // Eğer bu da çalışmazsa, direkt user ID ile silmeyi dene
            throw deleteError;
          }
        }
        
        console.log(`[CLEANUP] ✅ Deleted user: ${user.email || user.username || user.id}`);
        deleted++;
        
        // Silme işleminden sonra kısa bir bekleme
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
        console.error(`[CLEANUP] ❌ Failed to delete user ${user.email || user.username || user.id}:`, errorMessage);
        errors.push({
          email: user.email || user.username || user.id,
          error: errorMessage,
        });
      }
    }
    
    // Silme işleminden sonra tekrar kontrol et
    console.log('[CLEANUP] Verifying deletion...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniye bekle
    
    const verifyResponse = await api.get('/users').catch(() => ({ data: [] }));
    const remainingUsers = Array.isArray(verifyResponse.data) 
      ? verifyResponse.data 
      : (verifyResponse.data?.data || []);
    
    const remainingNonAdmin = remainingUsers.filter((user: any) => {
      const email = user.email?.toLowerCase() || '';
      return !ADMIN_EMAILS.some(adminEmail => 
        adminEmail.toLowerCase() === email
      );
    });
    
    console.log(`[CLEANUP] Remaining non-admin users: ${remainingNonAdmin.length}`);
    if (remainingNonAdmin.length > 0) {
      console.warn('[CLEANUP] ⚠️ Some users still exist:', remainingNonAdmin.map((u: any) => u.email || u.username));
    }
    
    console.log(`[CLEANUP] ✅ Cleanup completed: ${deleted} users deleted, ${errors.length} errors`);
    
    return { deleted, errors, remaining: remainingNonAdmin.length };
  } catch (error: any) {
    console.error('[CLEANUP] ❌ Failed to fetch users:', error);
    throw error;
  }
};

/**
 * Belirli bir email adresine sahip kullanıcıyı kontrol eder
 */
export const checkUserByEmail = async (email: string) => {
  try {
    console.log(`[CHECK USER] Searching for user with email: ${email}`);
    
    // Kullanıcıyı email ile bul
    const response = await api.get('/users', { params: { search: email } });
    const users = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.data || []);
    
    const user = users.find((u: any) => 
      u.email?.toLowerCase() === email.toLowerCase()
    );
    
    if (!user) {
      console.log(`[CHECK USER] ✅ User not found: ${email} (User is deleted or doesn't exist)`);
      return { exists: false, user: null };
    }
    
    console.log(`[CHECK USER] ⚠️ User found:`, {
      id: user.id,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
      tenantId: user.tenantId || user.tenant?.id,
      createdAt: user.createdAt,
    });
    
    return { exists: true, user };
  } catch (error: any) {
    console.error(`[CHECK USER] ❌ Failed to check user ${email}:`, error);
    const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
    throw new Error(`Failed to check user: ${errorMessage}`);
  }
};

/**
 * Belirli email adreslerine sahip kullanıcıları zorla siler
 */
export const forceDeleteUsersByEmails = async (emails: string[]) => {
  const results: Array<{ email: string; success: boolean; message: string }> = [];
  
  for (const email of emails) {
    try {
      console.log(`[FORCE DELETE] Processing: ${email}`);
      
      // Önce kullanıcıyı kontrol et
      const checkResult = await checkUserByEmail(email);
      
      if (!checkResult.exists || !checkResult.user) {
        console.log(`[FORCE DELETE] ✅ User not found: ${email}`);
        results.push({ email, success: true, message: 'User not found (already deleted)' });
        continue;
      }
      
      const user = checkResult.user;
      console.log(`[FORCE DELETE] Found user: ${email} (ID: ${user.id})`);
      
      // Birden fazla silme yöntemi dene
      let deleted = false;
      
      // Yöntem 1: Normal delete
      try {
        await api.delete(`/users/${user.id}`);
        console.log(`[FORCE DELETE] ✅ Method 1 (normal delete) succeeded for: ${email}`);
        deleted = true;
      } catch (error1: any) {
        if (error1?.response?.status === 404) {
          console.log(`[FORCE DELETE] ℹ️ User already deleted (404): ${email}`);
          deleted = true;
        } else {
          console.warn(`[FORCE DELETE] ⚠️ Method 1 failed for ${email}:`, error1?.response?.data?.message || error1?.message);
        }
      }
      
      // Yöntem 2: Force delete parametresi ile
      if (!deleted) {
        try {
          await api.delete(`/users/${user.id}`, { params: { force: true } });
          console.log(`[FORCE DELETE] ✅ Method 2 (force delete) succeeded for: ${email}`);
          deleted = true;
        } catch (error2: any) {
          console.warn(`[FORCE DELETE] ⚠️ Method 2 failed for ${email}:`, error2?.response?.data?.message || error2?.message);
        }
      }
      
      // Yöntem 3: Hard delete endpoint'i dene
      if (!deleted) {
        try {
          await api.post(`/users/${user.id}/hard-delete`);
          console.log(`[FORCE DELETE] ✅ Method 3 (hard-delete endpoint) succeeded for: ${email}`);
          deleted = true;
        } catch (error3: any) {
          console.warn(`[FORCE DELETE] ⚠️ Method 3 failed for ${email}:`, error3?.response?.data?.message || error3?.message);
        }
      }
      
      // Silme işleminden sonra kontrol et
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniye bekle
      
      const verifyResult = await checkUserByEmail(email);
      if (!verifyResult.exists) {
        console.log(`[FORCE DELETE] ✅ User successfully deleted: ${email}`);
        results.push({ email, success: true, message: 'User deleted successfully' });
      } else {
        console.error(`[FORCE DELETE] ❌ User still exists: ${email}`);
        results.push({ 
          email, 
          success: false, 
          message: `User still exists after delete attempts. Backend may be using soft delete. User ID: ${user.id}` 
        });
      }
    } catch (error: any) {
      console.error(`[FORCE DELETE] ❌ Error processing ${email}:`, error);
      results.push({ 
        email, 
        success: false, 
        message: error?.response?.data?.message || error?.message || 'Unknown error' 
      });
    }
  }
  
  console.log(`[FORCE DELETE] ✅ Completed. Results:`, results);
  return results;
};

/**
 * Belirli bir email adresine sahip kullanıcıyı siler
 */
export const deleteUserByEmail = async (email: string) => {
  try {
    console.log(`[DELETE USER] Searching for user with email: ${email}`);
    
    // Önce kullanıcıyı kontrol et
    const checkResult = await checkUserByEmail(email);
    
    if (!checkResult.exists || !checkResult.user) {
      console.warn(`[DELETE USER] ⚠️ User not found: ${email}`);
      return { success: false, message: 'User not found', alreadyDeleted: true };
    }
    
    const user = checkResult.user;
    console.log(`[DELETE USER] Found user: ${user.email} (ID: ${user.id})`);
    
    // Kullanıcıyı sil (hard delete için force parametresi ile dene)
    try {
      // Önce normal delete dene
      try {
        await api.delete(`/users/${user.id}`);
        console.log(`[DELETE USER] ✅ Delete request sent for user: ${email}`);
      } catch (deleteError: any) {
        // Eğer 404 alırsak kullanıcı zaten silinmiş
        if (deleteError?.response?.status === 404) {
          console.log(`[DELETE USER] ℹ️ User already deleted (404): ${email}`);
          const verifyResult = await checkUserByEmail(email);
          if (!verifyResult.exists) {
            return { success: true, message: `User ${email} already deleted` };
          }
        }
        
        // Hard delete için force parametresi ile dene
        try {
          await api.delete(`/users/${user.id}`, { params: { force: true } });
          console.log(`[DELETE USER] ✅ Hard delete request sent for user: ${email}`);
        } catch (forceError: any) {
          // Eğer bu da çalışmazsa, orijinal hatayı fırlat
          throw deleteError;
        }
      }
      
      // Silme işleminden sonra tekrar kontrol et (birkaç kez dene)
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Her seferinde 1 saniye bekle
        
        const verifyResult = await checkUserByEmail(email);
        if (!verifyResult.exists) {
          console.log(`[DELETE USER] ✅ User successfully deleted: ${email} (verified after ${i + 1} attempts)`);
          return { success: true, message: `User ${email} deleted successfully` };
        }
      }
      
      // Hala varsa uyarı ver
      const finalCheck = await checkUserByEmail(email);
      if (finalCheck.exists) {
        console.warn(`[DELETE USER] ⚠️ User still exists after delete request: ${email}`);
        console.warn(`[DELETE USER] ⚠️ This may be a backend issue. User might be soft-deleted.`);
        return { success: false, message: 'Delete request sent but user still exists', user: finalCheck.user };
      }
      
      return { success: true, message: `User ${email} deleted successfully` };
    } catch (deleteError: any) {
      const errorMessage = deleteError?.response?.data?.message || deleteError?.message || 'Unknown error';
      console.error(`[DELETE USER] ❌ Delete request failed:`, errorMessage);
      throw deleteError;
    }
  } catch (error: any) {
    console.error(`[DELETE USER] ❌ Failed to delete user ${email}:`, error);
    const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
    throw new Error(`Failed to delete user: ${errorMessage}`);
  }
};

/**
 * Yeni bir test kullanıcısı oluşturur ve tenant ID kontrolü yapar
 */
export const createTestUserAndCheckTenantId = async (email: string, password: string, username?: string) => {
  try {
    console.log(`[TEST USER] Creating test user: ${email}`);
    
    // Kullanıcı oluştur
    const createResponse = await api.post('/auth/register', {
      email,
      password,
      username: username || email.split('@')[0],
      fullName: `Test User ${email.split('@')[0]}`,
    });
    
    console.log('[TEST USER] ✅ User created:', createResponse.data);
    
    const userId = createResponse.data?.user?.id || createResponse.data?.id;
    if (!userId) {
      throw new Error('User ID not found in response');
    }
    
    // Kullanıcı bilgilerini getir ve tenant ID kontrolü yap
    const userResponse = await api.get(`/users/${userId}`);
    const userData = userResponse.data?.data || userResponse.data;
    
    const tenantId = userData?.tenantId || userData?.tenant?.id || null;
    
    console.log('[TEST USER] User data:', {
      id: userId,
      email: userData?.email,
      username: userData?.username,
      tenantId: tenantId,
      tenant: userData?.tenant,
    });
    
    if (tenantId) {
      console.log(`[TEST USER] ✅ Tenant ID assigned: ${tenantId}`);
      return {
        success: true,
        userId,
        email: userData?.email,
        tenantId,
        message: 'User created and tenant ID assigned successfully',
      };
    } else {
      console.warn('[TEST USER] ⚠️ Tenant ID not assigned yet');
      return {
        success: false,
        userId,
        email: userData?.email,
        tenantId: null,
        message: 'User created but tenant ID not assigned (may need admin approval)',
      };
    }
  } catch (error: any) {
    console.error('[TEST USER] ❌ Failed to create test user:', error);
    const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
    throw new Error(`Failed to create test user: ${errorMessage}`);
  }
};

// Global olarak erişilebilir yap
if (typeof window !== 'undefined') {
  (window as any).cleanupNonAdminUsers = cleanupNonAdminUsers;
  (window as any).checkUserByEmail = checkUserByEmail;
  (window as any).deleteUserByEmail = deleteUserByEmail;
  (window as any).forceDeleteUsersByEmails = forceDeleteUsersByEmails;
  (window as any).createTestUserAndCheckTenantId = createTestUserAndCheckTenantId;
  
  console.log('[CLEANUP UTILS] Global functions available:');
  console.log('  - window.cleanupNonAdminUsers() - Delete all non-admin users');
  console.log('  - window.checkUserByEmail(email) - Check if user exists');
  console.log('  - window.deleteUserByEmail(email) - Delete user by email');
  console.log('  - window.forceDeleteUsersByEmails([email1, email2, ...]) - Force delete multiple users');
  console.log('  - window.createTestUserAndCheckTenantId(email, password, username?) - Create test user and check tenant ID');
}

