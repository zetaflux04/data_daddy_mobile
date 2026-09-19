import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const TITLE_STYLE = {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: '#111B21',
};

export const AppHeader = ({
    title,
    titleComponent,
    subtitle,
    showBack = true,
    onBack,
    rightAction,
    backgroundColor,
    titleColor,
    hasBorder = false,
}) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    let theme = null;
    try {
        theme = useTheme();
    } catch {
        theme = null;
    }
    const themeColors = theme?.colors;
    const isDark = theme?.isDark ?? false;

    const headerBg = backgroundColor ?? (themeColors ? (isDark ? themeColors.background : themeColors.card) : '#FFFFFF');
    const headerTitleColor = titleColor ?? themeColors?.text ?? TITLE_STYLE.color;
    const headerSubtitleColor = themeColors?.textSecondary ?? '#64748B';
    const borderColor = themeColors?.border ?? '#202C33';

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
        <View style={[
            styles.headerWrapper,
            {
                backgroundColor: headerBg,
                paddingTop: Math.max(insets.top, 8) + 2,
                borderBottomWidth: hasBorder ? 1 : 0,
                borderBottomColor: hasBorder ? borderColor : 'transparent',
            }
        ]}>
            <View style={styles.headerContent}>
                <View style={styles.titleRow}>
                    {showBack ? (
                        <Pressable
                            onPress={handleBack}
                            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.55 : 1 }]}
                        >
                            <Ionicons name="chevron-back" size={24} color={headerTitleColor} />
                        </Pressable>
                    ) : null}
                    {titleComponent ? (
                        titleComponent
                    ) : (
                        <View style={styles.titleTextWrap}>
                            <Text style={[styles.title, { color: headerTitleColor }]} numberOfLines={1}>
                                {title}
                            </Text>
                            {subtitle ? (
                                <Text style={[styles.subtitle, { color: headerSubtitleColor }]} numberOfLines={1}>
                                    {subtitle}
                                </Text>
                            ) : null}
                        </View>
                    )}
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
        borderBottomWidth: 0,
        zIndex: 10,
    },
    headerContent: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 2,
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
        fontSize: 13,
        fontWeight: '400',
        letterSpacing: -0.1,
        color: '#64748B',
        marginTop: 2,
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
