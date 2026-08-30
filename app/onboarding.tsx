import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Platform,
  SafeAreaView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

interface SlideItem {
  id: string;
  badge: string;
  badgeColor: string;
  badgeIcon: keyof typeof Ionicons.glyphMap;
  title: string;
  highlightText: string;
  titleEnd: string;
  description: string;
  tags: string[];
  renderGraphic: () => React.ReactNode;
}

export default function OnboardingScreen() {
  const router = useRouter();
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

  const handleBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / width
    );
    if (slideIndex !== currentIndex && slideIndex >= 0 && slideIndex < slides.length) {
      setCurrentIndex(slideIndex);
    }
  };

  const slides: SlideItem[] = [
    {
      id: '1',
      badge: 'DIGITAL JOB CARDS',
      badgeColor: Colors.primary,
      badgeIcon: 'clipboard',
      title: 'Ditch the ',
      highlightText: 'Paper Register',
      titleEnd: ' for Good',
      description:
        'Create professional digital job cards in under 30 seconds. Track brand, model, customer complaints, diagnostics, and cost estimates seamlessly.',
      tags: ['⚡ 30s Intake', '🏷️ Unique Job IDs', '🔍 Instant Search'],
      renderGraphic: () => (
        <View style={styles.graphicCard}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.mockupHeader}>
            <View style={styles.mockupHeaderLeft}>
              <View style={styles.deviceCircle}>
                <Ionicons name="phone-portrait" size={16} color="#60A5FA" />
              </View>
              <View>
                <Text style={styles.mockupJobId}>JOB #DD-2026-084</Text>
                <Text style={styles.mockupDevice}>iPhone 14 Pro Max • Space Black</Text>
              </View>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>IN PROGRESS</Text>
            </View>
          </LinearGradient>

          <View style={styles.mockupBody}>
            <View style={styles.mockupRow}>
              <Text style={styles.mockupLabel}>Customer</Text>
              <Text style={styles.mockupValue}>Rahul Sharma (+91 98765 43210)</Text>
            </View>
            <View style={styles.mockupDivider} />
            <View style={styles.mockupRow}>
              <Text style={styles.mockupLabel}>Reported Issue</Text>
              <Text style={styles.mockupValueHighlight}>Screen Flickering & Battery Drain</Text>
            </View>
            <View style={styles.mockupDivider} />
            <View style={styles.mockupFooter}>
              <View>
                <Text style={styles.costLabel}>ESTIMATED REPAIR</Text>
                <Text style={styles.costValue}>₹4,850</Text>
              </View>
              <View style={styles.advanceBadge}>
                <Ionicons name="shield-checkmark" size={13} color="#10B981" />
                <Text style={styles.advanceText}>Advance: ₹1,000</Text>
              </View>
            </View>
          </View>
        </View>
      ),
    },
    {
      id: '2',
      badge: 'FAST2SMS GATEWAY',
      badgeColor: '#0284C7',
      badgeIcon: 'paper-plane',
      title: 'Automated ',
      highlightText: 'SMS Alerts',
      titleEnd: ' for Customers',
      description:
        'Keep customers delighted and informed. Automated SMS updates for device intake, repair completed, and delivery. Zero phone call interruptions.',
      tags: ['📱 Fast2SMS Integration', '💬 Ready for Pickup SMS', '⚡ 1-Tap Updates'],
      renderGraphic: () => (
        <View style={styles.graphicCard}>
          {/* SMS Notification Banner */}
          <LinearGradient
            colors={['#0369A1', '#075985']}
            style={styles.smsHeader}>
            <View style={styles.smsHeaderIcon}>
              <Ionicons name="chatbox-ellipses" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.smsHeaderTitle}>Fast2SMS Gateway • INSTANT</Text>
              <Text style={styles.smsHeaderSub}>Delivered to +91 98765 43210</Text>
            </View>
            <View style={styles.smsSentBadge}>
              <Text style={styles.smsSentText}>SENT</Text>
            </View>
          </LinearGradient>

          <View style={styles.smsBubble}>
            <View style={styles.smsBubbleHeader}>
              <Text style={styles.smsSender}>TechFix Solutions (DataDaddy)</Text>
              <Text style={styles.smsTime}>Just now</Text>
            </View>
            <Text style={styles.smsBody}>
              "Dear Rahul, your iPhone 14 Pro Max is <Text style={{ fontWeight: '800', color: '#10B981' }}>REPAIRED & READY FOR PICKUP</Text>!
              Total Balance: ₹3,850. Thank you for choosing us!"
            </Text>
            <View style={styles.smsActionRow}>
              <View style={styles.smsBadgeItem}>
                <Ionicons name="checkmark-done" size={14} color="#0284C7" />
                <Text style={styles.smsBadgeText}>Delivery Confirmed</Text>
              </View>
              <View style={styles.smsBadgeItem}>
                <Ionicons name="flash" size={14} color="#F59E0B" />
                <Text style={styles.smsBadgeText}>1.2s Fast Delivery</Text>
              </View>
            </View>
          </View>
        </View>
      ),
    },
    {
      id: '3',
      badge: 'PROFIT & LOSS TRACKER',
      badgeColor: '#10B981',
      badgeIcon: 'trending-up',
      title: 'Real-Time ',
      highlightText: 'P&L & Staff',
      titleEnd: ' Control',
      description:
        'Know your true profits. Track spare parts expenses, assign jobs to technicians, monitor pending balances, and grow your shop revenue.',
      tags: ['📊 Real-Time P&L', '🔧 Parts Cost Log', '👥 Staff Permissions'],
      renderGraphic: () => (
        <View style={styles.graphicCard}>
          <LinearGradient
            colors={['#064E3B', '#065F46']}
            style={styles.pnlHeader}>
            <View>
              <Text style={styles.pnlHeaderLabel}>MONTHLY SHOP REVENUE</Text>
              <Text style={styles.pnlHeaderAmount}>₹1,84,500</Text>
            </View>
            <View style={styles.pnlGrowthPill}>
              <Ionicons name="trending-up" size={13} color="#FFFFFF" />
              <Text style={styles.pnlGrowthText}>+28.4%</Text>
            </View>
          </LinearGradient>

          <View style={styles.pnlMetricsRow}>
            <View style={styles.pnlMetricBox}>
              <Text style={styles.pnlMetricLabel}>PARTS COST</Text>
              <Text style={styles.pnlMetricValue}>₹62,000</Text>
              <Text style={styles.pnlMetricSub}>42 items used</Text>
            </View>
            <View style={styles.pnlMetricDivider} />
            <View style={styles.pnlMetricBox}>
              <Text style={[styles.pnlMetricLabel, { color: '#059669' }]}>NET PROFIT</Text>
              <Text style={[styles.pnlMetricValue, { color: '#059669' }]}>₹1,22,500</Text>
              <Text style={[styles.pnlMetricSub, { color: '#10B981' }]}>66.4% Margin</Text>
            </View>
          </View>

          <View style={styles.techAssignBox}>
            <Ionicons name="person" size={14} color="#6366F1" />
            <Text style={styles.techAssignText}>
              Assigned Tech: <Text style={{ fontWeight: '700', color: '#0F172A' }}>Suresh Kumar</Text> (Commission 15%)
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: '4',
      badge: 'JOIN 5,000+ SHOPS',
      badgeColor: '#8B5CF6',
      badgeIcon: 'rocket',
      title: 'Ready to Run a ',
      highlightText: 'Smarter Shop?',
      titleEnd: '',
      description:
        'Join thousands of electronics and mobile repair technicians across India modernizing their daily business operations with DataDaddy.',
      tags: ['🔒 100% Cloud Synced', '⚡ Fast Setup', '🇮🇳 Made for India'],
      renderGraphic: () => (
        <View style={[styles.graphicCard, { padding: 22, alignItems: 'center' }]}>
          <LinearGradient
            colors={['#2563EB', '#7C3AED']}
            style={styles.finalHeroBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Ionicons name="rocket-sharp" size={42} color="#FFFFFF" />
          </LinearGradient>

          <Text style={styles.finalHeroTitle}>All Systems Ready</Text>
          <Text style={styles.finalHeroSubtitle}>
            Fast2SMS Connected • Cloud Storage Online • Digital Register Activated
          </Text>

          <View style={styles.featurePillsWrap}>
            <View style={styles.featurePill}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.featurePillText}>Instant OTP Login</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.featurePillText}>Auto Fast2SMS</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.featurePillText}>Live P&L Tracking</Text>
            </View>
          </View>
        </View>
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Header with Logo and Skip */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <LinearGradient
            colors={Colors.gradients.primary}
            style={styles.brandLogoBox}>
            <Ionicons name="construct" size={18} color="#FFFFFF" />
          </LinearGradient>
          <View>
            <Text style={styles.brandName}>DataDaddy</Text>
            <Text style={styles.brandSub}>Repair Register</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={handleFinish}>
          <Text style={styles.skipBtnText}>Skip</Text>
          <Ionicons name="chevron-forward" size={16} color="#64748B" />
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
            {/* Visual Graphic Mockup */}
            <View style={styles.graphicContainer}>{item.renderGraphic()}</View>

            {/* Slide Content Card */}
            <View style={styles.slideContent}>
              {/* Badge */}
              <View style={[styles.badge, { backgroundColor: `${item.badgeColor}18` }]}>
                <Ionicons name={item.badgeIcon} size={13} color={item.badgeColor} />
                <Text style={[styles.badgeText, { color: item.badgeColor }]}>
                  {item.badge}
                </Text>
              </View>

              {/* Title with Gradient Emphasis */}
              <Text style={styles.titleText}>
                {item.title}
                <Text style={{ color: Colors.primary }}>{item.highlightText}</Text>
                {item.titleEnd}
              </Text>

              {/* Description */}
              <Text style={styles.descriptionText}>{item.description}</Text>

              {/* Feature Chips */}
              <View style={styles.tagsRow}>
                {item.tags.map((tag: string, idx: number) => (
                  <View key={idx} style={styles.tagPill}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      />

      {/* Bottom Navigation & Indicator Bar */}
      <View style={styles.bottomControls}>
        {/* Pagination Dots */}
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

        {/* Buttons Row */}
        <View style={styles.actionRow}>
          {currentIndex > 0 ? (
            <Pressable
              style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color="#475569" />
              <Text style={styles.backBtnText}>Back</Text>
            </Pressable>
          ) : (
            <View style={{ width: 80 }} />
          )}

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={handleNext}>
            <LinearGradient
              colors={Colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}>
              <Text style={styles.primaryBtnText}>
                {currentIndex === slides.length - 1 ? 'Get Started Now' : 'Next'}
              </Text>
              <Ionicons
                name={currentIndex === slides.length - 1 ? 'rocket' : 'arrow-forward'}
                size={18}
                color="#FFFFFF"
              />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogoBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#EDF2F7',
    gap: 2,
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  slide: {
    width: width,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  graphicContainer: {
    flex: 1.15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  graphicCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  mockupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  mockupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deviceCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockupJobId: {
    fontSize: 12,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 0.5,
  },
  mockupDevice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  statusPillText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
  },
  mockupBody: {
    padding: 16,
  },
  mockupRow: {
    marginVertical: 2,
  },
  mockupLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  mockupValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
  mockupValueHighlight: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '700',
  },
  mockupDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  mockupFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  costLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  costValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  advanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  advanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  smsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  smsHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smsHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  smsHeaderSub: {
    color: '#BAE6FD',
    fontSize: 11,
    fontWeight: '500',
  },
  smsSentBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  smsSentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  smsBubble: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  smsBubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  smsSender: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  smsTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  smsBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
  smsActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smsBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  smsBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  pnlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  pnlHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A7F3D0',
    letterSpacing: 0.5,
  },
  pnlHeaderAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pnlGrowthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  pnlGrowthText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  pnlMetricsRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  pnlMetricBox: {
    flex: 1,
  },
  pnlMetricDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  pnlMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  pnlMetricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  pnlMetricSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  techAssignBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E7FF',
    gap: 6,
  },
  techAssignText: {
    fontSize: 12,
    color: '#4338CA',
  },
  finalHeroBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  finalHeroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  finalHeroSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  featurePillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  featurePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  slideContent: {
    flex: 1,
    paddingTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
    lineHeight: 32,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#CBD5E1',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  primaryBtn: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
