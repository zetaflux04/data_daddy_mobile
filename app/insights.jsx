import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { Colors } from '../constants/Colors';
import { AppHeader } from '../components/AppHeader';
import { DateFilterBar } from '../components/DateFilterBar';
import { LineAreaChart } from '../components/charts/LineAreaChart';
import { DonutChart } from '../components/charts/DonutChart';
import { HBarList } from '../components/charts/HBarList';
import { VerticalBarChart } from '../components/charts/VerticalBarChart';

const ChartCard = ({ title, children }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        {children}
    </View>
);

export default function InsightsScreen() {
    const insets = useSafeAreaInsets();
    const [insights, setInsights] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
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

    return (
        <View style={styles.container}>
            <AppHeader title="Analytics" subtitle="Shop performance insights"/>
            <DateFilterBar
                selectedRange={selectedRange}
                onRangeChange={onRangeChange}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
            />

            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 16 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary}/>}
            >
                <View style={styles.kpiRow}>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Total Revenue</Text>
                        <Text style={styles.kpiValue}>{formatInr(kpis.totalRevenue)}</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Pending Dues</Text>
                        <Text style={[styles.kpiValue, { color: Colors.rose }]}>{formatInr(kpis.pendingDues)}</Text>
                    </View>
                </View>

                <ChartCard title="Revenue Overview">
                    <Text style={styles.kpiInline}>{formatInr(kpis.totalRevenue)}</Text>
                    <LineAreaChart data={insights?.revenueOverview || []} gradientId="insightsRevenue"/>
                </ChartCard>

                <ChartCard title="Job Pipeline">
                    <DonutChart
                        items={statusItems.length ? statusItems : (insights?.statusDistribution || [])}
                        centerNumber={kpis.totalJobs}
                        centerLabel="Jobs"
                    />
                </ChartCard>

                <ChartCard title="Types of Devices">
                    <HBarList
                        items={insights?.deviceTypes || []}
                        formatValue={(item) => `${item.count} · ${formatInr(item.revenue)}`}
                    />
                </ChartCard>

                <ChartCard title="Accessories">
                    <HBarList
                        items={insights?.accessories || []}
                        accentColor="#F59E0B"
                        formatValue={(item) => `${item.count} · ${formatInr(item.revenue)}`}
                    />
                </ChartCard>

                <ChartCard title="Service Types">
                    <DonutChart
                        items={(insights?.orderTypes || []).map((item) => ({
                            ...item,
                            color: item.color || '#2563EB',
                        }))}
                        centerNumber={(insights?.orderTypes || []).reduce((sum, item) => sum + (item.count || 0), 0)}
                        centerLabel="Orders"
                    />
                    <View style={{ height: 12 }}/>
                    <HBarList
                        items={insights?.serviceTypes || []}
                        accentColor="#8B5CF6"
                        formatValue={(item) => `${item.count}`}
                    />
                </ChartCard>

                <ChartCard title="Customers Per Day">
                    <VerticalBarChart data={insights?.customersByDay || []} valueKey="count" color="#10B981"/>
                </ChartCard>

                <ChartCard title="Jobs Per Day">
                    <VerticalBarChart data={insights?.jobsByDay || []} valueKey="count" color="#2563EB"/>
                </ChartCard>
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
        gap: 14,
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
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.2,
        marginBottom: 8,
    },
});
