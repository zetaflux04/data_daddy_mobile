import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { api, resolveImageUrls } from '../../services/api';
import { JobCard, DashboardSummary } from '../../types';
import { MetricCard } from '../../components/MetricCard';
import { DashboardChartsSection } from '../../components/DashboardChartsSection';
import { JobCardItem } from '../../components/JobCardItem';
import { BannerCarousel } from '../../components/BannerCarousel';
import { S3Image } from '../../components/S3Image';
import { Colors } from '../../constants/Colors';

export default function DashboardScreen() {
  const router = useRouter();
  const { shop, refreshShopProfile } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentJobs, setRecentJobs] = useState<JobCard[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const loadData = async () => {
    try {
      const [sumData, jobsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getJobs(),
        refreshShopProfile().catch(() => null),
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

  const totalRecentJobsCount =
    summary?.jobs.total ??
    (summary?.jobs
      ? summary.jobs.pending +
        summary.jobs.inProgress +
        summary.jobs.partsDelayed +
        summary.jobs.readyForPickup +
        summary.jobs.delivered
      : recentJobs.length);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }>
      {/* Welcome & Shop Profile Bar */}
      <View style={styles.shopTopBar}>
        <Pressable
          style={styles.shopAvatarBtn}
          onPress={() => router.push('/(tabs)/profile')}>
          {shop?.logoUrl && !avatarFailed ? (() => {
            const urls = resolveImageUrls(shop.logoUrl);
            return urls ? (
              <S3Image
                uri={urls.uri}
                proxyUri={urls.proxyUri}
                style={styles.shopHeaderAvatarImg}
                resizeMode="cover"
                onAllFailed={() => setAvatarFailed(true)}
              />
            ) : null;
          })() : (
            <View style={styles.shopHeaderAvatarFallback}>
              <Text style={styles.shopHeaderAvatarLetter}>
                {shop?.name ? shop.name.charAt(0).toUpperCase() : 'C'}
              </Text>
            </View>
          )}
        </Pressable>

        <View style={styles.shopTopInfo}>
          <Text style={styles.shopTopGreeting}>Welcome back, 👋</Text>
          <View style={styles.shopNameRow}>
            <Text style={styles.shopTopName} numberOfLines={1}>
              {shop?.name || 'Chipix'}
            </Text>
            <View style={styles.proPlanPill}>
              <Ionicons name="checkmark-circle" size={12} color="#059669" />
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

      {/* Promotional Banner Carousel (Diwali Bulk Parts Discount) */}
      <BannerCarousel />

      {/* 4 Primary KPI Metric Cards (2x2 Grid) */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricsRow}>
          <MetricCard
            title="Pending Jobs"
            value={summary?.jobs.pending ?? 2}
            subtitle={`${summary?.jobs.todayNew ?? 1} booked today`}
            icon="gift-outline"
            accentColor="#3B82F6"
            onPress={() => router.push('/(tabs)/jobs')}
          />
          <View style={{ width: 12 }} />
          <MetricCard
            title="Ready for Pickup"
            value={summary?.jobs.readyForPickup ?? 1}
            subtitle="SMS sent to customer"
            icon="checkmark-circle-outline"
            accentColor="#10B981"
            onPress={() => router.push('/(tabs)/jobs')}
          />
        </View>

        <View style={[styles.metricsRow, { marginTop: 12 }]}>
          <MetricCard
            title="Total Revenue"
            value={`₹${(summary?.financials.totalRevenue ?? 18000).toLocaleString('en-IN')}`}
            subtitle={`Net: ₹${(summary?.financials.netProfit ?? 18000).toLocaleString('en-IN')}`}
            icon="wallet-outline"
            accentColor="#8B5CF6"
            onPress={() => router.push('/analytics')}
          />
          <View style={{ width: 12 }} />
          <MetricCard
            title="Pending Dues"
            value={`₹${(summary?.financials.totalDuesPending ?? 4000).toLocaleString('en-IN')}`}
            subtitle="Uncollected balance"
            icon="alert-circle-outline"
            accentColor="#EF4444"
            onPress={() => router.push('/(tabs)/jobs')}
          />
        </View>
      </View>

      {/* NEW SECTION: Revenue Overview Line Chart & Job Status Donut Chart */}
      <DashboardChartsSection
        summary={summary}
        onPressRevenue={() => router.push('/analytics')}
        onPressJobs={() => router.push('/(tabs)/jobs')}
      />

      {/* Recent Jobs Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Jobs</Text>
        <Pressable onPress={() => router.push('/(tabs)/jobs')}>
          <Text style={styles.viewAllText}>
            View All ({totalRecentJobsCount > 0 ? totalRecentJobsCount : 5})
          </Text>
        </Pressable>
      </View>

      {recentJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="clipboard-outline" size={36} color="#94A3B8" />
          </View>
          <Text style={styles.emptyStateTitle}>No job cards created yet</Text>
          <Text style={styles.emptyStateText}>
            Start creating digital job cards for incoming devices
          </Text>
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

      <View style={{ height: 24 }} />
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  shopAvatarBtn: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  shopHeaderAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  shopHeaderAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  shopHeaderAvatarLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  shopTopInfo: {
    flex: 1,
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
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
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
    paddingHorizontal: 13,
    paddingVertical: 9,
    gap: 4,
  },
  newJobBtnTextCompact: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  metricsGrid: {
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
