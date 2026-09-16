import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { Colors } from '../constants/Colors';

const STATIC_SCREENS = [
  {
    id: 'screen_jobs',
    title: 'Devices & Jobs',
    subtitle: 'Screen · Everyday',
    category: 'SCREENS',
    icon: 'phone-portrait-outline',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
    route: '/jobs',
    keywords: ['device', 'devices', 'jobs', 'cards', 'repair', 'tickets', 'challan'],
  },
  {
    id: 'screen_new_job',
    title: 'New Job Card',
    subtitle: 'Action · Create new repair intake',
    category: 'SCREENS',
    icon: 'add-circle-outline',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    route: '/job/new',
    keywords: ['new', 'add', 'create', 'intake', 'ticket', 'job'],
  },
  {
    id: 'screen_customers',
    title: 'Customers Directory',
    subtitle: 'Screen · People',
    category: 'SCREENS',
    icon: 'people-outline',
    iconBg: '#F3E8FF',
    iconColor: '#7C3AED',
    route: '/customers',
    keywords: ['customer', 'customers', 'client', 'clients', 'phone', 'contact', 'people'],
  },
  {
    id: 'screen_analytics',
    title: 'Profit & Loss (P&L)',
    subtitle: 'Screen · Business',
    category: 'SCREENS',
    icon: 'trending-up-outline',
    iconBg: '#EEF2FF',
    iconColor: '#2563EB',
    route: '/analytics',
    keywords: ['profit', 'loss', 'p&l', 'revenue', 'margin', 'business'],
  },
  {
    id: 'screen_expenses',
    title: 'Shop Expenses',
    subtitle: 'Screen · Expense Manager',
    category: 'SCREENS',
    icon: 'wallet-outline',
    iconBg: '#FFF1F2',
    iconColor: '#E11D48',
    route: '/expenses',
    keywords: ['expense', 'expenses', 'parts', 'spending', 'bills', 'rent', 'salary', 'cost'],
  },
  {
    id: 'screen_about',
    title: 'About Metafy',
    subtitle: 'Screen · App & Company',
    category: 'SCREENS',
    icon: 'information-circle-outline',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    route: '/about',
    keywords: ['about', 'metafy', 'chipix', 'version', 'developer', 'info', 'support'],
  },
  {
    id: 'screen_insights',
    title: 'Analytics & Trends',
    subtitle: 'Screen · Business',
    category: 'SCREENS',
    icon: 'analytics-outline',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    route: '/insights',
    keywords: ['insights', 'analytics', 'charts', 'trends', 'daily', 'weekly'],
  },
  {
    id: 'screen_guides',
    title: 'Technician Guides',
    subtitle: 'Screen · Schematics & boardviews',
    category: 'SCREENS',
    icon: 'construct-outline',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    route: '/guides',
    keywords: ['guide', 'guides', 'schematic', 'boardview', 'fix', 'video', 'hardware'],
  },
  {
    id: 'screen_staff',
    title: 'Staff & Technicians',
    subtitle: 'Screen · People',
    category: 'SCREENS',
    icon: 'id-card-outline',
    iconBg: '#F3E8FF',
    iconColor: '#9333EA',
    route: '/staff',
    keywords: ['staff', 'technician', 'technicians', 'employee', 'login', 'permission'],
  },
  {
    id: 'screen_notifications',
    title: 'Notifications & Alerts',
    subtitle: 'Screen · Alerts',
    category: 'SCREENS',
    icon: 'notifications-outline',
    iconBg: '#FFE4E6',
    iconColor: '#E11D48',
    route: '/notifications',
    keywords: ['notification', 'notifications', 'alert', 'alerts', 'announcement', 'sms'],
  },
  {
    id: 'screen_profile',
    title: 'Shop Profile',
    subtitle: 'Screen · Shop information',
    category: 'SCREENS',
    icon: 'person-outline',
    iconBg: '#F1F5F9',
    iconColor: '#334155',
    route: '/(tabs)/profile',
    keywords: ['profile', 'shop', 'owner', 'logo', 'avatar', 'account'],
  },
];

