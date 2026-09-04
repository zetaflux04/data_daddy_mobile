import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing, Platform, Image, } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
const { width } = Dimensions.get('window');
export const SplashScreenView = ({ onFinish }) => {
    const logoScale = useRef(new Animated.Value(0.92)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(10)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const containerOpacity = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        // Smooth, refined entrance animations
        Animated.parallel([
            Animated.timing(logoScale, {
                toValue: 1,
                duration: 700,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 600,
                delay: 250,
                useNativeDriver: true,
            }),
            Animated.timing(contentTranslateY, {
                toValue: 0,
                duration: 600,
                delay: 250,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 1600,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: false,
            }),
        ]).start();
        // Smooth, clean exit transition
        const timer = setTimeout(() => {
            Animated.timing(containerOpacity, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }).start(() => {
                if (onFinish) {
                    onFinish();
                }
            });
        }, 1800);
        return () => {
            clearTimeout(timer);
        };
    }, []);
    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });
    return (<Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.gradient}>
        
        {/* Centered Brand Showcase */}
        <View style={styles.centerContainer}>
          <Animated.View style={[
            styles.logoContainer,
            {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
            },
        ]}>
            <Image source={require('../assets/logo.png')} style={styles.splashLogoImage} resizeMode="contain"/>
          </Animated.View>

          <Animated.View style={[
            styles.taglineContainer,
            {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
            },
        ]}>
            <Text style={styles.brandTagline}>
              Smart Digital Register for Repair Centers
            </Text>
          </Animated.View>
        </View>

        {/* Minimal Clean Bottom Progress */}
        <View style={styles.bottomArea}>
          <View style={styles.progressBarTrack}>
            <Animated.View style={[
            styles.progressBarFill,
            {
                width: progressWidth,
            },
        ]}/>
          </View>
          <Text style={styles.footerText}>Made for Indian Electronics & Mobile Centers</Text>
        </View>

      </LinearGradient>
    </Animated.View>);
};
const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        zIndex: 9999,
        backgroundColor: '#FFFFFF',
    },
    gradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    splashLogoImage: {
        width: 260,
        height: 130,
    },
    taglineContainer: {
        marginTop: 6,
        alignItems: 'center',
    },
    brandTagline: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        letterSpacing: 0.2,
        textAlign: 'center',
    },
    bottomArea: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 48 : 36,
        left: 48,
        right: 48,
        alignItems: 'center',
    },
    progressBarTrack: {
        width: 140,
        height: 3.5,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 14,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#2563EB',
        borderRadius: 2,
    },
    footerText: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
        textAlign: 'center',
        letterSpacing: 0.2,
    },
});
export default SplashScreenView;
