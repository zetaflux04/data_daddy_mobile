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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { JobCardItem } from '../../components/JobCardItem';
import { HeaderFilterBar } from '../../components/HeaderFilterBar';
import { FloatingCloseButton } from '../../components/FloatingCloseButton';
import { Colors } from '../../constants/Colors';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'parts_delayed', label: 'Parts Delayed' },
  { key: 'repaired', label: 'Repaired' },
  { key: 'delivered', label: 'Delivered' },
];

export default function JobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState(undefined);
  const [customEndDate, setCustomEndDate] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Advanced Filter Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterDeviceType, setFilterDeviceType] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterOrderType, setFilterOrderType] = useState('all');
  const [filterSortBy, setFilterSortBy] = useState('newest');

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getJobs({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchQuery,
        dateRange: selectedDateRange,
        startDate: customStartDate,
        endDate: customEndDate,
        orderType: filterOrderType === 'all' ? undefined : filterOrderType,
      });
      setJobs(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [
    selectedStatus,
    selectedDateRange,
    customStartDate,
    customEndDate,
    searchQuery,
    filterOrderType,
  ]);

  const handleDateRangeChange = (range, startDate, endDate) => {
    setSelectedDateRange(range);
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  // Client-side filtering & sorting for device type, payment status, and order
  const processedJobs = useMemo(() => {
    let list = [...jobs];

    // Device Type filter
    if (filterDeviceType !== 'all') {
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

    // Order Type filter
    if (filterOrderType !== 'all') {
      list = list.filter((j) => (j.orderType || 'repair') === filterOrderType);
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
  }, [jobs, filterDeviceType, filterPaymentStatus, filterOrderType, filterSortBy]);

  const hasActiveFilters =
    filterDeviceType !== 'all' ||
    filterPaymentStatus !== 'all' ||
    filterOrderType !== 'all' ||
    filterSortBy !== 'newest';

  const activeFilterCount =
    (filterDeviceType !== 'all' ? 1 : 0) +
    (filterPaymentStatus !== 'all' ? 1 : 0) +
    (filterOrderType !== 'all' ? 1 : 0) +
    (filterSortBy !== 'newest' ? 1 : 0);

  const handleResetFilters = () => {
    setFilterDeviceType('all');
    setFilterPaymentStatus('all');
    setFilterOrderType('all');
    setFilterSortBy('newest');
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedDateRange('all');
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
    handleResetFilters();
  };

  return (
    <View style={styles.container}>
      {/* Full-width Search Bar */}
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

      {/* Status Filter Chips (Solid blue active pill, gray inactive) */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {statusTabs.map((tab) => {
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

      {/* Job Cards List */}
      <FlatList
        data={processedJobs}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={fetchJobs}
        renderItem={({ item }) => (
          <JobCardItem
            job={item}
            onPress={() => router.push(`/job/${item._id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No matching jobs found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? `No jobs match "${searchQuery}"`
                : 'No jobs match your selected filters'}
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
              {/* Device Type */}
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

              {/* Order Type */}
              <Text style={styles.filterSectionTitle}>Order Type</Text>
              <View style={styles.modalChipRow}>
                {[
                  { key: 'all', label: 'All Orders' },
                  { key: 'repair', label: 'Repairs Only' },
                  { key: 'accessory', label: 'Accessories' },
                ].map((item) => (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.modalChip,
                      filterOrderType === item.key && styles.modalChipActive,
                    ]}
                    onPress={() => setFilterOrderType(item.key)}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        filterOrderType === item.key &&
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
                onPress={() => setIsFilterModalOpen(false)}
              >
                <Text style={styles.modalApplyBtnText}>Apply Filters</Text>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
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
  listContent: {
    padding: 16,
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
  // Modal Styles
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
  resetModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.rose,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    marginBottom: 8,
  },
  modalChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primary,
  },
  modalChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  modalChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  modalFooter: {
    marginTop: 20,
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
