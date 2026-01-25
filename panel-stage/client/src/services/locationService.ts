// TurkiyeAPI Integration for Turkish Location Data
// API Documentation: https://turkiyeapi.dev/docs

const TURKIYE_API_BASE = 'https://turkiyeapi.dev/api/v1';

export interface Province {
  id: number;
  name: string;
  population: number;
  area: number;
  isMetropolitan?: boolean;
}

export interface District {
  id: number;
  name: string;
  population: number;
  area: number;
  provinceId?: number;
}

export interface Neighborhood {
  id: number;
  name: string;
  population?: number;
  districtId?: number;
}

/**
 * Location Service for Turkish Administrative Divisions
 * Uses TurkiyeAPI (MIT License, Open Source)
 */
export const locationService = {
  /**
   * Get all provinces (81 provinces in Turkey)
   */
  getProvinces: async (): Promise<Province[]> => {
    try {
      const response = await fetch(`${TURKIYE_API_BASE}/provinces?fields=id,name,population,area,isMetropolitan`);
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  },

  /**
   * Get districts for a specific province
   * @param provinceId - Province ID (1-81)
   */
  getDistricts: async (provinceId: number): Promise<District[]> => {
    try {
      const response = await fetch(`${TURKIYE_API_BASE}/provinces/${provinceId}?extend=districts`);
      if (!response.ok) {
        throw new Error('Failed to fetch districts');
      }
      const data = await response.json();
      return data.data?.districts || [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  },

  /**
   * Get neighborhoods for a specific province
   * @param provinceId - Province ID (1-81)
   */
  getNeighborhoods: async (provinceId: number): Promise<Neighborhood[]> => {
    try {
      const response = await fetch(`${TURKIYE_API_BASE}/provinces/${provinceId}?extend=neighborhoods`);
      if (!response.ok) {
        throw new Error('Failed to fetch neighborhoods');
      }
      const data = await response.json();
      return data.data?.neighborhoods || [];
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
      return [];
    }
  },

  /**
   * Search provinces by name
   * @param query - Search query
   */
  searchProvinces: async (query: string): Promise<Province[]> => {
    try {
      const response = await fetch(`${TURKIYE_API_BASE}/provinces?name=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search provinces');
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching provinces:', error);
      return [];
    }
  },

  /**
   * Find province by name (exact match)
   * @param name - Province name
   */
  findProvinceByName: async (name: string): Promise<Province | null> => {
    try {
      const provinces = await locationService.getProvinces();
      return provinces.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
    } catch (error) {
      console.error('Error finding province:', error);
      return null;
    }
  },

  /**
   * Find district by name within a province
   * @param provinceId - Province ID
   * @param districtName - District name
   */
  findDistrictByName: async (provinceId: number, districtName: string): Promise<District | null> => {
    try {
      const districts = await locationService.getDistricts(provinceId);
      return districts.find(d => d.name.toLowerCase() === districtName.toLowerCase()) || null;
    } catch (error) {
      console.error('Error finding district:', error);
      return null;
    }
  },
};

export default locationService;
