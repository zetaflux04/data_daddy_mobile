import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Linking, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView, } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { DateFilterBar } from '../../components/DateFilterBar';
import { Colors } from '../../constants/Colors';
import { FloatingCloseButton } from '../../components/FloatingCloseButton';
export default function CustomersScreen() {
    const router = useRouter();
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedDateRange, setSelectedDateRange] = useState('all');
    const [customStartDate, setCustomStartDate] = useState(undefined);
    const [customEndDate, setCustomEndDate] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    // Add Customer Modal State
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const data = await api.getCustomers({
                search,
                dateRange: selectedDateRange,
                startDate: customStartDate,
                endDate: customEndDate,
            });
            setCustomers(data);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchCustomers();
    }, [search, selectedDateRange, customStartDate, customEndDate]);
    const handleDateRangeChange = (range, startDate, endDate) => {
        setSelectedDateRange(range);
        setCustomStartDate(startDate);
        setCustomEndDate(endDate);
    };
    const handleAddCustomer = async () => {
        if (!newName.trim() || !newPhone.trim()) {
            Alert.alert('Missing Details', 'Please provide at least a customer name and phone number.');
            return;
        }
        try {
            const created = await api.addCustomer({
                name: newName.trim(),
                phone: newPhone.trim(),
                address: newAddress.trim(),
            });
            if (created) {
                setIsAddModalVisible(false);
                setNewName('');
                setNewPhone('');
                setNewAddress('');
                fetchCustomers();
            }
        }
        catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to add customer.';
            Alert.alert('Customer Error', msg);
        }
    };
    const openCall = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };
    const openWhatsApp = (phone) => {
        const clean = phone.replace(/\D/g, '').slice(-10);
        Linking.openURL(`https://wa.me/91${clean}?text=Hello%20from%20Repair%20Shop!`);
    };
    return (<View style={styles.container}>
      {/* Search & Add Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }}/>
          <TextInput style={styles.searchInput} placeholder="Search by customer name or phone..." placeholderTextColor="#94A3B8" value={search} onChangeText={setSearch}/>
          {search.length > 0 && (<Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8"/>
            </Pressable>)}
        </View>

        <Pressable style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.88 : 1 }]} onPress={() => setIsAddModalVisible(true)}>
          <Ionicons name="person-add" size={18} color="#FFFFFF"/>
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      {/* Date Filter Bar (Day, Week, Month, Year, Custom) */}
      <DateFilterBar selectedRange={selectedDateRange} onRangeChange={handleDateRangeChange} customStartDate={customStartDate} customEndDate={customEndDate}/>

      {/* Customer List */}
      <FlatList data={customers} keyExtractor={(item) => item._id} contentContainerStyle={styles.listContent} refreshing={isLoading} onRefresh={fetchCustomers} renderItem={({ item }) => (<View style={styles.customerCard}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{item.name}</Text>
                <Text style={styles.customerPhone}>+91 {item.phone}</Text>
                {item.address ? (<Text style={styles.customerAddress} numberOfLines={1}>
                    📍 {item.address}
                  </Text>) : null}
              </View>

              <View style={styles.orderCountBadge}>
                <Text style={styles.orderCountText}>
                  {item.totalOrdersCount} {item.totalOrdersCount === 1 ? 'Job' : 'Jobs'}
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Pressable style={styles.actionButton} onPress={() => openCall(item.phone)}>
                <Ionicons name="call" size={14} color="#0284C7"/>
                <Text style={styles.actionButtonText}>Call</Text>
              </Pressable>

              <Pressable style={[styles.actionButton, styles.whatsappButton]} onPress={() => openWhatsApp(item.phone)}>
                <Ionicons name="logo-whatsapp" size={14} color="#16A34A"/>
                <Text style={[styles.actionButtonText, { color: '#16A34A' }]}>WhatsApp</Text>
              </Pressable>

              <Pressable style={[styles.actionButton, styles.newJobForCustButton]} onPress={() => router.push({
                pathname: '/job/new',
                params: { customerId: item._id, name: item.name, phone: item.phone },
            })}>
                <Ionicons name="add-circle" size={14} color={Colors.primary}/>
                <Text style={[styles.actionButtonText, { color: Colors.primary }]}>New Job</Text>
              </Pressable>
            </View>
          </View>)} ListEmptyComponent={<View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#CBD5E1"/>
            <Text style={styles.emptyTitle}>No customers found</Text>
            <Text style={styles.emptySubtitle}>
              {search ? `No results matching "${search}"` : 'No customers found for the selected date filter'}
            </Text>
            <Pressable style={styles.resetBtn} onPress={() => {
                setSearch('');
                setSelectedDateRange('all');
                setCustomStartDate(undefined);
                setCustomEndDate(undefined);
            }}>
              <Text style={styles.resetBtnText}>Clear Filters</Text>
            </Pressable>
          </View>}/>

      {/* Add Customer Modal */}
      <Modal visible={isAddModalVisible} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setIsAddModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsAddModalVisible(false)}/>
          <FloatingCloseButton onPress={() => setIsAddModalVisible(false)}/>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Customer</Text>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
              <Text style={styles.inputLabel}>Customer Name *</Text>
              <TextInput style={styles.modalInput} placeholder="e.g. Ramesh Kumar" placeholderTextColor="#94A3B8" value={newName} onChangeText={setNewName}/>

              <Text style={styles.inputLabel}>Mobile Phone Number *</Text>
              <TextInput style={styles.modalInput} placeholder="10-digit number (e.g. 9876543210)" placeholderTextColor="#94A3B8" keyboardType="phone-pad" maxLength={10} value={newPhone} onChangeText={setNewPhone}/>

              <Text style={styles.inputLabel}>Address / Area (Optional)</Text>
              <TextInput style={styles.modalInput} placeholder="e.g. Main Market, Shop #4" placeholderTextColor="#94A3B8" value={newAddress} onChangeText={setNewAddress}/>

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setIsAddModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>

                <Pressable style={styles.saveBtn} onPress={handleAddCustomer}>
                  <Text style={styles.saveBtnText}>Save Customer</Text>
                </Pressable>
              </View>
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
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        gap: 10,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 42,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 4,
    },
    addBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
    },
    customerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarInitial: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.primary,
    },
    customerDetails: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 2,
    },
    customerPhone: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    customerAddress: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    orderCountBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    orderCountText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    cardFooter: {
        flexDirection: 'row',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F0F9FF',
        gap: 4,
    },
    whatsappButton: {
        backgroundColor: '#F0FDF4',
    },
    newJobForCustButton: {
        backgroundColor: Colors.primaryGlow,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0284C7',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
        marginTop: 12,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#94A3B8',
        marginBottom: 16,
        textAlign: 'center',
    },
    resetBtn: {
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    resetBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
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
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6,
        marginTop: 8,
    },
    modalInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#0F172A',
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: 24,
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
