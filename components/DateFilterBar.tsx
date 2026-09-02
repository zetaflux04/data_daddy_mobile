import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export type DateRangeKey = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export interface DateFilterValue {
  key: DateRangeKey;
  label: string;
  startDate?: string;
  endDate?: string;
}

interface DateFilterBarProps {
  selectedRange: DateRangeKey;
  onRangeChange: (range: DateRangeKey, startDate?: string, endDate?: string) => void;
  customStartDate?: string;
  customEndDate?: string;
}

const filterTabs: Array<{ key: DateRangeKey; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'all', label: 'All Time', icon: 'infinite-outline' },
  { key: 'today', label: 'Today', icon: 'today-outline' },
  { key: 'week', label: 'This Week', icon: 'calendar-outline' },
  { key: 'month', label: 'This Month', icon: 'calendar-number-outline' },
  { key: 'year', label: 'This Year', icon: 'time-outline' },
  { key: 'custom', label: 'Custom', icon: 'options-outline' },
];

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  selectedRange,
  onRangeChange,
  customStartDate,
  customEndDate,
}) => {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [tempStart, setTempStart] = useState(
    customStartDate || new Date().toISOString().split('T')[0]
  );
  const [tempEnd, setTempEnd] = useState(
    customEndDate || new Date().toISOString().split('T')[0]
  );

  const handleTabPress = (key: DateRangeKey) => {
    if (key === 'custom') {
      setIsCustomModalOpen(true);
    } else {
      onRangeChange(key);
    }
  };

  const handleApplyCustom = () => {
    setIsCustomModalOpen(false);
    onRangeChange('custom', tempStart, tempEnd);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {filterTabs.map((tab) => {
          const isSelected = selectedRange === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}>
              <Ionicons
                name={tab.icon}
                size={13}
                color={isSelected ? Colors.primary : '#64748B'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {tab.key === 'custom' && selectedRange === 'custom' && customStartDate && customEndDate
                  ? `${customStartDate} - ${customEndDate}`
                  : tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Custom Date Range Picker Modal */}
      <Modal
        visible={isCustomModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCustomModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
                <Text style={styles.modalTitle}>Custom Date Range</Text>
              </View>
              <TouchableOpacity onPress={() => setIsCustomModalOpen(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 2025-05-01"
              placeholderTextColor="#94A3B8"
              value={tempStart}
              onChangeText={setTempStart}
            />

            <Text style={styles.inputLabel}>End Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 2025-05-31"
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
                }}>
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
                }}>
                <Text style={styles.presetText}>Last 30 Days</Text>
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setIsCustomModalOpen(false)}>
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
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
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
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
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
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
