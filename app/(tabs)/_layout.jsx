import React, { useState, useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, View, StyleSheet, Platform, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { api } from '../../services/api';
import { MaterialBadge } from '../../components/MaterialBadge';
import { AppHeader } from '../../components/AppHeader';

export default function TabLayout() {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const fetchUnread = async () => {
            try {
                const list = await api.getNotifications();
                if (isMounted && Array.isArray(list)) {
                    const unread = list.filter((n) => !n.read).length;
                    setUnreadCount(unread);
                }
            } catch {
                // ignore error
            }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: '#64748B',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#E2E8F0',
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 88 : 64,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                    paddingTop: 6,
                    shadowColor: '#0F172A',
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 6,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    header: () => (
                        <AppHeader
                            showBack={false}
                            titleComponent={
                                <View style={styles.headerLogoWrap}>
                                    <Image
                                        source={require('../../assets/logo.png')}
                                        style={styles.headerLogo}
                                        resizeMode="contain"
                                    />
                                </View>
                            }
                            rightAction={
                                <Pressable
                                    onPress={() => router.push('/notifications')}
                                    style={({ pressed }) => [styles.headerNotifBtn, { opacity: pressed ? 0.7 : 1 }]}
                                >
                                    <MaterialBadge badgeContent={unreadCount} color="error">
                                        <Ionicons name="notifications-outline" size={20} color="#0F172A" />
                                    </MaterialBadge>
                                </Pressable>
                            }
                        />
                    ),
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="jobs"
                options={{
                    title: 'Jobs',
                    header: () => (
                        <AppHeader
                            title="Job Cards"
                            rightAction={
                                <Pressable
                                    onPress={() => router.push('/job/new')}
                                    style={({ pressed }) => [styles.jobsAddBtn, { opacity: pressed ? 0.8 : 1 }]}
                                >
                                    <Ionicons name="add" size={16} color="#FFFFFF" />
                                    <Text style={styles.jobsAddBtnText}>New Job</Text>
                                </Pressable>
                            }
                        />
                    ),
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'clipboard' : 'clipboard-outline'} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="customers"
                options={{
                    title: 'Customers',
                    header: () => <AppHeader title="Customer Directory" />,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    headerLogoWrap: {
        justifyContent: 'center',
        marginLeft: 4,
    },
    headerLogo: {
        height: 38,
        width: 58,
    },
    headerNotifBtn: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    jobsAddBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    jobsAddBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
});
