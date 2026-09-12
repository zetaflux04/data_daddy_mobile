import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Colors } from '../../constants/Colors';

export const VerticalBarChart = ({
    data = [],
    valueKey = 'count',
    height = 120,
    color = Colors.primary,
    emptyLabel = 'No data in this range',
}) => {
    const points = Array.isArray(data) ? data : [];
    const maxVal = Math.max(...points.map((p) => Number(p[valueKey]) || 0), 0);

    if (!points.length || maxVal === 0) {
        return (
            <View style={[styles.emptyWrap, { height }]}>
                <Text style={styles.emptyText}>{emptyLabel}</Text>
            </View>
        );
    }

    const chartWidth = 310;
    const paddingLeft = 8;
    const paddingRight = 8;
    const paddingTop = 8;
    const paddingBottom = 4;
    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = height - 28;
    const gap = points.length > 20 ? 1 : 4;
    const barWidth = Math.max(3, (plotWidth - gap * (points.length - 1)) / points.length);
    const labels = points.length > 8
        ? points.filter((_, i) => i % Math.ceil(points.length / 6) === 0 || i === points.length - 1)
        : points;

    return (
        <View>
            <Svg width="100%" height={plotHeight + paddingTop + paddingBottom} viewBox={`0 0 ${chartWidth} ${plotHeight + paddingTop + paddingBottom}`}>
                {points.map((pt, i) => {
                    const value = Number(pt[valueKey]) || 0;
                    const h = (value / maxVal) * plotHeight;
                    const x = paddingLeft + i * (barWidth + gap);
                    const y = paddingTop + (plotHeight - h);
                    return (
                        <Rect
                            key={`${pt.day}-${i}`}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={Math.max(h, 1)}
                            rx={Math.min(3, barWidth / 2)}
                            fill={color}
                            opacity={0.9}
                        />
                    );
                })}
            </Svg>
            <View style={styles.xAxisRow}>
                {labels.map((pt, idx) => (
                    <Text key={`${pt.day}-l-${idx}`} style={styles.xAxisLabel}>{pt.day}</Text>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    xAxisRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
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
