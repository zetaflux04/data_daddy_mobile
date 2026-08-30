import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { JobCard, DashboardSummary } from '../../types';
import { MetricCard } from '../../components/MetricCard';
import { JobCardItem } from '../../components/JobCardItem';
import { BannerCarousel } from '../../components/BannerCarousel';
import { Colors } from '../../constants/Colors';

export default function DashboardScreen() {
  const router = useRouter();
  const { shop } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentJobs, setRecentJobs] = useState<JobCard[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [sumData, jobsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getJobs(),
      ]);
      setSummary(sumData);
      setRecentJobs(jobsData.slice(0, 5));
    } catch (e) {
      // Fallback loaded by API service
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }>
      {/* Compact Shop Profile Header Bar */}
      <View style={styles.shopTopBar}>
        <View style={styles.shopTopInfo}>
          <Text style={styles.shopTopGreeting}>Welcome back 👋</Text>
          <View style={styles.shopNameRow}>
            <Text style={styles.shopTopName} numberOfLines={1}>
              {shop?.name || 'OK-Repair Solutions'}
            </Text>
            <View style={styles.proPlanPill}>
              <Ionicons name="shield-checkmark" size={11} color={Colors.emerald} />
              <Text style={styles.proPlanPillText}>Pro</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.newJobBtnCompact, { opacity: pressed ? 0.88 : 1 }]}
          onPress={() => router.push('/job/new')}>
          <LinearGradient
            colors={Colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.newJobGradientCompact}>
            <Ionicons name="add" size={17} color="#FFFFFF" />
            <Text style={styles.newJobBtnTextCompact}>New Job</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Promotional Banner Carousel (Uploadable via Admin Dashboard) */}
      <BannerCarousel />

      {/* 4 Primary KPI Cards */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricsRow}>
          <MetricCard
            title="Pending Jobs"
            value={summary?.jobs.pending ?? 0}
            subtitle={`${summary?.jobs.todayNew ?? 0} booked today`}
            icon="time-outline"
            accentColor={Colors.amber}
            onPress={() => router.push('/(tabs)/jobs')}
          />
          <View style={{ width: 12 }} />
          <MetricCard
            title="Ready for Pickup"
            value={summary?.jobs.readyForPickup ?? 0}
            subtitle="SMS sent to customer"
            icon="checkmark-circle-outline"
            accentColor={Colors.emerald}
            onPress={() => router.push('/(tabs)/jobs')}
          />
        </View>

        <View style={[styles.metricsRow, { marginTop: 12 }]}>
          <MetricCard
            title="Total Revenue"
            value={`₹${(summary?.financials.totalRevenue ?? 0).toLocaleString('en-IN')}`}
            subtitle={`Net: ₹${(summary?.financials.netProfit ?? 0).toLocaleString('en-IN')}`}
            icon="wallet-outline"
            accentColor={Colors.primary}
            onPress={() => router.push('/analytics')}
          />
          <View style={{ width: 12 }} />
          <MetricCard
            title="Pending Dues"
            value={`₹${(summary?.financials.totalDuesPending ?? 0).toLocaleString('en-IN')}`}
            subtitle="Uncollected balance"
            icon="alert-circle-outline"
            accentColor={Colors.rose}
            onPress={() => router.push('/(tabs)/jobs')}
          />
        </View>
      </View>

      {/* Recent Job Cards */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Job Cards</Text>
        <Pressable onPress={() => router.push('/(tabs)/jobs')}>
          <Text style={styles.viewAllText}>
            View All ({summary?.jobs ? summary.jobs.pending + summary.jobs.inProgress + summary.jobs.readyForPickup + summary.jobs.delivered : ''})
          </Text>
        </Pressable>
      </View>

      {recentJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="clipboard-outline" size={38} color="#94A3B8" />
          </View>
          <Text style={styles.emptyStateTitle}>No job cards created yet</Text>
          <Text style={styles.emptyStateText}>Start creating digital job cards for incoming devices</Text>
          <Pressable style={styles.emptyButton} onPress={() => router.push('/job/new')}>
            <LinearGradient
              colors={Colors.gradients.primary}
              style={styles.emptyButtonGradient}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Create First Job Card</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        recentJobs.map((job) => (
          <JobCardItem
            key={job._id}
            job={job}
            onPress={() => router.push(`/job/${job._id}`)}
          />
        ))
      )}

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
  shopTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  shopTopInfo: {
    flex: 1,
    marginRight: 10,
  },
  shopTopGreeting: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  shopTopName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  proPlanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  proPlanPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  newJobBtnCompact: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  newJobGradientCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  newJobBtnTextCompact: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  metricsGrid: {
    marginBottom: 18,
  },
  metricsRow: {
    flexDirection: 'row',
  },
  smsAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  smsIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  smsAlertContent: {
    flex: 1,
  },
  smsAlertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  smsAlertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  smsOnlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  smsOnlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0284C7',
  },
  smsOnlineBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  smsAlertSubtitle: {
    fontSize: 11,
    color: '#0284C7',
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 11,
    gap: 6,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
