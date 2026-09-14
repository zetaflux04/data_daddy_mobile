import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { JobCardItem } from '../../components/JobCardItem';
import { FloatingCloseButton } from '../../components/FloatingCloseButton';
import { Colors } from '../../constants/Colors';
import { MaterialMultiSelect } from '../../components/MaterialMultiSelect';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { CustomDateRangeModal } from '../../components/CustomDateRangeModal';
import { formatShortRange, todayISO } from '../../utils/date';

const statusOptions = [
  { key: 'all', label: 'All Status', dot: '#2563EB' },
  { key: 'pending', label: 'Pending', dot: '#F59E0B' },
  { key: 'in_progress', label: 'In Progress', dot: '#2563EB' },
  { key: 'parts_delayed', label: 'Parts Delayed', dot: '#EF4444' },
  { key: 'repaired', label: 'Repaired', dot: '#10B981' },
  { key: 'delivered', label: 'Delivered', dot: '#8B5CF6' },
  { key: 'unrepairable', label: 'Unrepairable', dot: '#B91C1C' },
];

const dateRangeOptions = [
  { key: 'all', label: 'All Time', icon: 'infinite-outline' },
  { key: 'today', label: 'Today', icon: 'today-outline' },
  { key: 'week', label: 'This Week', icon: 'calendar-outline' },
  { key: 'month', label: 'This Month', icon: 'calendar-number-outline' },
  { key: 'year', label: 'This Year', icon: 'time-outline' },
  { key: 'custom', label: 'Custom Range', icon: 'options-outline' },
];

