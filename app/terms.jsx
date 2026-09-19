import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

export default function TermsScreen() {
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Terms & Conditions" subtitle="Usage policy and service agreement" />

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.badgeRow}>
            <View style={[styles.dateBadge, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : '#EEF2FF' }]}>
              <Text style={[styles.dateBadgeText, { color: isDark ? '#60A5FA' : Colors.primary }]}>
                Last updated: August 2026
              </Text>
            </View>
          </View>

          <Text style={[styles.intro, { color: colors.textSecondary }]}>
            By creating an account or using <Text style={[styles.bold, { color: colors.text }]}>Metafy</Text>, you agree to the following terms and operating guidelines.
          </Text>

          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.heading, { color: colors.text }]}>1. Software License & Free Tier</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Metafy provides a complimentary digital register tier for repair shops to record job cards, track customer dues, and compute profit/loss.
            </Text>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.heading, { color: colors.text }]}>2. SMS Gateway & Indian Telecom Compliance (DLT)</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Automated customer notifications are routed via certified telecom transactional gateways. Shop owners are responsible for ensuring customer contact details provided for job card intake are accurate and intended for transactional repair updates.
            </Text>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.heading, { color: colors.text }]}>3. Paid Technician Knowledge Base</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Pro subscriptions unlock step-by-step disassembly guides, boardviews, and video tutorials. Subscriptions are billed per month or year via Razorpay. Pre-signed schematic links are strictly non-transferable outside the registered shop account.
            </Text>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.heading, { color: colors.text }]}>4. Limitation of Liability</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Repair guides and schematics are intended as reference technical materials for skilled electronics technicians. Metafy is not liable for device hardware damage caused during improper physical repairs or disassembly.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
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
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 20,
    },
    bold: {
        fontWeight: '700',
        color: '#0F172A',
    },
});
