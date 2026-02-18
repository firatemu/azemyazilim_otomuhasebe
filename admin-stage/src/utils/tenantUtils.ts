/**
 * Tenant Utility Functions
 * SaaS multi-tenant yapısı için yardımcı fonksiyonlar
 */

import { useAuthStore } from '@/stores/authStore';

/**
 * Mevcut tenant ID'yi döndürür
 */
export const getCurrentTenantId = (): string | null => {
  return useAuthStore.getState().tenantId;
};

/**
 * Tenant ID'nin mevcut olup olmadığını kontrol eder
 */
export const hasTenantId = (): boolean => {
  return !!useAuthStore.getState().tenantId;
};

/**
 * Tenant bilgilerini console'a yazdırır (debug için)
 */
export const debugTenantInfo = (): void => {
  const authState = useAuthStore.getState();
  const tenantId = authState.tenantId;
  const user = authState.user;
  
  console.group('🔍 Tenant Debug Info');
  console.log('Tenant ID:', tenantId || 'NOT FOUND');
  console.log('User:', user);
  console.log('User Tenant ID:', user?.tenantId);
  console.log('User Tenant Object:', user?.tenant);
  console.log('LocalStorage Tenant ID:', localStorage.getItem('tenantId'));
  console.groupEnd();
  
  if (!tenantId) {
    console.warn('⚠️ Tenant ID bulunamadı! SaaS multi-tenant çalışmayabilir.');
    console.warn('Lütfen login yapın veya backend response formatını kontrol edin.');
  }
};

/**
 * Tenant ID'yi localStorage'dan kontrol eder ve store'a yükler
 * Eğer tenant ID yoksa uyarı verir
 */
export const ensureTenantId = (): boolean => {
  const authState = useAuthStore.getState();
  let tenantId = authState.tenantId;
  
  // Store'da yoksa localStorage'dan kontrol et
  if (!tenantId) {
    tenantId = localStorage.getItem('tenantId');
    
    // User objesinden de kontrol et
    if (!tenantId && authState.user) {
      tenantId = authState.user.tenantId || authState.user.tenant?.id || null;
    }
    
    // Bulunduysa store'a kaydet
    if (tenantId) {
      useAuthStore.setState({ tenantId });
      console.log('[TENANT UTILS] Tenant ID loaded from localStorage/user:', tenantId);
    }
  }
  
  if (!tenantId) {
    console.error('[TENANT UTILS] Tenant ID not found! Please login again.');
    return false;
  }
  
  return true;
};

/**
 * Tenant ID yoksa backend'den otomatik olarak çeker
 * Bu fonksiyon async olarak çalışır ve tenant ID'yi store'a kaydeder
 */
export const fetchTenantIdFromBackend = async (): Promise<string | null> => {
  const authState = useAuthStore.getState();
  
  // Zaten tenant ID varsa döndür
  if (authState.tenantId) {
    return authState.tenantId;
  }
  
  // Kullanıcı bilgisi yoksa çalışamaz
  if (!authState.user?.id || !authState.accessToken) {
    console.error('[TENANT UTILS] Cannot fetch tenant ID: No user ID or access token');
    return null;
  }
  
  try {
    const api = (await import('@/lib/axios')).default;
    
    console.log('[TENANT UTILS] Fetching tenant ID from backend for user:', authState.user.id);
    
    // Kullanıcı bilgilerini çek
    const response = await api.get(`/users/${authState.user.id}`);
    const userData = response.data?.data || response.data;
    
    const tenantId = 
      userData?.tenantId ||
      userData?.tenant?.id ||
      null;
    
    if (tenantId) {
      // Store'a ve localStorage'a kaydet
      useAuthStore.setState({ tenantId });
      localStorage.setItem('tenantId', tenantId);
      console.log('[TENANT UTILS] Tenant ID fetched and saved:', tenantId);
      return tenantId;
    } else {
      console.error('[TENANT UTILS] Tenant ID not found in user data:', userData);
      return null;
    }
  } catch (error: any) {
    console.error('[TENANT UTILS] Failed to fetch tenant ID:', error);
    return null;
  }
};

/**
 * Belirli bir email adresine sahip kullanıcının tenant ID'sini kontrol eder
 * @param email - Kontrol edilecek email adresi
 */
export const checkUserTenantId = async (email: string): Promise<void> => {
  try {
    const api = (await import('@/lib/axios')).default;
    
    console.group(`🔍 Checking tenant ID for user: ${email}`);
    
    // Tüm kullanıcıları getir
    const response = await api.get('/users', { params: { search: email } });
    
    const users = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.data || []);
    
    const user = users.find((u: any) => 
      u.email?.toLowerCase() === email.toLowerCase() ||
      u.email === email
    );
    
    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        fullName: user.fullName || user.name,
        tenantId: user.tenantId || user.tenant?.id || 'NOT FOUND',
        tenant: user.tenant || null,
        role: user.role,
      });
      
      const tenantId = user.tenantId || user.tenant?.id;
      if (tenantId) {
        console.log(`✅ Tenant ID: ${tenantId}`);
      } else {
        console.warn('⚠️ Tenant ID not found for this user!');
        console.warn('User object:', user);
      }
    } else {
      console.warn(`⚠️ User with email ${email} not found!`);
      console.log('Available users:', users.map((u: any) => ({ email: u.email, tenantId: u.tenantId || u.tenant?.id })));
    }
    
    console.groupEnd();
  } catch (error: any) {
    console.error('❌ Error checking user tenant ID:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
  }
};

