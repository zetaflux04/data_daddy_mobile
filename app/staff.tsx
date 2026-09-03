import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { Colors } from '../constants/Colors';
import { AppHeader } from '../components/AppHeader';
import { FloatingCloseButton } from '../components/FloatingCloseButton';

interface StaffMember {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  role: 'owner' | 'technician' | 'staff';
  isActive?: boolean;
  active?: boolean;
}

export default function StaffScreen() {
  const insets = useSafeAreaInsets();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'technician' | 'staff'>('technician');

  const fetchStaff = async () => {
    try {
      const list = await api.getStaff();
      setStaff(list);
    } catch {
      setStaff([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchStaff();
    setIsRefreshing(false);
  };

  const handleAddStaff = async () => {
    if (!name.trim() || !phone.trim() || phone.trim().replace(/\D/g, '').length !== 10) {
      Alert.alert('Invalid Details', 'Please provide a valid name and 10-digit mobile phone number.');
      return;
    }

    setIsSaving(true);
    try {
      const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
      const newMember = await api.addStaff({
        name: name.trim(),
        phone: cleanPhone,
        role,
      });

      if (newMember) {
        setIsModalOpen(false);
        setName('');
        setPhone('');
        Alert.alert('Staff Added', `${name} has been added as a ${role}.`);
        fetchStaff();
      } else {
        Alert.alert('Error', 'Could not add staff member. Check connection or if phone number already exists.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to add staff member.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Staff & Technicians" />

      <View style={styles.topNotice}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
        <Text style={styles.noticeText}>
          Technicians have access to job cards and repair guides. Financials are reserved for Owners.
        </Text>
      </View>

      <FlatList
        data={staff}
        keyExtractor={(item) => item._id || item.id || `${item.phone}_${Math.random()}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={[styles.emptySubtitle, { marginTop: 12 }]}>Loading staff directory...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="people-outline" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Staff Members Found</Text>
              <Text style={styles.emptySubtitle}>
                Tap the button below to add your technicians and front-desk staff.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.staffCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name ? item.name.charAt(0).toUpperCase() : 'U'}</Text>
            </View>

            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
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
                    {(item.role || 'staff').toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.phone}>+91 {item.phone}</Text>
            </View>

            <View style={[styles.statusDot, { backgroundColor: item.isActive !== false ? '#10B981' : '#94A3B8' }]} />
          </View>
        )}
      />

      {/* Add Staff Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.addStaffBtn, { opacity: pressed ? 0.88 : 1 }]}
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
        statusBarTranslucent
        onRequestClose={() => setIsModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsModalOpen(false)} />
          <FloatingCloseButton onPress={() => setIsModalOpen(false)} />
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Staff Member</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Sharma"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Mobile Phone (10 digits) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 9811223344"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.inputLabel}>Staff Role *</Text>
              <View style={styles.roleSelectionRow}>
                <Pressable
                  style={[styles.roleSelectBtn, role === 'technician' && styles.roleSelectBtnActive]}
                  onPress={() => setRole('technician')}>
                  <Ionicons
                    name="build-outline"
                    size={16}
                    color={role === 'technician' ? Colors.primary : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.roleSelectText,
                      role === 'technician' && styles.roleSelectTextActive,
                    ]}>
                    Technician
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.roleSelectBtn, role === 'staff' && styles.roleSelectBtnActive]}
                  onPress={() => setRole('staff')}>
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={role === 'staff' ? Colors.primary : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.roleSelectText,
                      role === 'staff' && styles.roleSelectTextActive,
                    ]}>
                    Front Desk / Staff
                  </Text>
                </Pressable>
              </View>

              <Pressable
                disabled={isSaving}
                style={({ pressed }) => [styles.submitBtn, { opacity: pressed || isSaving ? 0.88 : 1 }]}
                onPress={handleAddStaff}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Staff Member</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryGlow,
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
    flexShrink: 1,
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
    fontSize: 12,
    color: '#64748B',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
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
    fontSize: 14,
    fontWeight: '700',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
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
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  roleSelectionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  roleSelectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  roleSelectBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  roleSelectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  roleSelectTextActive: {
    color: Colors.primary,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
