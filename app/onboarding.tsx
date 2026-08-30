import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  renderGraphic: () => React.ReactNode;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding, user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleFinish = async () => {
    await completeOnboarding();
    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentIndex && slideIndex >= 0 && slideIndex < slides.length) {
      setCurrentIndex(slideIndex);
    }
  };

  const slides: OnboardingSlide[] = [
    {
      id: '1',
      title: 'Track Every Repair',
      subtitle: "Never lose a customer's order again.\nStay organized and efficient.",
      renderGraphic: () => (
        <View style={styles.cardContainer}>
          <View style={styles.mockupJobCard}>
            {/* Mockup Header */}
            <View style={styles.jobCardTop}>
              <View style={styles.jobCardBadge}>
                <Ionicons name="construct" size={14} color="#D97706" />
              </View>
              <Text style={styles.jobCardTitle}>Repair Job Card</Text>
            </View>

            {/* Client & Job Info Grid */}
            <View style={styles.jobCardGrid}>
              <View style={styles.jobCardCol}>
                <View style={styles.rowItem}>
                  <Ionicons name="person-outline" size={12} color="#64748B" />
                  <Text style={styles.gridHeading}>Client Details</Text>
                </View>
                <Text style={styles.gridValueSmall}>Customer: Rahul S.</Text>
                <Text style={styles.gridSubSmall}>Contact: 98765 43210</Text>
              </View>

              <View style={styles.jobCardCol}>
                <View style={styles.rowItem}>
                  <Ionicons name="calendar-outline" size={12} color="#64748B" />
                  <Text style={styles.gridHeading}>Job Information</Text>
                </View>
                <Text style={styles.gridValueSmall}>Job ID: #DD-2026-084</Text>
                <Text style={styles.gridSubSmall}>Status: In Progress</Text>
              </View>
            </View>

            {/* Repair Items Checkbox list */}
            <View style={styles.repairItemsBox}>
              <View style={styles.rowItem}>
                <Ionicons name="build-outline" size={12} color="#64748B" />
                <Text style={styles.gridHeading}>Repair Items</Text>
              </View>

              <View style={styles.checkItem}>
                <Ionicons name="checkbox" size={13} color="#F59E0B" />
                <Text style={styles.checkText}>1. Screen Replacement (iPhone 13)</Text>
                <Text style={styles.checkTime}>Est. 2 hrs</Text>
              </View>

              <View style={styles.checkItem}>
                <Ionicons name="checkbox" size={13} color="#F59E0B" />
                <Text style={styles.checkText}>2. Battery Service</Text>
                <Text style={styles.checkTime}>Est. 1 hr</Text>
              </View>

              <View style={styles.checkItem}>
                <Ionicons name="checkbox" size={13} color="#F59E0B" />
                <Text style={styles.checkText}>3. Camera Lens Shield</Text>
                <Text style={styles.checkTime}>Est. 30 min</Text>
              </View>
            </View>

            {/* Technician Notes */}
            <View style={styles.notesBox}>
              <View style={styles.rowItem}>
                <Ionicons name="pencil-outline" size={11} color="#64748B" />
                <Text style={styles.notesTitle}>Technician Notes</Text>
              </View>
              <Text style={styles.notesBody}>Check water resistance seals post-repair. Priority: High</Text>
            </View>

            {/* Mockup Action Button */}
            <View style={styles.mockupBtn}>
              <Text style={styles.mockupBtnText}>Start Repair</Text>
            </View>
          </View>
        </View>
      ),
    },
    {
      id: '2',
      title: 'Automated SMS Alerts',
      subtitle: 'Keep customers updated instantly.\nZero phone call interruptions.',
      renderGraphic: () => (
        <View style={styles.cardContainer}>
          <View style={styles.mockupJobCard}>
            {/* SMS Header */}
            <View style={styles.jobCardTop}>
              <View style={[styles.jobCardBadge, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="chatbox-ellipses" size={14} color="#0284C7" />
              </View>
              <Text style={styles.jobCardTitle}>Automated Customer SMS</Text>
            </View>

            <View style={styles.smsBubbleItem}>
              <View style={styles.smsHeaderRow}>
                <Text style={styles.smsSenderName}>DataDaddy Alert</Text>
                <Text style={styles.smsTimeText}>Just now</Text>
              </View>
              <Text style={styles.smsMessageBody}>
                Dear Customer, your <Text style={{ fontWeight: '800', color: '#0F172A' }}>iPhone 14 Pro Max</Text> has been repaired and is <Text style={{ fontWeight: '800', color: '#16A34A' }}>READY FOR PICKUP</Text>!
              </Text>
              <View style={styles.smsDeliveryStatus}>
                <Ionicons name="checkmark-done" size={14} color="#16A34A" />
                <Text style={styles.smsDeliveredText}>SMS Delivered to +91 98765 43210</Text>
              </View>
            </View>

            <View style={[styles.smsBubbleItem, { marginTop: 10, backgroundColor: '#F8FAFC' }]}>
              <View style={styles.smsHeaderRow}>
                <Text style={styles.smsSenderName}>Job Intake Confirmation</Text>
                <Text style={styles.smsTimeText}>2 hrs ago</Text>
              </View>
              <Text style={styles.smsMessageBody}>
                Job ID: #DD-2026-084 created. Estimated: ₹4,850. Track status in real-time.
              </Text>
            </View>

            <View style={[styles.mockupBtn, { backgroundColor: '#0284C7', marginTop: 14 }]}>
              <Text style={styles.mockupBtnText}>SMS Gateway Active</Text>
            </View>
          </View>
        </View>
      ),
    },
    {
      id: '3',
      title: 'Real-Time Profit & Loss',
      subtitle: 'Know your true shop margins.\nTrack parts expenses and technician dues.',
      renderGraphic: () => (
        <View style={styles.cardContainer}>
          <View style={styles.mockupJobCard}>
            {/* P&L Header */}
            <View style={styles.jobCardTop}>
              <View style={[styles.jobCardBadge, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="trending-up" size={14} color="#10B981" />
              </View>
              <Text style={styles.jobCardTitle}>Workshop Profit & Loss</Text>
            </View>

            <View style={styles.pnlRevenueBox}>
              <Text style={styles.pnlLabel}>THIS MONTH'S REVENUE</Text>
              <Text style={styles.pnlAmount}>₹1,84,500</Text>
              <View style={styles.pnlBadge}>
                <Ionicons name="arrow-up" size={12} color="#16A34A" />
                <Text style={styles.pnlBadgeText}>+28.4% growth</Text>
              </View>
            </View>

            <View style={styles.pnlStatsRow}>
              <View style={styles.pnlStatBox}>
                <Text style={styles.pnlStatLabel}>PARTS COST</Text>
                <Text style={styles.pnlStatVal}>₹62,000</Text>
              </View>
              <View style={styles.pnlDivider} />
              <View style={styles.pnlStatBox}>
                <Text style={[styles.pnlStatLabel, { color: '#16A34A' }]}>NET PROFIT</Text>
                <Text style={[styles.pnlStatVal, { color: '#16A34A' }]}>₹1,22,500</Text>
              </View>
            </View>

            <View style={[styles.mockupBtn, { backgroundColor: '#10B981', marginTop: 14 }]}>
              <Text style={styles.mockupBtnText}>Live Digital Register</Text>
            </View>
          </View>
        </View>
      ),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 20) }]}>
      {/* Top Header: Skip Button */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }} />
        <Pressable
          style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={handleFinish}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Main Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Center Graphic Card */}
            <View style={styles.graphicArea}>{item.renderGraphic()}</View>

            {/* Text Area */}
            <View style={styles.textArea}>
              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.subtitleText}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Area: Indicators & Golden Orange Button */}
      <View style={styles.bottomArea}>
        {/* Pagination Indicators (1 elongated pill + 2 dots) */}
        <View style={styles.paginationRow}>
          {slides.map((_, index) => {
            const isActive = currentIndex === index;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>

        {/* Golden Orange Next Button matching Image 1 */}
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
          ]}
          onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  graphicArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  mockupJobCard: {
    backgroundColor: '#FAF7EE',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3E8C8',
  },
  jobCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE0B8',
  },
  jobCardBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#78350F',
  },
  jobCardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  jobCardCol: {
    flex: 1,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  gridHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  gridValueSmall: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  gridSubSmall: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  repairItemsBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 5,
  },
  checkText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  checkTime: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },
  notesBox: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  notesBody: {
    fontSize: 9,
    color: '#475569',
    marginTop: 1,
  },
  mockupBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  mockupBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  smsBubbleItem: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  smsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  smsSenderName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  smsTimeText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  smsMessageBody: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  smsDeliveryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  smsDeliveredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  pnlRevenueBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pnlLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  pnlAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 2,
  },
  pnlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  pnlBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  pnlStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pnlStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  pnlStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  pnlStatVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  pnlDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  textArea: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F2942',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 8 : 14,
    alignItems: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 32,
    backgroundColor: '#1E293B',
  },
  dotInactive: {
    width: 7,
    backgroundColor: '#CBD5E1',
  },
  nextBtn: {
    width: '100%',
    backgroundColor: '#F59E0B',
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
