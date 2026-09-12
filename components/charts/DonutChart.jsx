import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export const DonutChart = ({
    items = [],
    centerNumber = 0,
    centerLabel = 'Total',
    emptyLabel = 'No data in this range',
    size = 124,
    strokeWidth = 14,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = items.reduce((sum, item) => sum + (item.count || 0), 0);
    let cumulativeAngle = 0;
    const donutSlices = items.map((item) => {
        const pct = total > 0 ? (item.count / total) * 100 : 0;
        const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
        const strokeDashoffset = -cumulativeAngle;
        cumulativeAngle += (pct / 100) * circumference;
        return { ...item, percentage: Math.round(pct), strokeDasharray, strokeDashoffset };
    });

    return (
        <View style={styles.donutContainer}>
            <View style={[styles.donutSvgWrapper, { width: size, height: size }]}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.donutSvg}>
                    <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} fill="none"/>
                    {total > 0 &&
                        donutSlices.map((slice, i) =>
                            slice.count > 0 ? (
                                <Circle
                                    key={slice.key || slice.label || i}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke={slice.color}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={slice.strokeDasharray}
                                    strokeDashoffset={slice.strokeDashoffset}
                                    strokeLinecap="butt"
                                    fill="none"
                                />
                            ) : null,
                        )}
                </Svg>
                <View style={styles.donutCenterTextContainer}>
                    <Text style={styles.donutTotalNumber}>{centerNumber}</Text>
                    <Text style={styles.donutTotalLabel}>{centerLabel}</Text>
                </View>
            </View>

            <View style={styles.legendContainer}>
                {items.length === 0 || total === 0 ? (
                    <Text style={styles.emptyText}>{emptyLabel}</Text>
                ) : (
                    items.map((item) => (
                        <View key={item.key || item.label} style={styles.legendItemRow}>
                            <View style={[styles.legendDot, { backgroundColor: item.color }]}/>
                            <Text style={styles.legendLabel} numberOfLines={1}>{item.label}</Text>
                            <Text style={styles.legendCount}>
                                {item.count}{' '}
                                <Text style={styles.legendPct}>
                                    ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)
                                </Text>
                            </Text>
                        </View>
                    ))
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    },
    donutSvg: {
        transform: [{ rotate: '-90deg' }],
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
    emptyText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94A3B8',
    },
});
