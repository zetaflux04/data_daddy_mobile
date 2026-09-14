import React from 'react';
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
  onOpenCustomDates,
  customDateLabel,
}) {
  const insets = useSafeAreaInsets();

  const handleSelectCameIn = (key) => {
    onSelectCameIn(key);
    if (key === 'custom' && onOpenCustomDates) {
      onOpenCustomDates();
    }
  };

  return (
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
            <Text style={styles.sectionHeader}>CAME IN</Text>
            <View style={styles.chipsRow}>
              {CAME_IN_FILTER_OPTIONS.map((item) => {
                const isSelected = selectedCameIn === item.key;
                const displayLabel =
                  item.key === 'custom' && customDateLabel
                    ? customDateLabel
                    : item.label;

                return (
                  <Pressable
                    key={item.key}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => handleSelectCameIn(item.key)}
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
                      {displayLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

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
                        style={[styles.chip, isSelected && styles.chipSelected]}
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
                    selectedTechnician === 'anyone' && styles.chipTextSelected,
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
