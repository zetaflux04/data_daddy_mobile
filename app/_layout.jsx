import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useMemo } from 'react';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { SplashScreenView } from '../components/SplashScreenView';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';
import { TextInput } from 'react-native';
import { CustomAlertProvider } from '../components/CustomAlert';
import { DropdownHost } from '../components/DropdownHost';
import { PortalHost } from '@rn-primitives/portal';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors';

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
    const { isDark, colors } = useTheme();
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
      <StatusBar style={isDark ? "light" : "dark"} />
      <DropdownHost>
      <PortalHost />
      <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
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
        <Stack.Screen name="expenses" options={{
            headerShown: false,
        }}/>
        <Stack.Screen name="about" options={{
            headerShown: false,
        }}/>
        <Stack.Screen name="insights" options={{
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
        <Stack.Screen name="search" options={{
            headerShown: false,
        }}/>
      </Stack>

      {!splashFinished && (<SplashScreenView onFinish={handleSplashFinish}/>)}
      </DropdownHost>
    </>);
}

function AppWithTheme() {
    const { isDark, colors } = useTheme();

    const paperTheme = useMemo(() => {
        const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
        return {
            ...baseTheme,
            colors: {
                ...baseTheme.colors,
                primary: Colors.primary,
                secondary: Colors.accent,
                error: Colors.rose,
                background: colors.background,
                surface: colors.card,
                outline: colors.border,
                onSurfaceVariant: colors.textSecondary,
            },
        };
    }, [isDark, colors]);

    return (
      <PaperProvider
        theme={paperTheme}
        settings={{
          icon: (props) => <MaterialCommunityIcons {...props} />,
        }}
      >
        <CustomAlertProvider>
          <AuthProvider>
            <RootNavigation />
          </AuthProvider>
        </CustomAlertProvider>
      </PaperProvider>
    );
}

export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...Ionicons.font,
        ...MaterialCommunityIcons.font,
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
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </SafeAreaProvider>);
}