const STATIC_SETTINGS = [
  {
    id: 'setting_shop_info',
    title: 'Shop Business Details',
    subtitle: 'Name, phone and shop address',
    category: 'SETTINGS',
    icon: 'storefront-outline',
    iconBg: '#F1F5F9',
    iconColor: '#475569',
    route: '/settings',
    keywords: ['address', 'shop', 'name', 'phone', 'owner', 'settings', 'details'],
  },
  {
    id: 'setting_sms',
    title: 'Automated SMS Alerts',
    subtitle: 'Order received, repair & delivery SMS alerts',
    category: 'SETTINGS',
    icon: 'chatbox-ellipses-outline',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
    route: '/settings',
    keywords: ['sms', 'message', 'alert', 'notifications', 'order', 'repaired', 'delivered', 'automated'],
  },
  {
    id: 'setting_terms',
    title: 'Terms of Service',
    subtitle: 'in Legal & policies',
    category: 'SETTINGS',
    icon: 'document-text-outline',
    iconBg: '#F1F5F9',
    iconColor: '#475569',
    route: '/terms',
    keywords: ['terms', 'legal', 'policy', 'rules', 'agreement'],
  },
  {
    id: 'setting_privacy',
    title: 'Privacy Policy',
    subtitle: 'in Legal & security',
    category: 'SETTINGS',
    icon: 'shield-checkmark-outline',
    iconBg: '#F1F5F9',
    iconColor: '#475569',
    route: '/privacy',
    keywords: ['privacy', 'security', 'data', 'policy'],
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchEntities = async () => {
      setIsLoadingData(true);
      try {
        const [jobsRes, custRes] = await Promise.all([
          api.getJobs({ limit: 100 }),
          api.getCustomers({ limit: 100 }),
        ]);
        if (isMounted) {
          if (Array.isArray(jobsRes)) setJobs(jobsRes);
          if (Array.isArray(custRes)) setCustomers(custRes);
        }
      } catch (e) {
        // quiet fallback
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    };
    fetchEntities();
    return () => {
      isMounted = false;
    };
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!cleanQuery) {
      return {
        screens: STATIC_SCREENS.slice(0, 5),
        settings: STATIC_SETTINGS.slice(0, 4),
        jobs: jobs.slice(0, 3),
        customers: customers.slice(0, 3),
        isQueryEmpty: true,
      };
    }

    // 1. Screens match
    const matchedScreens = STATIC_SCREENS.filter(
      (s) =>
        s.title.toLowerCase().includes(cleanQuery) ||
        s.subtitle.toLowerCase().includes(cleanQuery) ||
        s.keywords.some((k) => k.includes(cleanQuery))
    );

    // 2. Settings match
    const matchedSettings = STATIC_SETTINGS.filter(
      (s) =>
        s.title.toLowerCase().includes(cleanQuery) ||
        s.subtitle.toLowerCase().includes(cleanQuery) ||
        s.keywords.some((k) => k.includes(cleanQuery))
    );

    // 3. Jobs match
    const matchedJobs = jobs.filter((j) => {
      const jobId = String(j.jobId || j.id || j._id || '').toLowerCase();
      const custName = String(j.customerSnapshot?.name || j.customerName || '').toLowerCase();
      const phone = String(j.customerSnapshot?.phone || j.customerPhone || '').toLowerCase();
      const brand = String(j.device?.brand || '').toLowerCase();
      const model = String(j.device?.model || '').toLowerCase();
      const problem = String(j.problemDescription || j.issue || '').toLowerCase();
      const status = String(j.status || '').toLowerCase();

      return (
        jobId.includes(cleanQuery) ||
        custName.includes(cleanQuery) ||
        phone.includes(cleanQuery) ||
        brand.includes(cleanQuery) ||
        model.includes(cleanQuery) ||
        problem.includes(cleanQuery) ||
        status.includes(cleanQuery)
      );
    });

    // 4. Customers match
    const matchedCustomers = customers.filter((c) => {
      const name = String(c.name || '').toLowerCase();
      const phone = String(c.phone || '').toLowerCase();
      const address = String(c.address || '').toLowerCase();
      return (
        name.includes(cleanQuery) ||
        phone.includes(cleanQuery) ||
        address.includes(cleanQuery)
      );
    });

    return {
      screens: matchedScreens,
      settings: matchedSettings,
      jobs: matchedJobs.slice(0, 10),
      customers: matchedCustomers.slice(0, 10),
      isQueryEmpty: false,
    };
  }, [cleanQuery, jobs, customers]);

  const hasAnyResults =
    searchResults.screens.length > 0 ||
    searchResults.settings.length > 0 ||
    searchResults.jobs.length > 0 ||
    searchResults.customers.length > 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'repaired':
      case 'delivered':
        return { bg: '#ECFDF5', text: '#059669', label: status.toUpperCase() };
      case 'in_progress':
        return { bg: '#EFF6FF', text: '#2563EB', label: 'IN PROGRESS' };
      case 'parts_delayed':
        return { bg: '#FEF2F2', text: '#DC2626', label: 'PARTS DELAYED' };
      case 'pending':
      default:
        return { bg: '#FFFBEB', text: '#D97706', label: (status || 'PENDING').toUpperCase() };
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: Math.max(insets.top, 8) + 2 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Search Header */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-back" size={26} color="#0F172A" />
        </Pressable>

        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, customers, screens..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && Platform.OS !== 'ios' && (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearBtn}
            >
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Search Results Body */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isLoadingData && !cleanQuery && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingBannerText}>Indexing jobs and customers...</Text>
          </View>
        )}

        {cleanQuery && !hasAnyResults ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="search-outline" size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              We couldn't find anything matching "{query}". Try checking for typos, or search by phone number or device name.
            </Text>
          </View>
        ) : (
          <>
            {/* Category 1: SCREENS */}
            {searchResults.screens.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {searchResults.isQueryEmpty ? 'QUICK NAVIGATION' : 'SCREENS'}
                </Text>
                <View style={styles.groupCard}>
                  {searchResults.screens.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.resultRow,
                          pressed && styles.resultRowPressed,
                        ]}
                        onPress={() => router.push(item.route)}
                      >
                        <View style={[styles.resultIconBox, { backgroundColor: item.iconBg }]}>
                          <Ionicons name={item.icon} size={20} color={item.iconColor} />
                        </View>
                        <View style={styles.resultDetails}>
                          <Text style={styles.resultTitle}>{item.title}</Text>
                          <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                      </Pressable>
                      {idx < searchResults.screens.length - 1 && (
                        <View style={styles.resultDivider} />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {/* Category 2: JOBS (Repairs & Devices) */}
            {searchResults.jobs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {searchResults.isQueryEmpty ? 'RECENT JOBS' : 'JOB CARDS'}
                </Text>
                <View style={styles.groupCard}>
                  {searchResults.jobs.map((item, idx) => {
                    const statusInfo = getStatusColor(item.status);
                    const devName = [item.device?.brand, item.device?.model].filter(Boolean).join(' ') || item.problemDescription || 'Device Repair';
                    const custName = item.customerSnapshot?.name || item.customerName || 'Customer';

                    return (
                      <React.Fragment key={item._id || item.id || idx}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.resultRow,
                            pressed && styles.resultRowPressed,
                          ]}
                          onPress={() => router.push(`/job/${item._id || item.id}`)}
                        >
                          <View style={[styles.resultIconBox, { backgroundColor: '#EFF6FF' }]}>
                            <Ionicons name="hardware-chip-outline" size={20} color={Colors.primary} />
                          </View>
                          <View style={styles.resultDetails}>
                            <View style={styles.titleWithBadge}>
                              <Text style={styles.resultTitle} numberOfLines={1}>
                                {devName}
                              </Text>
                              <View style={[styles.statusPill, { backgroundColor: statusInfo.bg }]}>
                                <Text style={[styles.statusPillText, { color: statusInfo.text }]}>
                                  {statusInfo.label}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.resultSubtitle} numberOfLines={1}>
                              {custName} • #{item.jobId || (item._id || '').slice(-4)}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                        </Pressable>
                        {idx < searchResults.jobs.length - 1 && (
                          <View style={styles.resultDivider} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Category 3: CUSTOMERS */}
            {searchResults.customers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {searchResults.isQueryEmpty ? 'CUSTOMERS' : 'MATCHING CUSTOMERS'}
                </Text>
                <View style={styles.groupCard}>
                  {searchResults.customers.map((item, idx) => (
                    <React.Fragment key={item._id || item.id || idx}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.resultRow,
                          pressed && styles.resultRowPressed,
                        ]}
                        onPress={() => router.push('/customers')}
                      >
                        <View style={[styles.resultIconBox, { backgroundColor: '#F3E8FF' }]}>
                          <Ionicons name="person" size={18} color="#7C3AED" />
                        </View>
                        <View style={styles.resultDetails}>
                          <Text style={styles.resultTitle}>{item.name}</Text>
                          <Text style={styles.resultSubtitle}>
                            +91 {item.phone} {item.address ? `• ${item.address}` : ''}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                      </Pressable>
                      {idx < searchResults.customers.length - 1 && (
                        <View style={styles.resultDivider} />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {/* Category 4: SETTINGS */}
            {searchResults.settings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SETTINGS & TOOLS</Text>
                <View style={styles.groupCard}>
                  {searchResults.settings.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.resultRow,
                          pressed && styles.resultRowPressed,
                        ]}
                        onPress={() => router.push(item.route)}
                      >
                        <View style={[styles.resultIconBox, { backgroundColor: item.iconBg }]}>
                          <Ionicons name={item.icon} size={20} color={item.iconColor} />
                        </View>
                        <View style={styles.resultDetails}>
                          <Text style={styles.resultTitle}>{item.title}</Text>
                          <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                      </Pressable>
                      {idx < searchResults.settings.length - 1 && (
                        <View style={styles.resultDivider} />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    height: '100%',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    marginBottom: 8,
  },
  loadingBannerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 6,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  resultRowPressed: {
    backgroundColor: '#F8FAFC',
  },
  resultIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  resultDetails: {
    flex: 1,
    minWidth: 0,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    flexShrink: 1,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  resultSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 68,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
