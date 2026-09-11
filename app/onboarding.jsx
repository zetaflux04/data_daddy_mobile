import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// Proportional hero height calculated so the bottom curved wave is always preserved
// while leaving ample comfortable space for typography, icon, and actions.
const HERO_ASPECT_RATIO = 595 / 460;
const FULL_HERO_HEIGHT = Math.round(width * HERO_ASPECT_RATIO);
const HERO_HEIGHT = Math.min(
  FULL_HERO_HEIGHT,
  Math.max(380, Math.round(height * 0.50))
);

// 1. Slide 1 Badge Icon: Shop's Profit (Clean, sharp trending profit icon)
function ProfitBadgeIcon() {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name="trending-up" size={38} color="#2563EB" />
    </View>
  );
}

// 2. Slide 2 Badge Icon: Instant Job Updates (Clean, official WhatsApp vector icon)
function WhatsAppBadgeIcon() {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name="logo-whatsapp" size={38} color="#2563EB" />
    </View>
  );
}

// 3. Slide 3 Badge Icon: Customer Records (Clean, crisp customer group silhouette icon)
function CustomerBadgeIcon() {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name="people" size={38} color="#2563EB" />
    </View>
  );
}

const slides = [
  {
    id: '1',
    image: require('../assets/onboarding/slide_1.png'),
    titlePrimary: "Track Your Shop's",
    titleAccent: 'Profit',
    subtitle:
      'Get real-time insights into your earnings, expenses and overall profit. Make better decisions, grow faster.',
    renderIcon: () => <ProfitBadgeIcon />,
  },
  {
    id: '2',
    image: require('../assets/onboarding/slide_2.png'),
    titlePrimary: 'Instant',
    titleAccent: 'Job Updates',
    subtitle: 'Auto notify your customers on WhatsApp at every step.',
    renderIcon: () => <WhatsAppBadgeIcon />,
  },
  {
    id: '3',
    image: require('../assets/onboarding/slide_3.png'),
    titlePrimary: 'Keep Customer',
    titleAccent: 'Records',
    subtitle:
      'Store customer details, device history and service records — all in one place.',
    renderIcon: () => <CustomerBadgeIcon />,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding, user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

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
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      handleFinish();
    }
  };

  const onMomentumScrollEnd = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex >= 0 && slideIndex < slides.length) {
      setCurrentIndex(slideIndex);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Floating Top Header: Skip Button */}
      <View
        style={[
          styles.topHeader,
          {
            top: Math.max(insets.top + 8, 20),
          },
        ]}
      >
        <Pressable
          hitSlop={12}
          style={({ pressed }) => [
            styles.skipBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          onPress={handleFinish}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Top Hero Image with Organic Curved Wave */}
            <View style={styles.heroContainer}>
              <Image
                source={item.image}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>

            {/* Bottom Content Area */}
            <View style={styles.contentArea}>
              {/* Feature Badge Icon */}
              <View style={styles.iconWrapper}>{item.renderIcon()}</View>

              {/* Dual-Tone Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.titlePrimary}>{item.titlePrimary}</Text>
                <Text style={styles.titleAccent}>{item.titleAccent}</Text>
              </View>

              {/* Subtitle / Description */}
              <Text style={styles.subtitleText}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Fixed Navigation: Dots & CTA Button */}
      <View
        style={[
          styles.bottomControls,
          {
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        {/* Pagination Dots */}
        <View style={styles.paginationRow}>
          {slides.map((_, index) => {
            const isActive = currentIndex === index;
            return (
              <Pressable
                key={index}
                hitSlop={8}
                onPress={() => {
                  flatListRef.current?.scrollToIndex({
                    index,
                    animated: true,
                  });
                  setCurrentIndex(index);
                }}
              >
                <View
                  style={[
                    styles.dot,
                    isActive ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              </Pressable>
            );
          })}
        </View>

        {/* Primary Action Button */}
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            {
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            },
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>Next →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.2,
  },
  slide: {
    width: width,
    height: '100%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  heroContainer: {
    width: width,
    height: HERO_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#FFFFFF',
  },
  heroImage: {
    width: width,
    height: FULL_HERO_HEIGHT,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 115,
    justifyContent: 'flex-start',
  },
  iconWrapper: {
    marginBottom: 16,
  },
  iconContainer: {
    width: 74,
    height: 74,
    borderRadius: 26,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  titlePrimary: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  titleAccent: {
    fontSize: 27,
    fontWeight: '800',
    color: '#2563EB',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 310,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 26,
    backgroundColor: '#2563EB',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#E2E8F0',
  },
  nextBtn: {
    width: '100%',
    backgroundColor: '#2563EB',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
