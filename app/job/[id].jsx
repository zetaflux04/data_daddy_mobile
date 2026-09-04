import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api, resolveImageUrls } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { DeviceIcon } from '../../components/DeviceIcon';
import { Colors } from '../../constants/Colors';
import { AppHeader } from '../../components/AppHeader';
import { S3Image } from '../../components/S3Image';
import { FloatingCloseButton } from '../../components/FloatingCloseButton';
import { useAuth } from '../../context/AuthContext';
const statusFlow = ['pending', 'in_progress', 'parts_delayed', 'repaired', 'delivered'];
export default function JobDetailScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user, shop } = useAuth();
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Staff & Technician State
    const [staffList, setStaffList] = useState([]);
    const [selectedRepairedBy, setSelectedRepairedBy] = useState(null);
    const [isTechDropdownOpen, setIsTechDropdownOpen] = useState(false);
    // Payment Modal
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [payAmount, setPayAmount] = useState('');
    const [payMode, setPayMode] = useState('upi');
    // Delivered Confirmation Modal State
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [deliveryImei, setDeliveryImei] = useState('');
    const [hasWarranty, setHasWarranty] = useState(false);
    const [warrantyUnit, setWarrantyUnit] = useState('months');
    const [warrantyPeriod, setWarrantyPeriod] = useState('3');
    const [isDelivering, setIsDelivering] = useState(false);
    const loadJob = async () => {
        if (!id)
            return;
        setIsLoading(true);
        try {
            const data = await api.getJobById(id);
            setJob(data);
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadStaff = async () => {
        try {
            const list = await api.getStaff();
            setStaffList(list || []);
        }
        catch {
            setStaffList([]);
        }
    };
    useEffect(() => {
        loadJob();
        loadStaff();
    }, [id]);
    // Combined options: Shop Owner (Self) + Technicians added by the shop owner
    const repairedByOptions = React.useMemo(() => {
        const ownerName = shop?.ownerName || user?.name || 'Shop Owner';
        const ownerId = user?.id || user?._id || 'owner_self';
        const list = [
            {
                id: String(ownerId),
                name: `${ownerName} (Self)`,
                label: `${ownerName} (Self)`,
                role: 'owner',
                isSelf: true,
            },
        ];
        (staffList || []).forEach((s) => {
            const isOwnerRole = s.role === 'owner';
            const matchesOwnerId = s._id && s._id === ownerId;
            const matchesPhone = s.phone && (s.phone === user?.phone || s.phone === shop?.phone);
            if (isOwnerRole || matchesOwnerId || matchesPhone) {
                return;
            }
            list.push({
                id: String(s._id || s.id),
                name: s.name,
                label: s.name,
                role: s.role || 'technician',
                isSelf: false,
            });
        });
        return list;
    }, [shop, user, staffList]);
    const handleStatusClick = (newStatus) => {
        if (!job)
            return;
        if (newStatus === 'delivered') {
            setDeliveryImei(job.serialOrImei || '');
            setHasWarranty(job.warranty?.hasWarranty ?? false);
            setWarrantyUnit(job.warranty?.unit ?? 'months');
            setWarrantyPeriod(job.warranty?.period ? String(job.warranty.period) : '3');
            // Initialize selectedRepairedBy
            if (job.repairedBy?.name) {
                setSelectedRepairedBy(job.repairedBy);
            }
            else if (job.assignedTechnicianId && typeof job.assignedTechnicianId === 'object' && job.assignedTechnicianId.name) {
                setSelectedRepairedBy({
                    id: job.assignedTechnicianId._id,
                    name: job.assignedTechnicianId.name,
                    role: 'technician',
                });
            }
            else {
                const ownerName = shop?.ownerName || user?.name || 'Shop Owner';
                const ownerId = user?.id || user?._id || 'owner_self';
                setSelectedRepairedBy({
                    id: String(ownerId),
                    name: `${ownerName} (Self)`,
                    role: 'owner',
                });
            }
            setIsTechDropdownOpen(false);
            setIsDeliveryModalOpen(true);
        }
        else {
            handleUpdateStatus(newStatus);
        }
    };
    const handleUpdateStatus = async (newStatus) => {
        if (!job)
            return;
        try {
            const updated = await api.updateJobStatus(job._id, newStatus);
            if (updated) {
                setJob({ ...updated });
                if (newStatus === 'repaired') {
                    Alert.alert('Status Updated: Repaired', `SMS sent to customer ${job.customerSnapshot.phone}: "Device for ${job.jobId} is ready for pickup."`);
                }
            }
        }
        catch (e) {
            Alert.alert('Update Failed', e.response?.data?.message || 'Failed to update job status.');
        }
    };
    const handleConfirmDelivery = async () => {
        if (!job)
            return;
        if (hasWarranty) {
            const periodNum = parseInt(warrantyPeriod, 10);
            if (isNaN(periodNum) || periodNum <= 0) {
                Alert.alert('Invalid Warranty Period', 'Please enter a valid positive number for the warranty duration.');
                return;
            }
        }
        setIsDelivering(true);
        try {
            const updated = await api.updateJobStatus(job._id, 'delivered', {
                serialOrImei: deliveryImei.trim(),
                warranty: {
                    hasWarranty,
                    period: hasWarranty ? Number(warrantyPeriod) : undefined,
                    unit: hasWarranty ? warrantyUnit : undefined,
                },
                repairedBy: selectedRepairedBy
                    ? {
                        id: selectedRepairedBy.id,
                        name: selectedRepairedBy.name,
                        role: selectedRepairedBy.role,
                    }
                    : undefined,
                assignedTechnicianId: selectedRepairedBy?.id,
            });
            if (updated) {
                setJob({ ...updated });
                setIsDeliveryModalOpen(false);
                const techInfo = selectedRepairedBy?.name ? ` Repaired by: ${selectedRepairedBy.name}.` : '';
                Alert.alert('Status Updated: Delivered', `Device marked as delivered.${hasWarranty ? ` Warranty active for ${warrantyPeriod} ${warrantyUnit}.` : ''}${techInfo} Invoice sent to ${job.customerSnapshot.phone}.`);
            }
        }
        catch {
            Alert.alert('Delivery Error', 'Failed to update job status to delivered.');
        }
        finally {
            setIsDelivering(false);
        }
    };
    const getWarrantyExpiryPreview = () => {
        const period = parseInt(warrantyPeriod, 10);
        if (isNaN(period) || period <= 0)
            return '';
        const d = new Date();
        if (warrantyUnit === 'days')
            d.setDate(d.getDate() + period);
        else if (warrantyUnit === 'months')
            d.setMonth(d.getMonth() + period);
        else if (warrantyUnit === 'years')
            d.setFullYear(d.getFullYear() + period);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    const handleRecordPayment = async () => {
        const entered = Number(payAmount);
        if (!job || !payAmount || isNaN(entered) || entered <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount.');
            return;
        }
        if (job.status !== 'delivered') {
            Alert.alert('Payment Restricted', 'Payments can only be recorded once the job status is Delivered.');
            return;
        }
        const estimatePrice = job.cost.final || job.cost.estimated || 0;
        const currentPaid = job.cost.advancePaid || 0;
        const maxPayable = job.cost.due;
        if (entered > maxPayable || (currentPaid + entered) > estimatePrice) {
            Alert.alert('Payment Exceeds Estimate', `Payment amount (₹${entered}) cannot exceed the estimate price of ₹${estimatePrice} (Remaining due: ₹${maxPayable}). Total paid cannot be greater than the estimate price.`);
            return;
        }
        try {
            const updated = await api.addPayment(job._id, entered, payMode);
            if (updated) {
                setJob({ ...updated });
                setIsPayModalOpen(false);
                setPayAmount('');
                Alert.alert('Payment Recorded', `Successfully recorded ₹${entered.toLocaleString('en-IN')} via ${payMode.toUpperCase()}.`);
            }
        }
        catch (e) {
            Alert.alert('Payment Failed', e.response?.data?.message || 'Failed to record payment.');
        }
    };
    const openCall = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };
    const openWhatsApp = (phone) => {
        const clean = phone.replace(/\D/g, '').slice(-10);
        Linking.openURL(`https://wa.me/91${clean}?text=Hello%20${job?.customerSnapshot.name},%20regarding%20your%20repair%20order%20${job?.jobId}`);
    };
    if (!job) {
        return (<View style={styles.container}>
        <AppHeader title="Job Card Details"/>
        <View style={styles.centerContainer}>
          <Text style={{ color: '#64748B' }}>Loading job details...</Text>
        </View>
      </View>);
    }
    const hasDue = job.cost.due > 0;
    return (<View style={styles.container}>
      <AppHeader title="Job Card Details" subtitle={job.jobId}/>

      <ScrollView style={styles.scrollArea} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}>
        {/* Top Banner Card */}
        <View style={styles.topCard}>
          <View style={styles.headerRow}>
            <DeviceIcon type={job.deviceType} size={24}/>
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
            <StatusBadge status={job.status} size="md"/>
          </View>

          {job.serialOrImei || job.passcodePattern ? (<View style={styles.deviceMetaRow}>
              {job.serialOrImei && (<View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>IMEI/Serial:</Text>
                  <Text style={styles.metaVal}>{job.serialOrImei}</Text>
                </View>)}
              {job.passcodePattern && (<View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Passcode:</Text>
                  <Text style={styles.metaVal}>{job.passcodePattern}</Text>
                </View>)}
            </View>) : null}

          <View style={styles.topCardActionRow}>
            <Pressable
              style={styles.viewInvoiceHeaderBtn}
              onPress={() => router.push(`/invoice/${job._id || job.id || id}`)}
            >
              <Ionicons name="receipt-outline" size={14} color={Colors.primary} />
              <Text style={styles.viewInvoiceHeaderBtnText}>Tax Invoice</Text>
            </Pressable>
          </View>
        </View>

        {/* Warranty Active Card (if applicable) */}
        {job.warranty?.hasWarranty && (<View style={styles.warrantyCard}>
            <View style={styles.warrantyHeader}>
              <View style={styles.warrantyIconCircle}>
                <Ionicons name="shield-checkmark" size={18} color={Colors.emerald}/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.warrantyTitle}>Service Warranty Active</Text>
                <Text style={styles.warrantySub}>
                  Coverage: {job.warranty.period} {job.warranty.unit}
                  {job.warranty.expiresAt
                ? ` • Expires ${new Date(job.warranty.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : ''}
                </Text>
              </View>
              <View style={styles.warrantyPill}>
                <Text style={styles.warrantyPillText}>PROTECTED</Text>
              </View>
            </View>
          </View>)}

        {/* Repaired By Card (if recorded) */}
        {(job.repairedBy?.name || (typeof job.assignedTechnicianId === 'object' && job.assignedTechnicianId?.name)) && (<View style={styles.repairedByCard}>
            <View style={styles.repairedByHeader}>
              <View style={styles.repairedByIconCircle}>
                <Ionicons name="construct" size={18} color="#2563EB"/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.repairedByTitle}>Repaired By</Text>
                <Text style={styles.repairedBySub}>
                  {job.repairedBy?.name || (typeof job.assignedTechnicianId === 'object' ? job.assignedTechnicianId?.name : '')}
                </Text>
              </View>
              <View style={[
                styles.repairedByPill,
                (job.repairedBy?.role === 'owner' || job.repairedBy?.name?.includes('(Self)'))
                    ? { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }
                    : { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
            ]}>
                <Text style={[
                styles.repairedByPillText,
                (job.repairedBy?.role === 'owner' || job.repairedBy?.name?.includes('(Self)'))
                    ? { color: '#92400E' }
                    : { color: '#1E40AF' },
            ]}>
                  {(job.repairedBy?.role === 'owner' || job.repairedBy?.name?.includes('(Self)'))
                ? 'SHOP OWNER (SELF)'
                : 'TECHNICIAN'}
                </Text>
              </View>
            </View>
          </View>)}

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
                <Ionicons name="call" size={18} color="#0284C7"/>
              </Pressable>
              <Pressable style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]} onPress={() => openWhatsApp(job.customerSnapshot.phone)}>
                <Ionicons name="logo-whatsapp" size={18} color="#16A34A"/>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Problem Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reported Problem</Text>
          <Text style={styles.problemDesc}>{job.problemDescription}</Text>
        </View>

        {/* Device Photos if uploaded */}
        {job.photos && job.photos.length > 0 && (<View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={styles.cardTitle}>Product Photos ({job.photos.length})</Text>
              <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500' }}>Inspection records</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
              {job.photos.map((photoUrl, idx) => {
                const urls = resolveImageUrls(photoUrl);
                if (!urls)
                    return null;
                return (<View key={idx} style={{ position: 'relative', marginRight: 10, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <S3Image uri={urls.uri} proxyUri={urls.proxyUri} style={{ width: 100, height: 100, borderRadius: 10, backgroundColor: '#F1F5F9' }} resizeMode="cover"/>
                    <View style={{ position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(15, 23, 42, 0.75)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>#{idx + 1}</Text>
                    </View>
                  </View>);
            })}
            </ScrollView>
          </View>)}

        {/* Pipeline Status Controller */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Update Job Status</Text>
          <Text style={styles.pipelineHelp}>
            Tap any status to update. Customer SMS is sent automatically on Repaired and Delivered.
          </Text>

          <View style={styles.statusButtonsGrid}>
            {statusFlow.map((st) => {
            const isCurrent = job.status === st;
            return (<Pressable key={st} style={[
                    styles.statusSelectBtn,
                    isCurrent && styles.statusSelectBtnCurrent,
                ]} onPress={() => handleStatusClick(st)}>
                  <Text style={[
                    styles.statusSelectText,
                    isCurrent && styles.statusSelectTextCurrent,
                ]}>
                    {st.replace('_', ' ').toUpperCase()}
                  </Text>
                  {isCurrent && <Ionicons name="checkmark-circle" size={16} color="#FFFFFF"/>}
                </Pressable>);
        })}
          </View>
        </View>

        {/* Financials & Payments — Only shown when job status is delivered */}
        {job.status === 'delivered' && (<View style={styles.card}>
            <View style={styles.cardHeaderBetween}>
              <Text style={styles.cardTitle}>Billing & Payments</Text>
              <Pressable style={styles.invoiceBtn} onPress={() => router.push(`/invoice/${job._id || job.id || id}`)}>
                <Ionicons name="document-text" size={14} color={Colors.primary}/>
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

            {hasDue && (<Pressable style={({ pressed }) => [styles.recordPayBtn, { opacity: pressed ? 0.9 : 1 }]} onPress={() => setIsPayModalOpen(true)}>
                <Ionicons name="cash-outline" size={18} color="#FFFFFF"/>
                <Text style={styles.recordPayText}>Record Payment</Text>
              </Pressable>)}

            {/* Payments list */}
            {job.payments && job.payments.length > 0 && (<View style={styles.paymentHistory}>
                <Text style={styles.subHeading}>Payment History</Text>
                {job.payments.map((p, idx) => (<View key={idx} style={styles.payRow}>
                    <View style={styles.payModeBadge}>
                      <Text style={styles.payModeText}>{p.mode.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.payDate}>
                      {new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                    <Text style={styles.payAmount}>+₹{p.amount.toLocaleString('en-IN')}</Text>
                  </View>))}
              </View>)}
          </View>)}

        {/* SMS Logs */}
        <View style={styles.card}>
          <View style={styles.smsLogHeader}>
            <Ionicons name="chatbubble-ellipses" size={18} color="#0284C7"/>
            <Text style={[styles.cardTitle, { marginLeft: 8 }]}>Customer SMS Updates Delivered</Text>
          </View>

          {job.smsLogs && job.smsLogs.length > 0 ? (job.smsLogs.map((log, index) => (<View key={index} style={styles.smsLogRow}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.emerald}/>
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
              </View>))) : (<Text style={styles.noSmsText}>No SMS sent yet for this order.</Text>)}
        </View>

        {/* Delivered Confirmation Modal */}
        <Modal visible={isDeliveryModalOpen} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setIsDeliveryModalOpen(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setIsDeliveryModalOpen(false)}/>
            <FloatingCloseButton onPress={() => setIsDeliveryModalOpen(false)}/>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  <View style={[styles.modalIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="checkmark-done-circle" size={22} color={Colors.emerald}/>
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Device Delivery & Warranty</Text>
                    <Text style={styles.modalHeaderSub}>Confirm IMEI and repair guarantee</Text>
                  </View>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* IMEI / Serial Number Input */}
                <Text style={styles.inputLabel}>1. IMEI / Serial Number</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. 356984110293847 or SN-98234" placeholderTextColor="#94A3B8" value={deliveryImei} onChangeText={setDeliveryImei}/>

                {/* Warranty Yes/No Selection */}
                <Text style={[styles.inputLabel, { marginTop: 14 }]}>2. Warranty Guarantee</Text>
                <View style={styles.warrantyChoiceRow}>
                  <Pressable style={[styles.warrantyChoiceBtn, !hasWarranty && styles.warrantyChoiceBtnActive]} onPress={() => setHasWarranty(false)}>
                    <Ionicons name={!hasWarranty ? 'radio-button-on' : 'radio-button-off'} size={18} color={!hasWarranty ? Colors.primary : '#94A3B8'}/>
                    <Text style={[styles.warrantyChoiceText, !hasWarranty && styles.warrantyChoiceTextActive]}>
                      No Warranty
                    </Text>
                  </Pressable>

                  <Pressable style={[styles.warrantyChoiceBtn, hasWarranty && styles.warrantyChoiceBtnActiveEmerald]} onPress={() => setHasWarranty(true)}>
                    <Ionicons name={hasWarranty ? 'radio-button-on' : 'radio-button-off'} size={18} color={hasWarranty ? Colors.emerald : '#94A3B8'}/>
                    <Text style={[styles.warrantyChoiceText, hasWarranty && styles.warrantyChoiceTextActiveEmerald]}>
                      Provide Warranty (Yes)
                    </Text>
                  </Pressable>
                </View>

                {/* If Warranty is Yes: Time Span Unit Dropdown/Chips + Number Input */}
                {hasWarranty && (<View style={styles.warrantyFormBox}>
                    <Text style={styles.warrantyFormLabel}>Choose Time Span & Duration:</Text>

                    {/* Dropdown / Chips for Unit (Days, Months, Years) */}
                    <View style={styles.unitChipsRow}>
                      {['days', 'months', 'years'].map((unit) => {
                const isSelected = warrantyUnit === unit;
                return (<Pressable key={unit} style={[styles.unitChip, isSelected && styles.unitChipSelected]} onPress={() => setWarrantyUnit(unit)}>
                            <Text style={[styles.unitChipText, isSelected && styles.unitChipTextSelected]}>
                              {unit === 'days' ? 'Days' : unit === 'months' ? 'Months' : 'Years'}
                            </Text>
                          </Pressable>);
            })}
                    </View>

                    {/* Number Input Box */}
                    <Text style={[styles.warrantyFormLabel, { marginTop: 10 }]}>
                      Enter Number of {warrantyUnit.charAt(0).toUpperCase() + warrantyUnit.slice(1)}:
                    </Text>
                    <TextInput style={styles.modalInput} placeholder="e.g. 1, 3, 6, 12, 30" placeholderTextColor="#94A3B8" keyboardType="numeric" value={warrantyPeriod} onChangeText={setWarrantyPeriod}/>

                    {/* Calculated Live Expiry Preview */}
                    {getWarrantyExpiryPreview() ? (<View style={styles.expiryPreviewPill}>
                        <Ionicons name="shield-checkmark" size={15} color={Colors.emerald}/>
                        <Text style={styles.expiryPreviewText}>
                          Warranty valid until:{' '}
                          <Text style={{ fontWeight: '800' }}>
                            {getWarrantyExpiryPreview()} ({warrantyPeriod} {warrantyUnit})
                          </Text>
                        </Text>
                      </View>) : null}
                  </View>)}

                {/* 3. Repaired By Dropdown */}
                <Text style={[styles.inputLabel, { marginTop: 14 }]}>3. Repaired By</Text>
                <Text style={styles.inputSubLabel}>
                  Select technician or shop owner (self) who completed this repair:
                </Text>

                {/* Dropdown Selector */}
                <View style={styles.dropdownContainer}>
                  <Pressable style={[
            styles.dropdownTrigger,
            isTechDropdownOpen && styles.dropdownTriggerActive,
        ]} onPress={() => setIsTechDropdownOpen((prev) => !prev)}>
                    <View style={styles.dropdownTriggerLeft}>
                      <View style={[
            styles.dropdownTriggerAvatar,
            (selectedRepairedBy?.role === 'owner' || selectedRepairedBy?.name?.includes('(Self)'))
                ? { backgroundColor: '#FEF3C7' }
                : { backgroundColor: '#EFF6FF' },
        ]}>
                        <Ionicons name={(selectedRepairedBy?.role === 'owner' || selectedRepairedBy?.name?.includes('(Self)'))
            ? 'person-circle-outline'
            : 'construct-outline'} size={20} color={(selectedRepairedBy?.role === 'owner' || selectedRepairedBy?.name?.includes('(Self)'))
            ? '#D97706'
            : Colors.primary}/>
                      </View>
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.dropdownTriggerValue} numberOfLines={1}>
                            {selectedRepairedBy?.name || 'Select Technician'}
                          </Text>
                          {(selectedRepairedBy?.role === 'owner' || selectedRepairedBy?.name?.includes('(Self)')) && (<View style={styles.selfBadge}>
                              <Text style={styles.selfBadgeText}>SELF</Text>
                            </View>)}
                        </View>
                        <Text style={styles.dropdownTriggerSub}>
                          {(selectedRepairedBy?.role === 'owner' || selectedRepairedBy?.name?.includes('(Self)'))
            ? 'Shop Owner'
            : selectedRepairedBy?.role === 'technician'
                ? 'Technician'
                : 'Staff Member'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.dropdownChevronCircle}>
                      <Ionicons name={isTechDropdownOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#475569"/>
                    </View>
                  </Pressable>

                  {/* Dropdown Menu Options */}
                  {isTechDropdownOpen && (<View style={styles.dropdownMenu}>
                      {repairedByOptions.map((opt, idx) => {
                const isSelected = selectedRepairedBy?.name === opt.name ||
                    (selectedRepairedBy?.id && selectedRepairedBy?.id === opt.id);
                const isLast = idx === repairedByOptions.length - 1;
                return (<Pressable key={opt.id} style={[
                        styles.dropdownMenuItem,
                        isSelected && styles.dropdownMenuItemSelected,
                        !isLast && styles.dropdownMenuItemDivider,
                    ]} onPress={() => {
                        setSelectedRepairedBy({ id: opt.id, name: opt.name, role: opt.role });
                        setIsTechDropdownOpen(false);
                    }}>
                            <View style={styles.dropdownMenuItemLeft}>
                              <View style={[
                        styles.dropdownMenuItemAvatar,
                        opt.isSelf ? { backgroundColor: '#FEF3C7' } : { backgroundColor: '#EFF6FF' },
                    ]}>
                                <Ionicons name={opt.isSelf ? 'person-circle-outline' : 'construct-outline'} size={17} color={opt.isSelf ? '#D97706' : Colors.primary}/>
                              </View>
                              <View style={{ marginLeft: 10, flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                  <Text style={[
                        styles.dropdownMenuItemName,
                        isSelected && styles.dropdownMenuItemNameSelected,
                    ]} numberOfLines={1}>
                                    {opt.name}
                                  </Text>
                                  {opt.isSelf && (<View style={styles.selfBadge}>
                                      <Text style={styles.selfBadgeText}>SELF</Text>
                                    </View>)}
                                </View>
                                <Text style={styles.dropdownMenuItemRole}>
                                  {opt.isSelf ? 'Shop Owner' : opt.role === 'technician' ? 'Technician' : 'Staff Member'}
                                </Text>
                              </View>
                            </View>

                            {isSelected ? (<Ionicons name="checkmark-circle" size={19} color={Colors.emerald}/>) : (<Ionicons name="ellipse-outline" size={19} color="#CBD5E1"/>)}
                          </Pressable>);
            })}
                    </View>)}
                </View>

                {repairedByOptions.length === 1 && (<Text style={styles.techHintText}>
                    💡 Tip: Add more technicians from Settings &gt; Staff to assign orders directly to team members.
                  </Text>)}

                {/* Outstanding balance warning if applicable */}
                {hasDue && (<View style={styles.dueWarningBox}>
                    <Ionicons name="alert-circle-outline" size={18} color={Colors.rose}/>
                    <Text style={styles.dueWarningText}>
                      Customer has an unpaid balance of ₹{job.cost.due}. Payment can also be collected later.
                    </Text>
                  </View>)}

                <View style={styles.deliveryModalActions}>
                  <Pressable disabled={isDelivering} style={styles.modalCancelBtn} onPress={() => setIsDeliveryModalOpen(false)}>
                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                  </Pressable>

                  <Pressable disabled={isDelivering} style={({ pressed }) => [
            styles.confirmDeliveryBtn,
            { opacity: pressed || isDelivering ? 0.88 : 1 },
        ]} onPress={handleConfirmDelivery}>
                    {isDelivering ? (<ActivityIndicator size="small" color="#FFFFFF"/>) : (<>
                        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF"/>
                        <Text style={styles.confirmDeliveryBtnText}>Confirm & Deliver</Text>
                      </>)}
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Payment Modal */}
        <Modal visible={isPayModalOpen} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setIsPayModalOpen(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setIsPayModalOpen(false)}/>
            <FloatingCloseButton onPress={() => setIsPayModalOpen(false)}/>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Record Payment</Text>
              </View>

              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
                <Text style={styles.modalSub}>
                  Remaining balance due:{' '}
                  <Text style={{ color: Colors.rose, fontWeight: '800' }}>₹{job.cost.due}</Text>
                  <Text style={{ color: '#64748B', fontWeight: '500' }}> (Estimate: ₹{job.cost.final})</Text>
                </Text>

                <Text style={styles.inputLabel}>Amount Received (₹)</Text>
                <TextInput style={[
            styles.modalInput,
            (Number(payAmount) > job.cost.due || (job.cost.advancePaid + Number(payAmount)) > job.cost.final) && {
                borderColor: Colors.rose,
                borderWidth: 1.5,
            },
        ]} placeholder={`Max ₹${job.cost.due}`} placeholderTextColor="#94A3B8" keyboardType="numeric" value={payAmount} onChangeText={setPayAmount}/>

                {(Number(payAmount) > job.cost.due || (job.cost.advancePaid + Number(payAmount)) > job.cost.final) && (<Text style={{ color: Colors.rose, fontSize: 12, marginTop: 4, marginBottom: 10, fontWeight: '600' }}>
                    Payment amount cannot exceed remaining due ₹{job.cost.due} (Estimate: ₹{job.cost.final}).
                  </Text>)}

                <Text style={styles.inputLabel}>Payment Mode</Text>
                <View style={styles.modeRow}>
                  {['upi', 'cash', 'card'].map((m) => (<Pressable key={m} style={[styles.modeChip, payMode === m && styles.modeChipActive]} onPress={() => setPayMode(m)}>
                      <Text style={[styles.modeText, payMode === m && styles.modeTextActive]}>
                        {m.toUpperCase()}
                      </Text>
                    </Pressable>))}
                </View>

                <Pressable style={[
            styles.submitPayBtn,
            (!payAmount ||
                Number(payAmount) <= 0 ||
                Number(payAmount) > job.cost.due ||
                (job.cost.advancePaid + Number(payAmount)) > job.cost.final) && {
                backgroundColor: '#94A3B8',
            },
        ]} disabled={!payAmount ||
            Number(payAmount) <= 0 ||
            Number(payAmount) > job.cost.due ||
            (job.cost.advancePaid + Number(payAmount)) > job.cost.final} onPress={handleRecordPayment}>
                  <Text style={styles.submitPayBtnText}>Confirm Payment</Text>
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>



        <View style={{ height: 40 }}/>
      </ScrollView>
    </View>);
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
        marginBottom: 16,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleInfo: {
        flex: 1,
        marginLeft: 12,
    },
    jobIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    jobIdBadge: {
        backgroundColor: Colors.primaryGlow,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    jobIdText: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.primary,
    },
    dateText: {
        fontSize: 11,
        color: '#94A3B8',
    },
    deviceName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#0F172A',
    },
    deviceMetaRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    topCardActionRow: {
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    viewInvoiceHeaderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    viewInvoiceHeaderBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
    metaVal: {
        fontSize: 12,
        color: '#0F172A',
        fontWeight: '700',
    },
    warrantyCard: {
        backgroundColor: '#ECFDF5',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#A7F3D0',
        marginBottom: 16,
    },
    warrantyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    warrantyIconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#D1FAE5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    warrantyTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#065F46',
    },
    warrantySub: {
        fontSize: 12,
        color: '#047857',
        marginTop: 1,
    },
    warrantyPill: {
        backgroundColor: '#059669',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    warrantyPillText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardHeaderBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#0F172A',
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
        fontSize: 15,
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
    },
    pipelineHelp: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
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
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
    },
    statusSelectBtnCurrent: {
        backgroundColor: Colors.primary,
    },
    statusSelectText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },
    statusSelectTextCurrent: {
        color: '#FFFFFF',
    },
    invoiceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.primaryGlow,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    invoiceBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary,
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
        marginBottom: 2,
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
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 10,
    },
    subHeading: {
        fontSize: 12,
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
        fontSize: 10,
        fontWeight: '800',
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
        marginBottom: 10,
    },
    smsLogRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 8,
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
    },
    noSmsText: {
        fontSize: 12,
        color: '#94A3B8',
    },
    // Modal Common
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFill,
    },
    modalCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 22,
        maxHeight: '92%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    modalHeaderTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    modalIconBox: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#0F172A',
    },
    modalHeaderSub: {
        fontSize: 12,
        color: '#64748B',
    },
    modalSub: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 6,
    },
    modalInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 14,
        color: '#0F172A',
    },
    // Delivered Modal Styles
    warrantyChoiceRow: {
        flexDirection: 'row',
        gap: 10,
    },
    warrantyChoiceBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingVertical: 12,
        borderRadius: 12,
    },
    warrantyChoiceBtnActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryGlow,
    },
    warrantyChoiceBtnActiveEmerald: {
        borderColor: Colors.emerald,
        backgroundColor: '#ECFDF5',
    },
    warrantyChoiceText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    warrantyChoiceTextActive: {
        color: Colors.primary,
    },
    warrantyChoiceTextActiveEmerald: {
        color: Colors.emerald,
    },
    warrantyFormBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 14,
        marginTop: 12,
    },
    warrantyFormLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
    },
    unitChipsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 4,
    },
    unitChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    unitChipSelected: {
        backgroundColor: Colors.emerald,
        borderColor: Colors.emerald,
    },
    unitChipText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
    },
    unitChipTextSelected: {
        color: '#FFFFFF',
    },
    expiryPreviewPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    expiryPreviewText: {
        fontSize: 12,
        color: '#065F46',
    },
    dueWarningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFF1F2',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 14,
        borderWidth: 1,
        borderColor: '#FECDD3',
    },
    dueWarningText: {
        flex: 1,
        fontSize: 12,
        color: Colors.rose,
        fontWeight: '600',
    },
    deliveryModalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        marginBottom: 10,
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
    },
    modalCancelBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    confirmDeliveryBtn: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.emerald,
        gap: 6,
    },
    confirmDeliveryBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // Mode chips in pay modal
    modeRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 6,
        marginBottom: 16,
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
        fontSize: 12,
        fontWeight: '800',
        color: '#64748B',
    },
    modeTextActive: {
        color: '#FFFFFF',
    },
    submitPayBtn: {
        backgroundColor: Colors.primary,
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
    invWarrantyBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 6,
    },
    invWarrantyText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#065F46',
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
    // Repaired By Card on Job Details
    repairedByCard: {
        backgroundColor: '#F0F9FF',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#BAE6FD',
        marginBottom: 16,
    },
    repairedByHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    repairedByIconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#E0F2FE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    repairedByTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#0369A1',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    repairedBySub: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0C4A6E',
        marginTop: 1,
    },
    repairedByPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
    },
    repairedByPillText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    inputSubLabel: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 8,
        marginTop: -2,
    },
    // Dropdown Styles for Repaired By
    dropdownContainer: {
        marginBottom: 8,
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    dropdownTriggerActive: {
        borderColor: Colors.primary,
        backgroundColor: '#F0F9FF',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    dropdownTriggerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dropdownTriggerAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdownTriggerValue: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0F172A',
    },
    dropdownTriggerSub: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 1,
    },
    dropdownChevronCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dropdownMenu: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderTopWidth: 0,
        borderColor: Colors.primary,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        overflow: 'hidden',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    dropdownMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    dropdownMenuItemSelected: {
        backgroundColor: '#F0FDF4',
    },
    dropdownMenuItemDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    dropdownMenuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dropdownMenuItemAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdownMenuItemName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
    },
    dropdownMenuItemNameSelected: {
        color: '#0F172A',
        fontWeight: '800',
    },
    dropdownMenuItemRole: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 1,
    },
    selfBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#FDE68A',
    },
    selfBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#92400E',
        letterSpacing: 0.5,
    },
    techHintText: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 4,
        fontStyle: 'italic',
    },
});
