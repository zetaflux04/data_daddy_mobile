import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { ExpenseItem, DashboardSummary } from '../types';
import { Colors } from '../constants/Colors';
import { AppHeader } from '../components/AppHeader';

const categories = [
  { key: 'spare_part', label: 'Spare Part', icon: 'hardware-chip-outline' },
  { key: 'rent', label: 'Rent', icon: 'business-outline' },
  { key: 'salary', label: 'Salary', icon: 'people-outline' },
  { key: 'tools', label: 'Tools/Consumables', icon: 'build-outline' },
  { key: 'utilities', label: 'Electricity/Net', icon: 'flash-outline' },
  { key: 'other', label: 'Other', icon: 'receipt-outline' },
];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Add Expense Form State
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<'spare_part' | 'rent' | 'salary' | 'tools' | 'utilities' | 'other'>('spare_part');
  const [expNote, setExpNote] = useState('');

  const loadData = async () => {
    const [sum, expList] = await Promise.all([
      api.getDashboardSummary(),
      api.getExpenses(),
    ]);
    setSummary(sum);
    setExpenses(expList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveExpense = async () => {
    if (!expTitle.trim() || !expAmount || Number(expAmount) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid title and amount in Rupees (₹).');
      return;
    }

    try {
      await api.addExpense({
        title: expTitle.trim(),
        amount: Number(expAmount),
        category: expCategory,
        note: expNote.trim(),
      });

      setIsAddExpenseOpen(false);
      setExpTitle('');
      setExpAmount('');
      setExpNote('');
      loadData();
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to save expense.';
      Alert.alert('Expense Error', msg);
    }
  };

  const revenue = summary?.financials.totalRevenue ?? 0;
  const expenseTotal = summary?.financials.totalExpense ?? 0;
  const netProfit = summary?.financials.netProfit ?? 0;
  const marginPct = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Profit & Loss"
        rightAction={
          <Pressable
            style={({ pressed }) => [styles.headerAddBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => setIsAddExpenseOpen(true)}>
            <Ionicons name="add" size={18} color={Colors.primary} />
            <Text style={styles.headerAddText}>Add</Text>
          </Pressable>
        }
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 16 }]}
        showsVerticalScrollIndicator={false}>
        {/* Net Profit Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroSub}>Shop Net Profit (This Month)</Text>
          <Text style={styles.heroValue}>₹{netProfit.toLocaleString('en-IN')}</Text>

          <View style={styles.heroBadges}>
            <View style={styles.marginPill}>
              <Ionicons name="trending-up" size={14} color={Colors.emerald} />
              <Text style={styles.marginText}>{marginPct}% Margin</Text>
            </View>
            <Text style={styles.heroDuesNotice} numberOfLines={1}>
              ₹{(summary?.financials.totalDuesPending ?? 0).toLocaleString('en-IN')} dues uncollected
            </Text>
          </View>
        </View>

        {/* Revenue vs Expense Comparison Card */}
        <View style={styles.compareCard}>
          <Text style={styles.cardHeaderTitle}>Revenue vs Expenses</Text>

          <View style={styles.barItem}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Total Collected</Text>
              <Text style={[styles.barAmount, { color: Colors.primary }]}>
                ₹{revenue.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: '100%', backgroundColor: Colors.primary }]} />
            </View>
          </View>

          <View style={styles.barItem}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Total Expenses & Parts</Text>
              <Text style={[styles.barAmount, { color: Colors.rose }]}>
                ₹{expenseTotal.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${revenue > 0 ? Math.min(100, Math.round((expenseTotal / revenue) * 100)) : 0}%`,
                    backgroundColor: Colors.rose,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Expense Manager Section */}
        <View style={styles.expenseSectionHeader}>
          <Text style={styles.cardHeaderTitle}>Shop Expenses & Parts</Text>
          <Pressable
            style={({ pressed }) => [styles.addExpBtn, { opacity: pressed ? 0.88 : 1 }]}
            onPress={() => setIsAddExpenseOpen(true)}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addExpBtnText}>Add Expense</Text>
          </Pressable>
        </View>

        {expenses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={32} color="#94A3B8" />
            <Text style={styles.emptyText}>No expenses recorded this month</Text>
            <Text style={styles.emptySubText}>Add parts purchases, rent, or staff payouts above</Text>
          </View>
        ) : (
          expenses.map((exp) => (
            <View key={exp._id} style={styles.expenseItemCard}>
              <View style={styles.expIconBox}>
                <Ionicons name="receipt-outline" size={18} color="#64748B" />
              </View>
              <View style={styles.expInfo}>
                <Text style={styles.expTitle}>{exp.title}</Text>
                <Text style={styles.expDate}>
                  {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {exp.category.replace('_', ' ')}
                </Text>
              </View>
              <Text style={styles.expAmount}>-₹{exp.amount.toLocaleString('en-IN')}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={isAddExpenseOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddExpenseOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Expense / Part Cost</Text>
              <Pressable
                onPress={() => setIsAddExpenseOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. iPhone 13 Screen combo purchase"
                placeholderTextColor="#94A3B8"
                value={expTitle}
                onChangeText={setExpTitle}
              />

              <Text style={styles.inputLabel}>Amount (₹) *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 2800"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={expAmount}
                onChangeText={setExpAmount}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {categories.map((c) => (
                  <Pressable
                    key={c.key}
                    style={[styles.catChip, expCategory === c.key && styles.catChipActive]}
                    onPress={() => setExpCategory(c.key as any)}>
                    <Text style={[styles.catChipText, expCategory === c.key && styles.catChipTextActive]}>
                      {c.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Note (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Purchased from Nehru Place distributor"
                placeholderTextColor="#94A3B8"
                value={expNote}
                onChangeText={setExpNote}
              />

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setIsAddExpenseOpen(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={handleSaveExpense}>
                  <Text style={styles.saveBtnText}>Save Expense</Text>
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
  scrollArea: {
    flex: 1,
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  headerAddText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 16,
    gap: 6,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  emptySubText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  heroSub: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 6,
  },
  heroValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  marginText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34D399',
  },
  heroDuesNotice: {
    fontSize: 12,
    color: '#94A3B8',
  },
  compareCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  barItem: {
    marginBottom: 12,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  barAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  expenseSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addExpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addExpBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  expenseItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expInfo: {
    flex: 1,
  },
  expTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  expDate: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'capitalize',
  },
  expAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.rose,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: Colors.primary,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
