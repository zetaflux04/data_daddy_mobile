import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { AppHeader } from '../components/AppHeader';
import { FloatingCloseButton } from '../components/FloatingCloseButton';
import { OutlinedTextInput } from '../components/OutlinedTextInput';

const categories = [
  { key: 'spare_part', label: 'Spare Part', icon: 'hardware-chip-outline', color: '#2563EB', bg: '#EFF6FF' },
  { key: 'rent', label: 'Rent', icon: 'business-outline', color: '#7C3AED', bg: '#F5F3FF' },
  { key: 'salary', label: 'Salary', icon: 'people-outline', color: '#059669', bg: '#ECFDF5' },
  { key: 'tools', label: 'Tools', icon: 'build-outline', color: '#D97706', bg: '#FFFBEB' },
  { key: 'utilities', label: 'Utilities', icon: 'flash-outline', color: '#CA8A04', bg: '#FEFCE8' },
  { key: 'other', label: 'Other', icon: 'receipt-outline', color: '#475569', bg: '#F1F5F9' },
];

const categoryMap = categories.reduce((acc, cur) => {
  acc[cur.key] = cur;
  return acc;
}, {});

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Add Expense Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('spare_part');
  const [expNote, setExpNote] = useState('');

  const fetchExpenses = useCallback(async () => {
    try {
      const data = await api.getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch {
      setExpenses([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchExpenses();
  };

  const handleSaveExpense = async () => {
    if (!expTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a description or title for the expense.');
      return;
    }
    const numAmount = Number(expAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount in Rupees (₹).');
      return;
    }

    setIsSaving(true);
    try {
      await api.addExpense({
        title: expTitle.trim(),
        amount: numAmount,
        category: expCategory,
        note: expNote.trim(),
        date: new Date(),
      });
      setIsAddOpen(false);
      setExpTitle('');
      setExpAmount('');
      setExpNote('');
      setExpCategory('spare_part');
      await fetchExpenses();
      Alert.alert('Expense Saved', 'The expense record was added successfully.');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Could not save expense.';
      Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = (exp) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${exp.title}" of ₹${exp.amount.toLocaleString('en-IN')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteExpense(exp._id);
              setExpenses((prev) => prev.filter((item) => item._id !== exp._id));
            } catch (error) {
              const msg = error.response?.data?.message || error.message || 'Could not delete expense.';
              Alert.alert('Delete Failed', msg);
            }
          },
        },
      ]
    );
  };

  // Filtered expenses
  const filteredExpenses = selectedCategory === 'all'
    ? expenses
    : expenses.filter((e) => e.category === selectedCategory);

  // Financial calculations
  const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const partsAmount = expenses
    .filter((e) => e.category === 'spare_part')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Shop Expenses"
        subtitle="Parts purchases, rent, salaries & bills"
        rightAction={
          <Pressable
            style={({ pressed }) => [styles.headerAddBtn, { opacity: pressed ? 0.75 : 1 }]}
            onPress={() => setIsAddOpen(true)}
          >
            <Ionicons name="add-circle" size={16} color="#FFFFFF" />
            <Text style={styles.headerAddBtnText}>Add</Text>
          </Pressable>
        }
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 24) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[isDark ? '#60A5FA' : Colors.primary]}
            progressBackgroundColor={isDark ? '#202C33' : '#FFFFFF'}
            tintColor={isDark ? '#60A5FA' : Colors.primary}
          />
        }
      >
        {/* KPI Summary Cards */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: isDark ? '#2A3942' : '#FECDD3' }]}>
            <View style={styles.kpiTop}>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Expenses</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.12)' }]}>
                <Ionicons name="wallet" size={16} color={Colors.rose} />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: colors.text }]}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            <Text style={[styles.kpiSub, { color: colors.textSecondary }]}>{expenses.length} total entries recorded</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.kpiTop}>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Spare Parts</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(37, 99, 235, 0.12)' }]}>
                <Ionicons name="hardware-chip" size={16} color={isDark ? '#60A5FA' : Colors.primary} />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: isDark ? '#60A5FA' : Colors.primary }]}>
              ₹{partsAmount.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.kpiSub, { color: colors.textSecondary }]}>Parts & hardware costs</Text>
          </View>
        </View>

        {/* Category Filter Pills */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPills}>
            <Pressable
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedCategory === 'all' ? (isDark ? '#2563EB' : Colors.primary) : (isDark ? '#202C33' : '#FFFFFF'),
                  borderColor: selectedCategory === 'all' ? (isDark ? '#2563EB' : Colors.primary) : (isDark ? '#2A3942' : '#E2E8F0'),
                },
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.filterChipText, { color: selectedCategory === 'all' ? '#FFFFFF' : (isDark ? '#8696A0' : '#475569') }, selectedCategory === 'all' && styles.filterChipTextActive]}>
                All ({expenses.length})
              </Text>
            </Pressable>

            {categories.map((cat) => {
              const count = expenses.filter((e) => e.category === cat.key).length;
              const isActive = selectedCategory === cat.key;
              const catColor = isDark && cat.key === 'spare_part' ? '#60A5FA' : cat.color;
              return (
                <Pressable
                  key={cat.key}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? catColor : (isDark ? '#202C33' : '#FFFFFF'),
                      borderColor: isActive ? catColor : (isDark ? '#2A3942' : '#E2E8F0'),
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat.key)}
                >
                  <Ionicons
                    name={cat.icon}
                    size={14}
                    color={isActive ? '#FFFFFF' : (isDark ? '#8696A0' : '#64748B')}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={[styles.filterChipText, { color: isActive ? '#FFFFFF' : (isDark ? '#8696A0' : '#475569') }, isActive && styles.filterChipTextActive]}>
                    {cat.label} {count > 0 ? `(${count})` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Expenses List */}
        <View style={styles.listHeaderRow}>
          <Text style={[styles.listTitle, { color: colors.text }]}>
            {selectedCategory === 'all' ? 'All Expense Records' : `${categoryMap[selectedCategory]?.label || 'Category'} Records`}
          </Text>
          <Text style={[styles.listCount, { color: colors.textSecondary }]}>{filteredExpenses.length} items</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={isDark ? '#60A5FA' : Colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading expenses...</Text>
          </View>
        ) : filteredExpenses.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIconCircle, isDark && { backgroundColor: '#202C33' }]}>
              <Ionicons name="receipt-outline" size={32} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Expenses Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {selectedCategory === 'all'
                ? 'No shop expenses have been recorded yet.'
                : `No expenses found under ${categoryMap[selectedCategory]?.label || 'this category'}.`}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyAddBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => {
                if (selectedCategory !== 'all') {
                  setExpCategory(selectedCategory);
                }
                setIsAddOpen(true);
              }}
            >
              <Ionicons name="add-circle" size={16} color="#FFFFFF" />
              <Text style={styles.emptyAddBtnText}>Record an Expense</Text>
            </Pressable>
          </View>
        ) : (
          filteredExpenses.map((exp) => {
            const cat = categoryMap[exp.category] || categoryMap.other;
            const expDate = exp.date ? new Date(exp.date) : new Date();
            const formattedDate = expDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const catColor = isDark && cat.key === 'spare_part' ? '#60A5FA' : cat.color;
            const catBg = isDark ? 'rgba(255, 255, 255, 0.08)' : cat.bg;

            return (
              <View key={exp._id} style={[styles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.expenseIconBox, { backgroundColor: catBg }]}>
                  <Ionicons name={cat.icon} size={20} color={catColor} />
                </View>

                <View style={styles.expenseMain}>
                  <View style={styles.expenseTopLine}>
                    <Text style={[styles.expenseTitle, { color: colors.text }]} numberOfLines={1}>
                      {exp.title}
                    </Text>
                    <Text style={styles.expenseAmount}>
                      -₹{Number(exp.amount).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.expenseMetaRow}>
                    <View style={[styles.categoryBadge, { backgroundColor: catBg }]}>
                      <Text style={[styles.categoryBadgeText, { color: catColor }]}>
                        {cat.label}
                      </Text>
                    </View>
                    <Text style={[styles.expenseDate, { color: colors.textSecondary }]}>{formattedDate}</Text>
                  </View>

                  {exp.note ? (
                    <Text style={[styles.expenseNote, { color: colors.textSecondary }]} numberOfLines={2}>
                      💬 {exp.note}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1 }]}
                  onPress={() => handleDeleteExpense(exp)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={isAddOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setIsAddOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setIsAddOpen(false)} />
          <FloatingCloseButton onPress={() => setIsAddOpen(false)} />
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#111B21' : '#FFFFFF', paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalHeaderIcon, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.18)' : 'rgba(37, 99, 235, 0.12)' }]}>
                <Ionicons name="receipt" size={20} color={isDark ? '#60A5FA' : Colors.primary} />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: isDark ? '#E9EDEF' : '#0F172A' }]}>Record Shop Expense</Text>
                <Text style={[styles.modalSub, { color: isDark ? '#8696A0' : '#64748B' }]}>Track parts purchases, rent, salary and utilities</Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <OutlinedTextInput
                label="Expense Title"
                required
                placeholder="e.g. iPhone 13 Screen combo purchase"
                value={expTitle}
                onChangeText={setExpTitle}
              />

              <OutlinedTextInput
                label="Amount (₹)"
                required
                placeholder="e.g. 2800"
                keyboardType="numeric"
                startAdornment="₹"
                value={expAmount}
                onChangeText={setExpAmount}
              />

              <Text style={[styles.catLabel, { color: colors.textSecondary }]}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catPickerScroll}>
                {categories.map((c) => {
                  const isSelected = expCategory === c.key;
                  const catColor = isDark && c.key === 'spare_part' ? '#60A5FA' : c.color;
                  return (
                    <Pressable
                      key={c.key}
                      style={[
                        styles.catPickerChip,
                        {
                          backgroundColor: isSelected ? catColor : (isDark ? '#202C33' : '#FFFFFF'),
                          borderColor: isSelected ? catColor : (isDark ? '#2A3942' : '#E2E8F0'),
                        },
                      ]}
                      onPress={() => setExpCategory(c.key)}
                    >
                      <Ionicons
                        name={c.icon}
                        size={15}
                        color={isSelected ? '#FFFFFF' : (isDark ? '#8696A0' : '#475569')}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.catPickerChipText,
                          { color: isSelected ? '#FFFFFF' : (isDark ? '#E9EDEF' : '#475569') },
                          isSelected && styles.catPickerChipTextActive,
                        ]}
                      >
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <OutlinedTextInput
                label="Note / Supplier Info (Optional)"
                placeholder="e.g. Purchased from local market distributor"
                value={expNote}
                onChangeText={setExpNote}
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.cancelBtn, isDark && { backgroundColor: '#202C33' }]}
                  onPress={() => setIsAddOpen(false)}
                  disabled={isSaving}
                >
                  <Text style={[styles.cancelBtnText, isDark && { color: '#E9EDEF' }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                  onPress={handleSaveExpense}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.saveBtnText}>Save Expense</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerAddBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  headerAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiPrimary: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.rose,
    marginBottom: 2,
  },
  kpiSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  listCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyAddBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  expenseIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseMain: {
    flex: 1,
    marginRight: 8,
  },
  expenseTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.rose,
  },
  expenseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expenseDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  expenseNote: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteBtn: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
  },
  catLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 6,
    marginBottom: 8,
  },
  catPickerScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  catPickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  catPickerChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  catPickerChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
