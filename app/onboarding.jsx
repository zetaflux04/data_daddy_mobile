import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Pressable, } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop, } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
const { width } = Dimensions.get('window');
// 1. Repair Clipboard Graphic (Slide 1)
function ClipboardGraphic() {
    return (<View style={[styles.iconCard, { backgroundColor: '#EFF6FF' }]}>
      <Svg width={70} height={84} viewBox="0 0 70 84" fill="none">
        <Defs>
          <LinearGradient id="boardGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E2A672"/>
            <Stop offset="1" stopColor="#C67E42"/>
          </LinearGradient>
          <LinearGradient id="paperGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF"/>
            <Stop offset="1" stopColor="#F8FAFC"/>
          </LinearGradient>
          <LinearGradient id="clipGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#8E9CAA"/>
            <Stop offset="1" stopColor="#606F80"/>
          </LinearGradient>
        </Defs>

        {/* Board base */}
        <Rect x={6} y={10} width={58} height={70} rx={10} fill="url(#boardGrad)"/>

        {/* Paper Sheet with Dog-Ear Corner */}
        <Path d="M 16 18 L 51 18 C 52.65 18 54 19.35 54 21 L 54 56 L 42 68 L 16 68 C 14.35 68 13 66.65 13 65 L 13 21 C 13 19.35 14.35 18 16 18 Z" fill="url(#paperGrad)"/>

        {/* Dog-ear folded triangle */}
        <Path d="M 42 68 L 42 58 C 42 56.5 43.5 56 45 56 L 54 56 Z" fill="#D48F54"/>

        {/* Checklist / Document Lines */}
        <Rect x={20} y={27} width={27} height={3.2} rx={1.6} fill="#A2B1C6"/>
        <Rect x={20} y={35} width={27} height={3.2} rx={1.6} fill="#A2B1C6"/>
        <Rect x={20} y={43} width={27} height={3.2} rx={1.6} fill="#A2B1C6"/>
        <Rect x={20} y={51} width={17} height={3.2} rx={1.6} fill="#A2B1C6"/>

        {/* Metal Clip at Top */}
        <Rect x={24} y={6} width={22} height={10} rx={3.5} fill="url(#clipGrad)"/>
        <Circle cx={35} cy={8.5} r={2} fill="#374151"/>
      </Svg>
    </View>);
}
// 2. Speech Bubble Graphic (Slide 2)
function SmsGraphic() {
    return (<View style={[styles.iconCard, { backgroundColor: '#ECFDF5' }]}>
      <Svg width={76} height={68} viewBox="0 0 76 68" fill="none">
        <Defs>
          <LinearGradient id="bubbleGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <Stop offset="0" stopColor="#F6EFFE"/>
            <Stop offset="0.4" stopColor="#ECE2FD"/>
            <Stop offset="1" stopColor="#D4BEF8"/>
          </LinearGradient>
          <LinearGradient id="bubbleShadow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#C4B5FD" stopOpacity="0.4"/>
            <Stop offset="1" stopColor="#A78BFA" stopOpacity="0.5"/>
          </LinearGradient>
        </Defs>

        {/* Subtle drop shadow */}
        <Path d="M 22 13 C 9 13 3 22 3 33 C 3 41 7 47 14 50 L 10 61 C 9.5 62.5 11 64 12.8 63 L 24 55 C 28 56 32 56 36 56 C 58 56 71 46 71 33 C 71 20 58 13 36 13 Z" fill="url(#bubbleShadow)" transform="translate(0, 1.5)"/>

        {/* Main 3D Bubble */}
        <Path d="M 22 12 C 9 12 3 21 3 32 C 3 40 7 46 14 49 L 10 60 C 9.5 61.5 11 63 12.8 62 L 24 54 C 28 55 32 55 36 55 C 58 55 71 45 71 32 C 71 19 58 12 36 12 Z" fill="url(#bubbleGrad)"/>

        {/* Top reflection highlight */}
        <Path d="M 18 16 C 11 16 8 21 8 27 C 8 22 15 18 28 17 C 42 16 56 19 60 24 C 57 19 48 16 36 16 Z" fill="#FFFFFF" opacity={0.65}/>
      </Svg>
    </View>);
}
// 3. Profit Chart Graphic (Slide 3)
function ProfitGraphic() {
    return (<View style={[styles.iconCard, { backgroundColor: '#FFF7ED' }]}>
      <Svg width={74} height={74} viewBox="0 0 74 74" fill="none">
        <Defs>
          <LinearGradient id="tabletGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E9E3F8"/>
            <Stop offset="1" stopColor="#D5C8F0"/>
          </LinearGradient>
          <LinearGradient id="lineGrad" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor="#2563EB"/>
            <Stop offset="1" stopColor="#3B82F6"/>
          </LinearGradient>
        </Defs>

        {/* Rounded Chart Tablet */}
        <Rect x={7} y={7} width={60} height={60} rx={16} fill="url(#tabletGrad)"/>

        {/* Grid lines */}
        <Path d="M 12 22 L 62 22" stroke="#C3B3E6" strokeWidth={1.5} opacity={0.65} strokeLinecap="round"/>
        <Path d="M 12 37 L 62 37" stroke="#C3B3E6" strokeWidth={1.5} opacity={0.65} strokeLinecap="round"/>
        <Path d="M 12 52 L 62 52" stroke="#C3B3E6" strokeWidth={1.5} opacity={0.65} strokeLinecap="round"/>

        <Path d="M 22 12 L 22 62" stroke="#C3B3E6" strokeWidth={1.5} opacity={0.65} strokeLinecap="round"/>
        <Path d="M 37 12 L 37 62" stroke="#C3B3E6" strokeWidth={1.5} opacity={0.65} strokeLinecap="round"/>
        <Path d="M 52 12 L 52 62" stroke="#C3B3E6" strokeWidth={1.5} opacity={0.65} strokeLinecap="round"/>

        {/* Upward Profit Line */}
        <Path d="M 6 53 L 24 36 L 35 42 L 60 16" stroke="url(#lineGrad)" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    </View>);
}
const slides = [
    {
        id: '1',
        title: 'Track Every Repair',
        subtitle: "Never lose a customer's order again. Log\nevery job in seconds.",
        renderGraphic: () => <ClipboardGraphic />,
    },
    {
        id: '2',
        title: 'Auto SMS Updates',
        subtitle: 'Customers get notified automatically when\ntheir device is ready.',
        renderGraphic: () => <SmsGraphic />,
    },
    {
        id: '3',
        title: "See Your Shop's Profit",
        subtitle: 'Beautiful charts for revenue, expenses,\nand pending dues.',
        renderGraphic: () => <ProfitGraphic />,
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
        }
        else {
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
        }
        else {
            handleFinish();
        }
    };
    const onMomentumScrollEnd = (event) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        if (slideIndex >= 0 && slideIndex < slides.length) {
            setCurrentIndex(slideIndex);
        }
    };
    const isLastSlide = currentIndex === slides.length - 1;
    return (<View style={[
            styles.container,
            {
                paddingTop: Math.max(insets.top, 16),
                paddingBottom: Math.max(insets.bottom, 24),
            },
        ]}>
      <StatusBar style="dark"/>

      {/* Top Header: Skip Button */}
      <View style={styles.topHeader}>
        <Pressable hitSlop={12} style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.6 : 1 }]} onPress={handleFinish}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Slide Carousel */}
      <FlatList ref={flatListRef} data={slides} keyExtractor={(item) => item.id} horizontal pagingEnabled showsHorizontalScrollIndicator={false} bounces={false} onMomentumScrollEnd={onMomentumScrollEnd} getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
        })} renderItem={({ item }) => (<View style={styles.slide}>
            <View style={styles.contentWrapper}>
              {/* Graphic Card */}
              <View style={styles.graphicArea}>{item.renderGraphic()}</View>

              {/* Title & Subtitle */}
              <View style={styles.textArea}>
                <Text style={styles.titleText}>{item.title}</Text>
                <Text style={styles.subtitleText}>{item.subtitle}</Text>
              </View>
            </View>
          </View>)}/>

      {/* Bottom Area: Indicators & Button */}
      <View style={styles.bottomArea}>
        {/* Pagination Indicators */}
        <View style={styles.paginationRow}>
          {slides.map((_, index) => {
            const isActive = currentIndex === index;
            return (<Pressable key={index} hitSlop={8} onPress={() => {
                    flatListRef.current?.scrollToIndex({
                        index,
                        animated: true,
                    });
                    setCurrentIndex(index);
                }}>
                <View style={[
                    styles.dot,
                    isActive ? styles.dotActive : styles.dotInactive,
                ]}/>
              </Pressable>);
        })}
        </View>

        {/* Primary Action Button */}
        <Pressable style={({ pressed }) => [
            styles.nextBtn,
            { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
        ]} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {isLastSlide ? 'Get Started' : 'Next →'}
          </Text>
        </Pressable>
      </View>
    </View>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'space-between',
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 4,
    },
    skipBtn: {
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2563EB',
    },
    slide: {
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    contentWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingBottom: 40,
    },
    graphicArea: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    iconCard: {
        width: 124,
        height: 124,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textArea: {
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    titleText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        letterSpacing: -0.3,
        marginBottom: 12,
    },
    subtitleText: {
        fontSize: 15,
        fontWeight: '400',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 300,
    },
    bottomArea: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    paginationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 28,
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
    },
    nextBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
