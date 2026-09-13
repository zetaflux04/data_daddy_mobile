import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { FloatingCloseButton } from './FloatingCloseButton';
import { CalendarDateRange } from './CalendarDateRange';
import { formatShortRange, todayISO } from '../utils/date';

const filterTabs = [
  { key: 'all', label: 'All Time', icon: 'infinite-outline' },
  { key: 'today', label: 'Today', icon: 'today-outline' },
  { key: 'week', label: 'This Week', icon: 'calendar-outline' },
  { key: 'month', label: 'This Month', icon: 'calendar-number-outline' },
  { key: 'year', label: 'This Year', icon: 'time-outline' },
  { key: 'custom', label: 'Custom', icon: 'options-outline' },
];

export const DateFilterBar = ({
  selectedRange,
  onRangeChange,
  customStartDate,
  customEndDate,
}) => {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [tempStart, setTempStart] = useState(customStartDate || todayISO());
  const [tempEnd, setTempEnd] = useState(customEndDate || todayISO());

  const handleTabPress = (key) => {
    if (key === 'custom') {
      setTempStart(customStartDate || todayISO());
      setTempEnd(customEndDate || todayISO());
      setIsCustomModalOpen(true);
      return;
    }
    onRangeChange(key);
  };

  const handleApplyCustom = () => {
    if (!tempStart || !tempEnd) return;
    setIsCustomModalOpen(false);
    onRangeChange('custom', tempStart, tempEnd);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filterTabs.map((tab) => {
          const isSelected = selectedRange === tab.key;
          const label =
            tab.key === 'custom' && selectedRange === 'custom' && customStartDate && customEndDate
              ? formatShortRange(customStartDate, customEndDate)
              : tab.label;
          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Ionicons
                name={tab.icon}
                size={13}
                color={isSelected ? '#FFFFFF' : '#64748B'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Modal
        visible={isCustomModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCustomModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsCustomModalOpen(false)} />
          <FloatingCloseButton onPress={() => setIsCustomModalOpen(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
                <Text style={styles.modalTitle}>Custom Date Range</Text>
              </View>
              <Text style={styles.modalSubtitle}>Pick start and end dates from the calendar</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <CalendarDateRange
                startDate={tempStart}
                endDate={tempEnd}
                onChangeStart={setTempStart}
                onChangeEnd={setTempEnd}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setIsCustomModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.applyBtn} onPress={handleApplyCustom}>
                <Text style={styles.applyBtnText}>Apply Filter</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    marginBottom: 14,
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
  modalSubtitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
