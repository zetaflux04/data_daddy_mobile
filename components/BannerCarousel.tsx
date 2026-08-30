import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;

export interface BannerItem {
  _id: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaRoute: string;
  gradientColors: readonly [string, string, ...string[]];
  badgeIcon: keyof typeof Ionicons.glyphMap;
  badgeBg: string;
}

// Demo banners prepared for admin dashboard uploads
export const defaultBanners: BannerItem[] = [
  {
    _id: 'banner_diwali',
    tag: 'DIWALI SPECIAL • 15% OFF',
    tagBg: 'rgba(245, 158, 11, 0.25)',
    tagColor: '#FDE68A',
    title: 'Diwali Bulk Spare Parts Discount',
    subtitle:
      'Extra 15% discount on iPhone 13/14 OLED combos and Samsung display panels ordered this week.',
    ctaText: 'Claim Offer',
    ctaRoute: '/notifications',
    gradientColors: ['#1E3A8A', '#1E40AF', '#172554'] as const,
    badgeIcon: 'gift',
    badgeBg: '#F59E0B',
  },
  {
    _id: 'banner_sms_alerts',
    tag: 'AUTOMATED ALERTS • INSTANT',
    tagBg: 'rgba(56, 189, 248, 0.25)',
    tagColor: '#BAE6FD',
    title: 'Automated Customer SMS Updates',
    subtitle:
      'Deliver automated order received, repair completion, and delivery alerts instantly to your customers.',
    ctaText: 'Explore Features',
    ctaRoute: '/settings',
    gradientColors: ['#0369A1', '#0284C7', '#0C4A6E'] as const,
    badgeIcon: 'paper-plane',
    badgeBg: '#0284C7',
  },
  {
    _id: 'banner_guides',
    tag: 'TECHNICIAN GUIDES • 2026',
    tagBg: 'rgba(16, 185, 129, 0.25)',
    tagColor: '#A7F3D0',
    title: 'Motherboard Schematics & Fixes',
    subtitle:
      'Access 250+ step-by-step schematics, boardviews, and short-circuit troubleshooting diagrams.',
    ctaText: 'Browse Guides',
    ctaRoute: '/guides',
    gradientColors: ['#065F46', '#047857', '#022C22'] as const,
    badgeIcon: 'construct',
    badgeBg: '#10B981',
  },
  {
    _id: 'banner_pro',
    tag: 'DATADADDY PRO • UPGRADE',
    tagBg: 'rgba(139, 92, 246, 0.25)',
    tagColor: '#DDD6FE',
    title: 'Multi-Technician & Live P&L',
    subtitle:
      'Track technician commissions, print barcode receipts, and calculate real-time net margins easily.',
    ctaText: 'Explore Pro',
    ctaRoute: '/analytics',
    gradientColors: ['#581C87', '#6D28D9', '#3B0764'] as const,
    badgeIcon: 'trending-up',
    badgeBg: '#8B5CF6',
  },
];

interface BannerCarouselProps {
  banners?: BannerItem[];
  autoPlayInterval?: number;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners = defaultBanners,
  autoPlayInterval = 4500,
}) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isInteracting = useRef(false);

  // Auto-scrolling carousel timer
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      if (isInteracting.current) return;
      const nextIndex = (currentIndex + 1) % banners.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [currentIndex, banners.length, autoPlayInterval]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / BANNER_WIDTH
    );
    if (slideIndex !== currentIndex && slideIndex >= 0 && slideIndex < banners.length) {
      setCurrentIndex(slideIndex);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={(item) => item._id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onTouchStart={() => {
          isInteracting.current = true;
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            isInteracting.current = false;
          }, 3000);
        }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.bannerCard,
              { opacity: pressed ? 0.94 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
            ]}
            onPress={() => router.push(item.ctaRoute as any)}>
            <LinearGradient
              colors={item.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerGradient}>
              {/* Top Row: Tag Pill & Badge Icon */}
              <View style={styles.topRow}>
                <View style={[styles.tagPill, { backgroundColor: item.tagBg }]}>
                  <Text style={[styles.tagText, { color: item.tagColor }]}>
                    {item.tag}
                  </Text>
                </View>

                <View style={[styles.badgeIconCircle, { backgroundColor: item.badgeBg }]}>
                  <Ionicons name={item.badgeIcon} size={15} color="#FFFFFF" />
                </View>
              </View>

              {/* Banner Headline */}
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>

              {/* Banner Subtitle */}
              <Text style={styles.subtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>

              {/* Bottom CTA Row */}
              <View style={styles.bottomRow}>
                <View style={styles.ctaButton}>
                  <Text style={styles.ctaButtonText}>{item.ctaText}</Text>
                  <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                </View>

                <Text style={styles.swipeHintText}>Swipe for more offers</Text>
              </View>
            </LinearGradient>
          </Pressable>
        )}
      />

      {/* Pagination Dot Indicators */}
      <View style={styles.paginationContainer}>
        {banners.map((_, index) => {
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  bannerGradient: {
    padding: 16,
    paddingBottom: 14,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  badgeIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 17,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  swipeHintText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },
});
