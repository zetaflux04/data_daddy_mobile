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

// Direct public S3 base URL for the bucket
const S3_BUCKET_NAME = 'datadaddy2026';
const S3_REGION = 'ap-south-1';
const S3_PUBLIC_BASE = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com`;

/**
 * Resolve image URLs for display in React Native Image components.
 *
 * Strategy:
 *  - Full S3 amazonaws.com URLs → served DIRECTLY from S3 (fastest, no proxy, works in APK)
 *  - Raw S3 keys (profiles/, repairs/, general/, banners/) → direct S3 URL
 *  - Relative API paths (/api/uploads/ or /uploads/) → routed through backend proxy
 *  - Any other http/https URL → returned as-is
 *
 * Why direct S3 and not the backend proxy?
 * The backend proxy uses Node.js stream piping (s3Response.Body.pipe(res)) which
 * produces chunked transfer-encoded responses. Android's native Image component
 * does not reliably handle chunked responses from a Node server, causing blank
 * images in production APK builds (while Expo Go works fine because it uses a
 * different network layer internally).
 */
export const resolveImageUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;

  // Already a full S3 URL — serve directly, no proxy
  if (url.includes('.amazonaws.com/')) {
    return url;
  }

  // Raw S3 key (e.g. "profiles/shopId/timestamp.jpg", "repairs/...", "general/...")
  if (
    url.startsWith('profiles/') ||
    url.startsWith('repairs/') ||
    url.startsWith('general/') ||
    url.startsWith('banners/')
  ) {
    return `${S3_PUBLIC_BASE}/${url}`;
  }

  // Relative URL starting with /api/uploads/ — route through backend
  if (url.startsWith('/api/uploads/')) {
    const base = getBackendBaseUrl().replace(/\/api\/?$/, '');
    return `${base}${url}`;
  }

  // Relative URL starting with /uploads/ — route through backend
  if (url.startsWith('/uploads/')) {
    const base = getBackendBaseUrl();
    return `${base}${url}`;
  }

  return url;
};

/**
 * Returns both the direct S3 URL (primary) and backend proxy URL (fallback).
 * Used with S3Image component which transparently handles old private + new public objects.
 */
export const resolveImageUrls = (url?: string | null): { uri: string; proxyUri: string } | undefined => {
  if (!url) return undefined;

  let s3Key: string | null = null;

  if (url.includes('.amazonaws.com/')) {
    s3Key = url.split('.amazonaws.com/')[1];
  } else if (
    url.startsWith('profiles/') ||
    url.startsWith('repairs/') ||
    url.startsWith('general/') ||
    url.startsWith('banners/')
  ) {
    s3Key = url;
  }

  if (s3Key) {
    return {
      uri: `${S3_PUBLIC_BASE}/${s3Key}`,
      proxyUri: `${getBackendBaseUrl()}/uploads/media/${s3Key}`,
    };
  }

  const resolved = resolveImageUrl(url);
  if (!resolved) return undefined;
  return { uri: resolved, proxyUri: resolved };
};


/**
 * Detect MIME type from file URI extension (fallback for Android where asset.mimeType can be undefined)
 */
const getMimeTypeFromUri = (uri: string): string => {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'image/jpeg';
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
   * Uses native fetch() instead of Axios — required for correct binary file handling
   * on Android APK. Axios's default Content-Type: application/json header and its
   * transformRequest pipeline interfere with FormData binary reading on native Android.
   */
  async uploadProfilePhoto(
    fileUri: string,
    mimeType: string = 'image/jpeg',
    fileName: string = 'profile.jpg'
  ): Promise<{ success: boolean; url: string; key?: string; message?: string }> {
    const resolvedMime = mimeType || getMimeTypeFromUri(fileUri) || 'image/jpeg';
    const formData = new FormData();

    if (Platform.OS === 'web') {
      // Web: fetch the blob from the data URI first
      const blobRes = await fetch(fileUri);
      const blob = await blobRes.blob();
      formData.append('image', blob, fileName);
    } else {
      // Native Android/iOS: pass the file object — React Native's native
      // networking resolves file:// and content:// URIs at the OS level
      (formData as any).append('image', {
        uri: fileUri,
        name: fileName,
        type: resolvedMime,
      });
    }

    // Read auth token to pass as Bearer header
    const token = await AsyncStorage.getItem('@repairshop_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // IMPORTANT: Do NOT set Content-Type manually.
    // Native fetch automatically sets: Content-Type: multipart/form-data; boundary=...
    // Setting it manually removes the boundary and breaks multipart parsing on the server.

    const fetchRes = await fetch(`${getBackendBaseUrl()}/uploads/profile`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!fetchRes.ok) {
      const errData = await fetchRes.json().catch(() => ({}));
      throw new Error((errData as any).message || `Upload failed: HTTP ${fetchRes.status}`);
    }

    return fetchRes.json();
  },


  /**
   * Upload Device / Product Photo to AWS S3 (for repair job cards)
   * Uses native fetch() instead of Axios — same reason as uploadProfilePhoto.
   */
  async uploadDevicePhoto(
    fileUri: string,
    mimeType: string = 'image/jpeg',
    fileName: string = 'device.jpg'
  ): Promise<{ success: boolean; url: string; key?: string; message?: string }> {
    const resolvedMime = mimeType || getMimeTypeFromUri(fileUri) || 'image/jpeg';
    const formData = new FormData();

    if (Platform.OS === 'web') {
      const blobRes = await fetch(fileUri);
      const blob = await blobRes.blob();
      formData.append('image', blob, fileName);
    } else {
      (formData as any).append('image', {
        uri: fileUri,
        name: fileName,
        type: resolvedMime,
      });
    }
    // Append folder for repair photos
    formData.append('folder', 'repairs');

    const token = await AsyncStorage.getItem('@repairshop_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Do NOT set Content-Type — native fetch sets multipart/form-data with boundary

    const fetchRes = await fetch(`${getBackendBaseUrl()}/uploads/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!fetchRes.ok) {
      const errData = await fetchRes.json().catch(() => ({}));
      throw new Error((errData as any).message || `Upload failed: HTTP ${fetchRes.status}`);
    }

    return fetchRes.json();
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