export default function JobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('repair'); // 'repair' | 'accessory'
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState(undefined);
  const [customEndDate, setCustomEndDate] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [tempStart, setTempStart] = useState(todayISO());
  const [tempEnd, setTempEnd] = useState(todayISO());

  // Advanced Filter Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [filterDeviceType, setFilterDeviceType] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterSortBy, setFilterSortBy] = useState('newest');

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getJobs({
        status: selectedStatuses.length === 0 ? undefined : selectedStatuses.join(','),
        search: searchQuery,
        dateRange: selectedDateRange,
        startDate: customStartDate,
        endDate: customEndDate,
        orderType: activeTab,
      });
      setJobs(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [
    activeTab,
    selectedStatuses,
    selectedDateRange,
    customStartDate,
    customEndDate,
    searchQuery,
  ]);

  // Client-side filtering & sorting for device type, payment status, and order
  const processedJobs = useMemo(() => {
    let list = [...jobs];

    // Filter by orderType tab
    list = list.filter((j) => (j.orderType || 'repair') === activeTab);

    // Multi-select status filter
    if (selectedStatuses.length > 0) {
      list = list.filter((j) => selectedStatuses.includes(j.status));
    }

    // Device Type filter (for repairs)
    if (activeTab === 'repair' && filterDeviceType !== 'all') {
      list = list.filter(
        (j) => (j.deviceType || '').toLowerCase() === filterDeviceType.toLowerCase()
      );
    }

    // Payment Status filter
    if (filterPaymentStatus === 'paid') {
      list = list.filter((j) => (j.cost?.due || 0) <= 0);
    } else if (filterPaymentStatus === 'due') {
      list = list.filter((j) => (j.cost?.due || 0) > 0);
    }

    // Sort By
    if (filterSortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (filterSortBy === 'due_high') {
      list.sort((a, b) => (b.cost?.due || 0) - (a.cost?.due || 0));
    } else {
      // newest
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [jobs, activeTab, selectedStatuses, filterDeviceType, filterPaymentStatus, filterSortBy]);

  const hasActiveFilters =
    selectedDateRange !== 'all' ||
    filterDeviceType !== 'all' ||
    filterPaymentStatus !== 'all' ||
    filterSortBy !== 'newest';

  const activeFilterCount =
    (selectedDateRange !== 'all' ? 1 : 0) +
    (filterDeviceType !== 'all' ? 1 : 0) +
    (filterPaymentStatus !== 'all' ? 1 : 0) +
    (filterSortBy !== 'newest' ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedDateRange('all');
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
    setFilterDeviceType('all');
    setFilterPaymentStatus('all');
    setFilterSortBy('newest');
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedStatuses([]);
    setSelectedDateRange('all');
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
    handleResetFilters();
  };

  return (
    <View style={styles.container}>
      {/* Top Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={18}
            color="#94A3B8"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Job ID, customer, phone, model..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Segmented Tab Bar: Repairs vs Accessories */}
      <View style={styles.tabBarContainer}>
        <Pressable
          style={[styles.tabButton, activeTab === 'repair' && styles.tabButtonActive]}
          onPress={() => setActiveTab('repair')}
        >
          <Ionicons
            name="construct-outline"
            size={17}
            color={activeTab === 'repair' ? Colors.primary : '#64748B'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'repair' && styles.tabButtonTextActive,
            ]}
          >
            Repairs
          </Text>
          {activeTab === 'repair' && <View style={styles.tabActiveIndicator} />}
        </Pressable>

        <Pressable
          style={[styles.tabButton, activeTab === 'accessory' && styles.tabButtonActive]}
          onPress={() => setActiveTab('accessory')}
        >
          <Ionicons
            name="cube-outline"
            size={17}
            color={activeTab === 'accessory' ? Colors.primary : '#64748B'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'accessory' && styles.tabButtonTextActive,
            ]}
          >
            Accessories
          </Text>
          {activeTab === 'accessory' && <View style={styles.tabActiveIndicator} />}
        </Pressable>
      </View>

      <View style={styles.filterRowContainer}>
        <MaterialMultiSelect
          style={styles.statusSelect}
          inputStyle={styles.statusInput}
          label="Status"
          placeholder="All Status"
          value={selectedStatuses}
          onChange={setSelectedStatuses}
          options={statusOptions
            .filter((opt) => opt.key !== 'all')
            .map((opt) => ({ value: opt.key, label: opt.label }))}
        />
        <Pressable style={styles.filterBtnWrap} onPress={() => setIsFilterModalOpen(true)}>
          <View style={styles.filterBtnInner}>
            <PaperTextInput
              mode="outlined"
              dense
              label="Filter"
              value={activeFilterCount > 0 ? String(activeFilterCount) : ''}
              editable={false}
              outlineColor={hasActiveFilters ? Colors.primary : undefined}
              activeOutlineColor={Colors.primary}
              right={<PaperTextInput.Icon icon="filter-variant" />}
              style={styles.filterInput}
              outlineStyle={styles.filterOutline}
            />
          </View>
        </Pressable>
      </View>

      {/* Job Cards FlatList */}
      <FlatList
        data={processedJobs}
        keyExtractor={(item) => item._id || item.id || item.jobId}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={fetchJobs}
        renderItem={({ item }) => (
          <JobCardItem
            job={item}
            onPress={() => router.push(`/job/${item._id || item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={activeTab === 'accessory' ? 'bag-handle-outline' : 'search-outline'}
              size={48}
              color="#CBD5E1"
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'accessory' ? 'No accessory sales found' : 'No matching jobs found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? `No results match "${searchQuery}"`
                : selectedStatuses.length > 0
                ? `No orders matching the selected status filters`
                : activeTab === 'accessory'
                ? 'Record an accessory sale using the + button above'
                : 'Create a repair job card using the + button above'}
            </Text>
            <Pressable style={styles.resetBtn} onPress={handleClearAll}>
              <Text style={styles.resetBtnText}>Clear All Filters</Text>
            </Pressable>
          </View>
        }
      />

      {/* Advanced Filter Modal */}
      <Modal
        visible={isFilterModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsFilterModalOpen(false)}
          />
          <FloatingCloseButton onPress={() => setIsFilterModalOpen(false)} />

          <View style={styles.filterModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="options" size={20} color={Colors.primary} />
                <Text style={styles.modalTitle}>Filter Jobs</Text>
              </View>
              {hasActiveFilters && (
                <Pressable onPress={handleResetFilters}>
                  <Text style={styles.resetModalText}>Reset All</Text>
                </Pressable>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterSectionTitle}>Time Range</Text>
              <View style={styles.modalChipRow}>
                {dateRangeOptions.map((opt) => (
                  <Pressable
                    key={opt.key}
                    style={[
                      styles.modalChip,
                      selectedDateRange === opt.key && styles.modalChipActive,
                    ]}
                    onPress={() => {
                      if (opt.key === 'custom') {
                        setTempStart(customStartDate || todayISO());
                        setTempEnd(customEndDate || todayISO());
                        setIsFilterModalOpen(false);
                        setTimeout(() => setIsCustomDateModalOpen(true), 280);
                        return;
                      }
                      setSelectedDateRange(opt.key);
                      setCustomStartDate(undefined);
                      setCustomEndDate(undefined);
                    }}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={14}
                      color={selectedDateRange === opt.key ? '#FFFFFF' : '#64748B'}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.modalChipText,
                        selectedDateRange === opt.key && styles.modalChipTextActive,
                      ]}
                    >
                      {opt.key === 'custom' &&
                      selectedDateRange === 'custom' &&
                      customStartDate &&
                      customEndDate
                        ? formatShortRange(customStartDate, customEndDate)
                        : opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Device Type (Only if activeTab is repair) */}
              {activeTab === 'repair' && (
                <>
                  <Text style={styles.filterSectionTitle}>Device Type</Text>
                  <View style={styles.modalChipRow}>
                    {[
                      { key: 'all', label: 'All Devices' },
                      { key: 'mobile', label: 'Mobile' },
                      { key: 'laptop', label: 'Laptop' },
                      { key: 'tablet', label: 'Tablet' },
                      { key: 'smartwatch', label: 'Watch' },
                    ].map((item) => (
                      <Pressable
                        key={item.key}
                        style={[
                          styles.modalChip,
                          filterDeviceType === item.key && styles.modalChipActive,
                        ]}
                        onPress={() => setFilterDeviceType(item.key)}
                      >
                        <Text
                          style={[
                            styles.modalChipText,
                            filterDeviceType === item.key &&
                              styles.modalChipTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {/* Payment Status */}
              <Text style={styles.filterSectionTitle}>Payment Status</Text>
              <View style={styles.modalChipRow}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'paid', label: 'Paid in Full' },
                  { key: 'due', label: 'Has Dues' },
                ].map((item) => (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.modalChip,
                      filterPaymentStatus === item.key && styles.modalChipActive,
                    ]}
                    onPress={() => setFilterPaymentStatus(item.key)}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        filterPaymentStatus === item.key &&
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
                  { key: 'newest', label: 'Newest First' },
                  { key: 'oldest', label: 'Oldest First' },
                  { key: 'due_high', label: 'Highest Due' },
                ].map((item) => (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.modalChip,
                      filterSortBy === item.key && styles.modalChipActive,
                    ]}
                    onPress={() => setFilterSortBy(item.key)}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        filterSortBy === item.key && styles.modalChipTextActive,
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
                onPress={() => {
                  setIsFilterModalOpen(false);
                }}
              >
                <Text style={styles.modalApplyBtnText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <CustomDateRangeModal
        visible={isCustomDateModalOpen}
        startDate={tempStart}
        endDate={tempEnd}
        onChangeStart={setTempStart}
        onChangeEnd={setTempEnd}
        onCancel={() => {
          setIsCustomDateModalOpen(false);
          setTimeout(() => setIsFilterModalOpen(true), 280);
        }}
        onApply={() => {
          setSelectedDateRange('custom');
          setCustomStartDate(tempStart);
          setCustomEndDate(tempEnd);
          setIsCustomDateModalOpen(false);
          setTimeout(() => setIsFilterModalOpen(true), 280);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  // Segmented Tab Bar
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    position: 'relative',
  },
  tabButtonActive: {},
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  tabActiveIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.primary,
  },
  filterRowContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusSelect: {
    flex: 1,
    marginVertical: 0,
  },
  statusInput: {
    backgroundColor: '#FFFFFF',
    height: 40,
  },
  filterBtnWrap: {
    width: 118,
    justifyContent: 'center',
  },
  filterBtnInner: {
    pointerEvents: 'none',
  },
  filterInput: {
    backgroundColor: '#FFFFFF',
    height: 40
  },
  filterOutline: {
    borderRadius: 4,
  },
  filterBadgeCircle: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  // List Content
  listContent: {
    padding: 16,
    paddingBottom: 110,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  resetBtn: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  // Status Dropdown Popup
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusDropdownCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  statusDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusDropdownTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 1,
  },
  statusDropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  statusDropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  statusDropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  statusDropdownItemTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  // Date & Filter Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  optionsList: {
    gap: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  optionRowActive: {
    backgroundColor: '#EFF6FF',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  optionTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  backToPresetsBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  backToPresetsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Advanced Filter Modal Content
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
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
