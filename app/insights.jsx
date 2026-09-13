import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { Colors } from '../constants/Colors';
import { AppHeader } from '../components/AppHeader';
import { DateFilterBar } from '../components/DateFilterBar';
import { LineAreaChart } from '../components/charts/LineAreaChart';
import { DonutChart } from '../components/charts/DonutChart';
import { HBarList } from '../components/charts/HBarList';
import { VerticalBarChart } from '../components/charts/VerticalBarChart';
import { formatShortRange } from '../utils/date';

const RANGE_LABELS = {
    all: 'All time',
    today: 'Today',
    week: 'This week',
    month: 'This month',
    year: 'This year',
};

const ChartCard = ({ title, icon, iconColor = Colors.primary, iconBg = '#EEF2FF', children }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={16} color={iconColor} />
            </View>
            <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {children}
    </View>
);

const KpiCard = ({ label, value, valueColor, icon, iconColor, iconBg }) => (
    <View style={styles.kpiCard}>
        <View style={[styles.kpiIcon, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={[styles.kpiValue, valueColor ? { color: valueColor } : null]} numberOfLines={1}>
            {value}
        </Text>
    </View>
);

export default function InsightsScreen() {
    const insets = useSafeAreaInsets();
    const [insights, setInsights] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState('month');
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);

    const loadData = useCallback(async (range = selectedRange, from = customStartDate, to = customEndDate) => {
        const params = { range };
        if (range === 'custom' && from && to) {
            params.from = from;
            params.to = to;
        }
        const data = await api.getAnalyticsInsights(params);
        setInsights(data);
        setIsLoading(false);
    }, [selectedRange, customStartDate, customEndDate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRangeChange = (key, start, end) => {
        setSelectedRange(key);
        if (key === 'custom') {
            setCustomStartDate(start);
            setCustomEndDate(end);
            loadData('custom', start, end);
        } else {
            setCustomStartDate(null);
            setCustomEndDate(null);
            loadData(key);
        }
    };

    const onRefresh = async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    };

    const kpis = insights?.kpis || { totalRevenue: 0, pendingDues: 0, totalJobs: 0 };
    const statusItems = (insights?.statusDistribution || []).filter((item) => item.count > 0);
    const formatInr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
    const periodLabel =
        selectedRange === 'custom' && customStartDate && customEndDate
            ? formatShortRange(customStartDate, customEndDate)
            : RANGE_LABELS[selectedRange] || 'This month';

    return (
        <View style={styles.container}>
            <AppHeader title="Analytics" subtitle="Shop performance insights" />
            <DateFilterBar
                selectedRange={selectedRange}
                onRangeChange={onRangeChange}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
            />

            {isLoading && !insights ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading insights…</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollArea}
                    contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 16 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                >
                    <View style={styles.periodPill}>
                        <Ionicons name="time-outline" size={14} color={Colors.primary} />
                        <Text style={styles.periodPillText}>Showing data for {periodLabel}</Text>
                    </View>

                    <View style={styles.kpiRow}>
                        <KpiCard
                            label="Total Revenue"
                            value={formatInr(kpis.totalRevenue)}
                            icon="cash-outline"
                            iconColor={Colors.emerald}
                            iconBg={Colors.emeraldLight}
                        />
                        <KpiCard
                            label="Pending Dues"
                            value={formatInr(kpis.pendingDues)}
                            valueColor={Colors.rose}
                            icon="alert-circle-outline"
                            iconColor={Colors.rose}
                            iconBg={Colors.roseLight}
                        />
                    </View>
                    <KpiCard
                        label="Jobs in this period"
                        value={String(kpis.totalJobs || 0)}
                        icon="clipboard-outline"
                        iconColor={Colors.primary}
                        iconBg="#EEF2FF"
                    />

                    <ChartCard title="Revenue Overview" icon="trending-up-outline" iconColor={Colors.primary} iconBg="#EEF2FF">
                        <Text style={styles.kpiInline}>{formatInr(kpis.totalRevenue)}</Text>
                        <LineAreaChart data={insights?.revenueOverview || []} gradientId="insightsRevenue" />
                    </ChartCard>

                    <ChartCard title="Job Pipeline" icon="pie-chart-outline" iconColor={Colors.purple} iconBg={Colors.purpleLight}>
                        <DonutChart
                            items={statusItems.length ? statusItems : (insights?.statusDistribution || [])}
                            centerNumber={kpis.totalJobs}
                            centerLabel="Jobs"
                        />
                    </ChartCard>

                    <ChartCard title="Types of Devices" icon="phone-portrait-outline" iconColor={Colors.primary} iconBg="#EEF2FF">
                        <HBarList
                            items={insights?.deviceTypes || []}
                            formatValue={(item) => `${item.count} · ${formatInr(item.revenue)}`}
                        />
                    </ChartCard>

                    <ChartCard title="Accessories" icon="cube-outline" iconColor={Colors.amber} iconBg={Colors.amberLight}>
                        <HBarList
                            items={insights?.accessories || []}
                            accentColor="#F59E0B"
                            formatValue={(item) => `${item.count} · ${formatInr(item.revenue)}`}
                        />
                    </ChartCard>

                    <ChartCard title="Service Types" icon="construct-outline" iconColor={Colors.purple} iconBg={Colors.purpleLight}>
                        <DonutChart
                            items={(insights?.orderTypes || []).map((item) => ({
                                ...item,
                                color: item.color || '#2563EB',
                            }))}
                            centerNumber={(insights?.orderTypes || []).reduce((sum, item) => sum + (item.count || 0), 0)}
                            centerLabel="Orders"
                        />
                        <View style={{ height: 12 }} />
                        <HBarList
                            items={insights?.serviceTypes || []}
                            accentColor="#8B5CF6"
                            formatValue={(item) => `${item.count}`}
                        />
                    </ChartCard>

                    <ChartCard title="Customers Per Day" icon="people-outline" iconColor={Colors.emerald} iconBg={Colors.emeraldLight}>
                        <VerticalBarChart data={insights?.customersByDay || []} valueKey="count" color="#10B981" />
                    </ChartCard>

                    <ChartCard title="Jobs Per Day" icon="briefcase-outline" iconColor={Colors.primary} iconBg="#EEF2FF">
                        <VerticalBarChart data={insights?.jobsByDay || []} valueKey="count" color="#2563EB" />
                    </ChartCard>
                </ScrollView>
            )}
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
        gap: 14,
    },
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    loadingText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    periodPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        backgroundColor: '#EEF2FF',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    periodPillText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary,
    },
    kpiRow: {
        flexDirection: 'row',
        gap: 12,
    },
    kpiCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    kpiIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    kpiLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 6,
    },
    kpiValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0F172A',
        letterSpacing: -0.4,
    },
    kpiInline: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0F172A',
        marginBottom: 4,
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
        gap: 10,
        marginBottom: 10,
    },
    cardIcon: {
        width: 30,
        height: 30,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.2,
        flex: 1,
    },
});
