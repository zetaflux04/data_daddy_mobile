import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import {
  addDaysISO,
  daysInMonth,
  formatDisplayDate,
  parseISODate,
  todayISO,
  toISODate,
} from '../utils/date';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const buildGrid = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const total = daysInMonth(year, monthIndex);
  const cells = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let day = 1; day <= total; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

export const CalendarDateRange = ({ startDate, endDate, onChangeStart, onChangeEnd }) => {
  const today = todayISO();
  const start = startDate || today;
  const end = endDate || today;
  const [activeField, setActiveField] = useState('start');
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const source = parseISODate(start);
    return { year: source.getFullYear(), month: source.getMonth() };
  });

  useEffect(() => {
    const source = parseISODate(activeField === 'end' ? end : start);
    setVisibleMonth({ year: source.getFullYear(), month: source.getMonth() });
  }, [activeField]);

  const cells = useMemo(
    () => buildGrid(visibleMonth.year, visibleMonth.month),
    [visibleMonth.year, visibleMonth.month]
  );

  const monthTitle = new Date(visibleMonth.year, visibleMonth.month, 1).toLocaleDateString(
    'en-IN',
    { month: 'long', year: 'numeric' }
  );

  const shiftMonth = (delta) => {
    const next = new Date(visibleMonth.year, visibleMonth.month + delta, 1);
    setVisibleMonth({ year: next.getFullYear(), month: next.getMonth() });
  };

  const handleSelectDay = (day) => {
    const iso = toISODate(new Date(visibleMonth.year, visibleMonth.month, day));
    if (activeField === 'start') {
      onChangeStart(iso);
      if (iso > end) onChangeEnd(iso);
      setActiveField('end');
      return;
    }
    onChangeEnd(iso);
    if (iso < start) onChangeStart(iso);
  };

  const applyPreset = (daysBack) => {
    const to = todayISO();
    const from = addDaysISO(to, -daysBack);
    onChangeStart(from);
    onChangeEnd(to);
    const parsed = parseISODate(from);
    setVisibleMonth({ year: parsed.getFullYear(), month: parsed.getMonth() });
    setActiveField('start');
  };

  return (
    <View>
      <View style={styles.fieldsRow}>
        <DateField
          label="Start date"
          value={start}
          active={activeField === 'start'}
          onPress={() => setActiveField('start')}
        />
        <View style={styles.fieldsDivider}>
          <Ionicons name="arrow-forward" size={14} color="#94A3B8" />
        </View>
        <DateField
          label="End date"
          value={end}
          active={activeField === 'end'}
          onPress={() => setActiveField('end')}
        />
      </View>

      <Text style={styles.hint}>
        {activeField === 'start' ? 'Tap a date to set the start' : 'Tap a date to set the end'}
      </Text>

      <View style={styles.calendarCard}>
        <View style={styles.monthNav}>
          <Pressable
            onPress={() => shiftMonth(-1)}
            hitSlop={10}
            style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="chevron-back" size={18} color="#334155" />
          </Pressable>
          <Text style={styles.monthTitle}>{monthTitle}</Text>
          <Pressable
            onPress={() => shiftMonth(1)}
            hitSlop={10}
            style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="chevron-forward" size={18} color="#334155" />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map((day, index) => (
            <Text key={`${day}-${index}`} style={styles.weekday}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((day, index) => {
            if (!day) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }
            const iso = toISODate(new Date(visibleMonth.year, visibleMonth.month, day));
            const isStart = iso === start;
            const isEnd = iso === end;
            const inRange = iso > start && iso < end;
            const isToday = iso === today;
            const isEdge = isStart || isEnd;

            return (
              <Pressable
                key={iso}
                onPress={() => handleSelectDay(day)}
                style={styles.dayCell}
              >
                {inRange ? <View style={styles.rangeFill} /> : null}
                {isStart && start !== end ? <View style={styles.rangeFillStart} /> : null}
                {isEnd && start !== end ? <View style={styles.rangeFillEnd} /> : null}
                <View style={[styles.dayInner, isEdge && styles.dayInnerSelected]}>
                  <Text
                    style={[
                      styles.dayText,
                      isToday && !isEdge && styles.dayTextToday,
                      isEdge && styles.dayTextSelected,
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

      <View style={styles.presetsRow}>
        <Pressable style={styles.presetChip} onPress={() => applyPreset(6)}>
          <Text style={styles.presetText}>Last 7 Days</Text>
        </Pressable>
        <Pressable style={styles.presetChip} onPress={() => applyPreset(29)}>
          <Text style={styles.presetText}>Last 30 Days</Text>
        </Pressable>
      </View>
    </View>
  );
};

const DateField = ({ label, value, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.dateField,
      active && styles.dateFieldActive,
      { opacity: pressed ? 0.88 : 1 },
    ]}
  >
    <Text style={[styles.dateFieldLabel, active && styles.dateFieldLabelActive]}>{label}</Text>
    <View style={styles.dateFieldValueRow}>
      <Ionicons name="calendar-outline" size={16} color={active ? Colors.primary : '#64748B'} />
      <Text style={[styles.dateFieldValue, active && styles.dateFieldValueActive]}>
        {formatDisplayDate(value)}
      </Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  fieldsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldsDivider: {
    paddingTop: 14,
  },
  dateField: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateFieldActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  dateFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  dateFieldLabelActive: {
    color: Colors.primary,
  },
  dateFieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateFieldValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  dateFieldValueActive: {
    color: Colors.primary,
  },
  hint: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EEF2FF',
  },
  rangeFillStart: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: '#EEF2FF',
  },
  rangeFillEnd: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: '#EEF2FF',
  },
  dayInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dayInnerSelected: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  dayTextToday: {
    color: Colors.primary,
    fontWeight: '800',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
});
