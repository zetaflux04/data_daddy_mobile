import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { FloatingCloseButton } from './FloatingCloseButton';

const dateRangeOptions = [
  { key: 'all', label: 'All Time', icon: 'infinite-outline' },
  { key: 'today', label: 'Today', icon: 'today-outline' },
  { key: 'week', label: 'This Week', icon: 'calendar-outline' },
  { key: 'month', label: 'This Month', icon: 'calendar-number-outline' },
  { key: 'year', label: 'This Year', icon: 'time-outline' },
  { key: 'custom', label: 'Custom Range', icon: 'options-outline' },
];

export const HeaderFilterBar = ({
  selectedDateRange,
  onDateRangeChange,
  customStartDate,
  customEndDate,
  onPressFilter,
  hasActiveFilters = false,
  activeFilterCount = 0,
}) => {
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isCustomDateActive, setIsCustomDateActive] = useState(false);
  const [tempStart, setTempStart] = useState(
    customStartDate || new Date().toISOString().split('T')[0]
  );
  const [tempEnd, setTempEnd] = useState(
    customEndDate || new Date().toISOString().split('T')[0]
  );

  // Compute label shown on the dropdown button
  const getSelectedLabel = () => {
    if (selectedDateRange === 'custom') {
      if (customStartDate && customEndDate) {
        return `${customStartDate} - ${customEndDate}`;
      }
      return 'Custom Range';
    }
    const found = dateRangeOptions.find((opt) => opt.key === selectedDateRange);
    return found ? found.label : 'All Time';
  };

  const handleSelectPreset = (key) => {
    if (key === 'custom') {
      setIsCustomDateActive(true);
    } else {
      setIsCustomDateActive(false);
      setIsDateModalOpen(false);
      onDateRangeChange(key, undefined, undefined);
    }
  };

  const handleApplyCustom = () => {
    setIsCustomDateActive(false);
    setIsDateModalOpen(false);
    onDateRangeChange('custom', tempStart, tempEnd);
  };

  return (
    <View style={styles.container}>
      {/* Date Dropdown Button (Left) */}
      <Pressable
        style={styles.dateDropdownBtn}
        onPress={() => {
          setIsCustomDateActive(selectedDateRange === 'custom');
          setIsDateModalOpen(true);
        }}
      >
        <Ionicons name="calendar-outline" size={16} color="#0F172A" />
        <Text style={styles.dateDropdownText} numberOfLines={1}>
          {getSelectedLabel()}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#64748B" />
      </Pressable>

      {/* Filter Button (Right) */}
      <Pressable
        style={[
          styles.filterBtn,
          hasActiveFilters && styles.filterBtnActive,
        ]}
        onPress={onPressFilter}
      >
        <Ionicons
          name="options-outline"
          size={16}
          color={hasActiveFilters ? Colors.primary : '#0F172A'}
        />
        <Text
          style={[
            styles.filterBtnText,
            hasActiveFilters && styles.filterBtnTextActive,
          ]}
        >
          Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Text>
        {hasActiveFilters && <View style={styles.filterActiveDot} />}
      </Pressable>

      {/* Date Selection Modal */}
      <Modal
        visible={isDateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsDateModalOpen(false)}
          />
          <FloatingCloseButton onPress={() => setIsDateModalOpen(false)} />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
                <Text style={styles.modalTitle}>
                  {isCustomDateActive ? 'Custom Date Range' : 'Filter by Date'}
                </Text>
              </View>
            </View>

            {!isCustomDateActive ? (
              <View style={styles.optionsList}>
                {dateRangeOptions.map((opt) => {
                  const isSelected = selectedDateRange === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionRowActive,
                      ]}
                      onPress={() => handleSelectPreset(opt.key)}
                    >
                      <View style={styles.optionLeft}>
                        <Ionicons
                          name={opt.icon}
                          size={18}
                          color={isSelected ? Colors.primary : '#64748B'}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={Colors.primary}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View>
                <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 2026-05-01"
                  placeholderTextColor="#94A3B8"
                  value={tempStart}
                  onChangeText={setTempStart}
                />

                <Text style={styles.inputLabel}>End Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 2026-05-31"
                  placeholderTextColor="#94A3B8"
                  value={tempEnd}
                  onChangeText={setTempEnd}
                />

                {/* Quick Presets */}
                <View style={styles.presetsRow}>
                  <Pressable
                    style={styles.presetChip}
                    onPress={() => {
                      const now = new Date();
                      const sevenDaysAgo = new Date();
                      sevenDaysAgo.setDate(now.getDate() - 7);
                      setTempStart(sevenDaysAgo.toISOString().split('T')[0]);
                      setTempEnd(now.toISOString().split('T')[0]);
                    }}
                  >
                    <Text style={styles.presetText}>Last 7 Days</Text>
                  </Pressable>
                  <Pressable
                    style={styles.presetChip}
                    onPress={() => {
                      const now = new Date();
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(now.getDate() - 30);
                      setTempStart(thirtyDaysAgo.toISOString().split('T')[0]);
                      setTempEnd(now.toISOString().split('T')[0]);
                    }}
                  >
                    <Text style={styles.presetText}>Last 30 Days</Text>
                  </Pressable>
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.backToPresetsBtn}
                    onPress={() => setIsCustomDateActive(false)}
                  >
                    <Text style={styles.backToPresetsBtnText}>Presets</Text>
                  </Pressable>
                  <Pressable
                    style={styles.applyBtn}
                    onPress={handleApplyCustom}
                  >
                    <Text style={styles.applyBtnText}>Apply Filter</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  dateDropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 8,
  },
  dateDropdownText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
    gap: 8,
  },
  filterBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  filterBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  filterBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  filterActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
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
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
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
});
