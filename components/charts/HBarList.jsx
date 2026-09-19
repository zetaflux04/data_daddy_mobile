import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export const HBarList = ({
    items = [],
    valueKey = 'count',
    formatValue,
    emptyLabel = 'No data in this range',
    accentColor = Colors.primary,
    isDark = false,
}) => {
    if (!items.length) {
        return (
            <View style={styles.emptyWrap}>
                <Text style={[styles.emptyText, isDark && { color: '#8696A0' }]}>{emptyLabel}</Text>
            </View>
        );
    }

    const maxVal = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1);

    return (
        <View style={styles.list}>
            {items.map((item, idx) => {
                const value = Number(item[valueKey]) || 0;
                const widthPct = Math.max(4, Math.round((value / maxVal) * 100));
                const color = item.color || accentColor;
                return (
                    <View key={item.key || item.label || idx} style={styles.row}>
                        <View style={styles.labelRow}>
                            <Text style={[styles.label, isDark && { color: '#8696A0' }]} numberOfLines={1}>{item.label}</Text>
                            <Text style={[styles.value, isDark && { color: '#E9EDEF' }]}>
                                {formatValue ? formatValue(item) : value}
                            </Text>
                        </View>
                        <View style={[styles.track, isDark && { backgroundColor: '#202C33' }]}>
                            <View style={[styles.fill, { width: `${widthPct}%`, backgroundColor: color }]}/>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    list: {
        gap: 12,
        marginTop: 4,
    },
    row: {
        gap: 6,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        flex: 1,
    },
    value: {
        fontSize: 13,
        fontWeight: '800',
        color: '#0F172A',
    },
    track: {
        height: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 4,
    },
    emptyWrap: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94A3B8',
    },
});
