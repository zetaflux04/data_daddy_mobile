import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { Colors } from '../constants/Colors';
import { MaterialSelect } from './MaterialSelect';
import { formatShortRange } from '../utils/date';
import { useTheme } from '../context/ThemeContext';

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
  const { colors, isDark } = useTheme();

  const handleTimeChange = (key) => {
    if (key === 'custom') {
      onDateRangeChange('custom', customStartDate, customEndDate);
      if (onPressFilter) onPressFilter();
      return;
    }
    onDateRangeChange(key, undefined, undefined);
  };

  const inputBg = isDark ? '#202C33' : '#FFFFFF';
  const activeColor = isDark ? '#60A5FA' : Colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <MaterialSelect
        style={styles.timeSelect}
        inputStyle={[styles.sharedInput, { backgroundColor: inputBg }]}
        label="Time"
        value={selectedDateRange}
        placeholder="All Time"
        options={dateRangeOptions.map((opt) => ({
          value: opt.key,
          label: opt.label,
        }))}
        displayValue={
          selectedDateRange === 'custom' && (customStartDate || customEndDate)
            ? customStartDate && customEndDate
              ? formatShortRange(customStartDate, customEndDate)
              : customStartDate
              ? `From ${customStartDate}`
              : `To ${customEndDate}`
            : undefined
        }
        onChange={handleTimeChange}
      />

      <Pressable style={styles.filterBtnWrap} onPress={onPressFilter}>
        <View style={styles.filterBtnInner}>
          <PaperTextInput
            mode="outlined"
            dense
            label="Filter"
            value={activeFilterCount > 0 ? String(activeFilterCount) : ''}
            editable={false}
            textColor={colors.text}
            outlineColor={hasActiveFilters ? activeColor : colors.border}
            activeOutlineColor={activeColor}
            right={<PaperTextInput.Icon icon="filter-variant" iconColor={hasActiveFilters ? activeColor : colors.textSecondary} />}
            style={[styles.sharedInput, { backgroundColor: inputBg }]}
            outlineStyle={styles.filterOutline}
            theme={{
              colors: {
                onSurfaceVariant: colors.textSecondary,
                text: colors.text,
              },
            }}
          />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  timeSelect: {
    flex: 1,
    marginVertical: 0,
  },
  filterBtnWrap: {
    width: 118,
    justifyContent: 'center',
  },
  filterBtnInner: {
    pointerEvents: 'none',
  },
  sharedInput: {
    backgroundColor: '#FFFFFF',
    height: 40,
  },
  filterOutline: {
    borderRadius: 4,
  },
});
