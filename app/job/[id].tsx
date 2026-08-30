import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { JobCard, JobStatus } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { DeviceIcon } from '../../components/DeviceIcon';
import { Colors } from '../../constants/Colors';

const statusFlow: JobStatus[] = ['pending', 'in_progress', 'parts_delayed', 'repaired', 'delivered'];

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<JobCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Payment Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'upi' | 'cash' | 'card'>('upi');

  // Invoice Modal
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const loadJob = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await api.getJobById(id);
      setJob(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [id]);

  const handleUpdateStatus = async (newStatus: JobStatus) => {
    if (!job) return;
    const updated = await api.updateJobStatus(job._id, newStatus);
    if (updated) {
      setJob({ ...updated });
      if (newStatus === 'repaired') {
        Alert.alert(
          'Status Updated: Repaired',
          `SMS sent to customer ${job.customerSnapshot.phone} via Fast2SMS: "Device for ${job.jobId} is ready for pickup."`
        );
      } else if (newStatus === 'delivered') {
        Alert.alert(
          'Status Updated: Delivered',
          `SMS sent to customer ${job.customerSnapshot.phone} via Fast2SMS: "Device for ${job.jobId} has been delivered. Thank you!"`
        );
      }
    }
  };

  const handleRecordPayment = async () => {
    if (!job || !payAmount || Number(payAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    const updated = await api.addPayment(job._id, Number(payAmount), payMode);
    if (updated) {
      setJob({ ...updated });
      setIsPayModalOpen(false);
      setPayAmount('');
    }
  };

  const openCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openWhatsApp = (phone: string) => {
    const clean = phone.replace(/\D/g, '').slice(-10);
    Linking.openURL(
      `https://wa.me/91${clean}?text=Hello%20${job?.customerSnapshot.name},%20regarding%20your%20repair%20order%20${job?.jobId}`
    );
  };

  if (!job) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#64748B' }}>Loading job details...</Text>
      </View>
    );
  }

  const hasDue = job.cost.due > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Banner Card */}
      <View style={styles.topCard}>
        <View style={styles.headerRow}>
          <DeviceIcon type={job.deviceType} size={24} />
          <View style={styles.titleInfo}>
            <View style={styles.jobIdRow}>
              <View style={styles.jobIdBadge}>
                <Text style={styles.jobIdText}>{job.jobId}</Text>
              </View>
              <Text style={styles.dateText}>
                {new Date(job.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Text style={styles.deviceName}>
              {job.brand} {job.model}
            </Text>
          </View>
          <StatusBadge status={job.status} size="md" />
        </View>

        {job.serialOrImei || job.passcodePattern ? (
          <View style={styles.deviceMetaRow}>
            {job.serialOrImei && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>IMEI/Serial:</Text>
                <Text style={styles.metaVal}>{job.serialOrImei}</Text>
              </View>
            )}
            {job.passcodePattern && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Passcode:</Text>
                <Text style={styles.metaVal}>{job.passcodePattern}</Text>
              </View>
            )}
          </View>
        ) : null}
      </View>

      {/* Customer Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Customer Details</Text>
        </View>
        <View style={styles.custRow}>
          <View style={styles.custInfo}>
            <Text style={styles.custName}>{job.customerSnapshot.name}</Text>
            <Text style={styles.custPhone}>+91 {job.customerSnapshot.phone}</Text>
          </View>
          <View style={styles.custActions}>
            <Pressable style={styles.iconCircle} onPress={() => openCall(job.customerSnapshot.phone)}>
              <Ionicons name="call" size={18} color="#0284C7" />
            </Pressable>
            <Pressable
              style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}
              onPress={() => openWhatsApp(job.customerSnapshot.phone)}>
              <Ionicons name="logo-whatsapp" size={18} color="#16A34A" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Problem Description */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Reported Problem</Text>
        <Text style={styles.problemDesc}>{job.problemDescription}</Text>
      </View>

      {/* Pipeline Status Controller */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Update Job Status</Text>
        <Text style={styles.pipelineHelp}>
          Tap any status to update. Fast2SMS is sent automatically on Repaired and Delivered.
        </Text>

        <View style={styles.statusButtonsGrid}>
          {statusFlow.map((st) => {
            const isCurrent = job.status === st;
            return (
              <Pressable
                key={st}
                style={[
                  styles.statusSelectBtn,
                  isCurrent && styles.statusSelectBtnCurrent,
                ]}
                onPress={() => handleUpdateStatus(st)}>
                <Text
                  style={[
                    styles.statusSelectText,
                    isCurrent && styles.statusSelectTextCurrent,
                  ]}>
                  {st.replace('_', ' ').toUpperCase()}
                </Text>
                {isCurrent && <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Financials & Payments */}
      <View style={styles.card}>
        <View style={styles.cardHeaderBetween}>
          <Text style={styles.cardTitle}>Billing & Payments</Text>
          <Pressable style={styles.invoiceBtn} onPress={() => setIsInvoiceOpen(true)}>
            <Ionicons name="document-text" size={14} color={Colors.primary} />
            <Text style={styles.invoiceBtnText}>View Invoice</Text>
          </Pressable>
        </View>

        <View style={styles.costSummaryRow}>
          <View style={styles.costBox}>
            <Text style={styles.costBoxLabel}>Estimate</Text>
            <Text style={styles.costBoxVal}>₹{job.cost.final.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.costBox}>
            <Text style={styles.costBoxLabel}>Paid</Text>
            <Text style={[styles.costBoxVal, { color: Colors.emerald }]}>
              ₹{job.cost.advancePaid.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.costBox}>
            <Text style={styles.costBoxLabel}>Balance Due</Text>
            <Text style={[styles.costBoxVal, { color: hasDue ? Colors.rose : Colors.emerald }]}>
              ₹{job.cost.due.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {hasDue && (
          <Pressable
            style={({ pressed }) => [styles.recordPayBtn, { opacity: pressed ? 0.9 : 1 }]}
            onPress={() => setIsPayModalOpen(true)}>
            <Ionicons name="cash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.recordPayText}>Record Payment</Text>
          </Pressable>
        )}

        {/* Payments list */}
        {job.payments && job.payments.length > 0 && (
          <View style={styles.paymentHistory}>
            <Text style={styles.subHeading}>Payment History</Text>
            {job.payments.map((p, idx) => (
              <View key={idx} style={styles.payRow}>
                <View style={styles.payModeBadge}>
                  <Text style={styles.payModeText}>{p.mode.toUpperCase()}</Text>
                </View>
                <Text style={styles.payDate}>
                  {new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
                <Text style={styles.payAmount}>+₹{p.amount.toLocaleString('en-IN')}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Fast2SMS Logs */}
      <View style={styles.card}>
        <View style={styles.smsLogHeader}>
          <Ionicons name="chatbubble-ellipses" size={18} color="#0284C7" />
          <Text style={[styles.cardTitle, { marginLeft: 8 }]}>Fast2SMS Updates Delivered</Text>
        </View>

        {job.smsLogs && job.smsLogs.length > 0 ? (
          job.smsLogs.map((log, index) => (
            <View key={index} style={styles.smsLogRow}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.emerald} />
              <View style={styles.smsLogContent}>
                <Text style={styles.smsLogType}>
                  {log.type === 'order_received'
                    ? 'Order Intake Confirmation'
                    : log.type === 'repaired'
                    ? 'Ready for Pickup Alert'
                    : 'Delivery Thank You'}
                </Text>
                <Text style={styles.smsLogTime}>
                  {new Date(log.sentAt).toLocaleString('en-IN')} • {log.providerRef || 'Delivered'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noSmsText}>No SMS sent yet for this order.</Text>
        )}
      </View>

      {/* Payment Modal */}
      <Modal
        visible={isPayModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPayModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Payment</Text>
              <Pressable onPress={() => setIsPayModalOpen(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            <Text style={styles.modalSub}>
              Remaining balance due: <Text style={{ color: Colors.rose, fontWeight: '800' }}>₹{job.cost.due}</Text>
            </Text>

            <Text style={styles.inputLabel}>Amount Received (₹)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={String(job.cost.due)}
              keyboardType="numeric"
              value={payAmount}
              onChangeText={setPayAmount}
            />

            <Text style={styles.inputLabel}>Payment Mode</Text>
            <View style={styles.modeRow}>
              {(['upi', 'cash', 'card'] as const).map((m) => (
                <Pressable
                  key={m}
                  style={[styles.modeChip, payMode === m && styles.modeChipActive]}
                  onPress={() => setPayMode(m)}>
                  <Text style={[styles.modeText, payMode === m && styles.modeTextActive]}>
                    {m.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.submitPayBtn} onPress={handleRecordPayment}>
              <Text style={styles.submitPayBtnText}>Confirm Payment</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Digital Invoice Preview Modal */}
      <Modal
        visible={isInvoiceOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsInvoiceOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.invoiceSheet}>
            <View style={styles.invoiceSheetHeader}>
              <Text style={styles.invoiceSheetTitle}>Digital Invoice Receipt</Text>
              <Pressable onPress={() => setIsInvoiceOpen(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View style={styles.invoiceBox}>
                <Text style={styles.invShopName}>OK-Repair Solutions</Text>
                <Text style={styles.invSub}>Invoice #: {job.invoice?.invoiceNumber || `INV-${job.jobId}`}</Text>
                <Text style={styles.invSub}>Date: {new Date().toLocaleDateString('en-IN')}</Text>

                <View style={styles.invDivider} />

                <Text style={styles.invSection}>Billed To:</Text>
                <Text style={styles.invCust}>{job.customerSnapshot.name} ({job.customerSnapshot.phone})</Text>

                <View style={styles.invDivider} />

                <Text style={styles.invSection}>Device & Service:</Text>
                <Text style={styles.invDevice}>{job.brand} {job.model} ({job.deviceType})</Text>
                <Text style={styles.invProblem}>Issue: {job.problemDescription}</Text>

                <View style={styles.invDivider} />

                <View style={styles.invRow}>
                  <Text style={styles.invLabel}>Repair Charges</Text>
                  <Text style={styles.invValue}>₹{job.cost.final}</Text>
                </View>
                <View style={styles.invRow}>
                  <Text style={styles.invLabel}>Total Paid</Text>
                  <Text style={[styles.invValue, { color: Colors.emerald }]}>₹{job.cost.advancePaid}</Text>
                </View>
                <View style={styles.invRow}>
                  <Text style={styles.invLabel}>Balance Due</Text>
                  <Text style={[styles.invValue, { color: hasDue ? Colors.rose : Colors.emerald }]}>
                    ₹{job.cost.due}
                  </Text>
                </View>

                <View style={styles.invDivider} />
                <Text style={styles.invFooter}>Thank you for choosing our repair service!</Text>
              </View>

              <Pressable
                style={styles.shareInvoiceBtn}
                onPress={() => Alert.alert('Share Invoice', `Sharing invoice for ${job.jobId} via WhatsApp / PDF.`)}>
                <Ionicons name="share-social" size={18} color="#FFFFFF" />
                <Text style={styles.shareInvoiceText}>Share Invoice with Customer</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  jobIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  jobIdBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  jobIdText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'SpaceMono',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  deviceMetaRow: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  metaVal: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  invoiceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  custRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  custInfo: {
    flex: 1,
  },
  custName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  custPhone: {
    fontSize: 13,
    color: '#64748B',
  },
  custActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  problemDesc: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginTop: 4,
  },
  pipelineHelp: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 12,
  },
  statusButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  statusSelectBtnCurrent: {
    backgroundColor: Colors.primary,
  },
  statusSelectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  statusSelectTextCurrent: {
    color: '#FFFFFF',
  },
  costSummaryRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  costBox: {
    flex: 1,
    alignItems: 'center',
  },
  costBoxLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  costBoxVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  recordPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.emerald,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  recordPayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  paymentHistory: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  payModeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  payModeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  payDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  payAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.emerald,
  },
  smsLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  smsLogRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  smsLogContent: {
    flex: 1,
  },
  smsLogType: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  smsLogTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  noSmsText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modeChipActive: {
    backgroundColor: Colors.primary,
  },
  modeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  submitPayBtn: {
    backgroundColor: Colors.emerald,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitPayBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  // Invoice Sheet
  invoiceSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  invoiceSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  invoiceSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  invoiceBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  invShopName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  invSub: {
    fontSize: 12,
    color: '#64748B',
  },
  invDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  invSection: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  invCust: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  invDevice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  invProblem: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  invRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  invLabel: {
    fontSize: 13,
    color: '#475569',
  },
  invValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  invFooter: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  shareInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  shareInvoiceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
