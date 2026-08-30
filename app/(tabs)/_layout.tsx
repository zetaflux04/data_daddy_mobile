import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, View, StyleSheet, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  const router = useRouter();

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
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: false,
        headerTintColor: '#0F172A',
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 18,
          letterSpacing: -0.3,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerTitle: () => (
            <View style={styles.headerBrandRow}>
              <View style={styles.brandIconBox}>
                <Ionicons name="construct" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.brandHeaderTitle}>Data<Text style={{ color: Colors.primary }}>Daddy</Text></Text>
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>LIVE</Text>
              </View>
            </View>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={22}
              color={color}
            />
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/notifications')}
              style={({ pressed }) => [styles.headerNotifBtn, { opacity: pressed ? 0.7 : 1 }]}>
              <Ionicons name="notifications-outline" size={22} color="#0F172A" />
              <View style={styles.notifBadgeDot} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          headerTitle: 'Repair Job Cards',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'clipboard' : 'clipboard-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          headerTitle: 'Customer Directory',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Shop Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    marginLeft: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  headerNotifBtn: {
    position: 'relative',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 16,
  },
  notifBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
