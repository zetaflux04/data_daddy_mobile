import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/Colors';
export const MetricCard = ({ title, value, subtitle, icon, accentColor = Colors.primary, onPress, }) => {
    return (<Pressable onPress={onPress} style={({ pressed }) => [
            styles.card,
            {
                opacity: pressed && onPress ? 0.92 : 1,
                transform: [{ scale: pressed && onPress ? 0.98 : 1 }],
            },
        ]}>
      <View style={styles.cardInner}>
        {/* Top row with Icon Circle and Title */}
        <View style={styles.topRow}>
          <View style={[styles.iconCircle, { backgroundColor: `${accentColor}18` }]}>
            <Ionicons name={icon} size={18} color={accentColor}/>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Large Value */}
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>

        {/* Subtitle with bullet dot */}
        {subtitle ? (<View style={styles.subtitleRow}>
            <View style={[styles.bulletDot, { backgroundColor: accentColor }]}/>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>) : null}
      </View>

      {/* Subtle Wavy Decorative Bottom Right Curve */}
      <View style={[styles.waveContainer, { pointerEvents: 'none' }]}>
        <Svg width="100%" height="32" viewBox="0 0 160 32" fill="none">
          <Path d="M0,28 C45,28 75,32 110,18 C135,8 145,2 160,0 L160,32 L0,32 Z" fill={`${accentColor}14`}/>
          <Path d="M0,30 C45,30 75,32 110,20 C135,10 145,4 160,2" stroke={accentColor} strokeWidth="1.2" strokeOpacity="0.5" fill="none"/>
        </Svg>
      </View>
    </Pressable>);
};
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        flex: 1,
        minHeight: 126,
        justifyContent: 'space-between',
    },
    cardInner: {
        padding: 14,
        zIndex: 2,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        flex: 1,
    },
    value: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0F172A',
        letterSpacing: -0.6,
        marginBottom: 6,
        marginTop: 2,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    bulletDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },
    subtitle: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
        flex: 1,
    },
    waveContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 32,
        zIndex: 1,
    },
});
