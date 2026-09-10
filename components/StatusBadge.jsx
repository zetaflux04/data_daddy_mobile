import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const statusConfig = {
    pending: {
        label: 'Pending',
        icon: 'time',
        bg: '#FEF2F2',
        border: '#FECACA',
        text: '#DC2626',
    },
    in_progress: {
        label: 'In Progress',
        icon: 'time',
        bg: '#FFF7ED',
        border: '#FFEDD5',
        text: '#EA580C',
    },
    parts_delayed: {
        label: 'Parts Delayed',
        icon: 'time',
        bg: '#FAF5FF',
        border: '#F3E8FF',
        text: '#9333EA',
    },
    repaired: {
        label: 'Repaired',
        icon: 'checkmark-circle',
        bg: '#ECFDF5',
        border: '#A7F3D0',
        text: '#059669',
    },
    delivered: {
        label: 'Delivered',
        icon: 'checkmark-circle',
        bg: '#ECFDF5',
        border: '#BBF7D0',
        text: '#16A34A',
    },
    unrepairable: {
        label: 'Unrepairable',
        icon: 'close-circle',
        bg: '#FEF2F2',
        border: '#FECACA',
        text: '#DC2626',
    },
    canceled: {
        label: 'Canceled',
        icon: 'close-circle-outline',
        bg: '#F1F5F9',
        border: '#E2E8F0',
        text: '#64748B',
    },
};

export const StatusBadge = ({ status, size = 'md' }) => {
    const config = statusConfig[status] || statusConfig.pending;
    const isSm = size === 'sm';
    return (
        <View
            style={[
                styles.badge,
                { backgroundColor: config.bg, borderColor: config.border },
                isSm && styles.badgeSm,
            ]}
        >
            <Ionicons
                name={config.icon}
                size={isSm ? 12 : 14}
                color={config.text}
                style={{ marginRight: 4 }}
            />
            <Text style={[styles.text, { color: config.text }, isSm && styles.textSm]}>
                {config.label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    badgeSm: {
        paddingHorizontal: 7,
        paddingVertical: 2.5,
        borderRadius: 10,
    },
    text: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.1,
    },
    textSm: {
        fontSize: 11,
    },
});

