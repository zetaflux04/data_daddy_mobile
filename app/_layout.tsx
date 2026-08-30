import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SplashScreenView } from '../components/SplashScreenView';
import { Colors } from '../constants/Colors';
import React from 'react';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const router = useRouter();
  const { hasCompletedOnboarding, user } = useAuth();
  const [splashFinished, setSplashFinished] = useState(false);

  const handleSplashFinish = () => {
    setSplashFinished(true);
    if (hasCompletedOnboarding === false) {
      router.replace('/onboarding');
    }
  };

  return (
    <>
      <StatusBar style={!splashFinished ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#0F172A',
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#F8FAFC' },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="job/[id]"
          options={{
            title: 'Job Card Details',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="job/new"
          options={{
            title: 'New Job Card',
            presentation: 'modal',
            headerBackTitle: 'Cancel',
          }}
        />
        <Stack.Screen
          name="(auth)/login"
          options={{
            title: 'Sign In',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)/register"
          options={{
            title: 'Register Shop',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="analytics"
          options={{
            title: 'Profit & Loss',
            headerBackTitle: 'Profile',
          }}
        />
        <Stack.Screen
          name="guides"
          options={{
            title: 'Technician Guides',
            headerBackTitle: 'Profile',
          }}
        />
        <Stack.Screen
          name="staff"
          options={{
            title: 'Staff & Technicians',
            headerBackTitle: 'Profile',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Shop Settings',
            headerBackTitle: 'Profile',
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{
            title: 'Privacy Policy',
            headerBackTitle: 'Profile',
          }}
        />
        <Stack.Screen
          name="terms"
          options={{
            title: 'Terms & Conditions',
            headerBackTitle: 'Profile',
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            title: 'Notifications & Alerts',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>

      {!splashFinished && (
        <SplashScreenView onFinish={handleSplashFinish} />
      )}
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...Ionicons.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
