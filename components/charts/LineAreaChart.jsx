import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, G, Line } from 'react-native-svg';

export const LineAreaChart = ({
    data = [],
    height = 120,
    valueKey = 'amount',
    emptyLabel = 'No data in this range',
    gradientId = 'lineAreaGradient',
}) => {
    const chartWidth = 310;
    const paddingLeft = 36;
    const paddingRight = 14;
    const paddingTop = 12;
    const paddingBottom = 24;
    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;
    const incoming = Array.isArray(data) ? data : [];
    const pointsData = incoming.length
        ? incoming
        : [
            { day: '9 AM', [valueKey]: 0 },
            { day: '12 PM', [valueKey]: 0 },
            { day: '3 PM', [valueKey]: 0 },
            { day: '6 PM', [valueKey]: 0 },
            { day: '9 PM', [valueKey]: 0 },
        ];
    const maxDataAmount = Math.max(...pointsData.map((p) => Number(p[valueKey]) || 0), 0);

    let maxVal = 1000;
    if (maxDataAmount > 0) {
        if (maxDataAmount <= 10) maxVal = 10;
        else if (maxDataAmount <= 50) maxVal = 50;
        else if (maxDataAmount <= 100) maxVal = 100;
        else if (maxDataAmount <= 500) maxVal = 500;
        else if (maxDataAmount <= 1000) maxVal = 1000;
        else if (maxDataAmount <= 5000) maxVal = 5000;
        else if (maxDataAmount <= 15000) maxVal = 15000;
        else if (maxDataAmount <= 30000) maxVal = 30000;
        else maxVal = Math.ceil(maxDataAmount / 10000) * 10000;
    }

    const yStep1 = maxVal;
    const yStep2 = Math.round((maxVal * 2) / 3);
    const yStep3 = Math.round(maxVal / 3);
    const formatK = (val) => {
        if (val === 0) return '0';
        if (val >= 1000) return `${Math.round(val / 1000)}K`;
        return `${val}`;
    };

    const points = pointsData.map((pt, index) => {
        const x = paddingLeft + (index / Math.max(pointsData.length - 1, 1)) * plotWidth;
        const y = paddingTop + plotHeight - (Math.min(Number(pt[valueKey]) || 0, maxVal) / maxVal) * plotHeight;
        return { x, y, day: pt.day, amount: Number(pt[valueKey]) || 0 };
    });
    const linePath = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`), '');
    const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x},${paddingTop + plotHeight} L ${points[0].x},${paddingTop + plotHeight} Z`
        : '';

    const xLabels = pointsData.length > 8
        ? pointsData.filter((_, i) => i % Math.ceil(pointsData.length / 7) === 0 || i === pointsData.length - 1)
        : pointsData;

    return (
        <View style={styles.lineChartWrapper}>
            <Svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
                <Defs>
                    <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.28"/>
                        <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0"/>
                    </SvgLinearGradient>
                </Defs>
                {[yStep1, yStep2, yStep3, 0].map((levelVal) => {
                    const y = paddingTop + plotHeight - (levelVal / maxVal) * plotHeight;
                    return (
                        <G key={levelVal}>
                            <Line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#F1F5F9" strokeDasharray="3 3" strokeWidth="1"/>
                        </G>
                    );
                })}
                {areaPath ? <Path d={areaPath} fill={`url(#${gradientId})`}/> : null}
                {linePath ? (
                    <Path d={linePath} stroke="#2563EB" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                ) : null}
                {points.map((pt, idx) => (
                    <G key={idx}>
                        <Circle cx={pt.x} cy={pt.y} r={3.5} fill="#2563EB" stroke="#FFFFFF" strokeWidth={1.5}/>
                    </G>
                ))}
            </Svg>
            <View style={styles.xAxisRow}>
                {xLabels.map((pt, idx) => (
                    <Text key={`${pt.day}-${idx}`} style={styles.xAxisLabel}>
                        {pt.day}
                    </Text>
                ))}
            </View>
            <View style={styles.yAxisOverlay}>
                <Text style={styles.yAxisLabel}>{formatK(yStep1)}</Text>
                <Text style={styles.yAxisLabel}>{formatK(yStep2)}</Text>
                <Text style={styles.yAxisLabel}>{formatK(yStep3)}</Text>
                <Text style={styles.yAxisLabel}>0</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    emptyWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94A3B8',
    },
});
