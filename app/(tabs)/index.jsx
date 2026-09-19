import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MetricCard } from '../../components/MetricCard';
import { DashboardChartsSection } from '../../components/DashboardChartsSection';
import { JobCardItem } from '../../components/JobCardItem';
import { BannerCarousel } from '../../components/BannerCarousel';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardScreen() {
    const router = useRouter();
    const { refreshShopProfile } = useAuth();
    const { colors, isDark } = useTheme();
    const [summary, setSummary] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const loadData = async () => {
        try {
            const [sumData, jobsData] = await Promise.all([
                api.getDashboardSummary(),
                api.getJobs(),
                refreshShopProfile().catch(() => null),
            ]);
            setSummary(sumData);
            setRecentJobs(jobsData.slice(0, 5));
        }
        catch (e) {
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
    const totalRecentJobsCount = summary?.jobs?.total ??
        (summary?.jobs
            ? summary.jobs.pending +
                summary.jobs.inProgress +
                summary.jobs.partsDelayed +
                summary.jobs.readyForPickup +
                summary.jobs.delivered
            : recentJobs.length);
    return (<ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary}/>}>
      {/* Promotional Banner Carousel (Diwali Bulk Parts Discount) */}
      <BannerCarousel />

      {/* 4 Primary KPI Metric Cards (2x2 Grid) */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricsRow}>
          <MetricCard title="Pending Jobs" value={summary?.jobs?.pending ?? 0} subtitle={`${summary?.jobs?.todayNew ?? 0} booked today`} icon="gift-outline" accentColor="#3B82F6" onPress={() => router.push('/(tabs)/jobs')}/>
          <View style={{ width: 12 }}/>
          <MetricCard title="Total Calls" value={summary?.jobs?.total ?? 0} subtitle="All job cards" icon="call-outline" accentColor="#10B981" onPress={() => router.push('/(tabs)/jobs')}/>
        </View>

        <View style={[styles.metricsRow, { marginTop: 12 }]}>
          <MetricCard title="Total Revenue" value={`₹${(summary?.financials?.totalRevenue ?? 0).toLocaleString('en-IN')}`} subtitle={`Net: ₹${(summary?.financials?.netProfit ?? 0).toLocaleString('en-IN')}`} icon="wallet-outline" accentColor="#8B5CF6" onPress={() => router.push('/analytics')}/>
          <View style={{ width: 12 }}/>
          <MetricCard title="Pending Dues" value={`₹${(summary?.financials?.totalDuesPending ?? 0).toLocaleString('en-IN')}`} subtitle="Uncollected balance" icon="alert-circle-outline" accentColor="#EF4444" onPress={() => router.push('/(tabs)/jobs')}/>
        </View>
      </View>

      {/* NEW SECTION: Revenue Overview Line Chart & Job Status Donut Chart */}
      <DashboardChartsSection summary={summary} onPressRevenue={() => router.push('/analytics')} onPressJobs={() => router.push('/(tabs)/jobs')}/>

      {/* Recent Jobs Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Jobs</Text>
        <Pressable onPress={() => router.push('/(tabs)/jobs')}>
          <Text style={[styles.viewAllText, { color: isDark ? '#60A5FA' : Colors.primary }]}>
            View All ({totalRecentJobsCount > 0 ? totalRecentJobsCount : 5})
          </Text>
        </Pressable>
      </View>

      {recentJobs.length === 0 ? (<View style={styles.emptyState}>
          <View style={[styles.emptyIconBox, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <Ionicons name="clipboard-outline" size={36} color={colors.textMuted}/>
          </View>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No job cards created yet</Text>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Start creating digital job cards for incoming devices
          </Text>
          <Pressable style={styles.emptyButton} onPress={() => router.push('/job/new')}>
            <LinearGradient colors={Colors.gradients.primary} style={styles.emptyButtonGradient}>
              <Ionicons name="add" size={16} color="#FFFFFF"/>
              <Text style={styles.emptyButtonText}>Create First Job Card</Text>
            </LinearGradient>
          </Pressable>
        </View>) : (recentJobs.map((job) => (<JobCardItem key={job._id} job={job} onPress={() => router.push(`/job/${job._id}`)}/>)))}

      <View style={{ height: 24 }}/>
    </ScrollView>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        padding: 16,
        paddingBottom: 110,
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
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.2,
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.primary,
        letterSpacing: -0.1,
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
        fontWeight: '500',
        color: '#1E293B',
        letterSpacing: -0.2,
        marginBottom: 4,
    },
    emptyStateText: {
        fontSize: 13,
        fontWeight: '400',
        color: '#64748B',
        letterSpacing: -0.1,
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
