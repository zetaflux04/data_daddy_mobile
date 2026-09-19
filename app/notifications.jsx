import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ScrollView, ActivityIndicator, } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { AppHeader } from '../components/AppHeader';
const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'broadcast', label: 'Announcements' },
    { key: 'job', label: 'Repair Alerts' },
    { key: 'system', label: 'System' },
];
function formatTimeAgo(dateStr) {
    if (!dateStr)
        return 'Recently';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return dateStr; // Already relative string like "10 mins ago"
    }
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60)
        return 'Just now';
    if (diffSec < 3600)
        return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400)
        return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800)
        return 'Yesterday';
    if (diffSec < 604800)
        return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
    });
}
export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const loadNotifications = async () => {
        try {
            setIsLoading(true);
            const data = await api.getNotifications();
            const items = (Array.isArray(data) ? data : []).map((d) => ({
                _id: d._id || d.id || `notif_${Math.random()}`,
                title: d.title || 'Notification',
                message: d.message || '',
                type: d.type === 'sms' ? 'system' : d.type || 'broadcast',
                priority: d.priority || 'info',
                createdAt: d.createdAt ? formatTimeAgo(d.createdAt) : 'Just now',
                read: d.read || false,
            }));
            setNotifications(items);
        }
        catch {
            setNotifications([]);
        }
        finally {
            setIsLoading(false);
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
        if (selectedFilter === 'all')
            return true;
        return item.type === selectedFilter;
    });
    const unreadCount = notifications.filter((n) => !n.read).length;
    const getIconConfig = (item) => {
        if (item.type === 'broadcast') {
            return { name: 'megaphone', color: '#2563EB', bg: '#EFF6FF' };
        }
        if (item.priority === 'warning') {
            return { name: 'alert-circle', color: '#F59E0B', bg: '#FEF3C7' };
        }
        if (item.type === 'job') {
            return { name: 'construct', color: '#10B981', bg: '#ECFDF5' };
        }
        return { name: 'notifications', color: '#6366F1', bg: '#EEF2FF' };
    };
    return (<View style={[styles.container, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <AppHeader
        title="Notifications"
        subtitle="Admin announcements & repair alerts"
        rightAction={unreadCount > 0 ? (
          <Pressable
            style={({ pressed }) => [styles.headerMarkBtn, { backgroundColor: isDark ? '#202C33' : '#EEF2FF', opacity: pressed ? 0.7 : 1 }]}
            onPress={markAllAsRead}
          >
            <Ionicons name="checkmark-done" size={16} color={isDark ? '#60A5FA' : Colors.primary}/>
            <Text style={[styles.headerMarkText, { color: isDark ? '#60A5FA' : Colors.primary }]}>Read all</Text>
          </Pressable>
        ) : undefined}
      />

      {/* Top Controls: Unread Counter */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.unreadStatus}>
          <View style={[styles.unreadBadge, { backgroundColor: isDark ? '#2563EB' : Colors.primary }]}>
            <Text style={styles.unreadBadgeText}>{unreadCount} NEW</Text>
          </View>
          <Text style={[styles.unreadSub, { color: colors.textSecondary }]}>Real-time updates & alerts</Text>
        </View>
      </View>

      {/* Horizontal Filter Chips */}
      <View style={[styles.filterScrollWrapper, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {filterTabs.map((tab) => {
            const isSelected = selectedFilter === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setSelectedFilter(tab.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected
                      ? (isDark ? 'rgba(96, 165, 250, 0.2)' : Colors.primaryGlow)
                      : (isDark ? '#202C33' : '#F1F5F9'),
                    borderColor: isSelected
                      ? (isDark ? '#60A5FA' : Colors.primaryLight)
                      : (isDark ? '#2A3942' : 'transparent'),
                  },
                ]}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: isSelected ? (isDark ? '#60A5FA' : Colors.primary) : colors.textSecondary },
                  isSelected && styles.filterChipTextSelected,
                ]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Loading state indicator */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#60A5FA' : Colors.primary}/>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Fetching latest notifications...</Text>
        </View>
      ) : (
        /* Notification List */
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? '#60A5FA' : Colors.primary}
              colors={[isDark ? '#60A5FA' : Colors.primary]}
              progressBackgroundColor={isDark ? '#202C33' : '#FFFFFF'}
            />
          }
          renderItem={({ item }) => {
            const icon = getIconConfig(item);
            const cardBg = !item.read
              ? (isDark ? '#182229' : '#FBFDFF')
              : colors.card;
            const cardBorder = !item.read
              ? (isDark ? '#2A3942' : '#93C5FD')
              : colors.border;

            return (
              <Pressable
                style={({ pressed }) => [
                  styles.notifCard,
                  { backgroundColor: cardBg, borderColor: cardBorder },
                  !item.read && [styles.notifCardUnread, { borderLeftColor: isDark ? '#60A5FA' : Colors.primary }],
                  { opacity: pressed ? 0.92 : 1 },
                ]}
                onPress={() => {
                  setNotifications((prev) => prev.map((n) => (n._id === item._id ? { ...n, read: true } : n)));
                }}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : icon.bg }]}>
                    <Ionicons name={icon.name} size={18} color={isDark && icon.color === '#2563EB' ? '#60A5FA' : icon.color}/>
                  </View>
                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      {!item.read && <View style={[styles.unreadDot, { backgroundColor: isDark ? '#60A5FA' : Colors.primary }]}/>}
                    </View>
                    <Text style={[styles.timestamp, { color: colors.textMuted }]}>{item.createdAt}</Text>
                  </View>
                </View>

                <Text style={[styles.cardMessage, { color: colors.textSecondary }]}>{item.message}</Text>

                {item.type === 'job' && (
                  <View style={styles.actionChipRow}>
                    <Pressable
                      style={[styles.actionChip, { backgroundColor: isDark ? '#202C33' : '#F1F5F9' }]}
                      onPress={() => router.push('/(tabs)/jobs')}
                    >
                      <Text style={[styles.actionChipText, { color: isDark ? '#60A5FA' : '#334155' }]}>View Job Cards →</Text>
                    </Pressable>
                  </View>
                )}

                {item.type === 'broadcast' && (
                  <View style={styles.actionChipRow}>
                    <Pressable
                      style={[styles.actionChip, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.18)' : '#EFF6FF' }]}
                      onPress={() => router.push('/analytics')}
                    >
                      <Text style={[styles.actionChipText, { color: isDark ? '#60A5FA' : Colors.primary }]}>
                        View Details →
                      </Text>
                    </Pressable>
                  </View>
                )}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconBox, { backgroundColor: isDark ? '#202C33' : '#F1F5F9' }]}>
                <Ionicons name="notifications-off-outline" size={36} color={colors.textMuted}/>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                You're all caught up! Admin broadcasts, repair updates, and alerts will appear here.
              </Text>
            </View>
          }
        />
      )}
    </View>);
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
    headerMarkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#EEF2FF',
        borderRadius: 8,
    },
    headerMarkText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary,
    },
    unreadStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 1,
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
        flexShrink: 1,
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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 12,
    },
    loadingText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
        paddingBottom: 24,
        flexGrow: 1,
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
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginTop: 2,
    },
    cardHeaderInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 6,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0F172A',
        flex: 1,
        lineHeight: 19,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginTop: 5,
    },
    timestamp: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 3,
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
        paddingHorizontal: 20,
        flex: 1,
    },
    emptyIconBox: {
        width: 64,
        height: 64,
        borderRadius: 32,
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
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 18,
    },
});
