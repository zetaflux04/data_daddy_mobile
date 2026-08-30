import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenViewProps {
  onFinish?: () => void;
}

export const SplashScreenView: React.FC<SplashScreenViewProps> = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Initial logo entrance
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Continuous pulse animation for outer glowing rings
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim2, {
          toValue: 1.45,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim2, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    pulseLoop2.start();

    // 3. Smooth exit sequence after ~2.1s
    const timer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        pulseLoop.stop();
        pulseLoop2.stop();
        if (onFinish) {
          onFinish();
        }
      });
    }, 2100);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
      pulseLoop2.stop();
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <LinearGradient
        colors={['#070B14', '#0F172A', '#1E3A8A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        {/* Background Ambient Glow Elements */}
        <Animated.View
          style={[
            styles.glowRingOuter,
            {
              transform: [{ scale: pulseAnim2 }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.glowRingInner,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />

        {/* Center Brand Showcase */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.splashLogoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand Text Content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitleText}>Data</Text>
            <Text style={styles.brandTitleAccent}>Daddy</Text>
          </View>

          <Text style={styles.brandTagline}>
            SMART DIGITAL REGISTER FOR REPAIR SHOPS
          </Text>

          <View style={styles.pillContainer}>
            <Ionicons name="shield-checkmark" size={13} color="#10B981" />
            <Text style={styles.pillText}>SMS Alerts • P&L Tracker • Digital Job Cards</Text>
          </View>
        </Animated.View>

        {/* Sleek Minimal Progress Bar at Bottom */}
        <View style={styles.bottomArea}>
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
          <Text style={styles.footerText}>Made for Indian Electronics & Mobile Centers</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: '#070B14',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  glowRingOuter: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  glowRingInner: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(37, 99, 235, 0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(96, 165, 250, 0.25)',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 26,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  splashLogoImage: {
    width: 130,
    height: 130,
  },
  textContainer: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandTitleText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandTitleAccent: {
    fontSize: 36,
    fontWeight: '900',
    color: '#60A5FA',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 16,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  pillText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomArea: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 32,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
});
