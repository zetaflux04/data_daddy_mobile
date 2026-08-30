import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  iconBg?: string;
  iconColor?: string;
  onPress: () => void;
  destructive?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor = Colors.primary,
  iconBg = '#F1F5F9',
  iconColor = '#475569',
  onPress,
  destructive = false,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.menuItem,
      { opacity: pressed ? 0.85 : 1 },
      destructive && styles.menuItemDestructive,
    ]}>
    <View style={[styles.menuIconBox, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>

    <View style={styles.menuTextBox}>
      <Text style={[styles.menuTitle, destructive && { color: Colors.rose }]}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
    </View>

    {badge ? (
      <View style={[styles.badgePill, { backgroundColor: `${badgeColor}18` }]}>
        <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
      </View>
    ) : null}

    <Ionicons
      name="chevron-forward"
      size={18}
      color={destructive ? Colors.rose : '#CBD5E1'}
      style={{ marginLeft: 6 }}
    />
  </Pressable>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { shop, user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out from DataDaddy?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}
      showsVerticalScrollIndicator={false}>
      {/* Shop Profile Card */}
      <View style={styles.shopCard}>
        <View style={styles.shopAvatarWrapper}>
          <View style={styles.shopAvatar}>
            <Text style={styles.shopAvatarText}>
              {shop?.name ? shop.name.charAt(0).toUpperCase() : 'D'}
            </Text>
          </View>
          <Pressable
            style={styles.avatarCameraBtn}
            onPress={() => Alert.alert('Upload Photo', 'Choose shop logo from gallery or take a picture.')}>
            <Ionicons name="camera" size={14} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={styles.shopName}>{shop?.name || 'DataDaddy Shop'}</Text>
        <Text style={styles.ownerName}>Owned by {shop?.ownerName || user?.name || 'Shop Owner'}</Text>
        <Text style={styles.phoneText}>+91 {shop?.phone || user?.phone || '9876543210'}</Text>

        <View style={styles.planStatusRow}>
          <View style={styles.proPill}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.emerald} />
            <Text style={styles.proPillText}>PRO PLAN ACTIVE</Text>
          </View>
          <View style={styles.smsPill}>
            <Ionicons name="chatbox-ellipses" size={14} color="#0284C7" />
            <Text style={styles.smsPillText}>SMS Alerts Active</Text>
          </View>
        </View>
      </View>

      {/* Group 1: Business Operations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Operations</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="pie-chart"
            iconBg="rgba(37, 99, 235, 0.12)"
            iconColor={Colors.primary}
            title="Profit & Loss"
            subtitle="Revenue, parts expenses, and margin"
            badge="Live P&L"
            badgeColor={Colors.primary}
            onPress={() => router.push('/analytics')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="construct"
            iconBg="rgba(245, 158, 11, 0.12)"
            iconColor={Colors.amber}
            title="Technician Guides"
            subtitle="Schematics, boardviews & fix videos"
            badge="PRO"
            badgeColor={Colors.amber}
            onPress={() => router.push('/guides')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="people"
            iconBg="rgba(139, 92, 246, 0.12)"
            iconColor={Colors.purple}
            title="Staff & Technicians"
            subtitle="Manage technician logins and permissions"
            onPress={() => router.push('/staff')}
          />
        </View>
      </View>

      {/* Group 2: Shop & Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences & Setup</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="notifications"
            iconBg="rgba(245, 158, 11, 0.12)"
            iconColor={Colors.amber}
            title="Notifications & Updates"
            subtitle="Admin announcements & repair alerts"
            badge="ALERTS"
            badgeColor={Colors.amber}
            onPress={() => router.push('/notifications')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="compass"
            iconBg="rgba(37, 99, 235, 0.12)"
            iconColor={Colors.primary}
            title="App Tour & Onboarding"
            subtitle="Explore features & first-time walkthrough"
            badge="TOUR"
            badgeColor={Colors.primary}
            onPress={() => router.push('/onboarding')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="settings-sharp"
            iconBg="#F1F5F9"
            iconColor="#334155"
            title="Shop Settings"
            subtitle="SMS notification templates & invoice info"
            onPress={() => router.push('/settings')}
          />
        </View>
      </View>

      {/* Group 3: Legal & Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal & Information</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="shield-outline"
            iconBg="#F1F5F9"
            iconColor="#64748B"
            title="Privacy Policy"
            subtitle="Data protection and customer privacy"
            onPress={() => router.push('/privacy')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="document-text-outline"
            iconBg="#F1F5F9"
            iconColor="#64748B"
            title="Terms & Conditions"
            subtitle="Usage policy and service agreement"
            onPress={() => router.push('/terms')}
          />
        </View>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="log-out-outline"
            iconBg="rgba(239, 68, 68, 0.12)"
            iconColor={Colors.rose}
            title="Sign Out"
            subtitle="Log out from this device"
            destructive
            onPress={handleLogout}
          />
        </View>
      </View>

      <Text style={styles.versionFooter}>DataDaddy v1.0.0 Enterprise • Made for Indian Repair Shops</Text>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  shopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  shopAvatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  shopAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  shopAvatarText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  avatarCameraBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0F172A',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  shopName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  ownerName: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 14,
  },
  planStatusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  proPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.emeraldLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  proPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.emerald,
  },
  smsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  smsPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuItemDestructive: {
    backgroundColor: '#FFF5F5',
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextBox: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 64,
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
});
