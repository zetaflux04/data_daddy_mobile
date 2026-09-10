import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

/**
 * Reusable Material-style Badge component matching MUI <Badge badgeContent={...} color="...">
 */
export const MaterialBadge = ({
  badgeContent,
  color = 'primary', // 'primary' | 'error' | 'success' | 'warning'
  max = 99,
  children,
  style,
}) => {
  const count = Number(badgeContent);
  const showBadge = badgeContent !== undefined && badgeContent !== null && (count > 0 || typeof badgeContent === 'string');

  const getBgColor = () => {
    switch (color) {
      case 'primary':
        return Colors.primary || '#2563EB';
      case 'error':
        return '#EF4444';
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      default:
        return color;
    }
  };

  const renderContent = () => {
    if (typeof badgeContent === 'string') return badgeContent;
    if (count > max) return `${max}+`;
    return count;
  };

  return (
    <View style={[styles.container, style]}>
      {children}
      {showBadge && (
        <View style={[styles.badge, { backgroundColor: getBgColor() }]}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {renderContent()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 12,
  },
});

export default MaterialBadge;
