import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TITLE_STYLE = {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#0F172A',
};

export const AppHeader = ({
    title,
    subtitle,
    showBack = true,
    onBack,
    rightAction,
    backgroundColor = '#FFFFFF',
    titleColor = TITLE_STYLE.color,
}) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }
        if (router.canGoBack()) {
            router.back();
        }
    };

    return (
        <View style={[styles.headerWrapper, { backgroundColor, paddingTop: insets.top }]}>
            <View style={styles.headerContent}>
                <View style={styles.titleRow}>
                    {showBack ? (
                        <Pressable
                            onPress={handleBack}
                            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.55 : 1 }]}
                        >
                            <Ionicons name="chevron-back" size={24} color={titleColor} />
                        </Pressable>
                    ) : null}
                    <View style={styles.titleTextWrap}>
                        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
                            {title}
                        </Text>
                        {subtitle ? (
                            <Text style={styles.subtitle} numberOfLines={1}>
                                {subtitle}
                            </Text>
                        ) : null}
                    </View>
                </View>

                <View style={styles.rightContainer}>
                    {rightAction || <View style={styles.placeholder} />}
                </View>
            </View>
        </View>
    );
};

export const headerTitleTextStyle = TITLE_STYLE;

const styles = StyleSheet.create({
    headerWrapper: {
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        zIndex: 10,
    },
    headerContent: {
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    titleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
        paddingRight: 8,
    },
    backBtn: {
        width: 28,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 2,
    },
    titleTextWrap: {
        flex: 1,
        justifyContent: 'center',
        minWidth: 0,
    },
    title: {
        fontSize: TITLE_STYLE.fontSize,
        fontWeight: TITLE_STYLE.fontWeight,
        letterSpacing: TITLE_STYLE.letterSpacing,
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
        width: 28,
    },
});
