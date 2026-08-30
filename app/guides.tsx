import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { RepairGuideItem } from '../types';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const brands = ['All', 'Apple', 'Samsung', 'Dell', 'OnePlus', 'Xiaomi'];

export default function GuidesScreen() {
  const { shop } = useAuth();
  const [guides, setGuides] = useState<RepairGuideItem[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [search, setSearch] = useState('');
  const [activeGuideModal, setActiveGuideModal] = useState<RepairGuideItem | null>(null);

  const isPro = shop?.plan === 'pro' && shop?.subscriptionStatus === 'active';

  useEffect(() => {
    loadGuides();
  }, [selectedBrand, search]);

  const loadGuides = async () => {
    const list = await api.getGuides({
      brand: selectedBrand === 'All' ? undefined : selectedBrand,
      search,
    });
    setGuides(list);
  };

  const handleOpenGuide = (guide: RepairGuideItem) => {
    setActiveGuideModal(guide);
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search guides, schematics, boardviews..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Brand Horizontal Filter */}
      <View style={styles.brandsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandsScroll}>
          {brands.map((b) => (
            <Pressable
              key={b}
              style={[styles.brandChip, selectedBrand === b && styles.brandChipActive]}
              onPress={() => setSelectedBrand(b)}>
              <Text style={[styles.brandChipText, selectedBrand === b && styles.brandChipTextActive]}>
                {b}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Guides List */}
      <FlatList
        data={guides}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.guideCard, { opacity: pressed ? 0.92 : 1 }]}
            onPress={() => handleOpenGuide(item)}>
            <View style={styles.guideTopRow}>
              <View style={styles.badgeRow}>
                <View style={styles.brandBadge}>
                  <Text style={styles.brandBadgeText}>{item.brand}</Text>
                </View>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.diffText}>{item.difficulty.toUpperCase()}</Text>
                </View>
              </View>

              {item.isPremium && (
                <View style={styles.proTag}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.proTagText}>PRO ACCESS</Text>
                </View>
              )}
            </View>

            <Text style={styles.guideTitle}>{item.title}</Text>
            <Text style={styles.guideSummary} numberOfLines={2}>
              {item.summary}
            </Text>

            <View style={styles.guideFooter}>
              <View style={styles.featureItem}>
                <Ionicons name="videocam-outline" size={15} color={Colors.primary} />
                <Text style={styles.featureText}>Video Walkthrough</Text>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="document-text-outline" size={15} color={Colors.emerald} />
                <Text style={styles.featureText}>Schematic PDF</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>
          </Pressable>
        )}
      />

      {/* Guide Detail & Step-by-Step Reader Modal */}
      {activeGuideModal && (
        <Modal
          visible={!!activeGuideModal}
          animationType="slide"
          onRequestClose={() => setActiveGuideModal(null)}>
          <View style={styles.readerContainer}>
            <View style={styles.readerHeader}>
              <Text style={styles.readerBrand}>{activeGuideModal.brand} • {activeGuideModal.model}</Text>
              <Pressable onPress={() => setActiveGuideModal(null)} style={styles.readerCloseBtn}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.readerContent}>
              <Text style={styles.readerTitle}>{activeGuideModal.title}</Text>
              <Text style={styles.readerSummary}>{activeGuideModal.summary}</Text>

              {/* Media Downloads Box */}
              <View style={styles.mediaBox}>
                <Text style={styles.mediaBoxTitle}>Schematics & Video Assets</Text>
                <View style={styles.mediaRow}>
                  <Pressable
                    style={styles.mediaBtn}
                    onPress={() => Alert.alert('Schematic Ready', 'Secure Cloudinary / CDN URL verified. Opening schematic boardview viewer.')}>
                    <Ionicons name="document-attach" size={18} color={Colors.primary} />
                    <Text style={styles.mediaBtnText}>Open Schematic PDF</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.mediaBtn, { backgroundColor: '#F0FDF4' }]}
                    onPress={() => Alert.alert('Video Tutorial Ready', 'Streaming walkthrough from Cloudinary CDN.')}>
                    <Ionicons name="play-circle" size={18} color={Colors.emerald} />
                    <Text style={[styles.mediaBtnText, { color: Colors.emerald }]}>Play Video</Text>
                  </Pressable>
                </View>
              </View>

              <Text style={styles.stepsHeading}>Step-by-Step Disassembly & Fix</Text>
              {activeGuideModal.steps?.map((step) => (
                <View key={step.stepNumber} style={styles.stepCard}>
                  <View style={styles.stepNumCircle}>
                    <Text style={styles.stepNumText}>{step.stepNumber}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchHeader: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  brandsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  brandChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  brandChipActive: {
    backgroundColor: Colors.primary,
  },
  brandChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  brandChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  guideTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  brandBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  brandBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  difficultyBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  proTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 20,
  },
  guideSummary: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  guideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  // Reader Modal
  readerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  readerBrand: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  readerCloseBtn: {
    padding: 4,
  },
  readerContent: {
    padding: 20,
  },
  readerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 26,
    marginBottom: 10,
  },
  readerSummary: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
  },
  mediaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 24,
  },
  mediaBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mediaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  mediaBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  stepsHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
});
