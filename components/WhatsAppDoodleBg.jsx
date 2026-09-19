import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const WhatsAppDoodleBg = ({ isDark, style }) => {
  const bgColor = isDark ? '#0B141A' : '#E5E7EB';
  const iconColor = isDark ? '#1C2E38' : '#D1D5DB';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      {/* Scattered subtle WhatsApp micro doodle icons */}
      <Ionicons name="chatbubble-ellipses-outline" size={22} color={iconColor} style={[styles.icon, { top: 22, left: 24 }]} />
      <Ionicons name="phone-portrait-outline" size={20} color={iconColor} style={[styles.icon, { top: 18, left: 120 }]} />
      <Ionicons name="star-outline" size={18} color={iconColor} style={[styles.icon, { top: 22, left: 200 }]} />
      <Ionicons name="cafe-outline" size={20} color={iconColor} style={[styles.icon, { top: 20, right: 90 }]} />
      <Ionicons name="search-outline" size={18} color={iconColor} style={[styles.icon, { top: 22, right: 30 }]} />
      
      <Ionicons name="heart-outline" size={18} color={iconColor} style={[styles.icon, { top: 80, left: 28 }]} />
      <Ionicons name="construct-outline" size={20} color={iconColor} style={[styles.icon, { top: 82, left: 140 }]} />
      <Ionicons name="sparkles-outline" size={18} color={iconColor} style={[styles.icon, { top: 76, right: 130 }]} />
      <Ionicons name="musical-notes-outline" size={20} color={iconColor} style={[styles.icon, { top: 80, right: 36 }]} />
      
      <Ionicons name="camera-outline" size={20} color={iconColor} style={[styles.icon, { bottom: 26, left: 25 }]} />
      <Ionicons name="hardware-chip-outline" size={20} color={iconColor} style={[styles.icon, { bottom: 22, left: 110 }]} />
      <Ionicons name="happy-outline" size={20} color={iconColor} style={[styles.icon, { bottom: 25, right: 110 }]} />
      <Ionicons name="shield-checkmark-outline" size={20} color={iconColor} style={[styles.icon, { bottom: 26, right: 35 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  icon: {
    position: 'absolute',
    opacity: 0.65,
  },
});

export default WhatsAppDoodleBg;
