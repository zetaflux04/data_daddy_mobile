import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export const QRCodeView = ({ value, size = 96, color = '#0F172A', backgroundColor = '#FFFFFF' }) => {
  if (!value) return null;

  return (
    <View style={[styles.container, { width: size + 12, height: size + 12, backgroundColor }]}>
      <QRCode
        value={value}
        size={size}
        color={color}
        backgroundColor="transparent"
        quietZone={0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
});
