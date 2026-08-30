import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Terms & Conditions</Text>
      <Text style={styles.updated}>Last updated: August 2026</Text>

      <Text style={styles.paragraph}>
        By creating an account or using <Text style={styles.bold}>DataDaddy</Text>, you agree to the following terms and operating guidelines.
      </Text>

      <Text style={styles.heading}>1. Software License & Free Tier</Text>
      <Text style={styles.paragraph}>
        DataDaddy provides a complimentary digital register tier for repair shops to record job cards, track customer dues, and compute profit/loss.
      </Text>

      <Text style={styles.heading}>2. SMS Gateway & Indian Telecom Compliance (DLT)</Text>
      <Text style={styles.paragraph}>
        Automated customer notifications are routed via Fast2SMS. Shop owners are responsible for ensuring customer contact details provided for job card intake are accurate and intended for transactional repair updates.
      </Text>

      <Text style={styles.heading}>3. Paid Technician Knowledge Base</Text>
      <Text style={styles.paragraph}>
        Pro subscriptions unlock step-by-step disassembly guides, boardviews, and video tutorials. Subscriptions are billed per month or year via Razorpay. Pre-signed schematic links are strictly non-transferable outside the registered shop account.
      </Text>

      <Text style={styles.heading}>4. Limitation of Liability</Text>
      <Text style={styles.paragraph}>
        Repair guides and schematics are intended as reference technical materials for skilled electronics technicians. DataDaddy is not liable for device hardware damage caused during improper physical repairs or disassembly.
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
