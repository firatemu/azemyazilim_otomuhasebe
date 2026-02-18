// Bu script'i browser console'da çalıştırabilirsiniz
// veya bu dosyayı import edip kullanabilirsiniz

// Email adresine göre tenant ID kontrolü
async function checkTenantByEmail(email) {
  try {
    console.log(`🔍 Checking tenant ID for: ${email}`);
    
    // API çağrısı yap
    const response = await fetch('https://api.otomuhasebe.com/api/users?search=' + encodeURIComponent(email), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'X-Tenant-Id': localStorage.getItem('tenantId') || '',
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const users = Array.isArray(data) ? data : (data.data || []);
    
    const user = users.find(u => 
      u.email?.toLowerCase() === email.toLowerCase()
    );
    
    if (user) {
      const tenantId = user.tenantId || user.tenant?.id;
      console.log('✅ User found:', {
        email: user.email,
        fullName: user.fullName,
        tenantId: tenantId || 'NOT FOUND',
        tenant: user.tenant,
      });
      return tenantId;
    } else {
      console.warn('⚠️ User not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

// Kullanım: checkTenantByEmail('frtygtcn@gmail.com')
