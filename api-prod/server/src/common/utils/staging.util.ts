/**
 * Staging ortamı yardımcı fonksiyonları
 * Staging ortamında tenant ID gereksinimini kaldırmak için kullanılır
 */

/**
 * Staging ortamında mıyız?
 */
export function isStagingEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'staging' ||
    process.env.NODE_ENV === 'development' ||
    process.env.STAGING_DISABLE_TENANT === 'true' ||
    !!process.env.STAGING_DEFAULT_TENANT_ID
  );
}

/**
 * Tenant ID'yi staging'de opsiyonel yap
 * Staging'de undefined döndürür, production'da tenantId'yi zorunlu kılar
 */
export function getTenantIdForQuery(tenantId: string | undefined): string | undefined {
  if (isStagingEnvironment()) {
    // Staging'de tenantId opsiyonel - undefined dönebilir
    return tenantId;
  }
  // Production'da tenantId zorunlu
  return tenantId;
}

/**
 * Database sorgusu için tenantId filtresi oluştur
 * Staging'de tenantId null/undefined olabilir
 */
export function buildTenantWhereClause(tenantId: string | undefined): any {
  if (isStagingEnvironment()) {
    // Staging'de tenantId opsiyonel
    if (tenantId) {
      // Hem tenantId'li hem null olanları getir
      return {
        OR: [
          { tenantId },
          { tenantId: null },
        ],
      };
    }
    // TenantId yoksa boş obje döndür (tüm kayıtları getir)
    return {};
  }

  // Production'da tenantId zorunlu
  if (!tenantId) {
    throw new Error('Tenant ID is required in production environment');
  }
  return { tenantId };
}


