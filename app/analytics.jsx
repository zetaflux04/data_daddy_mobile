import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { api } from '../services/api';
import { Colors } from '../constants/Colors';
import { AppHeader } from '../components/AppHeader';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const sum = await api.getDashboardSummary();
      setSummary(sum);
    } catch {
      // Handled silently
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const revenue = summary?.financials?.totalRevenue ?? 0;
  const expenseTotal = summary?.financials?.totalExpense ?? 0;
  const netProfit = summary?.financials?.netProfit ?? 0;
  const marginPct = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;
  const expenseRatio = revenue > 0 ? Math.min(100, Math.round((expenseTotal / revenue) * 100)) : 0;

  return (
    <View style={styles.container}>
      <AppHeader title="Profit & Loss" />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 24) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Calculating financials...</Text>
          </View>
        ) : (
          <>
            {/* Net Profit Hero Card */}
            <View style={styles.heroCard}>
              <Text style={styles.heroSub}>Shop Net Profit (This Month)</Text>
              <Text style={styles.heroValue}>₹{netProfit.toLocaleString('en-IN')}</Text>

              <View style={styles.heroBadges}>
                <View style={styles.marginPill}>
                  <Ionicons name="trending-up" size={14} color={Colors.emerald} />
                  <Text style={styles.marginText}>{marginPct}% Net Margin</Text>
                </View>
                <Text style={styles.heroDuesNotice} numberOfLines={1}>
                  ₹{(summary?.financials?.totalDuesPending ?? 0).toLocaleString('en-IN')} dues pending
                </Text>
              </View>
            </View>

            {/* Revenue vs Expense Comparison Card */}
            <View style={styles.compareCard}>
              <Text style={styles.cardHeaderTitle}>Revenue vs Expenses</Text>

              <View style={styles.barItem}>
                <View style={styles.barLabelRow}>
                  <View style={styles.legendDotRow}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                    <Text style={styles.barLabel}>Total Collected Revenue</Text>
                  </View>
                  <Text style={[styles.barAmount, { color: Colors.primary }]}>
                    ₹{revenue.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressBar, { width: '100%', backgroundColor: Colors.primary }]}
                  />
                </View>
              </View>

              <View style={styles.barItem}>
                <View style={styles.barLabelRow}>
                  <View style={styles.legendDotRow}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.rose }]} />
                    <Text style={styles.barLabel}>Total Shop Expenses & Parts</Text>
                  </View>
                  <Text style={[styles.barAmount, { color: Colors.rose }]}>
                    ₹{expenseTotal.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${expenseRatio}%`,
                        backgroundColor: Colors.rose,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Financial Health Metrics */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <View style={[styles.metricIconBox, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                  <Ionicons name="cash-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.metricVal}>₹{revenue.toLocaleString('en-IN')}</Text>
                <Text style={styles.metricLabel}>Gross Income</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={[styles.metricIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Ionicons name="card-outline" size={18} color={Colors.rose} />
                </View>
                <Text style={[styles.metricVal, { color: Colors.rose }]}>
                  ₹{expenseTotal.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.metricLabel}>Total Outflow</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={[styles.metricIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Ionicons name="pie-chart-outline" size={18} color="#059669" />
                </View>
                <Text style={[styles.metricVal, { color: '#059669' }]}>{marginPct}%</Text>
                <Text style={styles.metricLabel}>Profit Ratio</Text>
              </View>
            </View>

            {/* Quick Navigation to Dedicated Shop Expenses */}
            <Pressable
              style={({ pressed }) => [
                styles.expensesBanner,
                { opacity: pressed ? 0.88 : 1 },
              ]}
              onPress={() => router.push('/expenses')}
            >
              <View style={styles.bannerIconBox}>
                <Ionicons name="wallet" size={22} color={Colors.rose} />
              </View>
              <View style={styles.bannerTextBox}>
                <Text style={styles.bannerTitle}>Manage Shop Expenses</Text>
                <Text style={styles.bannerSub}>
                  Record parts purchases, rent, staff salaries & bills
                </Text>
              </View>
              <View style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Open</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
              </View>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroSub: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 6,
  },
  heroValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 14,
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  marginText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34D399',
  },
  heroDuesNotice: {
    fontSize: 12,
    color: '#94A3B8',
  },
  compareCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  barItem: {
    marginBottom: 14,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  barAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  expensesBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTextBox: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
    marginLeft: 6,
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});
