import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SplashScreenView } from '../components/SplashScreenView';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';
import { TextInput } from 'react-native';
import { CustomAlertProvider } from '../components/CustomAlert';
// Ensure default placeholder text color is never overridden to white in dark mode
if (TextInput.defaultProps == null) {
    TextInput.defaultProps = {};
}
TextInput.defaultProps.placeholderTextColor = '#94A3B8';
export { ErrorBoundary } from 'expo-router';
export const unstable_settings = {
    initialRouteName: '(tabs)',
};
SplashScreen.preventAutoHideAsync();
function RootNavigation() {
    const router = useRouter();
    const { hasCompletedOnboarding, user } = useAuth();
    const [splashFinished, setSplashFinished] = useState(false);
    useEffect(() => {
        if (!splashFinished || hasCompletedOnboarding === null)
            return;
        if (hasCompletedOnboarding === false) {
            router.replace('/onboarding');
        }
        else if (!user) {
            router.replace('/(auth)/login');
        }
    }, [splashFinished, hasCompletedOnboarding, user]);
    const handleSplashFinish = () => {
        setSplashFinished(true);
    };
    return (<>
      <StatusBar style="dark"/>
      <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F8FAFC' },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
        <Stack.Screen name="onboarding" options={{
            headerShown: false,
            gestureEnabled: false,
        }}/>
        <Stack.Screen name="job/[id]" options={{
            headerShown: false,
        }}/>
        <Stack.Screen name="invoice/[id]" options={{
            headerShown: false,
        }}/>
        <Stack.Screen name="job/new" options={{
            headerShown: false,
            presentation: 'modal',
        }}/>
        <Stack.Screen name="(auth)/login" options={{
            headerShown: false,
        }}/>
        <Stack.Screen name="(auth)/register" options={{
            headerShown: false,
        }}/>
        <Stack.Screen name="analytics" options={{
            headerShown: false,
        }}/>
        <Stack.Screen name="guides" options={{
            headerShown: false,
        }}/>
        <Stack.Screen name="staff" options={{
            headerShown: false,
        }}/>
        <Stack.Screen name="settings" options={{
            headerShown: false,
        }}/>
        <Stack.Screen name="privacy" options={{
            headerShown: false,
        }}/>
        <Stack.Screen name="terms" options={{
            headerShown: false,
        }}/>
        <Stack.Screen name="notifications" options={{
            headerShown: false,
        }}/>
      </Stack>

      {!splashFinished && (<SplashScreenView onFinish={handleSplashFinish}/>)}
    </>);
}
export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...Ionicons.font,
    });
    useEffect(() => {
        if (error)
            throw error;
    }, [error]);
    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);
    if (!loaded) {
        return null;
    }
    return (<SafeAreaProvider>
      <CustomAlertProvider>
        <AuthProvider>
          <RootNavigation />
        </AuthProvider>
      </CustomAlertProvider>
    </SafeAreaProvider>);
}
