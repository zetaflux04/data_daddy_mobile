import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ScrollView, Alert, Modal, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from '../components/AppHeader';
const brands = ['All', 'Apple', 'Samsung', 'Dell', 'OnePlus', 'Xiaomi'];
export default function GuidesScreen() {
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const { shop } = useAuth();
    const [guides, setGuides] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [search, setSearch] = useState('');
    const [activeGuideModal, setActiveGuideModal] = useState(null);
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
    const handleOpenGuide = (guide) => {
        setActiveGuideModal(guide);
    };
    return (<View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Technician Guides" subtitle="Hardware schematics, boardviews & fix videos" />

      {/* Search Header */}
      <View style={[styles.searchHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: isDark ? '#202C33' : '#F1F5F9', borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }}/>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search guides, schematics, boardviews..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (<Pressable onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted}/>
            </Pressable>)}
        </View>
      </View>

      {/* Brand Horizontal Filter */}
      <View style={[styles.brandsWrapper, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandsScroll}>
          {brands.map((b) => (<Pressable
            key={b}
            style={[
              styles.brandChip,
              { backgroundColor: isDark ? '#202C33' : '#F1F5F9', borderColor: colors.border, borderWidth: isDark ? 1 : 0 },
              selectedBrand === b && styles.brandChipActive
            ]}
            onPress={() => setSelectedBrand(b)}
          >
              <Text style={[styles.brandChipText, { color: selectedBrand === b ? '#FFFFFF' : colors.textSecondary }, selectedBrand === b && styles.brandChipTextActive]}>
                {b}
              </Text>
            </Pressable>))}
        </ScrollView>
      </View>

      {/* Guides List */}
      <FlatList
        data={guides}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBox, { backgroundColor: isDark ? '#202C33' : '#F1F5F9' }]}>
              <Ionicons name="book-outline" size={32} color={colors.textMuted}/>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Guides Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Try searching with another device model or brand keyword.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.guideCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              { opacity: pressed ? 0.92 : 1 }
            ]}
            onPress={() => handleOpenGuide(item)}
          >
            <View style={styles.guideTopRow}>
              <View style={styles.badgeRow}>
                <View style={[styles.brandBadge, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.18)' : '#EEF2FF' }]}>
                  <Text style={[styles.brandBadgeText, { color: isDark ? '#60A5FA' : Colors.primary }]}>{item.brand}</Text>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: isDark ? '#202C33' : '#F1F5F9' }]}>
                  <Text style={[styles.diffText, { color: colors.textSecondary }]}>{item.difficulty.toUpperCase()}</Text>
                </View>
              </View>

              {item.isPremium && (
                <View style={[styles.proTag, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7' }]}>
                  <Ionicons name="star" size={12} color="#F59E0B"/>
                  <Text style={[styles.proTagText, { color: isDark ? '#F59E0B' : '#B45309' }]}>PRO ACCESS</Text>
                </View>
              )}
            </View>

            <Text style={[styles.guideTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.guideSummary, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.summary}
            </Text>

            <View style={[styles.guideFooter, { borderTopColor: colors.border }]}>
              <View style={styles.featureItem}>
                <Ionicons name="videocam-outline" size={15} color={isDark ? '#60A5FA' : Colors.primary}/>
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>Video Walkthrough</Text>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="document-text-outline" size={15} color={Colors.emerald}/>
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>Schematic PDF</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={colors.textMuted}/>
            </View>
          </Pressable>
        )}
      />

      {/* Guide Detail & Step-by-Step Reader Modal */}
      {activeGuideModal && (
        <Modal visible={!!activeGuideModal} animationType="slide" onRequestClose={() => setActiveGuideModal(null)}>
          <View style={[styles.readerContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.readerHeader, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: Math.max(insets.top, 16) + 8 }]}>
              <Text style={[styles.readerBrand, { color: colors.textSecondary }]}>{activeGuideModal.brand} • {activeGuideModal.model}</Text>
              <Pressable onPress={() => setActiveGuideModal(null)} style={styles.readerCloseBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={24} color={colors.text}/>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={[
                styles.readerContent,
                { paddingBottom: Math.max(insets.bottom, 24) + 20 },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.readerTitle, { color: colors.text }]}>{activeGuideModal.title}</Text>
              <Text style={[styles.readerSummary, { color: colors.textSecondary }]}>{activeGuideModal.summary}</Text>

              {/* Media Downloads Box */}
              <View style={[styles.mediaBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.mediaBoxTitle, { color: colors.text }]}>Schematics & Video Assets</Text>
                <View style={styles.mediaRow}>
                  <Pressable
                    style={[styles.mediaBtn, { backgroundColor: isDark ? '#202C33' : '#EFF6FF' }]}
                    onPress={() => Alert.alert('Schematic Ready', 'Secure AWS S3 / CloudFront verified. Opening schematic boardview viewer.')}
                  >
                    <Ionicons name="document-attach" size={18} color={isDark ? '#60A5FA' : Colors.primary}/>
                    <Text style={[styles.mediaBtnText, { color: isDark ? '#60A5FA' : Colors.primary }]}>Open Schematic PDF</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.mediaBtn, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#F0FDF4' }]}
                    onPress={() => Alert.alert('Video Tutorial Ready', 'Streaming walkthrough securely from AWS S3 storage.')}
                  >
                    <Ionicons name="play-circle" size={18} color={Colors.emerald}/>
                    <Text style={[styles.mediaBtnText, { color: Colors.emerald }]}>Play Video</Text>
                  </Pressable>
                </View>
              </View>

              <Text style={[styles.stepsHeading, { color: colors.text }]}>Step-by-Step Disassembly & Fix</Text>
              {activeGuideModal.steps?.map((step) => (
                <View key={step.stepNumber} style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.stepNumCircle, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.2)' : Colors.primary }]}>
                    <Text style={[styles.stepNumText, { color: isDark ? '#60A5FA' : '#FFFFFF' }]}>{step.stepNumber}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                    <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>);
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
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 20,
        gap: 8,
    },
    emptyIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
        maxWidth: 260,
        lineHeight: 18,
    },
});
