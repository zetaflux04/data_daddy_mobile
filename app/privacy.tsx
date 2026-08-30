import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.updated}>Last updated: August 2026</Text>

      <Text style={styles.paragraph}>
        Welcome to <Text style={styles.bold}>DataDaddy</Text>. We are committed to protecting the privacy of repair shop owners, technicians, and their customers.
      </Text>

      <Text style={styles.heading}>1. Information We Collect</Text>
      <Text style={styles.paragraph}>
        - <Text style={styles.bold}>Shop & Account Details:</Text> Shop business name, owner name, contact number, and physical store address.
      </Text>
      <Text style={styles.paragraph}>
        - <Text style={styles.bold}>Repair Job Information:</Text> Customer contact details (name and phone), device model, serial/IMEI numbers, reported hardware/software issues, and repair status.
      </Text>
      <Text style={styles.paragraph}>
        - <Text style={styles.bold}>Telephony & SMS:</Text> Logs of automated transactional SMS sent to customers via Fast2SMS.
      </Text>

      <Text style={styles.heading}>2. How We Use Information</Text>
      <Text style={styles.paragraph}>
        Your data is strictly used to maintain your shop's digital registers, calculate profit & loss, send customer job card status alerts, and authenticate technician accounts. We do not sell or monetize customer contacts.
      </Text>

      <Text style={styles.heading}>3. Data Security & Storage</Text>
      <Text style={styles.paragraph}>
        All data is transmitted using encrypted HTTPS channels. Technician guides and schematics are hosted privately on secure cloud storage with short-lived pre-signed access tokens.
      </Text>

      <Text style={styles.heading}>4. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have any questions regarding this Privacy Policy, please contact our support team at <Text style={styles.bold}>support@datadaddy.in</Text>.
      </Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  updated: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 10,
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
});
