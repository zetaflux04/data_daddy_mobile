import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  onPress?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = Colors.primary,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          opacity: pressed && onPress ? 0.9 : 1,
          transform: [{ scale: pressed && onPress ? 0.98 : 1 }],
        },
      ]}>
      {/* Top accent line */}
      <View style={[styles.topBar, { backgroundColor: accentColor }]} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={[styles.iconBox, { backgroundColor: `${accentColor}18` }]}>
            <Ionicons name={icon} size={17} color={accentColor} />
          </View>
        </View>

        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>

        {subtitle && (
          <View style={styles.subtitleRow}>
            <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    flex: 1,
    minWidth: 150,
  },
  topBar: {
    height: 3.5,
    width: '100%',
  },
  content: {
    padding: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
  },
});
