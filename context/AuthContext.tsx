import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, ShopProfile } from '../types';
import { api, setUnauthorizedHandler } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  shop: ShopProfile | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean | null;
  requestOtp: (phone: string) => Promise<{ success: boolean; message: string; devOtp?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; needsRegistration?: boolean; message?: string }>;
  registerShop: (data: { phone: string; shopName: string; ownerName: string; address?: any }) => Promise<{ success: boolean }>;
  updateShopProfile: (data: { name?: string; ownerName?: string; phone?: string; address?: any; settings?: any }) => Promise<ShopProfile | null>;
  refreshShopProfile: () => Promise<ShopProfile | null>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setShop(null);
    });
    loadStoredSession();

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const loadStoredSession = async () => {
    try {
      const [storedToken, storedUser, storedShop, onboardingStatus] = await Promise.all([
        AsyncStorage.getItem('@repairshop_token'),
        AsyncStorage.getItem('@repairshop_user'),
        AsyncStorage.getItem('@repairshop_shop'),
        AsyncStorage.getItem('@datadaddy_onboarding_completed'),
      ]);

      setHasCompletedOnboarding(onboardingStatus === 'true');

      if (!storedToken || !storedUser || !storedShop) {
        await AsyncStorage.multiRemove([
          '@repairshop_token',
          '@repairshop_user',
          '@repairshop_shop',
        ]);
        setUser(null);
        setShop(null);
        return;
      }

      setUser(JSON.parse(storedUser));
      setShop(JSON.parse(storedShop));

      // Refresh and validate shop profile from DB in background
      const freshShop = await api.getShopProfile();
      if (freshShop) {
        setShop(freshShop);
        await AsyncStorage.setItem('@repairshop_shop', JSON.stringify(freshShop));
      } else {
        // If getting profile returned null (e.g. invalid/expired token), clean session
        await logout();
      }
    } catch {
      await logout();
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

  const updateShopProfile = async (data: {
    name?: string;
    ownerName?: string;
    phone?: string;
    address?: any;
    settings?: any;
  }) => {
    setIsLoading(true);
    try {
      const updatedShop = await api.updateShopProfile(data);
      if (updatedShop) {
        setShop(updatedShop);
        await AsyncStorage.setItem('@repairshop_shop', JSON.stringify(updatedShop));
        if (data.ownerName || data.phone) {
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  ...(data.ownerName && { name: data.ownerName }),
                  ...(data.phone && { phone: data.phone }),
                }
              : null
          );
        }
      }
      return updatedShop;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshShopProfile = async () => {
    try {
      const fresh = await api.getShopProfile();
      if (fresh) {
        setShop(fresh);
        await AsyncStorage.setItem('@repairshop_shop', JSON.stringify(fresh));
      }
      return fresh;
    } catch {
      return null;
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
        updateShopProfile,
        refreshShopProfile,
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
