import React, { useState, useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, View, StyleSheet, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { api, resolveImageUrls } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { S3Image } from '../../components/S3Image';
import { MaterialBadge } from '../../components/MaterialBadge';
import { AppHeader } from '../../components/AppHeader';
import { CustomTabBar } from '../../components/CustomTabBar';
import { useTheme } from '../../context/ThemeContext';

function DashboardHeaderTitle() {
    const router = useRouter();
    const { shop } = useAuth();
    const { colors } = useTheme();
    const [avatarFailed, setAvatarFailed] = useState(false);
    const urls = shop?.logoUrl ? resolveImageUrls(shop.logoUrl) : null;

    return (
        <Pressable
            style={({ pressed }) => [styles.headerProfileRow, { opacity: pressed ? 0.75 : 1 }]}
            onPress={() => router.push('/(tabs)/profile')}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
        >
            <View style={styles.headerAvatarWrap}>
                {urls && !avatarFailed ? (
                    <S3Image
                        uri={urls.uri}
                        proxyUri={urls.proxyUri}
                        style={[styles.headerAvatarImg, { borderColor: colors.border }]}
                        resizeMode="cover"
                        onAllFailed={() => setAvatarFailed(true)}
                    />
                ) : (
                    <View style={styles.headerAvatarFallback}>
                        <Text style={styles.headerAvatarLetter}>
                            {shop?.name ? shop.name.charAt(0).toUpperCase() : 'C'}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.headerShopInfo}>
                <Text style={[styles.headerGreeting, { color: colors.textSecondary }]}>Welcome back, 👋</Text>
                <View style={styles.headerNameRow}>
                    <Text style={[styles.headerShopName, { color: colors.text }]} numberOfLines={1}>
                        {shop?.name || 'Chipix'}
                    </Text>
                    <View style={styles.headerProPill}>
                        <Ionicons name="checkmark-circle" size={10} color="#059669" />
                        <Text style={styles.headerProPillText}>Pro</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

export default function TabLayout() {
    const router = useRouter();
    const { colors } = useTheme();
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
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: '#64748B',
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    elevation: 0,
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
                            titleComponent={<DashboardHeaderTitle />}
                            rightAction={
                                <View style={styles.headerActionsRow}>
                                    <Pressable
                                        onPress={() => router.push('/search')}
                                        style={({ pressed }) => [styles.headerIconBtn, { opacity: pressed ? 0.7 : 1 }]}
                                        accessibilityLabel="Global Search"
                                    >
                                        <Ionicons name="search-outline" size={20} color={colors.text} />
                                    </Pressable>
                                    <Pressable
                                        onPress={() => router.push('/notifications')}
                                        style={({ pressed }) => [styles.headerIconBtn, { opacity: pressed ? 0.7 : 1 }]}
                                    >
                                        <MaterialBadge badgeContent={unreadCount} color="error">
                                            <Ionicons name="notifications-outline" size={20} color={colors.text} />
                                        </MaterialBadge>
                                    </Pressable>
                                </View>
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
                            subtitle="Active repairs, status & intake"
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
                    header: () => <AppHeader title="Customer Directory" subtitle="Client contacts, dues & history" />,
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
    headerProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
        paddingRight: 4,
    },
    headerAvatarWrap: {
        width: 38,
        height: 38,
        borderRadius: 19,
        overflow: 'hidden',
    },
    headerAvatarImg: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    headerAvatarFallback: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerAvatarLetter: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    headerShopInfo: {
        marginLeft: 9,
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
    },
    headerGreeting: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '400',
        letterSpacing: -0.1,
    },
    headerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 1,
    },
    headerShopName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.2,
        flexShrink: 1,
    },
    headerProPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 6,
        gap: 2,
    },
    headerProPillText: {
        fontSize: 9.5,
        fontWeight: '800',
        color: '#059669',
    },
    headerActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerIconBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
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
