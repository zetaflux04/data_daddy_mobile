import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const formatDDMMYYYY = (val) => {
  if (!val) return '';
  if (typeof val === 'string' && val.includes('-')) {
    const parts = val.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }
  const dt = new Date(val);
  if (isNaN(dt.getTime())) return '';
  const day = String(dt.getDate()).padStart(2, '0');
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const year = dt.getFullYear();
  return `${day}/${month}/${year}`;
};

export const parseISODate = (val) => {
  if (!val) return new Date();
  if (typeof val === 'string' && val.includes('-')) {
    const parts = val.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d, 12, 0, 0);
      }
    }
  }
  const dt = new Date(val);
  return isNaN(dt.getTime()) ? new Date() : dt;
};

export const toISODate = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export function MaterialDatePickerModal({
  visible,
  date,
  onSet,
  onClear,
  onCancel,
}) {
  const [selectedDate, setSelectedDate] = useState(() => parseISODate(date));
  const [viewYear, setViewYear] = useState(() => parseISODate(date).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parseISODate(date).getMonth());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'year'

  useEffect(() => {
    if (visible) {
      const valid = parseISODate(date);
      setSelectedDate(valid);
      setViewYear(valid.getFullYear());
      setViewMonth(valid.getMonth());
      setViewMode('calendar');
    }
  }, [visible, date]);

  const daysGrid = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDayIndex; i += 1) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInCurrentMonth; d += 1) {
      cells.push(d);
    }
    return cells;
  }, [viewYear, viewMonth]);

  const yearList = useMemo(() => {
    const start = viewYear;
    const list = [];
    for (let y = start - 3; y <= start + 15; y += 1) {
      list.push(y);
    }
    return list;
  }, [viewYear]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day) => {
    const next = new Date(viewYear, viewMonth, day, 12, 0, 0);
    setSelectedDate(next);
  };

  const handleSelectYear = (y) => {
    setViewYear(y);
    setSelectedDate((prev) => new Date(y, prev.getMonth(), prev.getDate(), 12, 0, 0));
    setViewMode('calendar');
  };

  const handleSet = () => {
    if (onSet) onSet(toISODate(selectedDate));
  };

  const dateHeaderString = useMemo(() => {
    const dayName = SHORT_DAYS[selectedDate.getDay()];
    const dayNum = selectedDate.getDate();
    const monthName = SHORT_MONTHS[selectedDate.getMonth()];
    return `${dayName}, ${dayNum} ${monthName}`;
  }, [selectedDate]);

  if (!visible) return null;

  const content = (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onCancel} />

      <View style={styles.dialogCard}>
        {/* Header Bar */}
        <View style={styles.header}>
          <Pressable
            onPress={() =>
              setViewMode(viewMode === 'year' ? 'calendar' : 'year')
            }
            hitSlop={{ top: 8, bottom: 4, left: 8, right: 8 }}
          >
            <Text
              style={[
                styles.headerYear,
                viewMode === 'year' && styles.headerYearActive,
              ]}
            >
              {selectedDate.getFullYear()}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setViewMode('calendar')}
            hitSlop={{ top: 4, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.headerDate}>{dateHeaderString}</Text>
          </Pressable>
        </View>

        {/* Body */}
        {viewMode === 'year' ? (
          <ScrollView
            style={styles.yearListScroll}
            contentContainerStyle={styles.yearListContent}
            showsVerticalScrollIndicator={false}
          >
            {yearList.map((y) => {
              const isSelected = y === viewYear;
              return (
                <Pressable
                  key={y}
                  style={styles.yearItem}
                  onPress={() => handleSelectYear(y)}
                >
                  <Text
                    style={[
                      styles.yearItemText,
                      isSelected && styles.yearItemTextSelected,
                    ]}
                  >
                    {y}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.calendarBody}>
            {/* Month Navigation Row */}
            <View style={styles.monthNavRow}>
              <Pressable
                onPress={handlePrevMonth}
                style={styles.navBtn}
                hitSlop={8}
              >
                <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
              </Pressable>

              <Text style={styles.monthTitle}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>

              <Pressable
                onPress={handleNextMonth}
                style={styles.navBtn}
                hitSlop={8}
              >
                <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Weekday Labels */}
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((w, idx) => (
                <Text key={idx} style={styles.weekdayText}>
                  {w}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {daysGrid.map((day, idx) => {
                if (day === null) {
                  return <View key={`empty-${idx}`} style={styles.dayCell} />;
                }

                const isSelected =
                  selectedDate.getFullYear() === viewYear &&
                  selectedDate.getMonth() === viewMonth &&
                  selectedDate.getDate() === day;

                return (
                  <Pressable
                    key={`day-${day}`}
                    style={styles.dayCell}
                    onPress={() => handleSelectDay(day)}
                  >
                    <View
                      style={[
                        styles.dayBubble,
                        isSelected && styles.dayBubbleSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={onClear}
            style={styles.actionBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.actionText}>CLEAR</Text>
          </Pressable>
          <View style={styles.actionRightRow}>
            <Pressable
              onPress={onCancel}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.actionText}>CANCEL</Text>
            </Pressable>
            <Pressable
              onPress={handleSet}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.actionText}>SET</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#1F1A16',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 24,
  },
  header: {
    backgroundColor: '#565553',
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerYear: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  headerYearActive: {
    color: '#FDE3D2',
  },
  headerDate: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F4F4F5',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  calendarBody: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBubbleSelected: {
    backgroundColor: '#FDE3D2',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  dayTextSelected: {
    color: '#1F1A16',
    fontWeight: '700',
  },
  yearListScroll: {
    height: 250,
  },
  yearListContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  yearItem: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  yearItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  yearItemTextSelected: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FDE3D2',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionRightRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FDE3D2',
    letterSpacing: 0.6,
  },
});
