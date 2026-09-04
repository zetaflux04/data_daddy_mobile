import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export const AppHeader = ({ title, subtitle, showBack = true, onBack, rightAction, backgroundColor = '#FFFFFF', titleColor = '#0F172A', }) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const handleBack = () => {
        if (onBack) {
            onBack();
        }
        else {
            router.back();
        }
    };
    return (<View style={[styles.headerWrapper, { backgroundColor, paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        {/* Left: Back Button */}
        <View style={styles.leftContainer}>
          {showBack && (<Pressable onPress={handleBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
              <Ionicons name="arrow-back" size={22} color={titleColor}/>
            </Pressable>)}
        </View>

        {/* Center / Title Info */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (<Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>) : null}
        </View>

        {/* Right: Custom Action */}
        <View style={styles.rightContainer}>
          {rightAction || <View style={styles.placeholder}/>}
        </View>
      </View>
    </View>);
};
const styles = StyleSheet.create({
    headerWrapper: {
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        zIndex: 10,
    },
    headerContent: {
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    leftContainer: {
        width: 44,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    title: {
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 1,
    },
    rightContainer: {
        minWidth: 44,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    placeholder: {
        width: 38,
    },
});
