import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Linking,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { HeaderFilterBar } from '../../components/HeaderFilterBar';
import { StatusBadge } from '../../components/StatusBadge';
import { Colors } from '../../constants/Colors';
import { FloatingCloseButton } from '../../components/FloatingCloseButton';
import { OutlinedTextInput } from '../../components/OutlinedTextInput';

const customerStatusTabs = [
  { key: 'all', label: 'All' },
  { key: 'dues', label: 'Has Dues' },
  { key: 'active', label: 'Active Jobs' },
  { key: 'repeat', label: 'Repeat Clients' },
];

export default function CustomersScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState(undefined);
  const [customEndDate, setCustomEndDate] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // Advanced Filter Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [customerFilterType, setCustomerFilterType] = useState('all');
  const [customerSortBy, setCustomerSortBy] = useState('recent');

  // Add Customer Modal State
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Customer Jobs Modal State
  const [fetchingCustomerId, setFetchingCustomerId] = useState(null);
  const [isJobsModalVisible, setIsJobsModalVisible] = useState(false);
  const [selectedCustomerForJobs, setSelectedCustomerForJobs] = useState(null);
  const [customerJobsList, setCustomerJobsList] = useState([]);

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
    } finally {
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

  // Client-side filtering & sorting for customers
  const processedCustomers = React.useMemo(() => {
    let list = [...customers];

    // Status Tab or Filter Type
    const activeFilter = selectedStatus !== 'all' ? selectedStatus : customerFilterType;
    if (activeFilter === 'dues') {
      list = list.filter((c) => (c.totalDuesPending || 0) > 0);
    } else if (activeFilter === 'active') {
      list = list.filter((c) => (c.activeOrdersCount || 0) > 0 || (c.totalOrdersCount || 0) > 0);
    } else if (activeFilter === 'repeat') {
      list = list.filter((c) => (c.totalOrdersCount || 0) >= 2);
    } else if (activeFilter === 'single') {
      list = list.filter((c) => (c.totalOrdersCount || 0) === 1);
    }

    // Sort By
    if (customerSortBy === 'name_asc') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (customerSortBy === 'name_desc') {
      list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (customerSortBy === 'most_jobs') {
      list.sort((a, b) => (b.totalOrdersCount || 0) - (a.totalOrdersCount || 0));
    } else {
      // recent
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    }

    return list;
  }, [customers, selectedStatus, customerFilterType, customerSortBy]);

  const hasActiveFilters = customerFilterType !== 'all' || customerSortBy !== 'recent';
  const activeFilterCount =
    (customerFilterType !== 'all' ? 1 : 0) + (customerSortBy !== 'recent' ? 1 : 0);

  const handleResetFilters = () => {
    setCustomerFilterType('all');
    setCustomerSortBy('recent');
    setSelectedStatus('all');
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
    } catch (error) {
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

  // Handler when clicking on a customer's job badge or customer card
  const handleCustomerJobPress = async (customer) => {
    if (fetchingCustomerId) return;
    setFetchingCustomerId(customer._id);
    try {
      const jobs = await api.getCustomerJobs(customer._id, customer.phone);
      if (!jobs || jobs.length === 0) {
        Alert.alert(
          'No Jobs Found',
          `No repair jobs found for ${customer.name}. Would you like to create a new job card?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Create Job',
              onPress: () =>
                router.push({
                  pathname: '/job/new',
                  params: { customerId: customer._id, name: customer.name, phone: customer.phone },
                }),
            },
          ]
        );
        return;
      }

      if (jobs.length === 1) {
        // If single job: redirect directly to the job card
        router.push(`/job/${jobs[0]._id}`);
      } else {
        // If multiple jobs: show pop-up to choose which job to open
        setSelectedCustomerForJobs(customer);
        setCustomerJobsList(jobs);
        setIsJobsModalVisible(true);
      }
    } catch (error) {
      console.error('Failed to load customer jobs:', error);
      Alert.alert('Error', 'Unable to fetch jobs for this customer.');
    } finally {
      setFetchingCustomerId(null);
    }
  };

  const handleOpenJob = (jobId) => {
    setIsJobsModalVisible(false);
    router.push(`/job/${jobId}`);
  };

  return (
    <View style={styles.container}>
      {/* Search & Add Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer name or phone..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.88 : 1 }]}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="person-add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      {/* Date Range Dropdown & Filter Button Bar */}
      <HeaderFilterBar
        selectedDateRange={selectedDateRange}
        onDateRangeChange={handleDateRangeChange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onPressFilter={() => setIsFilterModalOpen(true)}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Customer Status Filter Chips (Solid blue active pill, gray inactive) */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {customerStatusTabs.map((tab) => {
            const isSelected = selectedStatus === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setSelectedStatus(tab.key)}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Customer List */}
      <FlatList
        data={processedCustomers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={fetchCustomers}
        renderItem={({ item }) => {
          const isFetchingThis = fetchingCustomerId === item._id;
          return (
            <View style={styles.customerCard}>
              <Pressable
                style={({ pressed }) => [styles.cardHeader, pressed && styles.cardHeaderPressed]}
                onPress={() => handleCustomerJobPress(item)}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.customerDetails}>
                  <Text style={styles.customerName}>{item.name}</Text>
                  <Text style={styles.customerPhone}>+91 {item.phone}</Text>
                  {item.address ? (
                    <Text style={styles.customerAddress} numberOfLines={1}>
                      📍 {item.address}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.orderCountBadge,
                    pressed && styles.orderCountBadgePressed,
                  ]}
                  onPress={() => handleCustomerJobPress(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {isFetchingThis ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="clipboard-outline" size={13} color={Colors.primary} />
                      <Text style={styles.orderCountText}>
                        {item.totalOrdersCount || 0} {item.totalOrdersCount === 1 ? 'Job' : 'Jobs'}
                      </Text>
                      <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
                    </>
                  )}
                </Pressable>
              </Pressable>

              <View style={styles.cardFooter}>
                <Pressable style={styles.actionButton} onPress={() => openCall(item.phone)}>
                  <Ionicons name="call" size={14} color="#0284C7" />
                  <Text style={styles.actionButtonText}>Call</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, styles.whatsappButton]}
                  onPress={() => openWhatsApp(item.phone)}
                >
                  <Ionicons name="logo-whatsapp" size={14} color="#16A34A" />
                  <Text style={[styles.actionButtonText, { color: '#16A34A' }]}>WhatsApp</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, styles.newJobForCustButton]}
                  onPress={() =>
                    router.push({
                      pathname: '/job/new',
                      params: { customerId: item._id, name: item.name, phone: item.phone },
                    })
                  }
                >
                  <Ionicons name="add-circle" size={14} color={Colors.primary} />
                  <Text style={[styles.actionButtonText, { color: Colors.primary }]}>New Job</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No customers found</Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? `No results matching "${search}"`
                : 'No customers found for the selected date filter'}
            </Text>
            <Pressable
              style={styles.resetBtn}
              onPress={() => {
                setSearch('');
                setSelectedStatus('all');
                setSelectedDateRange('all');
                setCustomStartDate(undefined);
                setCustomEndDate(undefined);
                handleResetFilters();
              }}
            >
              <Text style={styles.resetBtnText}>Clear Filters</Text>
            </Pressable>
          </View>
        }
      />

      {/* Advanced Filter Modal for Customers */}
      <Modal
        visible={isFilterModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <View style={styles.filterModalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsFilterModalOpen(false)}
          />
          <FloatingCloseButton onPress={() => setIsFilterModalOpen(false)} />

          <View style={styles.filterModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="options" size={20} color={Colors.primary} />
                <Text style={styles.modalTitle}>Filter Customers</Text>
              </View>
              {hasActiveFilters && (
                <Pressable onPress={handleResetFilters}>
                  <Text style={styles.resetModalText}>Reset All</Text>
                </Pressable>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Filter By */}
              <Text style={styles.filterSectionTitle}>Customer Type</Text>
              <View style={styles.modalChipRow}>
                {[
                  { key: 'all', label: 'All Customers' },
                  { key: 'dues', label: 'With Pending Dues' },
                  { key: 'repeat', label: 'Repeat (2+ Jobs)' },
                  { key: 'single', label: 'First-time (1 Job)' },
                ].map((item) => (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.modalChip,
                      customerFilterType === item.key && styles.modalChipActive,
                    ]}
                    onPress={() => setCustomerFilterType(item.key)}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        customerFilterType === item.key &&
                          styles.modalChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Sort By */}
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.modalChipRow}>
                {[
                  { key: 'recent', label: 'Recently Active' },
                  { key: 'name_asc', label: 'Name (A to Z)' },
                  { key: 'name_desc', label: 'Name (Z to A)' },
                  { key: 'most_jobs', label: 'Most Jobs' },
                ].map((item) => (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.modalChip,
                      customerSortBy === item.key && styles.modalChipActive,
                    ]}
                    onPress={() => setCustomerSortBy(item.key)}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        customerSortBy === item.key &&
                          styles.modalChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.modalApplyBtn}
                onPress={() => setIsFilterModalOpen(false)}
              >
                <Text style={styles.modalApplyBtnText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Multiple Jobs Selection Pop-up Modal */}
      <Modal
        visible={isJobsModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setIsJobsModalVisible(false)}
      >
        <View style={styles.jobsModalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsJobsModalVisible(false)} />
          <FloatingCloseButton onPress={() => setIsJobsModalVisible(false)} />

          <View style={styles.jobsModalCard}>
            {/* Modal Header */}
            <View style={styles.jobsModalHeader}>
              <View style={styles.jobsModalHeaderIcon}>
                <Ionicons name="layers-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.jobsModalTitle}>Select Job to Open</Text>
                <Text style={styles.jobsModalSubtitle} numberOfLines={1}>
                  {selectedCustomerForJobs?.name} • {customerJobsList.length} Jobs
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.jobsModalCloseBtn, pressed && { opacity: 0.7 }]}
                onPress={() => setIsJobsModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </Pressable>
            </View>

            <Text style={styles.jobsSelectInstruction}>
              Select which repair job card you want to view:
            </Text>

            {/* List of Jobs */}
            <ScrollView
              style={styles.jobsListScroll}
              contentContainerStyle={styles.jobsListContent}
              showsVerticalScrollIndicator={false}
            >
              {customerJobsList.map((job) => {
                const hasDue = (job.cost?.due ?? 0) > 0;
                const formattedDate = job.createdAt
                  ? new Date(job.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recent';

                const deviceName =
                  job.orderType === 'accessory'
                    ? job.productName || 'Accessory Order'
                    : `${job.brand || ''} ${job.model || ''}`.trim() || 'Device Repair';

                const iconName =
                  job.deviceType === 'laptop'
                    ? 'laptop-outline'
                    : job.deviceType === 'tablet'
                    ? 'tablet-portrait-outline'
                    : job.deviceType === 'smartwatch'
                    ? 'watch-outline'
                    : job.orderType === 'accessory'
                    ? 'cube-outline'
                    : 'phone-portrait-outline';

                return (
                  <Pressable
                    key={job._id}
                    style={({ pressed }) => [
                      styles.jobItemCard,
                      pressed && styles.jobItemCardPressed,
                    ]}
                    onPress={() => handleOpenJob(job._id)}
                  >
                    <View style={styles.jobItemTopRow}>
                      <View style={styles.jobItemIdentity}>
                        <View style={styles.jobItemIconCircle}>
                          <Ionicons name={iconName} size={18} color={Colors.primary} />
                        </View>
                        <View style={styles.jobIdPill}>
                          <Text style={styles.jobIdText}>{job.jobId || 'JOB'}</Text>
                        </View>
                      </View>

                      <StatusBadge status={job.status} size="sm" />
                    </View>

                    <Text style={styles.jobItemDeviceName} numberOfLines={1}>
                      {deviceName}
                    </Text>

                    {job.problemDescription ? (
                      <Text style={styles.jobItemProblem} numberOfLines={2}>
                        {job.problemDescription}
                      </Text>
                    ) : null}

                    <View style={styles.jobItemDivider} />

                    <View style={styles.jobItemBottomRow}>
                      <View style={styles.jobItemMetaDate}>
                        <Ionicons name="calendar-outline" size={13} color="#64748B" />
                        <Text style={styles.jobItemDateText}>{formattedDate}</Text>
                      </View>

                      <View style={styles.jobItemMetaRight}>
                        {hasDue ? (
                          <View style={styles.duePill}>
                            <Text style={styles.duePillText}>
                              Due: ₹{(job.cost?.due ?? 0).toLocaleString('en-IN')}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.paidPill}>
                            <Ionicons name="checkmark-circle" size={11} color="#059669" />
                            <Text style={styles.paidPillText}>
                              Paid ₹{(job.cost?.final ?? 0).toLocaleString('en-IN')}
                            </Text>
                          </View>
                        )}

                        <View style={styles.openBtnPill}>
                          <Text style={styles.openBtnText}>Open</Text>
                          <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Modal Bottom Action */}
            <View style={styles.jobsModalFooter}>
              <Pressable
                style={({ pressed }) => [
                  styles.newJobInModalBtn,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => {
                  setIsJobsModalVisible(false);
                  router.push({
                    pathname: '/job/new',
                    params: {
                      customerId: selectedCustomerForJobs?._id,
                      name: selectedCustomerForJobs?.name,
                      phone: selectedCustomerForJobs?.phone,
                    },
                  });
                }}
              >
                <Ionicons name="add-circle" size={18} color={Colors.primary} />
                <Text style={styles.newJobInModalBtnText}>
                  Create New Job for {selectedCustomerForJobs?.name || 'Customer'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setIsAddModalVisible(false)} />
          <FloatingCloseButton onPress={() => setIsAddModalVisible(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Customer</Text>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
              <OutlinedTextInput
                label="Customer Name"
                required
                placeholder="e.g. Ramesh Kumar"
                value={newName}
                onChangeText={setNewName}
              />

              <OutlinedTextInput
                label="Mobile Phone Number"
                required
                placeholder="10-digit number (e.g. 9876543210)"
                keyboardType="phone-pad"
                maxLength={10}
                value={newPhone}
                onChangeText={setNewPhone}
              />

              <OutlinedTextInput
                label="Address / Area (Optional)"
                placeholder="e.g. Main Market, Shop #4"
                value={newAddress}
                onChangeText={setNewAddress}
              />

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
    </View>
  );
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
  cardHeaderPressed: {
    opacity: 0.85,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 4,
  },
  orderCountBadgePressed: {
    backgroundColor: '#E0E7FF',
    opacity: 0.8,
  },
  orderCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
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

  // Multiple Jobs Selection Pop-up Modal
  jobsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  jobsModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '82%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  jobsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  jobsModalHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobsModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  jobsModalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  jobsModalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobsSelectInstruction: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 14,
    marginTop: 4,
  },
  jobsListScroll: {
    maxHeight: 380,
  },
  jobsListContent: {
    paddingBottom: 8,
    gap: 10,
  },
  jobItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobItemCardPressed: {
    backgroundColor: '#EEF2FF',
    borderColor: Colors.primary,
    transform: [{ scale: 0.99 }],
  },
  jobItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  jobItemIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobItemIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobIdPill: {
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  jobIdText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  jobItemDeviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  jobItemProblem: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  jobItemDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  jobItemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  jobItemMetaDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobItemDateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  jobItemMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  duePill: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  duePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  paidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  paidPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  openBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  openBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  jobsModalFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  newJobInModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primaryGlow,
    paddingVertical: 12,
    borderRadius: 12,
  },
  newJobInModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Add Customer Modal
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
  filterScrollWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filterModalContent: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  resetModalText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.rose,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  modalChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  modalChipActive: {
    backgroundColor: Colors.primary,
  },
  modalChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  modalChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalFooter: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalApplyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalApplyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
