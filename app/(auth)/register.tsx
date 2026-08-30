import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';

export default function RegisterShopScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string }>();
  const { registerShop, isLoading } = useAuth();

  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const handleRegister = async () => {
    if (!shopName.trim() || !ownerName.trim()) {
      Alert.alert('Missing Details', 'Please enter your shop name and owner name.');
      return;
    }

    const phone = params.phone || '9876543210';
    const res = await registerShop({
      phone,
      shopName: shopName.trim(),
      ownerName: ownerName.trim(),
      address: { city: city.trim(), pincode: pincode.trim() },
    });

    if (res.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Registration Failed', 'Could not set up shop account. Please retry.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="storefront" size={28} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Set Up Your Shop</Text>
        <Text style={styles.subtitle}>
          Create your shop profile to start managing repair job cards, customer SMS, and profit/loss
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Shop Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Master Mobile & Laptop Care"
          value={shopName}
          onChangeText={setShopName}
        />

        <Text style={styles.label}>Owner / Manager Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Sunil Verma"
          value={ownerName}
          onChangeText={setOwnerName}
        />

        <Text style={styles.label}>City / Town</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Jaipur, Rajasthan"
          value={city}
          onChangeText={setCity}
        />

        <Text style={styles.label}>Pin Code</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 302001"
          keyboardType="numeric"
          maxLength={6}
          value={pincode}
          onChangeText={setPincode}
        />

        <Pressable
          style={({ pressed }) => [styles.submitBtn, { opacity: pressed || isLoading ? 0.88 : 1 }]}
          disabled={isLoading}
          onPress={handleRegister}>
          <Text style={styles.submitBtnText}>
            {isLoading ? 'Creating Profile...' : 'Complete Setup & Enter Dashboard'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
