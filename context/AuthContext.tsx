import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, ShopProfile } from '../types';
import { api } from '../services/api';
import { mockUser, mockShop } from '../services/mockData';

interface AuthContextType {
  user: UserProfile | null;
  shop: ShopProfile | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean | null;
  requestOtp: (phone: string) => Promise<{ success: boolean; message: string; devOtp?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; needsRegistration?: boolean; message?: string }>;
  registerShop: (data: { phone: string; shopName: string; ownerName: string; address?: any }) => Promise<{ success: boolean }>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with default demo user & shop so app can be tested immediately
  const [user, setUser] = useState<UserProfile | null>(mockUser);
  const [shop, setShop] = useState<ShopProfile | null>(mockShop);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const [storedUser, storedShop, onboardingStatus] = await Promise.all([
        AsyncStorage.getItem('@repairshop_user'),
        AsyncStorage.getItem('@repairshop_shop'),
        AsyncStorage.getItem('@datadaddy_onboarding_completed'),
      ]);
      if (storedUser && storedShop) {
        setUser(JSON.parse(storedUser));
        setShop(JSON.parse(storedShop));
      }
      setHasCompletedOnboarding(onboardingStatus === 'true');
    } catch {
      setHasCompletedOnboarding(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@datadaddy_onboarding_completed', 'true');
      setHasCompletedOnboarding(true);
    } catch (e) {
      setHasCompletedOnboarding(true);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('@datadaddy_onboarding_completed');
      setHasCompletedOnboarding(false);
    } catch (e) {
      setHasCompletedOnboarding(false);
    }
  };

  const requestOtp = async (phone: string) => {
    setIsLoading(true);
    try {
      const res = await api.requestOtp(phone);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await api.verifyOtp(phone, otp);
      if (res.success && !res.needsRegistration && res.user && res.shop) {
        setUser(res.user);
        setShop(res.shop);
        await AsyncStorage.setItem('@repairshop_user', JSON.stringify(res.user));
        await AsyncStorage.setItem('@repairshop_shop', JSON.stringify(res.shop));
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const registerShop = async (data: { phone: string; shopName: string; ownerName: string; address?: any }) => {
    setIsLoading(true);
    try {
      const res = await api.registerShop(data);
      if (res.success && res.user && res.shop) {
        setUser(res.user);
        setShop(res.shop);
        await AsyncStorage.setItem('@repairshop_user', JSON.stringify(res.user));
        await AsyncStorage.setItem('@repairshop_shop', JSON.stringify(res.shop));
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@repairshop_token');
    await AsyncStorage.removeItem('@repairshop_user');
    await AsyncStorage.removeItem('@repairshop_shop');
    setUser(null);
    setShop(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        shop,
        isLoading,
        hasCompletedOnboarding,
        requestOtp,
        verifyOtp,
        registerShop,
        completeOnboarding,
        resetOnboarding,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
