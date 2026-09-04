import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, G, Line, } from 'react-native-svg';
import { Colors } from '../constants/Colors';
const timeFilterOptions = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'today', label: 'Today' },
    { key: 'year', label: 'This Year' },
];
export const DashboardChartsSection = ({ summary, onPressJobs, onPressRevenue, }) => {
    const [selectedTimeFilter, setSelectedTimeFilter] = useState('week');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    // Live Revenue Data
    const totalRevenue = summary?.financials.totalRevenue ?? 0;
    const growthPct = summary?.financials.revenueGrowthPct ?? 0;
    const weeklyRevenue = summary?.charts?.weeklyRevenue || [
        { day: 'Mon', amount: 0 },
        { day: 'Tue', amount: 0 },
        { day: 'Wed', amount: 0 },
        { day: 'Thu', amount: 0 },
        { day: 'Fri', amount: 0 },
        { day: 'Sat', amount: 0 },
        { day: 'Sun', amount: 0 },
    ];
    // Live Job Status Data
    const pendingCount = summary?.jobs.pending ?? 0;
    const inProgressCount = (summary?.jobs.inProgress ?? 0) + (summary?.jobs.partsDelayed ?? 0);
    const readyCount = summary?.jobs.readyForPickup ?? 0;
    const deliveredCount = summary?.jobs.delivered ?? 0;
    const totalCalculated = pendingCount + inProgressCount + readyCount + deliveredCount;
    const totalJobs = summary?.jobs.total ?? totalCalculated;
    const getPercentage = (count) => {
        if (totalCalculated === 0)
            return 0;
        return Math.round((count / totalCalculated) * 100);
    };
    const statusItems = [
        {
            label: 'Pending',
            count: pendingCount,
            percentage: getPercentage(pendingCount),
            color: '#F97316', // Orange
        },
        {
            label: 'In Progress',
            count: inProgressCount,
            percentage: getPercentage(inProgressCount),
            color: '#3B82F6', // Blue
        },
        {
            label: 'Ready',
            count: readyCount,
            percentage: getPercentage(readyCount),
            color: '#10B981', // Green
        },
        {
            label: 'Delivered',
            count: deliveredCount,
            percentage: getPercentage(deliveredCount),
            color: '#8B5CF6', // Purple
        },
    ];
    // SVG Line Chart Dynamic Scale Calculations
    const chartWidth = 310;
    const chartHeight = 120;
    const paddingLeft = 36;
    const paddingRight = 14;
    const paddingTop = 12;
    const paddingBottom = 24;
    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;
    const maxDataAmount = Math.max(...weeklyRevenue.map((p) => p.amount), 0);
    // Dynamic top scale: if 0, default to 10000; otherwise round up to nearest sensible ceiling
    let maxVal = 10000;
    if (maxDataAmount > 0) {
        if (maxDataAmount <= 5000)
            maxVal = 5000;
        else if (maxDataAmount <= 15000)
            maxVal = 15000;
        else if (maxDataAmount <= 30000)
            maxVal = 30000;
        else
            maxVal = Math.ceil(maxDataAmount / 10000) * 10000;
    }
    const yStep1 = maxVal;
    const yStep2 = Math.round((maxVal * 2) / 3);
    const yStep3 = Math.round(maxVal / 3);
    const formatK = (val) => {
        if (val === 0)
            return '0';
        if (val >= 1000)
            return `${Math.round(val / 1000)}K`;
        return `${val}`;
    };
    const points = weeklyRevenue.map((pt, index) => {
        const x = paddingLeft + (index / (weeklyRevenue.length - 1)) * plotWidth;
        const y = paddingTop + plotHeight - (Math.min(pt.amount, maxVal) / maxVal) * plotHeight;
        return { x, y, day: pt.day, amount: pt.amount };
    });
    const linePath = points.reduce((acc, pt, i) => {
        return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');
    const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x},${paddingTop + plotHeight} L ${points[0].x},${paddingTop + plotHeight} Z`
        : '';
    // SVG Donut Chart Calculation
    const donutSize = 124;
    const strokeWidth = 14;
    const radius = (donutSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let cumulativeAngle = 0;
    const donutSlices = statusItems.map((item) => {
        const pct = totalCalculated > 0 ? item.percentage : 0;
        const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
        const strokeDashoffset = -cumulativeAngle;
        cumulativeAngle += (pct / 100) * circumference;
        return {
            ...item,
            strokeDasharray,
            strokeDashoffset,
        };
    });
    const currentFilterLabel = timeFilterOptions.find((opt) => opt.key === selectedTimeFilter)?.label || 'This Week';
    return (<View style={styles.sectionWrapper}>
      {/* 1. Revenue Overview Card */}
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
            ₹{totalRevenue.toLocaleString('en-IN')}
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
              {growthPct >= 0 ? `${growthPct}%` : `${Math.abs(growthPct)}%`} vs last week
            </Text>
          </View>
        </View>

        {/* Live Line Chart */}
        <View style={styles.lineChartWrapper}>
          <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            <Defs>
              <SvgLinearGradient id="revenueGradientLive" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.28"/>
                <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0"/>
              </SvgLinearGradient>
            </Defs>

            {/* Horizontal Grid Lines */}
            {[yStep1, yStep2, yStep3, 0].map((levelVal) => {
            const y = paddingTop + plotHeight - (levelVal / maxVal) * plotHeight;
            return (<G key={levelVal}>
                  <Line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#F1F5F9" strokeDasharray="3 3" strokeWidth="1"/>
                </G>);
        })}

            {/* Gradient Area Fill */}
            {areaPath ? <Path d={areaPath} fill="url(#revenueGradientLive)"/> : null}

            {/* Line Curve */}
            {linePath ? (<Path d={linePath} stroke="#2563EB" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>) : null}

            {/* Data Point Circles */}
            {points.map((pt, idx) => (<G key={idx}>
                <Circle cx={pt.x} cy={pt.y} r={3.5} fill="#2563EB" stroke="#FFFFFF" strokeWidth={1.5}/>
              </G>))}
          </Svg>

          {/* X-Axis Day Labels */}
          <View style={styles.xAxisRow}>
            {weeklyRevenue.map((pt, idx) => (<Text key={idx} style={styles.xAxisLabel}>
                {pt.day}
              </Text>))}
          </View>

          {/* Y-Axis Scale Overlays */}
          <View style={styles.yAxisOverlay}>
            <Text style={styles.yAxisLabel}>{formatK(yStep1)}</Text>
            <Text style={styles.yAxisLabel}>{formatK(yStep2)}</Text>
            <Text style={styles.yAxisLabel}>{formatK(yStep3)}</Text>
            <Text style={styles.yAxisLabel}>0</Text>
          </View>
        </View>
      </Pressable>

      {/* 2. Job Status Overview Card */}
      <Pressable style={styles.card} onPress={onPressJobs}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Job Status Overview</Text>
          <View style={styles.liveTagBadge}>
            <View style={styles.liveDot}/>
            <Text style={styles.liveTagText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.donutContainer}>
          {/* Donut Chart with Center Text */}
          <View style={styles.donutSvgWrapper}>
            <Svg width={donutSize} height={donutSize} viewBox={`0 0 ${donutSize} ${donutSize}`}>
              <G rotation="-90" originX={donutSize / 2} originY={donutSize / 2}>
                {/* Background Track */}
                <Circle cx={donutSize / 2} cy={donutSize / 2} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} fill="none"/>
                {/* Real Live Segments */}
                {totalCalculated > 0 &&
            donutSlices.map((slice, i) => slice.count > 0 ? (<Circle key={i} cx={donutSize / 2} cy={donutSize / 2} r={radius} stroke={slice.color} strokeWidth={strokeWidth} strokeDasharray={slice.strokeDasharray} strokeDashoffset={slice.strokeDashoffset} strokeLinecap="round" fill="none"/>) : null)}
              </G>
            </Svg>

            {/* Centered Total Jobs Count */}
            <View style={styles.donutCenterTextContainer}>
              <Text style={styles.donutTotalNumber}>{totalJobs}</Text>
              <Text style={styles.donutTotalLabel}>Total Jobs</Text>
            </View>
          </View>

          {/* Legend Column on the right */}
          <View style={styles.legendContainer}>
            {statusItems.map((item) => (<View key={item.label} style={styles.legendItemRow}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]}/>
                <Text style={styles.legendLabel}>{item.label}</Text>
                <Text style={styles.legendCount}>
                  {item.count}{' '}
                  <Text style={styles.legendPct}>({item.percentage}%)</Text>
                </Text>
              </View>))}
          </View>
        </View>
      </Pressable>

      {/* Time Filter Selection Modal */}
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
    lineChartWrapper: {
        marginTop: 6,
        position: 'relative',
    },
    yAxisOverlay: {
        position: 'absolute',
        top: 6,
        left: 0,
        bottom: 26,
        justifyContent: 'space-between',
    },
    yAxisLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#94A3B8',
    },
    xAxisRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 34,
        paddingRight: 8,
        marginTop: -4,
    },
    xAxisLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#94A3B8',
    },
    // Donut chart styles
    donutContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingVertical: 6,
    },
    donutSvgWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: 124,
        height: 124,
    },
    donutCenterTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    donutTotalNumber: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    donutTotalLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748B',
        marginTop: -2,
    },
    legendContainer: {
        flex: 1,
        marginLeft: 18,
        gap: 10,
    },
    legendItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    legendLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        flex: 1,
    },
    legendCount: {
        fontSize: 13,
        fontWeight: '800',
        color: '#0F172A',
    },
    legendPct: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    // Modal styles
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
