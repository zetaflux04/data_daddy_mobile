import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

const TAB_CONFIG = [
  {
    name: 'index',
    label: 'Dashboard',
    iconDefault: 'grid-outline',
    iconFocused: 'grid',
  },
  {
    name: 'jobs',
    label: 'Jobs',
    iconDefault: 'phone-portrait-outline',
    iconFocused: 'phone-portrait',
  },
  // Center '+' button will be rendered between index/jobs and customers/profile
  {
    name: 'customers',
    label: 'Customers',
    iconDefault: 'people-outline',
    iconFocused: 'people',
  },
  {
    name: 'profile',
    label: 'Profile',
    iconDefault: 'person-outline',
    iconFocused: 'person',
  },
];

export function CustomTabBar({ state, descriptors, navigation }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const currentRoute = state.routes[state.index];
  const currentOptions = descriptors[currentRoute?.key]?.options;

  // If the active screen opted out of tab bar
  if (currentOptions?.tabBarStyle?.display === 'none' || isKeyboardVisible) {
    return null;
  }

  const renderTab = (item) => {
    const routeIndex = state.routes.findIndex((r) => r.name === item.name);
    if (routeIndex === -1) return null;

    const isFocused = state.index === routeIndex;
    const route = state.routes[routeIndex];

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const activeColor = colors.tint || Colors.primary;
    const inactiveColor = colors.tabIconDefault || (isDark ? '#8696A0' : '#54656F');

    return (
      <Pressable
        key={item.name}
        onPress={onPress}
        style={styles.tabBtn}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      >
        <View style={styles.tabIconBox}>
          <Ionicons
            name={isFocused ? item.iconFocused : item.iconDefault}
            size={24}
            color={isFocused ? activeColor : inactiveColor}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            isFocused
              ? [styles.tabLabelFocused, { color: activeColor }]
              : [styles.tabLabelMuted, { color: inactiveColor }],
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.barContainer} pointerEvents="box-none">
      <View
        style={[
          styles.fixedBar,
          {
            backgroundColor: isDark ? '#111B21' : '#FFFFFF',
            borderTopColor: isDark ? '#202C33' : '#E9EDEF',
            shadowColor: isDark ? '#000000' : '#0F172A',
            shadowOpacity: isDark ? 0.35 : 0.04,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
        {/* Tab 1: Dashboard */}
        {renderTab(TAB_CONFIG[0])}

        {/* Tab 2: Jobs */}
        {renderTab(TAB_CONFIG[1])}

        {/* Center '+' Plus Button in primary blue */}
        <Pressable
          style={({ pressed }) => [
            styles.centerPlusBtn,
            pressed && styles.centerPlusBtnPressed,
          ]}
          onPress={() => router.push('/job/new')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Create New Job"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>

        {/* Tab 3: Customers */}
        {renderTab(TAB_CONFIG[2])}

        {/* Tab 4: Profile */}
        {renderTab(TAB_CONFIG[3])}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  fixedBar: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9EDEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabIconBox: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  tabLabelFocused: {
    fontWeight: '700',
  },
  tabLabelMuted: {
    fontWeight: '500',
  },
  centerPlusBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  centerPlusBtnPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.9,
  },
});
