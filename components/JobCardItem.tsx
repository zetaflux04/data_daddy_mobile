import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JobCard } from '../types';
import { StatusBadge } from './StatusBadge';
import { Colors } from '../constants/Colors';

interface JobCardItemProps {
  job: JobCard;
  onPress: () => void;
}

export const JobCardItem: React.FC<JobCardItemProps> = ({ job, onPress }) => {
  const hasDue = (job.cost?.due ?? 0) > 0;
  const createdDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '2 May 2025';

  const handleSmsPress = (e: any) => {
    e.stopPropagation();
    if (job.customerSnapshot?.phone) {
      const clean = job.customerSnapshot.phone.replace(/\D/g, '').slice(-10);
      Linking.openURL(`sms:${clean}`);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
      ]}>
      {/* Main Content Area */}
      <View style={styles.cardHeader}>
        {/* Device Icon in Soft Blue Circle */}
        <View style={styles.deviceIconCircle}>
          <Ionicons
            name={
              job.deviceType === 'laptop'
                ? 'laptop-outline'
                : job.deviceType === 'tablet'
                ? 'tablet-portrait-outline'
                : job.deviceType === 'smartwatch'
                ? 'watch-outline'
                : 'phone-portrait-outline'
            }
            size={22}
            color={Colors.primary}
          />
        </View>

        {/* Info Column */}
        <View style={styles.headerInfoCol}>
          {/* Top Line: Job ID + Model + Status */}
          <View style={styles.topTitleRow}>
            <View style={styles.idModelGroup}>
              <View style={styles.jobIdPill}>
                <Text style={styles.jobIdText}>{job.jobId}</Text>
              </View>
              <Text style={styles.deviceModel} numberOfLines={1}>
                {job.orderType === 'accessory'
                  ? job.productName || 'Accessory'
                  : `${job.brand || ''} ${job.model || ''}`}
              </Text>
            </View>

            <StatusBadge status={job.status} size="sm" />
          </View>

          {/* Customer Name & Phone */}
          <Text style={styles.customerText} numberOfLines={1}>
            {job.customerSnapshot?.name || 'Customer'} • {job.customerSnapshot?.phone || ''}
          </Text>

          {/* Problem / Description */}
          <Text style={styles.problemText} numberOfLines={2}>
            {job.problemDescription || (job.orderType === 'accessory' ? 'Product Sale' : 'Repair Service')}
          </Text>
        </View>
      </View>

      {/* Bottom Action / Meta Row */}
      <View style={styles.bottomRow}>
        {/* Payment Status Pill */}
        <View style={styles.paymentCol}>
          {hasDue ? (
            <View style={styles.dueBadge}>
              <Text style={styles.dueText}>Due: ₹{(job.cost?.due ?? 0).toLocaleString('en-IN')}</Text>
            </View>
          ) : (
            <View style={styles.paidBadge}>
              <Ionicons name="checkmark-circle" size={13} color={Colors.emerald} />
              <Text style={styles.paidText}>
                Paid in Full (₹{(job.cost?.final ?? 0).toLocaleString('en-IN')})
              </Text>
            </View>
          )}
        </View>

        {/* Date and SMS Action */}
        <View style={styles.rightMetaRow}>
          <View style={styles.dateGroup}>
            <Ionicons name="calendar-outline" size={12} color="#64748B" />
            <Text style={styles.dateText}>{createdDate}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.smsBtn, { opacity: pressed ? 0.75 : 1 }]}
            onPress={handleSmsPress}>
            <Ionicons name="chatbox-ellipses" size={12} color={Colors.primary} />
            <Text style={styles.smsBtnText}>SMS</Text>
            <Ionicons name="chevron-forward" size={11} color={Colors.primary} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  deviceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  headerInfoCol: {
    flex: 1,
  },
  topTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  idModelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
    gap: 6,
  },
  jobIdPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  jobIdText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  deviceModel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    flex: 1,
  },
  customerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  problemText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  paymentCol: {
    flexShrink: 1,
  },
  dueBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dueText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.rose,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  paidText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  rightMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  smsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  smsBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
});
