import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  mockShop,
  mockUser,
  mockJobs,
  mockCustomers,
  mockExpenses,
  mockDashboard,
  mockGuides,
} from './mockData';
import { JobCard, CustomerItem, ExpenseItem, RepairGuideItem, DashboardSummary, JobStatus } from '../types';

// Dynamically resolve backend host from Expo packager when on local network/device
const getBackendBaseUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
};

export const apiClient = axios.create({
  baseURL: getBackendBaseUrl(),
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@repairshop_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignore storage read error
  }
  return config;
});

// In-memory local fallback store
let localJobs: JobCard[] = [...mockJobs];
let localCustomers: CustomerItem[] = [...mockCustomers];
let localExpenses: ExpenseItem[] = [...mockExpenses];

export const api = {
  // Auth
  async requestOtp(phone: string) {
    try {
      const res = await apiClient.post('/auth/otp/request', { phone });
      return res.data;
    } catch {
      return { success: true, message: 'OTP sent (Demo Mode: use 123456)', devOtp: '123456' };
    }
  },

  async verifyOtp(phone: string, otp: string) {
    try {
      const res = await apiClient.post('/auth/otp/verify', { phone, otp });
      if (res.data.token) {
        await AsyncStorage.setItem('@repairshop_token', res.data.token);
      }
      return res.data;
    } catch {
      // Mock verify
      const mockToken = 'mock_jwt_token_demo_repairshop';
      await AsyncStorage.setItem('@repairshop_token', mockToken);
      return {
        success: true,
        needsRegistration: false,
        token: mockToken,
        user: mockUser,
        shop: mockShop,
      };
    }
  },

  async registerShop(data: { phone: string; shopName: string; ownerName: string; address?: any }) {
    try {
      const res = await apiClient.post('/auth/register', data);
      if (res.data.token) {
        await AsyncStorage.setItem('@repairshop_token', res.data.token);
      }
      return res.data;
    } catch {
      const mockToken = 'mock_jwt_token_demo_repairshop';
      await AsyncStorage.setItem('@repairshop_token', mockToken);
      return {
        success: true,
        token: mockToken,
        user: { ...mockUser, name: data.ownerName, phone: data.phone },
        shop: { ...mockShop, name: data.shopName, ownerName: data.ownerName, phone: data.phone },
      };
    }
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const res = await apiClient.get('/analytics/summary');
      return res.data.data;
    } catch {
      // Calculate dynamic numbers from local store
      const pending = localJobs.filter((j) => j.status === 'pending').length;
      const inProgress = localJobs.filter((j) => j.status === 'in_progress').length;
      const partsDelayed = localJobs.filter((j) => j.status === 'parts_delayed').length;
      const readyForPickup = localJobs.filter((j) => j.status === 'repaired').length;
      const delivered = localJobs.filter((j) => j.status === 'delivered').length;

      const totalRevenue = localJobs.reduce((sum, j) => sum + j.cost.advancePaid, 0);
      const totalDuesPending = localJobs.reduce((sum, j) => sum + j.cost.due, 0);
      const totalExpense = localExpenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        jobs: { pending, inProgress, partsDelayed, readyForPickup, delivered, todayNew: 2 },
        financials: { totalRevenue, totalExpense, netProfit: totalRevenue - totalExpense, totalDuesPending },
      };
    }
  },

  // Jobs
  async getJobs(params?: { status?: string; search?: string }): Promise<JobCard[]> {
    try {
      const res = await apiClient.get('/orders', { params });
      return res.data.orders;
    } catch {
      let filtered = [...localJobs];
      if (params?.status && params.status !== 'all') {
        filtered = filtered.filter((j) => j.status === params.status);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (j) =>
            j.jobId.toLowerCase().includes(q) ||
            j.brand.toLowerCase().includes(q) ||
            j.model.toLowerCase().includes(q) ||
            j.customerSnapshot.name.toLowerCase().includes(q) ||
            j.customerSnapshot.phone.includes(q)
        );
      }
      return filtered;
    }
  },

  async getJobById(id: string): Promise<JobCard | null> {
    try {
      const res = await apiClient.get(`/orders/${id}`);
      return res.data.order;
    } catch {
      return localJobs.find((j) => j._id === id || j.jobId === id) || null;
    }
  },

  async createJob(data: any): Promise<JobCard> {
    try {
      const res = await apiClient.post('/orders', data);
      return res.data.order;
    } catch {
      const newNum = 1000 + localJobs.length + 1;
      const jobId = `JOB-${newNum}`;
      const estCost = Number(data.estimatedCost || 0);
      const adv = Number(data.advancePaid || 0);

      const newJob: JobCard = {
        _id: `job_local_${Date.now()}`,
        jobId,
        shopId: 'shop_demo_01',
        customerId: data.customerId || `cust_${Date.now()}`,
        customerSnapshot: {
          name: data.customerName || 'Customer',
          phone: data.customerPhone || '9876543210',
        },
        deviceType: data.deviceType || 'mobile',
        brand: data.brand || 'Device',
        model: data.model || 'Model',
        serialOrImei: data.serialOrImei,
        passcodePattern: data.passcodePattern,
        problemDescription: data.problemDescription,
        status: 'pending',
        cost: {
          estimated: estCost,
          final: estCost,
          advancePaid: adv,
          due: Math.max(0, estCost - adv),
        },
        payments: adv > 0 ? [{ amount: adv, mode: data.paymentMode || 'cash', paidAt: new Date().toISOString() }] : [],
        smsLogs: [{ type: 'order_received', status: 'sent', providerRef: 'SMS Delivery Confirmed', sentAt: new Date().toISOString() }],
        dates: {
          receivedAt: new Date().toISOString(),
          promisedDeliveryAt: data.promisedDeliveryAt,
        },
        invoice: {
          invoiceNumber: `INV-${jobId}`,
          issuedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      };

      localJobs.unshift(newJob);
      return newJob;
    }
  },

  async updateJobStatus(id: string, status: JobStatus): Promise<JobCard | null> {
    try {
      const res = await apiClient.patch(`/orders/${id}/status`, { status });
      return res.data.order;
    } catch {
      const job = localJobs.find((j) => j._id === id || j.jobId === id);
      if (job) {
        job.status = status;
        if (status === 'repaired') {
          job.smsLogs.push({
            type: 'repaired',
            status: 'sent',
            providerRef: 'Ready for Pickup SMS',
            sentAt: new Date().toISOString(),
          });
        } else if (status === 'delivered') {
          job.dates.deliveredAt = new Date().toISOString();
          job.smsLogs.push({
            type: 'delivered',
            status: 'sent',
            providerRef: 'Delivered SMS',
            sentAt: new Date().toISOString(),
          });
        }
      }
      return job || null;
    }
  },

  async addPayment(id: string, amount: number, mode: 'cash' | 'upi' | 'card'): Promise<JobCard | null> {
    try {
      const res = await apiClient.post(`/orders/${id}/payments`, { amount, mode });
      return res.data.order;
    } catch {
      const job = localJobs.find((j) => j._id === id || j.jobId === id);
      if (job) {
        job.payments.push({ amount, mode, paidAt: new Date().toISOString() });
        const totalPaid = job.payments.reduce((s, p) => s + p.amount, 0);
        job.cost.advancePaid = totalPaid;
        job.cost.due = Math.max(0, job.cost.final - totalPaid);
      }
      return job || null;
    }
  },

  // Customers
  async getCustomers(search?: string): Promise<CustomerItem[]> {
    try {
      const res = await apiClient.get('/customers', { params: { search } });
      return res.data.customers;
    } catch {
      if (!search) return localCustomers;
      const q = search.toLowerCase();
      return localCustomers.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
      );
    }
  },

  async addCustomer(data: { name: string; phone: string; address?: string; email?: string }): Promise<CustomerItem> {
    try {
      const res = await apiClient.post('/customers', data);
      return res.data.customer;
    } catch {
      const newCust: CustomerItem = {
        _id: `cust_${Date.now()}`,
        shopId: 'shop_demo_01',
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address || '',
        totalOrdersCount: 0,
        updatedAt: new Date().toISOString(),
      };
      localCustomers.unshift(newCust);
      return newCust;
    }
  },

  // Expenses
  async getExpenses(): Promise<ExpenseItem[]> {
    try {
      const res = await apiClient.get('/expenses');
      return res.data.expenses;
    } catch {
      return localExpenses;
    }
  },

  async addExpense(data: { category: any; title: string; amount: number; note?: string }): Promise<ExpenseItem> {
    try {
      const res = await apiClient.post('/expenses', data);
      return res.data.expense;
    } catch {
      const newExp: ExpenseItem = {
        _id: `exp_${Date.now()}`,
        category: data.category,
        title: data.title,
        amount: Number(data.amount),
        note: data.note,
        date: new Date().toISOString(),
      };
      localExpenses.unshift(newExp);
      return newExp;
    }
  },

  // Guides
  async getGuides(params?: { brand?: string; search?: string }): Promise<RepairGuideItem[]> {
    try {
      const res = await apiClient.get('/guides', { params });
      return res.data.guides;
    } catch {
      return mockGuides;
    }
  },

  async getGuideById(id: string): Promise<RepairGuideItem | null> {
    try {
      const res = await apiClient.get(`/guides/${id}`);
      return res.data.guide;
    } catch {
      return mockGuides.find((g) => g._id === id) || null;
    }
  },

  // Notifications from Admin Broadcast & Shop Notifications
  async getNotifications(): Promise<any[]> {
    try {
      const res = await apiClient.get('/notifications');
      return res.data.notifications || [];
    } catch {
      return [];
    }
  },
};
