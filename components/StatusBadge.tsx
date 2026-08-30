import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { JobStatus } from '../types';
import { Colors } from '../constants/Colors';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  JobStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    bg: Colors.amberLight,
    text: Colors.amber,
    dot: Colors.amber,
  },
  in_progress: {
    label: 'In Progress',
    bg: Colors.primaryGlow,
    text: Colors.primary,
    dot: Colors.primary,
  },
  parts_delayed: {
    label: 'Parts Delayed',
    bg: Colors.purpleLight,
    text: Colors.purple,
    dot: Colors.purple,
  },
  repaired: {
    label: 'Repaired (Ready)',
    bg: Colors.emeraldLight,
    text: Colors.emerald,
    dot: Colors.emerald,
  },
  delivered: {
    label: 'Delivered',
    bg: 'rgba(100, 116, 139, 0.12)',
    text: '#64748B',
    dot: '#94A3B8',
  },
  canceled: {
    label: 'Canceled',
    bg: Colors.roseLight,
    text: Colors.rose,
    dot: Colors.rose,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSm && styles.badgeSm,
      ]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 11,
  },
});
