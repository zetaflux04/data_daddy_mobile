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

export const CAME_IN_FILTER_OPTIONS = [
  { key: 'any_time', label: 'Any time' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last_7_days', label: 'Last 7 days' },
  { key: 'this_month', label: 'This month' },
  { key: 'custom', label: 'Custom dates' },
];

export const DEVICE_TYPE_OPTIONS = [
  { key: 'all', label: 'All Devices' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'laptop', label: 'Laptop' },
  { key: 'tablet', label: 'Tablet' },
  { key: 'smartwatch', label: 'Watch' },
];

export const PAYMENT_STATUS_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid in Full' },
  { key: 'due', label: 'Has Dues' },
];

export const SORT_FILTER_OPTIONS = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'due_high', label: 'Highest Due' },
];

export function FilterModal({
  visible,
  onClose,
  selectedCameIn = 'any_time',
  onSelectCameIn,
  customStartDate,
  onChangeCustomStartDate,
  customEndDate,
  onChangeCustomEndDate,
  selectedDeviceType = 'all',
  onSelectDeviceType,
  showDeviceType = true,
  selectedPaymentStatus = 'all',
  onSelectPaymentStatus,
  selectedTechnician = 'anyone',
  onSelectTechnician,
  technicians = [],
  selectedSortBy = 'newest',
  onSelectSortBy,
  onClearAll,
  onApply,
}) {
  const insets = useSafeAreaInsets();
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
            accessibilityLabel="Close filter"
          />
          <Pressable
            style={styles.backdropFlex}
            onPress={onClose}
            accessibilityLabel="Close filter backdrop"
          />

          <View
            style={[
              styles.sheetContainer,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            {/* Drag Handle Indicator */}
            <View style={styles.dragHandle} />

            {/* Header Row: Filters & Clear all */}
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Filters</Text>
              <Pressable
                onPress={onClearAll}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.clearAllText}>Clear all</Text>
              </Pressable>
            </View>

            {/* Scrollable Filter Options */}
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* CAME IN Section */}
              <Text style={styles.sectionHeader}>Time Period</Text>
              <View style={styles.chipsRow}>
                {CAME_IN_FILTER_OPTIONS.map((item) => {
                  const isSelected = selectedCameIn === item.key;

                  return (
                    <Pressable
                      key={item.key}
                      style={[styles.chip, isSelected && styles.chipSelected]}
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
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Custom Dates Box (From & To inputs as shown in reference) */}
              {selectedCameIn === 'custom' && (
                <View style={styles.customDateCard}>
                  <View style={styles.dateInputsRow}>
                    {/* From Field */}
                    <View style={styles.dateInputCol}>
                      <Text style={styles.dateInputLabel}>From</Text>
                      <Pressable
                        style={styles.datePickerBtn}
                        onPress={() => {
                          setActiveDateField('start');
                          setIsDatePickerVisible(true);
                        }}
                      >
                        <Text
                          style={[
                            styles.datePickerBtnText,
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
                          color="#64748B"
                        />
                      </Pressable>
                    </View>

                    {/* To Field */}
                    <View style={styles.dateInputCol}>
                      <Text style={styles.dateInputLabel}>To</Text>
                      <Pressable
                        style={styles.datePickerBtn}
                        onPress={() => {
                          setActiveDateField('end');
                          setIsDatePickerVisible(true);
                        }}
                      >
                        <Text
                          style={[
                            styles.datePickerBtnText,
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
                          color="#64748B"
                        />
                      </Pressable>
                    </View>
                  </View>

                  <Text style={styles.dateHelpText}>
                    Fill one side only for an open-ended range
                  </Text>
                </View>
              )}

              {/* DEVICE TYPE Section (Only if showDeviceType) */}
              {showDeviceType && (
                <>
                  <Text style={styles.sectionHeader}>DEVICE TYPE</Text>
                  <View style={styles.chipsRow}>
                    {DEVICE_TYPE_OPTIONS.map((item) => {
                      const isSelected = selectedDeviceType === item.key;
                      return (
                        <Pressable
                          key={item.key}
                          style={[
                            styles.chip,
                            isSelected && styles.chipSelected,
                          ]}
                          onPress={() => onSelectDeviceType(item.key)}
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
                              isSelected && styles.chipTextSelected,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {/* PAYMENT STATUS Section */}
              <Text style={styles.sectionHeader}>PAYMENT STATUS</Text>
              <View style={styles.chipsRow}>
                {PAYMENT_STATUS_OPTIONS.map((item) => {
                  const isSelected = selectedPaymentStatus === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => onSelectPaymentStatus(item.key)}
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
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* TECHNICIAN Section */}
              <Text style={styles.sectionHeader}>TECHNICIAN</Text>
              <View style={styles.chipsRow}>
                <Pressable
                  style={[
                    styles.chip,
                    selectedTechnician === 'anyone' && styles.chipSelected,
                  ]}
                  onPress={() => onSelectTechnician('anyone')}
                >
                  {selectedTechnician === 'anyone' && (
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
                      selectedTechnician === 'anyone' &&
                        styles.chipTextSelected,
                    ]}
                  >
                    Anyone
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.chip,
                    selectedTechnician === 'not_assigned' && styles.chipSelected,
                  ]}
                  onPress={() => onSelectTechnician('not_assigned')}
                >
                  {selectedTechnician === 'not_assigned' && (
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
                      selectedTechnician === 'not_assigned' &&
                        styles.chipTextSelected,
                    ]}
                  >
                    Not assigned
                  </Text>
                </Pressable>

                {technicians &&
                  technicians.map((tech) => {
                    const techId = tech._id || tech.id;
                    const isSelected = selectedTechnician === techId;
                    return (
                      <Pressable
                        key={techId}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => onSelectTechnician(techId)}
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
                            isSelected && styles.chipTextSelected,
                          ]}
                        >
                          {tech.name || 'Technician'}
                        </Text>
                      </Pressable>
                    );
                  })}
              </View>

              {/* SORT BY Section */}
              <Text style={styles.sectionHeader}>SORT BY</Text>
              <View style={styles.chipsRow}>
                {SORT_FILTER_OPTIONS.map((item) => {
                  const isSelected = selectedSortBy === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      style={[styles.chip, isSelected && styles.chipSelected]}
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
            <View style={styles.footerContainer}>
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
  // Custom Dates Card
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
