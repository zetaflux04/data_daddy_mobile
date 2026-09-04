import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { Colors } from '../constants/Colors';
export default function PrivacyPolicyScreen() {
    const insets = useSafeAreaInsets();
    return (<View style={styles.container}>
      <AppHeader title="Privacy Policy"/>

      <ScrollView style={styles.scrollArea} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>Last updated: August 2026</Text>
          </View>
        </View>

        <Text style={styles.intro}>
          Welcome to <Text style={styles.bold}>DataDaddy</Text>. We are committed to protecting the privacy and confidentiality of repair shop owners, technicians, and their customer data.
        </Text>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Shop & Account Details:</Text> Shop business name, owner name, mobile contact number, and physical store address.
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Repair Job Information:</Text> Customer contact details (name and phone), device brand, model, serial/IMEI numbers, reported hardware/software issues, passcode pattern, and repair progress.
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Telephony & SMS Logs:</Text> Logs of automated transactional SMS sent to customers for order intake, repair completion, and invoice delivery.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>2. How We Use Information</Text>
          <Text style={styles.paragraph}>
            Your data is strictly used to maintain your shop's digital registers, calculate profit & loss, send customer job card status alerts, and authenticate technician accounts.
          </Text>
          <Text style={styles.highlightText}>
            We NEVER sell, trade, or monetize your customer database or shop financials to third parties.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>3. Data Security & Storage</Text>
          <Text style={styles.paragraph}>
            All communications are encrypted in transit via industry-standard HTTPS/TLS protocols. Technician guides, schematics, and invoices are hosted privately on secure cloud storage with short-lived pre-signed access tokens.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>4. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions or privacy inquiries, please contact our support team at:
          </Text>
          <Text style={styles.emailText}>support@datadaddy.in</Text>
        </View>
      </ScrollView>
    </View>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollArea: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    badgeRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    dateBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    dateBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary,
    },
    intro: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 22,
        marginBottom: 16,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    heading: {
        fontSize: 15,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 8,
    },
    bold: {
        fontWeight: '700',
        color: '#0F172A',
    },
    highlightText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.emerald,
        marginTop: 4,
        lineHeight: 18,
    },
    emailText: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.primary,
        marginTop: 4,
    },
});
