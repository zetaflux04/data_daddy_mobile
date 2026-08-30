import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DeviceType } from '../types';
import { Colors } from '../constants/Colors';

interface DeviceIconProps {
  type: DeviceType;
  size?: number;
}

export const DeviceIcon: React.FC<DeviceIconProps> = ({ type, size = 20 }) => {
  let iconName: keyof typeof Ionicons.glyphMap = 'hardware-chip-outline';
  let bgColor = Colors.primaryGlow;
  let iconColor = Colors.primary;

  switch (type) {
    case 'mobile':
      iconName = 'phone-portrait-outline';
      bgColor = Colors.primaryGlow;
      iconColor = Colors.primary;
      break;
    case 'laptop':
      iconName = 'laptop-outline';
      bgColor = Colors.purpleLight;
      iconColor = Colors.purple;
      break;
    case 'tablet':
      iconName = 'tablet-portrait-outline';
      bgColor = Colors.emeraldLight;
      iconColor = Colors.emerald;
      break;
    case 'smartwatch':
      iconName = 'watch-outline';
      bgColor = Colors.amberLight;
      iconColor = Colors.amber;
      break;
    default:
      iconName = 'hardware-chip-outline';
      bgColor = 'rgba(100, 116, 139, 0.12)';
      iconColor = '#64748B';
      break;
  }

  const containerSize = size + 16;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor: bgColor,
        },
      ]}>
      <Ionicons name={iconName} size={size} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
