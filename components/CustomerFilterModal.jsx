import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import {
  MaterialDatePickerModal,
  formatDDMMYYYY,
} from './MaterialDatePickerModal';
import { CAME_IN_FILTER_OPTIONS } from './FilterModal';
import { useTheme } from '../context/ThemeContext';

export const CUSTOMER_TYPE_OPTIONS = [
  { key: 'all', label: 'All Customers' },
  { key: 'dues', label: 'With Pending Dues' },
  { key: 'repeat', label: 'Repeat (2+ Jobs)' },
  { key: 'single', label: 'First-time (1 Job)' },
];

export const CUSTOMER_SORT_OPTIONS = [
  { key: 'recent', label: 'Recently Active' },
  { key: 'name_asc', label: 'Name (A to Z)' },
  { key: 'name_desc', label: 'Name (Z to A)' },
  { key: 'most_jobs', label: 'Most Jobs' },
];

export function CustomerFilterModal({
  visible,
  onClose,
  selectedCameIn = 'any_time',
  onSelectCameIn,
  customStartDate,
  onChangeCustomStartDate,
  customEndDate,
  onChangeCustomEndDate,
  selectedType = 'all',
  onSelectType,
  selectedSortBy = 'recent',
  onSelectSortBy,
  onClearAll,
  onApply,
}) {
  const insets = useSafeAreaInsets();
  let colors = null;
  let isDark = false;
  try {
    const theme = useTheme();
    colors = theme.colors;
    isDark = theme.isDark;
  } catch {}
  const [activeDateField, setActiveDateField] = useState(null); // 'start' | 'end' | null
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const handleSetDate = (isoDate) => {
    if (activeDateField === 'start') {
      if (onChangeCustomStartDate) onChangeCustomStartDate(isoDate);
    } else if (activeDateField === 'end') {
      if (onChangeCustomEndDate) onChangeCustomEndDate(isoDate);
    }
    setIsDatePickerVisible(false);
    setActiveDateField(null);
  };

  const handleClearDate = () => {
    if (activeDateField === 'start') {
      if (onChangeCustomStartDate) onChangeCustomStartDate(undefined);
    } else if (activeDateField === 'end') {
      if (onChangeCustomEndDate) onChangeCustomEndDate(undefined);
    }
    setIsDatePickerVisible(false);
    setActiveDateField(null);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop pressable handlers so tapping outside closes modal */}
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={onClose}
            accessibilityLabel="Close customer filter"
          />
          <Pressable
            style={styles.backdropFlex}
            onPress={onClose}
            accessibilityLabel="Close customer filter backdrop"
          />

          <View
            style={[
              styles.sheetContainer,
              {
                backgroundColor: isDark ? '#111B21' : '#FFFFFF',
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            {/* Drag Handle Indicator */}
            <View style={[styles.dragHandle, isDark && { backgroundColor: '#202C33' }]} />

            {/* Header Row: Filters & Clear all */}
            <View style={[styles.headerRow, { borderBottomColor: isDark ? '#202C33' : '#F8FAFC' }]}>
              <Text style={[styles.headerTitle, { color: isDark ? '#E9EDEF' : '#0F172A' }]}>Filters</Text>
              <Pressable
                onPress={onClearAll}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={[styles.clearAllText, { color: isDark ? '#60A5FA' : Colors.primary }]}>Clear all</Text>
              </Pressable>
            </View>

            {/* Scrollable Filter Options */}
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* CAME IN / DATE RANGE Section */}
              {onSelectCameIn && (
                <>
                  <Text style={[styles.sectionHeader, { color: isDark ? '#8696A0' : '#64748B' }]}>Time Period</Text>
                  <View style={styles.chipsRow}>
                    {CAME_IN_FILTER_OPTIONS.map((item) => {
                      const isSelected = selectedCameIn === item.key;

                      return (
                        <Pressable
                          key={item.key}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: isSelected ? Colors.primary : (isDark ? '#202C33' : '#FFFFFF'),
                              borderColor: isSelected ? Colors.primary : (isDark ? '#2A3942' : '#E2E8F0'),
                            },
                          ]}
                          onPress={() => onSelectCameIn(item.key)}
                        >
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={15}
                              color="#FFFFFF"
                              style={styles.checkIcon}
                            />
                          )}
                          <Text
                            style={[
                              styles.chipText,
                              { color: isSelected ? '#FFFFFF' : (isDark ? '#E9EDEF' : '#475569') },
                              isSelected && styles.chipTextSelected,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Custom Dates Box */}
                  {selectedCameIn === 'custom' && (
                    <View style={[styles.customDateCard, isDark && { backgroundColor: '#202C33', borderColor: '#2A3942' }]}>
                      <View style={styles.dateInputsRow}>
                        {/* From Field */}
                        <View style={styles.dateInputCol}>
                          <Text style={[styles.dateInputLabel, isDark && { color: '#8696A0' }]}>From</Text>
                          <Pressable
                            style={[styles.datePickerBtn, isDark && { backgroundColor: '#111B21', borderColor: '#2A3942' }]}
                            onPress={() => {
                              setActiveDateField('start');
                              setIsDatePickerVisible(true);
                            }}
                          >
                            <Text
                              style={[
                                styles.datePickerBtnText,
                                isDark && { color: '#E9EDEF' },
                                !customStartDate && styles.datePickerPlaceholder,
                              ]}
                              numberOfLines={1}
                            >
                              {customStartDate
                                ? formatDDMMYYYY(customStartDate)
                                : ''}
                            </Text>
                            <Ionicons
                              name="chevron-down"
                              size={16}
                              color={isDark ? '#8696A0' : '#64748B'}
                            />
                          </Pressable>
                        </View>

                        {/* To Field */}
                        <View style={styles.dateInputCol}>
                          <Text style={[styles.dateInputLabel, isDark && { color: '#8696A0' }]}>To</Text>
                          <Pressable
                            style={[styles.datePickerBtn, isDark && { backgroundColor: '#111B21', borderColor: '#2A3942' }]}
                            onPress={() => {
                              setActiveDateField('end');
                              setIsDatePickerVisible(true);
                            }}
                          >
                            <Text
                              style={[
                                styles.datePickerBtnText,
                                isDark && { color: '#E9EDEF' },
                                !customEndDate && styles.datePickerPlaceholder,
                              ]}
                              numberOfLines={1}
                            >
                              {customEndDate
                                ? formatDDMMYYYY(customEndDate)
                                : ''}
                            </Text>
                            <Ionicons
                              name="chevron-down"
                              size={16}
                              color={isDark ? '#8696A0' : '#64748B'}
                            />
                          </Pressable>
                        </View>
                      </View>

                      <Text style={[styles.dateHelpText, isDark && { color: '#8696A0' }]}>
                        Fill one side only for an open-ended range
                      </Text>
                    </View>
                  )}
                </>
              )}

              {/* CUSTOMER TYPE Section */}
              <Text style={[styles.sectionHeader, { color: isDark ? '#8696A0' : '#64748B' }]}>CUSTOMER TYPE</Text>
              <View style={styles.chipsRow}>
                {CUSTOMER_TYPE_OPTIONS.map((item) => {
                  const isSelected = selectedType === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? Colors.primary : (isDark ? '#202C33' : '#FFFFFF'),
                          borderColor: isSelected ? Colors.primary : (isDark ? '#2A3942' : '#E2E8F0'),
                        },
                      ]}
                      onPress={() => onSelectType(item.key)}
                    >
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={15}
                          color="#FFFFFF"
                          style={styles.checkIcon}
                        />
                      )}
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : (isDark ? '#E9EDEF' : '#475569') },
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* SORT BY Section */}
              <Text style={[styles.sectionHeader, { color: isDark ? '#8696A0' : '#64748B' }]}>SORT BY</Text>
              <View style={styles.chipsRow}>
                {CUSTOMER_SORT_OPTIONS.map((item) => {
                  const isSelected = selectedSortBy === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? Colors.primary : (isDark ? '#202C33' : '#FFFFFF'),
                          borderColor: isSelected ? Colors.primary : (isDark ? '#2A3942' : '#E2E8F0'),
                        },
                      ]}
                      onPress={() => onSelectSortBy(item.key)}
                    >
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={15}
                          color="#FFFFFF"
                          style={styles.checkIcon}
                        />
                      )}
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : (isDark ? '#E9EDEF' : '#475569') },
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Sticky Bottom Action Button */}
            <View style={[styles.footerContainer, { backgroundColor: isDark ? '#111B21' : '#FFFFFF', borderTopColor: isDark ? '#202C33' : '#F1F5F9' }]}>
              <Pressable
                style={({ pressed }) => [
                  styles.applyButton,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                ]}
                onPress={() => {
                  if (onApply) onApply();
                  onClose();
                }}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Date Picker Dialog over the Screen */}
      <MaterialDatePickerModal
        visible={isDatePickerVisible}
        date={activeDateField === 'start' ? customStartDate : customEndDate}
        onSet={handleSetDate}
        onClear={handleClearDate}
        onCancel={() => {
          setIsDatePickerVisible(false);
          setActiveDateField(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropFlex: {
    flex: 1,
    width: '100%',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: '#0F172A',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollArea: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#64748B',
    marginTop: 18,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9.5,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#475569',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  customDateCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputCol: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  datePickerBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  datePickerPlaceholder: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  dateHelpText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 12,
  },
  footerContainer: {
    paddingHorizontal: 22,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
