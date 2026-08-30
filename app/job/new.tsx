import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { DeviceType } from '../../types';
import { Colors } from '../../constants/Colors';

const deviceTypes: Array<{ type: DeviceType; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { type: 'mobile', label: 'Mobile', icon: 'phone-portrait-outline' },
  { type: 'laptop', label: 'Laptop', icon: 'laptop-outline' },
  { type: 'tablet', label: 'Tablet', icon: 'tablet-portrait-outline' },
  { type: 'smartwatch', label: 'Watch', icon: 'watch-outline' },
];

export default function NewJobScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ customerId?: string; name?: string; phone?: string }>();

  // Customer Details
  const [customerName, setCustomerName] = useState(params.name || '');
  const [customerPhone, setCustomerPhone] = useState(params.phone || '');

  // Device Details
  const [deviceType, setDeviceType] = useState<DeviceType>('mobile');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialOrImei, setSerialOrImei] = useState('');
  const [passcode, setPasscode] = useState('');
  const [problem, setProblem] = useState('');

  // Cost & Advance
  const [estimatedCost, setEstimatedCost] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card'>('cash');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      Alert.alert('Missing Customer', 'Please enter customer name and phone number.');
      return;
    }
    if (!brand.trim() || !model.trim() || !problem.trim()) {
      Alert.alert('Missing Device Info', 'Please enter Brand, Model, and Problem Description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newJob = await api.createJob({
        customerId: params.customerId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deviceType,
        brand: brand.trim(),
        model: model.trim(),
        serialOrImei: serialOrImei.trim(),
        passcodePattern: passcode.trim(),
        problemDescription: problem.trim(),
        estimatedCost: Number(estimatedCost) || 0,
        advancePaid: Number(advancePaid) || 0,
        paymentMode,
      });

      Alert.alert(
        'Job Created!',
        `Job Card ${newJob.jobId} created successfully. Fast2SMS "Order Received" notification sent to +91 ${customerPhone}.`,
        [
          {
            text: 'View Job Card',
            onPress: () => router.replace(`/job/${newJob._id}`),
          },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Fast2SMS Banner */}
      <View style={styles.smsNotice}>
        <Ionicons name="chatbox-ellipses" size={18} color="#0369A1" />
        <Text style={styles.smsNoticeText}>
          Customer will automatically receive an SMS with Job ID and shop contact number upon saving.
        </Text>
      </View>

      {/* Customer Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>1. Customer Information</Text>

        <Text style={styles.fieldLabel}>Customer Full Name *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Ramesh Kumar"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Text style={styles.fieldLabel}>Mobile Phone Number *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="10-digit number (e.g. 9876543210)"
          keyboardType="phone-pad"
          maxLength={10}
          value={customerPhone}
          onChangeText={setCustomerPhone}
        />
      </View>

      {/* Device Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>2. Device Details</Text>

        <Text style={styles.fieldLabel}>Device Type</Text>
        <View style={styles.deviceTypeRow}>
          {deviceTypes.map((dt) => {
            const isSelected = deviceType === dt.type;
            return (
              <Pressable
                key={dt.type}
                style={[styles.deviceTypeChip, isSelected && styles.deviceTypeChipSelected]}
                onPress={() => setDeviceType(dt.type)}>
                <Ionicons
                  name={dt.icon}
                  size={16}
                  color={isSelected ? Colors.primary : '#64748B'}
                />
                <Text style={[styles.deviceTypeLabel, isSelected && styles.deviceTypeLabelSelected]}>
                  {dt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Brand *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Apple"
              value={brand}
              onChangeText={setBrand}
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Model *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. iPhone 13"
              value={model}
              onChangeText={setModel}
            />
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>IMEI / Serial (Opt)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Optional"
              value={serialOrImei}
              onChangeText={setSerialOrImei}
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Passcode / PIN</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 1234"
              value={passcode}
              onChangeText={setPasscode}
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>Problem Description *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Describe broken screen, water damage, battery drain, no display, etc."
          multiline
          numberOfLines={3}
          value={problem}
          onChangeText={setProblem}
        />
      </View>

      {/* Cost & Payment Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>3. Cost Estimation & Advance</Text>

        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Estimated Cost (₹)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 2500"
              keyboardType="numeric"
              value={estimatedCost}
              onChangeText={setEstimatedCost}
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Advance Paid (₹)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 500"
              keyboardType="numeric"
              value={advancePaid}
              onChangeText={setAdvancePaid}
            />
          </View>
        </View>

        {Number(advancePaid) > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.fieldLabel}>Advance Payment Mode</Text>
            <View style={styles.deviceTypeRow}>
              {(['cash', 'upi', 'card'] as const).map((m) => (
                <Pressable
                  key={m}
                  style={[styles.deviceTypeChip, paymentMode === m && styles.deviceTypeChipSelected]}
                  onPress={() => setPaymentMode(m)}>
                  <Text
                    style={[
                      styles.deviceTypeLabel,
                      paymentMode === m && styles.deviceTypeLabelSelected,
                    ]}>
                    {m.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Submit Button */}
      <Pressable
        style={({ pressed }) => [styles.submitBtn, { opacity: pressed || isSubmitting ? 0.88 : 1 }]}
        disabled={isSubmitting}
        onPress={handleSubmit}>
        <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
        <Text style={styles.submitBtnText}>
          {isSubmitting ? 'Creating Job Card...' : 'Save Job Card & Send SMS'}
        </Text>
      </Pressable>

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
  smsNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  smsNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 16,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top',
  },
  twoCol: {
    flexDirection: 'row',
  },
  deviceTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  deviceTypeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  deviceTypeChipSelected: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primaryLight,
  },
  deviceTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  deviceTypeLabelSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
