import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  JobCard,
  CustomerItem,
  ExpenseItem,
  RepairGuideItem,
  DashboardSummary,
  JobStatus,
  ShopProfile,
  UserProfile,
} from '../types';

// Base URL for backend API (Live Render deployment with local/env fallback)
const LIVE_API_BASE_URL = 'https://data-daddy-backend.onrender.com/api';

const getBackendBaseUrl = (): string => {
  let url = process.env.EXPO_PUBLIC_API_URL || LIVE_API_BASE_URL;

  // Auto-correct https://localhost or https://127.0.0.1 to http://
  if (url.startsWith('https://localhost') || url.startsWith('https://127.0.0.1')) {
    url = url.replace('https://', 'http://');
  }

  // On native mobile (Android/iOS), resolve localhost/127.0.0.1 to host machine IP or Android emulator gateway
  if (Platform.OS !== 'web' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
      const hostIp = hostUri.split(':')[0];
      if (hostIp) {
        return url.replace('localhost', hostIp).replace('127.0.0.1', hostIp);
      }
    }
    if (Platform.OS === 'android') {
      return url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
    }
  }

  return url;
};

/**
 * Resolve direct S3 URLs, relative upload paths, or S3 keys to the accessible backend media streaming URL
 */
export const resolveImageUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;

  // If already a full http/https url (non-S3)
  if (url.includes('.amazonaws.com/')) {
    const key = url.split('.amazonaws.com/')[1];
    const baseUrl = getBackendBaseUrl();
    return `${baseUrl}/uploads/media/${key}`;
  }

  // If it's a relative URL starting with /api/uploads/
  if (url.startsWith('/api/uploads/')) {
    const base = getBackendBaseUrl().replace(/\/api\/?$/, '');
    return `${base}${url}`;
  }

  // If relative URL starting with /uploads/
  if (url.startsWith('/uploads/')) {
    const base = getBackendBaseUrl();
    return `${base}${url}`;
  }

  // If it's a raw S3 key
  if (url.startsWith('profiles/') || url.startsWith('general/') || url.startsWith('banners/')) {
    const base = getBackendBaseUrl();
    return `${base}/uploads/media/${url}`;
  }

  return url;
};

let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedHandler = (cb: (() => void) | null) => {
  onUnauthorizedCallback = cb;
};

