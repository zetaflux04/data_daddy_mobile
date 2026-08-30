import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { Colors } from '../constants/Colors';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'broadcast' | 'job' | 'sms' | 'system';
  priority?: 'info' | 'warning' | 'promo';
  createdAt: string;
  read?: boolean;
}

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'broadcast', label: 'Announcements' },
  { key: 'job', label: 'Repair Alerts' },
  { key: 'sms', label: 'Fast2SMS' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      // Combine with local mock notification items for rich demo experience
      const defaultItems: NotificationItem[] = [
        {
          _id: 'notif_1',
          title: '📢 Diwali Bulk Spare Parts Special Discount',
          message:
            'All verified repair centers receive an extra 15% discount on iPhone 13/14 OLED combos and Samsung display panels ordered this week.',
          type: 'broadcast',
          priority: 'promo',
          createdAt: '10 mins ago',
          read: false,
        },
        {
          _id: 'notif_2',
          title: '⚡ Fast2SMS Gateway: 100 Credits Added',
          message:
            'Your monthly SMS quota has been successfully topped up. Automated customer SMS alerts are fully active.',
          type: 'sms',
          priority: 'info',
          createdAt: '2 hours ago',
          read: false,
        },
        {
          _id: 'notif_3',
          title: '🔧 Job #DD-2026-084 Ready for Pickup',
          message:
            'Technician Suresh completed display and battery repair for Rahul Sharma (iPhone 14 Pro Max). Customer notified via SMS.',
          type: 'job',
          priority: 'info',
          createdAt: '5 hours ago',
          read: true,
        },
        {
          _id: 'notif_4',
          title: '⚠️ Spare Parts Delay Notice',
          message:
            'Shipments for OnePlus 11 motherboard chips are delayed by 24 hours. Estimated delivery updated in inventory.',
          type: 'job',
          priority: 'warning',
          createdAt: 'Yesterday',
          read: true,
        },
        {
          _id: 'notif_5',
          title: '🎉 New Feature: Digital P&L Export',
          message:
            'You can now download daily, weekly, and monthly Profit & Loss spreadsheets directly from your DataDaddy shop profile.',
          type: 'broadcast',
          priority: 'promo',
          createdAt: '2 days ago',
          read: true,
        },
      ];

      // Merge backend items if any
      const merged = [...data.map((d: any) => ({ ...d, read: false })), ...defaultItems];
      // Deduplicate by _id
      const unique = merged.filter(
        (item, index, self) => index === self.findIndex((t) => t._id === item._id)
      );
      setNotifications(unique);
    } catch {
      // Fallback loaded
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.type === selectedFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIconConfig = (item: NotificationItem) => {
    if (item.type === 'broadcast') {
      return { name: 'megaphone' as const, color: '#2563EB', bg: '#EFF6FF' };
    }
    if (item.type === 'sms') {
      return { name: 'paper-plane' as const, color: '#0284C7', bg: '#E0F2FE' };
    }
    if (item.priority === 'warning') {
      return { name: 'alert-circle' as const, color: '#F59E0B', bg: '#FEF3C7' };
    }
    return { name: 'construct' as const, color: '#10B981', bg: '#ECFDF5' };
  };

  return (
    <View style={styles.container}>
      {/* Top Controls: Unread Counter & Mark as Read */}
      <View style={styles.topBar}>
        <View style={styles.unreadStatus}>
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount} NEW</Text>
          </View>
          <Text style={styles.unreadSub}>Real-time alerts & broadcasts</Text>
        </View>

        {unreadCount > 0 && (
          <Pressable
            style={({ pressed }) => [styles.markReadBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={16} color={Colors.primary} />
            <Text style={styles.markReadText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {/* Horizontal Filter Chips */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}>
          {filterTabs.map((tab) => {
            const isSelected = selectedFilter === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setSelectedFilter(tab.key)}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}>
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Notification List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => {
          const icon = getIconConfig(item);
          return (
            <Pressable
              style={({ pressed }) => [
                styles.notifCard,
                !item.read && styles.notifCardUnread,
                { opacity: pressed ? 0.92 : 1 },
              ]}
              onPress={() => {
                // Mark item read
                setNotifications((prev) =>
                  prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
                );
              }}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: icon.bg }]}>
                  <Ionicons name={icon.name} size={18} color={icon.color} />
                </View>
                <View style={styles.cardHeaderInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.timestamp}>{item.createdAt}</Text>
                </View>
              </View>

              <Text style={styles.cardMessage}>{item.message}</Text>

              {item.type === 'job' && (
                <View style={styles.actionChipRow}>
                  <Pressable
                    style={styles.actionChip}
                    onPress={() => router.push('/(tabs)/jobs')}>
                    <Text style={styles.actionChipText}>View Job Cards →</Text>
                  </Pressable>
                </View>
              )}

              {item.type === 'broadcast' && (
                <View style={styles.actionChipRow}>
                  <Pressable
                    style={[styles.actionChip, { backgroundColor: '#EFF6FF' }]}
                    onPress={() => router.push('/analytics')}>
                    <Text style={[styles.actionChipText, { color: Colors.primary }]}>
                      View Promo Details →
                    </Text>
                  </Pressable>
                </View>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="notifications-off-outline" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No notifications found</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! Admin broadcasts and repair alerts will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  unreadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  unreadSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  filterScrollWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primaryLight,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextSelected: {
    color: Colors.primary,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  notifCardUnread: {
    borderColor: '#93C5FD',
    backgroundColor: '#FBFDFF',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  timestamp: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardMessage: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  actionChipRow: {
    marginTop: 10,
    flexDirection: 'row',
  },
  actionChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
});
