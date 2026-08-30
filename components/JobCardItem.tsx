import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JobCard } from '../types';
import { StatusBadge } from './StatusBadge';
import { DeviceIcon } from './DeviceIcon';
import { Colors } from '../constants/Colors';

interface JobCardItemProps {
  job: JobCard;
  onPress: () => void;
}

export const JobCardItem: React.FC<JobCardItemProps> = ({ job, onPress }) => {
  const hasDue = job.cost.due > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
      ]}>
      <View style={styles.topRow}>
        <DeviceIcon type={job.deviceType} size={18} />

        <View style={styles.deviceInfo}>
          <View style={styles.idAndModel}>
            <View style={styles.jobIdPill}>
              <Text style={styles.jobIdText}>{job.jobId}</Text>
            </View>
            <Text style={styles.deviceModel} numberOfLines={1}>
              {job.brand} {job.model}
            </Text>
          </View>
          <Text style={styles.customerText} numberOfLines={1}>
            {job.customerSnapshot.name} • {job.customerSnapshot.phone}
          </Text>
        </View>

        <StatusBadge status={job.status} size="sm" />
      </View>

      <Text style={styles.problemText} numberOfLines={2}>
        {job.problemDescription}
      </Text>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.costBlock}>
          {hasDue ? (
            <View style={styles.dueBadge}>
              <Text style={styles.dueText}>Due: ₹{job.cost.due.toLocaleString('en-IN')}</Text>
            </View>
          ) : (
            <View style={styles.paidBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.emerald} />
              <Text style={styles.paidText}>Paid in Full (₹{job.cost.final.toLocaleString('en-IN')})</Text>
            </View>
          )}
        </View>

        <View style={styles.smsIndicator}>
          {job.smsLogs && job.smsLogs.length > 0 && (
            <View style={styles.smsSentPill}>
              <Ionicons name="chatbox-ellipses" size={12} color="#0284C7" />
              <Text style={styles.smsSentText}>SMS</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  idAndModel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  jobIdPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  jobIdText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    fontFamily: 'SpaceMono',
  },
  deviceModel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    flex: 1,
  },
  customerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  problemText: {
    fontSize: 13,
    color: '#334155',
    marginTop: 10,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dueText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.rose,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  paidText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  smsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smsSentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  smsSentText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
});
