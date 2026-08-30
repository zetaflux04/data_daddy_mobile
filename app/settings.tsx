import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';

export default function SettingsScreen() {
  const { shop } = useAuth();

  const [shopName, setShopName] = useState(shop?.name || 'OK-Repair Solutions');
  const [ownerName, setOwnerName] = useState(shop?.ownerName || 'Sunil Verma');
  const [phone, setPhone] = useState(shop?.phone || '9876543210');
  const [address, setAddress] = useState('Shop #14, Main Market, Jaipur');

  // Fast2SMS Toggles
  const [smsOrderReceived, setSmsOrderReceived] = useState(true);
  const [smsRepaired, setSmsRepaired] = useState(true);
  const [smsDelivered, setSmsDelivered] = useState(true);

  const handleSave = () => {
    Alert.alert('Settings Saved', 'Shop details and Fast2SMS notification rules updated successfully.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Fast2SMS Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fast2SMS Automated Notifications</Text>
        <Text style={styles.sectionSubtitle}>
          Configure which customer events automatically trigger instant SMS alerts
        </Text>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Order Received SMS</Text>
              <Text style={styles.switchDesc}>Sent with Job ID & shop phone number upon job card intake</Text>
            </View>
            <Switch
              value={smsOrderReceived}
              onValueChange={setSmsOrderReceived}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Device Repaired (Ready for Pickup)</Text>
              <Text style={styles.switchDesc}>Alerts customer their device is ready with outstanding balance</Text>
            </View>
            <Switch
              value={smsRepaired}
              onValueChange={setSmsRepaired}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Delivered Confirmation SMS</Text>
              <Text style={styles.switchDesc}>Sent upon final delivery and receipt payment collection</Text>
            </View>
            <Switch
              value={smsDelivered}
              onValueChange={setSmsDelivered}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      {/* Shop Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop Profile Details</Text>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Shop Business Name</Text>
          <TextInput
            style={styles.textInput}
            value={shopName}
            onChangeText={setShopName}
          />

          <Text style={styles.inputLabel}>Owner / Primary Manager</Text>
          <TextInput
            style={styles.textInput}
            value={ownerName}
            onChangeText={setOwnerName}
          />

          <Text style={styles.inputLabel}>Shop Contact Phone</Text>
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Physical Address (Prints on Invoice)</Text>
          <TextInput
            style={styles.textInput}
            value={address}
            onChangeText={setAddress}
          />
        </View>
      </View>

      {/* Save Button */}
      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Ionicons name="save-outline" size={18} color="#FFFFFF" />
        <Text style={styles.saveBtnText}>Save Preferences</Text>
      </Pressable>

      <View style={{ height: 30 }} />
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    marginLeft: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  switchDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
