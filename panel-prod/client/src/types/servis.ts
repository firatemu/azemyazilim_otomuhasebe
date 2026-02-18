// Service Module Types

export type WorkOrderStatus =
  | 'ACCEPTED'
  | 'DIAGNOSIS'
  | 'WAITING_FOR_APPROVAL'
  | 'APPROVED'
  | 'PART_WAITING'
  | 'IN_PROGRESS'
  | 'QUALITY_CONTROL'
  | 'READY_FOR_DELIVERY'
  | 'INVOICED'
  | 'CLOSED'
  | 'CANCELLED';

export type WorkOrderLineType = 'LABOR' | 'PART';
export type PartSource = 'STOCK_DIRECT' | 'SUPPLY_REQUEST';
export type SupplyRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Vehicle {
  id: string;
  tenantId: string;
  plateNumber: string;
  vin?: string;
  brand: string;
  model: string;
  year?: number;
  firstRegistrationDate?: string;
  engineSize?: string;
  fuelType?: string;
  color?: string;
  mileage?: number;
  customerId: string;
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  unvan?: string;
  cariKodu?: string;
  ad?: string;
  soyad?: string;
  telefon?: string;
  email?: string;
}

export interface Technician {
  id: string;
  tenantId: string;
  code: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  specialization?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderLine {
  id: string;
  workOrderId: string;
  lineType: WorkOrderLineType;
  description?: string;
  laborHours?: number;
  hourlyRate?: number;
  productId?: string;
  product?: {
    id: string;
    stokAdi: string;
    stokKodu: string;
  };
  quantity: number;
  unitPrice?: number | null; // nullable - stoktan karşılama için null
  discountRate: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  isUsed: boolean;
  usedAt?: string;
  // Parça kaynağı ve tedarik isteği durumu
  partSource?: PartSource;
  supplyRequestStatus?: SupplyRequestStatus;
  requestedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  approver?: {
    id: string;
    email: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderAuditLog {
  id: string;
  workOrderId: string;
  action: string;
  previousStatus?: WorkOrderStatus;
  newStatus?: WorkOrderStatus;
  technicianId?: string;
  technician?: Technician;
  details?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  tenantId: string;
  workOrderNo: string;
  vehicleId: string;
  vehicle?: Vehicle;
  customerId: string;
  customer?: Customer;
  technicianId?: string;
  technician?: Technician;
  status: WorkOrderStatus;
  acceptedAt: string;
  diagnosisAt?: string;
  approvedAt?: string;
  startedAt?: string;
  completedAt?: string;
  closedAt?: string;
  estimatedDelivery?: string;
  complaint?: string;
  findings?: string;
  internalNotes?: string;
  qualityNotes?: string;
  laborTotal: number;
  partsTotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
  lines?: WorkOrderLine[];
  auditLogs?: WorkOrderAuditLog[];
}

export interface VehicleMaintenanceReminder {
  id: string;
  tenantId: string;
  vehicleId: string;
  vehicle?: Vehicle;
  lastServiceDate: string;
  lastWorkOrderId?: string;
  lastMileage?: number;
  nextReminderDate: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper functions
export const getStatusLabel = (status: WorkOrderStatus): string => {
  const labels: Record<WorkOrderStatus, string> = {
    ACCEPTED: 'Kabul Edildi',
    DIAGNOSIS: 'Teşhis',
    WAITING_FOR_APPROVAL: 'Onay Bekliyor',
    APPROVED: 'Onaylandı',
    PART_WAITING: 'Parça Bekliyor',
    IN_PROGRESS: 'İşlemde',
    QUALITY_CONTROL: 'Kalite Kontrol',
    READY_FOR_DELIVERY: 'Teslime Hazır',
    INVOICED: 'Faturalandı',
    CLOSED: 'Kapatıldı',
    CANCELLED: 'İptal Edildi',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: WorkOrderStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const colors: Record<WorkOrderStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    ACCEPTED: 'info',
    DIAGNOSIS: 'secondary',
    WAITING_FOR_APPROVAL: 'warning',
    APPROVED: 'primary',
    PART_WAITING: 'warning',
    IN_PROGRESS: 'primary',
    QUALITY_CONTROL: 'info',
    READY_FOR_DELIVERY: 'success',
    INVOICED: 'success',
    CLOSED: 'default',
    CANCELLED: 'error',
  };
  return colors[status] || 'default';
};

export const getStatusBgColor = (status: WorkOrderStatus): string => {
  const colors: Record<WorkOrderStatus, string> = {
    ACCEPTED: '#e3f2fd',
    DIAGNOSIS: '#f3e5f5',
    WAITING_FOR_APPROVAL: '#fff3e0',
    APPROVED: '#e8f5e9',
    PART_WAITING: '#fff8e1',
    IN_PROGRESS: '#bbdefb',
    QUALITY_CONTROL: '#e1f5fe',
    READY_FOR_DELIVERY: '#c8e6c9',
    INVOICED: '#a5d6a7',
    CLOSED: '#eeeeee',
    CANCELLED: '#ffcdd2',
  };
  return colors[status] || '#f5f5f5';
};

export const allStatuses: WorkOrderStatus[] = [
  'ACCEPTED',
  'DIAGNOSIS',
  'WAITING_FOR_APPROVAL',
  'APPROVED',
  'PART_WAITING',
  'IN_PROGRESS',
  'QUALITY_CONTROL',
  'READY_FOR_DELIVERY',
  'INVOICED',
  'CLOSED',
  'CANCELLED',
];

// Geçerli durum geçişleri (backend ile uyumlu)
export const VALID_STATUS_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  ACCEPTED: ['DIAGNOSIS', 'CANCELLED'],
  DIAGNOSIS: ['WAITING_FOR_APPROVAL', 'CANCELLED'],
  WAITING_FOR_APPROVAL: ['APPROVED', 'CANCELLED'],
  APPROVED: ['PART_WAITING', 'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'CANCELLED'],
  PART_WAITING: ['IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'CANCELLED'],
  IN_PROGRESS: ['QUALITY_CONTROL', 'PART_WAITING', 'WAITING_FOR_APPROVAL', 'CANCELLED'],
  QUALITY_CONTROL: ['READY_FOR_DELIVERY', 'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'CANCELLED'],
  READY_FOR_DELIVERY: ['INVOICED', 'WAITING_FOR_APPROVAL', 'CANCELLED'],
  INVOICED: ['CLOSED', 'CANCELLED'],
  CLOSED: [],
  CANCELLED: [],
};

// Mevcut durumdan geçilebilecek durumları getir
export const getValidNextStatuses = (currentStatus: WorkOrderStatus): WorkOrderStatus[] => {
  return VALID_STATUS_TRANSITIONS[currentStatus] || [];
};

// Kanban'da gösterilecek durumlar (sıralı)
export const kanbanStatuses: WorkOrderStatus[] = [
  'ACCEPTED',
  'DIAGNOSIS',
  'WAITING_FOR_APPROVAL',
  'APPROVED',
  'PART_WAITING',
  'IN_PROGRESS',
  'QUALITY_CONTROL',
  'READY_FOR_DELIVERY',
];

