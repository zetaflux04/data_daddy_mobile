import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal, Alert, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, RefreshControl, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { AppHeader } from '../components/AppHeader';
import { FloatingCloseButton } from '../components/FloatingCloseButton';
import { OutlinedTextInput } from '../components/OutlinedTextInput';
export default function StaffScreen() {
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('technician');
    const fetchStaff = async () => {
        try {
            const list = await api.getStaff();
            setStaff(list);
        }
        catch {
            setStaff([]);
        }
        finally {
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
                Alert.alert('Technician Added', `${name} has been added as a ${role}.`);
                fetchStaff();
            }
            else {
                Alert.alert('Error', 'Could not add technician. Check connection or if phone number already exists.');
            }
        }
        catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to add technician.');
        }
        finally {
            setIsSaving(false);
        }
    };

    const handleDeleteStaff = (member) => {
        const memberId = member._id || member.id;
        if (!memberId) return;

        Alert.alert(
            'Delete Technician',
            `Are you sure you want to remove ${member.name}? This technician will no longer have access to this shop.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.deleteStaff(memberId);
                            Alert.alert('Success', `${member.name} has been deleted.`);
                            fetchStaff();
                        } catch (e) {
                            let msg = e.response?.data?.message;
                            if (!msg && e.response?.status === 404) {
                                msg = 'Delete endpoint not found on server (404). Please ensure the backend is deployed with the latest updates.';
                            } else if (!msg) {
                                msg = e.message || 'Failed to delete technician.';
                            }
                            Alert.alert('Error', msg);
                        }
                    },
                },
            ]
        );
    };

    return (<View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Technicians" subtitle="Technician logins & team permissions" />

      <View style={[styles.topNotice, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.12)' : Colors.primaryGlow, borderBottomColor: colors.border }]}>
        <Ionicons name="information-circle-outline" size={18} color={isDark ? '#60A5FA' : Colors.primary}/>
        <Text style={[styles.noticeText, { color: isDark ? '#E9EDEF' : '#1E40AF' }]}>
          Technicians have access to job cards and repair guides. Financials are reserved for Owners.
        </Text>
      </View>

      <FlatList
        data={staff}
        keyExtractor={(item) => item._id || item.id || `${item.phone}_${Math.random()}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[isDark ? '#60A5FA' : Colors.primary]}
            progressBackgroundColor={isDark ? '#202C33' : '#FFFFFF'}
            tintColor={isDark ? '#60A5FA' : Colors.primary}
          />
        }
        ListEmptyComponent={isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={isDark ? '#60A5FA' : Colors.primary}/>
            <Text style={[styles.emptySubtitle, { marginTop: 12, color: colors.textSecondary }]}>Loading technicians directory...</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBox, { backgroundColor: isDark ? '#202C33' : '#F1F5F9' }]}>
              <Ionicons name="people-outline" size={32} color={colors.textMuted}/>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Technicians Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Tap the button below to add your technicians.
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[styles.staffCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.2)' : Colors.primaryGlow }]}>
              <Text style={[styles.avatarText, { color: isDark ? '#60A5FA' : Colors.primary }]}>
                {item.name ? item.name.charAt(0).toUpperCase() : 'T'}
              </Text>
            </View>

            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={[
                  styles.roleBadge,
                  item.role === 'owner'
                    ? { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7' }
                    : item.role === 'technician'
                      ? { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.2)' : '#EEF2FF' }
                      : { backgroundColor: isDark ? '#202C33' : '#F1F5F9' },
                ]}>
                  <Text style={[
                    styles.roleText,
                    item.role === 'owner'
                      ? { color: isDark ? '#F59E0B' : '#B45309' }
                      : item.role === 'technician'
                        ? { color: isDark ? '#60A5FA' : Colors.primary }
                        : { color: isDark ? '#8696A0' : '#475569' },
                  ]}>
                    {(item.role || 'technician').toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={[styles.phone, { color: colors.textSecondary }]}>+91 {item.phone}</Text>
            </View>

            <View style={styles.cardActions}>
              <View style={[styles.statusDot, { backgroundColor: item.isActive !== false ? '#10B981' : '#94A3B8' }]}/>
              {item.role !== 'owner' && (
                <Pressable
                  hitSlop={10}
                  style={({ pressed }) => [
                    styles.deleteBtn,
                    { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' },
                    pressed && { opacity: 0.6 }
                  ]}
                  onPress={() => handleDeleteStaff(item)}
                >
                  <Ionicons name="trash-outline" size={19} color={Colors.rose}/>
                </Pressable>
              )}
            </View>
          </View>
        )}
      />

      {/* Add Technician Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={({ pressed }) => [styles.addStaffBtn, { backgroundColor: isDark ? '#2563EB' : Colors.primary, opacity: pressed ? 0.88 : 1 }]} onPress={() => setIsModalOpen(true)}>
          <Ionicons name="person-add" size={18} color="#FFFFFF"/>
          <Text style={styles.addStaffBtnText}>Add Technician</Text>
        </Pressable>
      </View>

      {/* Add Technician Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setIsModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsModalOpen(false)}/>
          <FloatingCloseButton onPress={() => setIsModalOpen(false)}/>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#111B21' : '#FFFFFF', borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#E9EDEF' : '#0F172A' }]}>Add Technician</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <OutlinedTextInput
                label="Full Name"
                required
                placeholder="e.g. Ramesh Sharma"
                value={name}
                onChangeText={setName}
              />

              <OutlinedTextInput
                label="Mobile Phone (10 digits)"
                required
                placeholder="e.g. 9811223344"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Role *</Text>
              <View style={styles.roleSelectionRow}>
                <Pressable
                  style={[
                    styles.roleSelectBtn,
                    { backgroundColor: isDark ? '#202C33' : '#F8FAFC', borderColor: colors.border },
                    role === 'technician' && [styles.roleSelectBtnActive, { borderColor: isDark ? '#60A5FA' : Colors.primary, backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : Colors.primaryGlow }],
                  ]}
                  onPress={() => setRole('technician')}
                >
                  <Ionicons name="build-outline" size={16} color={role === 'technician' ? (isDark ? '#60A5FA' : Colors.primary) : colors.textSecondary}/>
                  <Text style={[
                    styles.roleSelectText,
                    { color: colors.textSecondary },
                    role === 'technician' && [styles.roleSelectTextActive, { color: isDark ? '#60A5FA' : Colors.primary }],
                  ]}>
                    Technician
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.roleSelectBtn,
                    { backgroundColor: isDark ? '#202C33' : '#F8FAFC', borderColor: colors.border },
                    role === 'staff' && [styles.roleSelectBtnActive, { borderColor: isDark ? '#60A5FA' : Colors.primary, backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : Colors.primaryGlow }],
                  ]}
                  onPress={() => setRole('staff')}
                >
                  <Ionicons name="person-outline" size={16} color={role === 'staff' ? (isDark ? '#60A5FA' : Colors.primary) : colors.textSecondary}/>
                  <Text style={[
                    styles.roleSelectText,
                    { color: colors.textSecondary },
                    role === 'staff' && [styles.roleSelectTextActive, { color: isDark ? '#60A5FA' : Colors.primary }],
                  ]}>
                    Front Desk / Staff
                  </Text>
                </Pressable>
              </View>

              <Pressable disabled={isSaving} style={({ pressed }) => [styles.submitBtn, { backgroundColor: isDark ? '#2563EB' : Colors.primary, opacity: pressed || isSaving ? 0.88 : 1 }]} onPress={handleAddStaff}>
                {isSaving ? (<ActivityIndicator size="small" color="#FFFFFF"/>) : (<Text style={styles.submitBtnText}>Add Technician</Text>)}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>);
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
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginLeft: 8,
    },
    deleteBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
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
        ...StyleSheet.absoluteFill,
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
