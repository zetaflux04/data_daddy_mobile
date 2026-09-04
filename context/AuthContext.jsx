import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setUnauthorizedHandler } from '../services/api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [shop, setShop] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null);
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
            }
            else {
                // If getting profile returned null (e.g. invalid/expired token), clean session
                await logout();
            }
        }
        catch {
            await logout();
            setHasCompletedOnboarding(false);
        }
    };
    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('@datadaddy_onboarding_completed', 'true');
            setHasCompletedOnboarding(true);
        }
        catch (e) {
            setHasCompletedOnboarding(true);
        }
    };
    const resetOnboarding = async () => {
        try {
            await AsyncStorage.removeItem('@datadaddy_onboarding_completed');
            setHasCompletedOnboarding(false);
        }
        catch (e) {
            setHasCompletedOnboarding(false);
        }
    };
    const requestOtp = async (phone) => {
        setIsLoading(true);
        try {
            const res = await api.requestOtp(phone);
            return res;
        }
        finally {
            setIsLoading(false);
        }
    };
    const verifyOtp = async (phone, otp) => {
        setIsLoading(true);
        try {
            const res = await api.verifyOtp(phone, otp);
            if (res.success && !res.needsRegistration && res.user && res.shop) {
                setUser(res.user);
                setShop(res.shop);
                await AsyncStorage.setItem('@repairshop_user', JSON.stringify(res.user));
                await AsyncStorage.setItem('@repairshop_shop', JSON.stringify(res.shop));
                // Fetch fresh shop profile from DB in background to ensure all fields are synchronized
                api.getShopProfile().then((fresh) => {
                    if (fresh) {
                        setShop(fresh);
                        AsyncStorage.setItem('@repairshop_shop', JSON.stringify(fresh)).catch(() => { });
                    }
                }).catch(() => { });
            }
            return res;
        }
        finally {
            setIsLoading(false);
        }
    };
    const registerShop = async (data) => {
        setIsLoading(true);
        try {
            const res = await api.registerShop(data);
            if (res.success && res.user && res.shop) {
                setUser(res.user);
                setShop(res.shop);
                await AsyncStorage.setItem('@repairshop_user', JSON.stringify(res.user));
                await AsyncStorage.setItem('@repairshop_shop', JSON.stringify(res.shop));
                api.getShopProfile().then((fresh) => {
                    if (fresh) {
                        setShop(fresh);
                        AsyncStorage.setItem('@repairshop_shop', JSON.stringify(fresh)).catch(() => { });
                    }
                }).catch(() => { });
            }
            return res;
        }
        finally {
            setIsLoading(false);
        }
    };
    const updateShopProfile = async (data) => {
        setIsLoading(true);
        try {
            const updatedShop = await api.updateShopProfile(data);
            if (updatedShop) {
                setShop(updatedShop);
                await AsyncStorage.setItem('@repairshop_shop', JSON.stringify(updatedShop));
                if (data.ownerName || data.phone || data.logoUrl) {
                    setUser((prev) => prev
                        ? {
                            ...prev,
                            ...(data.ownerName && { name: data.ownerName }),
                            ...(data.phone && { phone: data.phone }),
                            ...(data.logoUrl && { avatarUrl: data.logoUrl }),
                        }
                        : null);
                }
            }
            return updatedShop;
        }
        finally {
            setIsLoading(false);
        }
    };
    const uploadShopLogo = async (fileUri, mimeType, fileName) => {
        setIsLoading(true);
        try {
            const res = await api.uploadProfilePhoto(fileUri, mimeType, fileName);
            if (res.success && res.url) {
                const newUrl = res.url;
                setShop((prev) => (prev ? { ...prev, logoUrl: newUrl } : null));
                setUser((prev) => (prev ? { ...prev, avatarUrl: newUrl } : null));
                const storedShopStr = await AsyncStorage.getItem('@repairshop_shop');
                if (storedShopStr) {
                    try {
                        const parsed = JSON.parse(storedShopStr);
                        parsed.logoUrl = newUrl;
                        await AsyncStorage.setItem('@repairshop_shop', JSON.stringify(parsed));
                    }
                    catch { }
                }
                // Also fetch fresh profile in background to ensure database consistency
                api.getShopProfile().then((fresh) => {
                    if (fresh) {
                        setShop(fresh);
                        AsyncStorage.setItem('@repairshop_shop', JSON.stringify(fresh)).catch(() => { });
                    }
                }).catch(() => { });
                return newUrl;
            }
            return null;
        }
        catch (error) {
            console.error('Failed to upload shop logo to S3:', error);
            throw error;
        }
        finally {
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
        }
        catch {
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
    return (<AuthContext.Provider value={{
            user,
            shop,
            isLoading,
            hasCompletedOnboarding,
            requestOtp,
            verifyOtp,
            registerShop,
            updateShopProfile,
            uploadShopLogo,
            refreshShopProfile,
            completeOnboarding,
            resetOnboarding,
            logout,
        }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
