import axios from '@/lib/axios';

export interface SystemParameter {
  id: string;
  key: string;
  value: any;
  description?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParameterDto {
  key: string;
  value: any;
  description?: string;
  category?: string;
}

export interface UpdateParameterDto {
  value?: any;
  description?: string;
  category?: string;
}

/**
 * Tüm parametreleri getir
 */
export async function getAllParameters(category?: string): Promise<SystemParameter[]> {
  const params = category ? { category } : {};
  const response = await axios.get('/system-parameter', { params });
  return response.data;
}

/**
 * Belirli bir parametreyi getir
 */
export async function getParameter(key: string): Promise<any> {
  const response = await axios.get(`/system-parameter/${key}`);
  return response.data;
}

/**
 * Parametre oluştur
 */
export async function createParameter(dto: CreateParameterDto): Promise<SystemParameter> {
  const response = await axios.post('/system-parameter', dto);
  return response.data;
}

/**
 * Parametre güncelle
 */
export async function updateParameter(
  key: string,
  dto: UpdateParameterDto,
): Promise<SystemParameter> {
  const response = await axios.put(`/system-parameter/${key}`, dto);
  return response.data;
}

/**
 * Parametre sil
 */
export async function deleteParameter(key: string): Promise<void> {
  await axios.delete(`/system-parameter/${key}`);
}

/**
 * Parametre değerini boolean olarak getir
 */
export async function getParameterAsBoolean(
  key: string,
  defaultValue: boolean = false,
): Promise<boolean> {
  try {
    const value = await getParameter(key);
    return value === true || value === 'true' || value === 1;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Parametre değerini ayarla (boolean için)
 */
export async function setParameterAsBoolean(
  key: string,
  value: boolean,
  description?: string,
  category?: string,
): Promise<SystemParameter> {
  return updateParameter(key, {
    value,
    description,
    category,
  });
}
