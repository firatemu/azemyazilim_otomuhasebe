import axios from '@/lib/axios';
import { QuickMenuItem } from '@/stores/quickMenuStore';

export interface QuickMenuSettings {
  tenantId?: string;
  userId?: string;
  items: QuickMenuItem[];
}

/**
 * Hızlı menü ayarlarını API'den getir
 */
export const getQuickMenuSettings = async (): Promise<QuickMenuItem[]> => {
  try {
    const response = await axios.get('/quick-menu/settings');
    return response.data.items || [];
  } catch (error) {
    console.error('Hızlı menü ayarları yüklenirken hata:', error);
    return [];
  }
};

/**
 * Hızlı menü ayarlarını kaydet
 */
export const saveQuickMenuSettings = async (
  items: QuickMenuItem[]
): Promise<void> => {
  try {
    await axios.post('/quick-menu/settings', { items });
  } catch (error) {
    console.error('Hızlı menü ayarları kaydedilirken hata:', error);
    throw error;
  }
};

/**
 * Hızlı menü ayarlarını varsayılanlara sıfırla
 */
export const resetQuickMenuToDefaults = async (): Promise<void> => {
  try {
    await axios.post('/quick-menu/settings/reset');
  } catch (error) {
    console.error('Hızlı menü sıfırlanırken hata:', error);
    throw error;
  }
};

/**
 * Hızlı menü öğesini güncelle
 */
export const updateQuickMenuItem = async (
  id: string,
  updates: Partial<QuickMenuItem>
): Promise<void> => {
  try {
    await axios.put(`/quick-menu/items/${id}`, updates);
  } catch (error) {
    console.error('Hızlı menü öğesi güncellenirken hata:', error);
    throw error;
  }
};

/**
 * Hızlı menü öğesini sil
 */
export const deleteQuickMenuItem = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/quick-menu/items/${id}`);
  } catch (error) {
    console.error('Hızlı menü öğesi silinirken hata:', error);
    throw error;
  }
};

/**
 * Hızlı menü öğelerini yeniden sırala
 */
export const reorderQuickMenuItems = async (
  items: QuickMenuItem[]
): Promise<void> => {
  try {
    await axios.put('/quick-menu/reorder', { items });
  } catch (error) {
    console.error('Hızlı menü sıralanırken hata:', error);
    throw error;
  }
};
