import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { AppHeader } from '../components/AppHeader';

const features = [
  {
    icon: 'flash-outline',
    title: 'Rapid Job Card Intake',
    desc: 'Intake mobile & laptop devices in under 30 seconds with fault checklists and condition photos.',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    icon: 'chatbox-ellipses-outline',
    title: 'Automated SMS & Alerts',
    desc: 'Keep customers updated at every stage: received, parts delayed, repaired, and ready for delivery.',
    color: '#0284C7',
    bg: '#F0F9FF',
  },
  {
    icon: 'receipt-outline',
    title: 'Smart Thermal & PDF Invoicing',
    desc: 'Instant 58mm/80mm Bluetooth thermal receipts and professional PDF tax invoices.',
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    icon: 'trending-up-outline',
    title: 'Shop Expense & Profit Tracking',
    desc: 'Record parts costs, shop rent, and overheads to monitor your real-time net profit margins.',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    icon: 'people-outline',
    title: 'Multi-Technician Management',
    desc: 'Assign jobs to specific technicians and track repair progress with role-based access.',
    color: '#D97706',
    bg: '#FFFBEB',
  },
  {
    icon: 'cloud-done-outline',
    title: 'Secure Cloud & S3 Storage',
    desc: 'All device condition photos and repair records are safely backed up in AWS S3 cloud.',
    color: '#0D9488',
    bg: '#F0FDFA',
  },
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleOpenLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <AppHeader title="About Metafy" />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Hero Card */}
        <View style={styles.heroCard}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appTagline}>
            Smart Repair & Service Business Management Platform
          </Text>

          <View style={styles.versionPill}>
            <Text style={styles.versionPillText}>Version 1.0.0 (Enterprise)</Text>
          </View>

          <Text style={styles.poweredBy}>Powered by Chipix Innovations</Text>
        </View>

        {/* Mission Statement */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About the Platform</Text>
          <Text style={styles.bodyText}>
            Metafy is an all-in-one business operating system engineered specifically for mobile phone, laptop, and electronic repair service centers.
          </Text>
          <Text style={[styles.bodyText, { marginTop: 10 }]}>
            Our mission is to empower independent repair shop owners, technicians, and multi-branch service chains to replace paper registers with a powerful, fast, and automated digital workflow.
          </Text>
        </View>

        {/* Core Capabilities */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>What Metafy Offers</Text>
          <View style={styles.featuresList}>
            {features.map((item, idx) => (
              <View key={idx} style={styles.featureItem}>
                <View style={[styles.featureIconBox, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Platform & Developer Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Software Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Product Name</Text>
            <Text style={styles.infoVal}>Metafy Repair OS</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Developer</Text>
            <Text style={styles.infoVal}>Chipix Technologies</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Build</Text>
            <Text style={styles.infoVal}>2026.09 (Release)</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Target Platforms</Text>
            <Text style={styles.infoVal}>Android & iOS</Text>
          </View>
        </View>

        {/* Contact & Support Links */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Connect & Support</Text>

          <Pressable
            style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleOpenLink('https://thechipix.com')}
          >
            <View style={[styles.linkIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="globe-outline" size={18} color={Colors.primary} />
            </View>
            <View style={styles.linkTextWrap}>
              <Text style={styles.linkTitle}>Official Website</Text>
              <Text style={styles.linkSub}>https://thechipix.com</Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#94A3B8" />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleOpenLink('mailto:support@chipix.in')}
          >
            <View style={[styles.linkIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="mail-outline" size={18} color="#16A34A" />
            </View>
            <View style={styles.linkTextWrap}>
              <Text style={styles.linkTitle}>Support & Enquiries</Text>
              <Text style={styles.linkSub}>support@chipix.in</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push('/privacy')}
          >
            <View style={[styles.linkIconBox, { backgroundColor: '#F8FAFC' }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#475569" />
            </View>
            <View style={styles.linkTextWrap}>
              <Text style={styles.linkTitle}>Privacy Policy</Text>
              <Text style={styles.linkSub}>Data protection & privacy guidelines</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push('/terms')}
          >
            <View style={[styles.linkIconBox, { backgroundColor: '#F8FAFC' }]}>
              <Ionicons name="document-text-outline" size={18} color="#475569" />
            </View>
            <View style={styles.linkTextWrap}>
              <Text style={styles.linkTitle}>Terms of Service</Text>
              <Text style={styles.linkSub}>Usage terms and service agreement</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footerWrap}>
          <Text style={styles.footerText}>
            © 2026 Metafy Technologies • All rights reserved
          </Text>
          <Text style={styles.footerSubText}>
            Built with ❤️ for repair engineers & shop owners
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
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoImage: {
    width: 220,
    height: 72,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  versionPill: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  versionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  poweredBy: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },
  featuresList: {
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoKey: {
    fontSize: 14,
    color: '#64748B',
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkTextWrap: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  linkSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  footerWrap: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  footerSubText: {
    fontSize: 11,
    color: '#CBD5E1',
  },
});