export const apiClient = axios.create({
  baseURL: getBackendBaseUrl(),
  timeout: 30000, // 30s timeout for cloud cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@repairshop_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignore storage read error
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.multiRemove([
          '@repairshop_token',
          '@repairshop_user',
          '@repairshop_shop',
        ]);
      } catch {
        // Ignore storage removal error
      }
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  async requestOtp(phone: string) {
    const res = await apiClient.post('/auth/otp/request', { phone });
    return res.data;
  },

  async verifyOtp(phone: string, otp: string) {
    const res = await apiClient.post('/auth/otp/verify', { phone, otp });
    if (res.data?.token) {
      await AsyncStorage.setItem('@repairshop_token', res.data.token);
    }
    return res.data;
  },

  async registerShop(data: { phone: string; shopName: string; ownerName: string; address?: any }) {
    const res = await apiClient.post('/auth/register', data);
    if (res.data?.token) {
      await AsyncStorage.setItem('@repairshop_token', res.data.token);
    }
    return res.data;
  },

  // Shop Profile & Settings
  async getShopProfile(): Promise<ShopProfile | null> {
    try {
      const res = await apiClient.get('/shops/profile');
      return res.data?.shop || null;
    } catch {
      return null;
    }
  },

  async updateShopProfile(data: {
    name?: string;
    ownerName?: string;
    phone?: string;
    logoUrl?: string;
    address?: any;
    settings?: any;
  }): Promise<ShopProfile | null> {
    const res = await apiClient.patch('/shops/profile', data);
    return res.data?.shop || null;
  },

  /**
   * Upload Profile Photo / Shop Logo to AWS S3
   */
  async uploadProfilePhoto(
    fileUri: string,
    mimeType: string = 'image/jpeg',
    fileName: string = 'profile.jpg'
  ): Promise<{ success: boolean; url: string; key?: string; message?: string }> {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      // In Web mode, fetch blob from uri and append
      const res = await fetch(fileUri);
      const blob = await res.blob();
      formData.append('image', blob, fileName);
    } else {
      // In native iOS / Android
      formData.append('image', {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      } as any);
    }

    const res = await apiClient.post('/uploads/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  },

  /**
   * Upload Device / Product Photo to AWS S3 (for repair job cards)
   */
  async uploadDevicePhoto(
    fileUri: string,
    mimeType: string = 'image/jpeg',
    fileName: string = 'device.jpg'
  ): Promise<{ success: boolean; url: string; key?: string; message?: string }> {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      const res = await fetch(fileUri);
      const blob = await res.blob();
      formData.append('image', blob, fileName);
    } else {
      formData.append('image', {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      } as any);
    }
    formData.append('folder', 'repairs');

    const res = await apiClient.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  },

  // Staff Management
  async getStaff(): Promise<any[]> {
    try {
      const res = await apiClient.get('/shops/staff');
      return res.data?.staff || [];
    } catch {
      return [];
    }
  },

  async addStaff(data: { name: string; phone: string; role?: string }): Promise<any> {
    const res = await apiClient.post('/shops/staff', data);
    return res.data?.staff;
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const res = await apiClient.get('/analytics/summary');
      return (
        res.data?.data || {
          jobs: { pending: 0, inProgress: 0, partsDelayed: 0, readyForPickup: 0, delivered: 0, todayNew: 0 },
          financials: { totalRevenue: 0, totalExpense: 0, netProfit: 0, totalDuesPending: 0 },
        }
      );
    } catch {
      return {
        jobs: { pending: 0, inProgress: 0, partsDelayed: 0, readyForPickup: 0, delivered: 0, todayNew: 0 },
        financials: { totalRevenue: 0, totalExpense: 0, netProfit: 0, totalDuesPending: 0 },
      };
    }
  },

  // Jobs / Orders
  async getJobs(params?: {
    status?: string;
    search?: string;
    dateRange?: 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
  }): Promise<JobCard[]> {
    try {
      const res = await apiClient.get('/orders', { params });
      return res.data?.orders || [];
    } catch {
      return [];
    }
  },

  async getJobById(id: string): Promise<JobCard | null> {
    try {
      const res = await apiClient.get(`/orders/${id}`);
      return res.data?.order || null;
    } catch {
      return null;
    }
  },

  async createJob(data: any): Promise<JobCard> {
    const res = await apiClient.post('/orders', data);
    return res.data?.order;
  },

  async updateJobStatus(
    id: string,
    status: JobStatus,
    extraData?: {
      serialOrImei?: string;
      warranty?: {
        hasWarranty: boolean;
        period?: number;
        unit?: 'days' | 'months' | 'years';
      };
    }
  ): Promise<JobCard | null> {
    try {
      const res = await apiClient.patch(`/orders/${id}/status`, { status, ...extraData });
      return res.data?.order || null;
    } catch {
      return null;
    }
  },

  async addPayment(id: string, amount: number, mode: 'cash' | 'upi' | 'card'): Promise<JobCard | null> {
    try {
      const res = await apiClient.post(`/orders/${id}/payments`, { amount, mode });
      return res.data?.order || null;
    } catch {
      return null;
    }
  },

  // Customers
  async getCustomers(params?: string | {
    search?: string;
    dateRange?: 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
  }): Promise<CustomerItem[]> {
    try {
      const queryParams = typeof params === 'string' ? { search: params } : params;
      const res = await apiClient.get('/customers', { params: queryParams });
      return res.data?.customers || [];
    } catch {
      return [];
    }
  },

  async addCustomer(data: { name: string; phone: string; address?: string; email?: string }): Promise<CustomerItem> {
    const res = await apiClient.post('/customers', data);
    return res.data?.customer;
  },

  // Expenses
  async getExpenses(): Promise<ExpenseItem[]> {
    try {
      const res = await apiClient.get('/expenses');
      return res.data?.expenses || [];
    } catch {
      return [];
    }
  },

  async addExpense(data: { category: any; title: string; amount: number; note?: string }): Promise<ExpenseItem> {
    const res = await apiClient.post('/expenses', data);
    return res.data?.expense;
  },

  // Guides
  async getGuides(params?: { brand?: string; search?: string }): Promise<RepairGuideItem[]> {
    try {
      const res = await apiClient.get('/guides', { params });
      return res.data?.guides || [];
    } catch {
      return [];
    }
  },

  async getGuideById(id: string): Promise<RepairGuideItem | null> {
    try {
      const res = await apiClient.get(`/guides/${id}`);
      return res.data?.guide || null;
    } catch {
      return null;
    }
  },

  // Notifications
  async getNotifications(): Promise<any[]> {
    try {
      const res = await apiClient.get('/notifications');
      return res.data?.notifications || [];
    } catch {
      return [];
    }
  },
};
