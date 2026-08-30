import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { JobCard, JobStatus } from '../../types';
import { JobCardItem } from '../../components/JobCardItem';
import { Colors } from '../../constants/Colors';

const statusTabs: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'parts_delayed', label: 'Parts Delayed' },
  { key: 'repaired', label: 'Repaired' },
  { key: 'delivered', label: 'Delivered' },
];

export default function JobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getJobs({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchQuery,
      });
      setJobs(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedStatus, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Job ID, customer, phone, model..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.createBtn, { opacity: pressed ? 0.88 : 1 }]}
          onPress={() => router.push('/job/new')}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Horizontal Status Filter Chips */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}>
          {statusTabs.map((tab) => {
            const isSelected = selectedStatus === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setSelectedStatus(tab.key)}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                ]}>
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Job Cards List */}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={fetchJobs}
        renderItem={({ item }) => (
          <JobCardItem
            job={item}
            onPress={() => router.push(`/job/${item._id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No matching jobs found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? `No jobs match "${searchQuery}"` : 'No jobs in this status filter'}
            </Text>
            <Pressable
              style={styles.resetBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedStatus('all');
              }}>
              <Text style={styles.resetBtnText}>Clear Filters</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  searchBox: {
    flex: 1,
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
  createBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScrollWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primaryLight,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
    textAlign: 'center',
  },
  resetBtn: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
});
