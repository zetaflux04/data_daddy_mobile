import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: 'owner' | 'technician' | 'staff';
  active: boolean;
}

const initialStaff: StaffMember[] = [
  { id: '1', name: 'Sunil Verma', phone: '9876543210', role: 'owner', active: true },
  { id: '2', name: 'Deepak Sharma', phone: '9811223344', role: 'technician', active: true },
  { id: '3', name: 'Aakash Patel', phone: '9766554433', role: 'technician', active: true },
  { id: '4', name: 'Neha Gupta', phone: '9988112233', role: 'staff', active: true },
];

export default function StaffScreen() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'technician' | 'staff'>('technician');

  const handleAddStaff = () => {
    if (!name.trim() || !phone.trim() || phone.trim().length !== 10) {
      Alert.alert('Invalid Details', 'Please provide a valid name and 10-digit mobile phone number.');
      return;
    }

    const newMember: StaffMember = {
      id: String(Date.now()),
      name: name.trim(),
      phone: phone.trim(),
      role,
      active: true,
    };

    setStaff([...staff, newMember]);
    setIsModalOpen(false);
    setName('');
    setPhone('');
    Alert.alert('Staff Added', `${name} has been added as a ${role}.`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topNotice}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
        <Text style={styles.noticeText}>
          Technicians have access to job cards and repair guides. Financials are reserved for Owners.
        </Text>
      </View>

      <FlatList
        data={staff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.staffCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>

            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                <View
                  style={[
                    styles.roleBadge,
                    item.role === 'owner'
                      ? { backgroundColor: '#FEF3C7' }
                      : item.role === 'technician'
                      ? { backgroundColor: '#EEF2FF' }
                      : { backgroundColor: '#F1F5F9' },
                  ]}>
                  <Text
                    style={[
                      styles.roleText,
                      item.role === 'owner'
                        ? { color: '#B45309' }
                        : item.role === 'technician'
                        ? { color: Colors.primary }
                        : { color: '#475569' },
                    ]}>
                    {item.role.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.phone}>+91 {item.phone}</Text>
            </View>

            <View style={styles.statusDot} />
          </View>
        )}
      />

      {/* Add Staff Button */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.addStaffBtn}
          onPress={() => setIsModalOpen(true)}>
          <Ionicons name="person-add" size={18} color="#FFFFFF" />
          <Text style={styles.addStaffBtnText}>Add Technician / Staff</Text>
        </Pressable>
      </View>

      {/* Add Staff Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Staff / Technician</Text>
              <Pressable onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ramesh Suthar"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Mobile Phone *</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.label}>Assign Role</Text>
            <View style={styles.roleRow}>
              {(['technician', 'staff'] as const).map((r) => (
                <Pressable
                  key={r}
                  style={[styles.roleChip, role === r && styles.roleChipActive]}
                  onPress={() => setRole(r)}>
                  <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>
                    {r.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setIsModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleAddStaff}>
                <Text style={styles.saveBtnText}>Save Staff</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
    lineHeight: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  phone: {
    fontSize: 13,
    color: '#64748B',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.emerald,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  addStaffBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  addStaffBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  roleChipActive: {
    backgroundColor: Colors.primary,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
