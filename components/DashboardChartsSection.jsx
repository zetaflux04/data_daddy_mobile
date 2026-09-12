import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { LineAreaChart } from './charts/LineAreaChart';
import { DonutChart } from './charts/DonutChart';

const timeFilterOptions = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
];

export const DashboardChartsSection = ({ summary, onPressJobs, onPressRevenue, }) => {
    const [selectedTimeFilter, setSelectedTimeFilter] = useState('today');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    let displayRevenue = 0;
    let growthPct = 0;
    let vsLabel = 'vs yesterday';
    let currentRevenueData = [];

    if (selectedTimeFilter === 'today') {
        displayRevenue = summary?.financials?.todayRevenue ?? 0;
        growthPct = summary?.financials?.todayGrowthPct ?? 0;
        vsLabel = 'vs yesterday';
        currentRevenueData = summary?.charts?.todayRevenue || [];
    } else if (selectedTimeFilter === 'month') {
        displayRevenue = summary?.financials?.thisMonthRevenue ?? 0;
        growthPct = summary?.financials?.thisMonthGrowthPct ?? 0;
        vsLabel = 'vs last month';
        currentRevenueData = summary?.charts?.monthlyRevenue || [];
    } else if (selectedTimeFilter === 'year') {
        displayRevenue = summary?.financials?.thisYearRevenue ?? 0;
        growthPct = summary?.financials?.thisYearGrowthPct ?? 0;
        vsLabel = 'vs last year';
        currentRevenueData = summary?.charts?.yearlyRevenue || [];
    } else {
        displayRevenue = summary?.financials?.thisWeekRevenue ?? 0;
        growthPct = summary?.financials?.thisWeekGrowthPct ?? summary?.financials?.revenueGrowthPct ?? 0;
        vsLabel = 'vs last week';
        currentRevenueData = summary?.charts?.weeklyRevenue || [];
    }

    const pendingCount = summary?.jobs?.pending ?? 0;
    const inProgressCount = (summary?.jobs?.inProgress ?? 0) + (summary?.jobs?.partsDelayed ?? 0);
    const readyCount = summary?.jobs?.readyForPickup ?? 0;
    const deliveredCount = summary?.jobs?.delivered ?? 0;
    const totalCalculated = pendingCount + inProgressCount + readyCount + deliveredCount;
    const totalJobs = summary?.jobs?.total ?? totalCalculated;
    const getPercentage = (count) => (totalCalculated === 0 ? 0 : Math.round((count / totalCalculated) * 100));
    const statusItems = [
        { label: 'Pending', count: pendingCount, percentage: getPercentage(pendingCount), color: '#F97316' },
        { label: 'In Progress', count: inProgressCount, percentage: getPercentage(inProgressCount), color: '#3B82F6' },
        { label: 'Ready', count: readyCount, percentage: getPercentage(readyCount), color: '#10B981' },
        { label: 'Delivered', count: deliveredCount, percentage: getPercentage(deliveredCount), color: '#8B5CF6' },
    ];
    const currentFilterLabel = timeFilterOptions.find((opt) => opt.key === selectedTimeFilter)?.label || 'Today';

    return (<View style={styles.sectionWrapper}>
      <Pressable style={styles.card} onPress={onPressRevenue}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Revenue Overview</Text>
          <Pressable style={styles.dropdownBtn} onPress={() => setIsFilterModalOpen(true)}>
            <Text style={styles.dropdownBtnText}>{currentFilterLabel}</Text>
            <Ionicons name="chevron-down" size={13} color="#475569"/>
          </Pressable>
        </View>

        <View style={styles.revenueRow}>
          <Text style={styles.revenueAmount}>
            ₹{displayRevenue.toLocaleString('en-IN')}
          </Text>
          <View style={[
            styles.trendBadge,
            growthPct < 0 && { backgroundColor: '#FEF2F2' },
        ]}>
            <Ionicons name={growthPct >= 0 ? 'arrow-up' : 'arrow-down'} size={11} color={growthPct >= 0 ? '#059669' : Colors.rose}/>
            <Text style={[
            styles.trendText,
            growthPct < 0 && { color: Colors.rose },
        ]}>
              {growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`} {vsLabel}
            </Text>
          </View>
        </View>

        <LineAreaChart data={currentRevenueData} gradientId="revenueGradientLive"/>
      </Pressable>

      <Pressable style={styles.card} onPress={onPressJobs}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Job Status Overview</Text>
          <View style={styles.liveTagBadge}>
            <View style={styles.liveDot}/>
            <Text style={styles.liveTagText}>LIVE</Text>
          </View>
        </View>

        <DonutChart items={statusItems} centerNumber={totalJobs} centerLabel="Total Jobs"/>
      </Pressable>

      <Modal visible={isFilterModalOpen} transparent animationType="fade" onRequestClose={() => setIsFilterModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsFilterModalOpen(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Select Revenue Timeframe</Text>
            {timeFilterOptions.map((opt) => (<Pressable key={opt.key} style={[
                styles.optionRow,
                selectedTimeFilter === opt.key && styles.optionRowActive,
            ]} onPress={() => {
                setSelectedTimeFilter(opt.key);
                setIsFilterModalOpen(false);
            }}>
                <Text style={[
                styles.optionText,
                selectedTimeFilter === opt.key && styles.optionTextActive,
            ]}>
                  {opt.label}
                </Text>
                {selectedTimeFilter === opt.key && (<Ionicons name="checkmark" size={18} color={Colors.primary}/>)}
              </Pressable>))}
          </View>
        </Pressable>
      </Modal>
    </View>);
};

const styles = StyleSheet.create({
    sectionWrapper: {
        gap: 14,
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.2,
    },
    liveTagBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 7,
        paddingVertical: 2.5,
        borderRadius: 6,
        gap: 4,
    },
    liveDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#10B981',
    },
    liveTagText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#059669',
    },
    dropdownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 4.5,
        borderRadius: 8,
    },
    dropdownBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
    },
    revenueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
    },
    revenueAmount: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        gap: 3,
    },
    trendText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#059669',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 280,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    modalHeading: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 12,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    optionRowActive: {
        backgroundColor: '#EEF2FF',
    },
    optionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    optionTextActive: {
        color: Colors.primary,
        fontWeight: '800',
    },
});
