/**
 * Mevcut kullanıcılar için Tenant ID atama utility'si
 * Bu script admin tarafından kullanılabilir veya backend'den çağrılabilir
 */

import api from '@/lib/axios';

/**
 * Belirli bir email adresine sahip kullanıcıya tenant ID atar
 * @param email - Kullanıcı email adresi
 * @param tenantId - Atanacak tenant ID (opsiyonel, backend otomatik oluşturabilir)
 */
export const assignTenantIdToUser = async (email: string, tenantId?: string): Promise<void> => {
  try {
    console.log(`[TENANT ASSIGN] Assigning tenant ID to user: ${email}`);
    
    // Önce kullanıcıyı bul
    const usersResponse = await api.get('/users', { params: { search: email } });
    const users = Array.isArray(usersResponse.data) 
      ? usersResponse.data 
      : (usersResponse.data?.data || []);
    
    const user = users.find((u: any) => 
      u.email?.toLowerCase() === email.toLowerCase()
    );
    
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    
    if (user.tenantId || user.tenant?.id) {
      console.log(`[TENANT ASSIGN] User already has tenant ID: ${user.tenantId || user.tenant?.id}`);
      return;
    }
    
    // Tenant ID ata
    const assignResponse = await api.post(`/users/${user.id}/assign-tenant`, { tenantId });
    
    console.log(`[TENANT ASSIGN] Successfully assigned tenant ID to ${email}:`, assignResponse.data);
  } catch (error: any) {
    console.error(`[TENANT ASSIGN] Error assigning tenant ID to ${email}:`, error);
    throw error;
  }
};

/**
 * Birden fazla kullanıcıya tenant ID atar
 * @param emails - Kullanıcı email adresleri array'i
 */
export const assignTenantIdsToUsers = async (emails: string[]): Promise<void> => {
  console.log(`[TENANT ASSIGN] Assigning tenant IDs to ${emails.length} users...`);
  
  const results = await Promise.allSettled(
    emails.map(email => assignTenantIdToUser(email))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`[TENANT ASSIGN] Completed: ${successful} successful, ${failed} failed`);
  
  if (failed > 0) {
    console.error('[TENANT ASSIGN] Some assignments failed:', 
      results.filter(r => r.status === 'rejected').map(r => (r as PromiseRejectedResult).reason)
    );
  }
};

/**
 * Mevcut kullanıcılar için tenant ID atama (browser console'dan kullanılabilir)
 */
export const assignTenantIdsToExistingUsers = async (): Promise<void> => {
  const emails = ['frtygtcn@gmail.com', 'azem_firat@hotmail.com'];
  await assignTenantIdsToUsers(emails);
};

// Browser console'dan erişilebilir hale getir
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.assignTenantIdToUser = assignTenantIdToUser;
  // @ts-ignore
  window.assignTenantIdsToUsers = assignTenantIdsToUsers;
  // @ts-ignore
  window.assignTenantIdsToExistingUsers = assignTenantIdsToExistingUsers;
}

