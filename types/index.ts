export type DeviceType = 'mobile' | 'laptop' | 'tablet' | 'smartwatch' | 'other';

export type JobStatus = 'pending' | 'in_progress' | 'parts_delayed' | 'repaired' | 'delivered' | 'canceled';

export interface PaymentItem {
  amount: number;
  mode: 'cash' | 'upi' | 'card' | 'online';
  paidAt: string;
}

export interface SmsLogItem {
  type: 'order_received' | 'repaired' | 'delivered';
  status: 'sent' | 'failed' | 'simulated';
  providerRef?: string;
  sentAt: string;
}

export interface JobCard {
  _id: string;
  jobId: string; // e.g. "JOB-1001"
  shopId: string;
  customerId: string;
  customerSnapshot: {
    name: string;
    phone: string;
  };
  deviceType: DeviceType;
  brand: string;
  model: string;
  serialOrImei?: string;
  passcodePattern?: string;
  problemDescription: string;
  status: JobStatus;
  cost: {
    estimated: number;
    final: number;
    advancePaid: number;
    due: number;
  };
  warranty?: {
    hasWarranty: boolean;
    period?: number;
    unit?: 'days' | 'months' | 'years';
    expiresAt?: string;
  };
  payments: PaymentItem[];
  smsLogs: SmsLogItem[];
  dates: {
    receivedAt: string;
    promisedDeliveryAt?: string;
    deliveredAt?: string;
  };
  invoice?: {
    invoiceNumber: string;
    issuedAt: string;
  };
  createdAt: string;
}

export interface CustomerItem {
  _id: string;
  shopId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrdersCount: number;
  updatedAt: string;
}

export interface ExpenseItem {
  _id: string;
  category: 'spare_part' | 'rent' | 'salary' | 'utilities' | 'tools' | 'other';
  title: string;
  amount: number;
  note?: string;
  date: string;
}

export interface RepairGuideItem {
  _id: string;
  title: string;
  brand: string;
  model: string;
  problemCategory: 'display' | 'battery' | 'charging_port' | 'motherboard' | 'water_damage' | 'software' | 'camera' | 'speaker';
  summary: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  isPremium: boolean;
  steps?: Array<{
    stepNumber: number;
    title: string;
    description: string;
    warning?: string;
  }>;
  videoUrl?: string;
  schematicUrl?: string;
}

export interface DashboardSummary {
  jobs: {
    pending: number;
    inProgress: number;
    partsDelayed: number;
    readyForPickup: number;
    delivered: number;
    todayNew: number;
  };
  financials: {
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
    totalDuesPending: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: 'owner' | 'technician' | 'staff';
}

export interface ShopAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface ShopSettings {
  currency?: string;
  smsNotificationsEnabled?: boolean;
  nextJobNumber?: number;
}

export interface ShopProfile {
  _id?: string;
  id?: string;
  name: string;
  ownerName: string;
  phone: string;
  address?: ShopAddress | string;
  plan?: 'free' | 'pro';
  subscriptionStatus?: 'active' | 'expired' | 'canceled';
  subscription?: {
    plan: 'free' | 'pro';
    status: 'active' | 'expired' | 'canceled';
  };
  settings?: ShopSettings;
}
