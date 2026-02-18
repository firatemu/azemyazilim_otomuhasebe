import { create } from 'zustand';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: {
    id: string;
    cariKodu: string;
    unvan: string;
  };
  orderDate: string;
  expectedDeliveryDate?: string | null;
  status: 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  notes?: string;
  items: Array<{
    id: string;
    orderedQuantity: number;
    receivedQuantity: number;
    status: 'PENDING' | 'PARTIAL' | 'COMPLETED';
  }>;
}

export interface PurchaseOrderFilters {
  status?: 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED';
  supplierId?: string;
  dateRange?: [Date, Date];
  search?: string;
}

interface PurchaseOrderState {
  orders: PurchaseOrder[];
  selectedOrder: PurchaseOrder | null;
  filters: PurchaseOrderFilters;
  setOrders: (orders: PurchaseOrder[]) => void;
  setSelectedOrder: (order: PurchaseOrder | null) => void;
  setFilters: (filters: PurchaseOrderFilters) => void;
}

export const usePurchaseOrderStore = create<PurchaseOrderState>((set) => ({
  orders: [],
  selectedOrder: null,
  filters: {},
  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (selectedOrder) => set({ selectedOrder }),
  setFilters: (filters) => set({ filters }),
}));

