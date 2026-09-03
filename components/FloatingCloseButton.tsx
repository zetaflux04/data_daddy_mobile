import React from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FloatingCloseButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const FloatingCloseButton: React.FC<FloatingCloseButtonProps> = ({ onPress, style }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.circleBtn,
        pressed && styles.circleBtnPressed,
        style,
      ]}
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel="Close modal">
      <Ionicons name="close" size={24} color="#0F172A" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  circleBtn: {
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  circleBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
});
