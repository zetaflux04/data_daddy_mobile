import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';

export default function RegisterShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone: string }>();
  const { registerShop, isLoading } = useAuth();

  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleRegister = async () => {
    if (!agreedToTerms) {
      Alert.alert(
        'Agreement Required',
        'Please check the box to agree to our Terms of Service and Privacy Policy before continuing.'
      );
      return;
    }

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
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: Math.max(insets.top, 24), paddingBottom: Math.max(insets.bottom, 16) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        
        {/* Top Brand Showcase */}
        <View style={styles.brandHero}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>DataDaddy</Text>
          <Text style={styles.brandSubtitle}>Complete your shop profile to get started.</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardTopAccent} />

          <View style={styles.cardInner}>
            <Text style={styles.cardHeading}>Set Up Your Shop</Text>

            <Text style={styles.inputLabel}>SHOP BUSINESS NAME *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Master Mobile & Laptop Care"
              placeholderTextColor="#94A3B8"
              value={shopName}
              onChangeText={setShopName}
            />

            <Text style={styles.inputLabel}>OWNER / MANAGER FULL NAME *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Sunil Verma"
              placeholderTextColor="#94A3B8"
              value={ownerName}
              onChangeText={setOwnerName}
            />

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>CITY / TOWN</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Jaipur"
                  placeholderTextColor="#94A3B8"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>PIN CODE</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 302001"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={6}
                  value={pincode}
                  onChangeText={setPincode}
                />
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { opacity: pressed || isLoading ? 0.88 : 1 },
              ]}
              disabled={isLoading}
              onPress={handleRegister}>
              <Text style={styles.primaryBtnText}>
                {isLoading ? 'Creating Profile...' : 'Complete Registration'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Terms & Conditions Agreement */}
        <View style={styles.legalSection}>
          <Pressable
            style={styles.checkboxRow}
            onPress={() => setAgreedToTerms((prev) => !prev)}>
            <View
              style={[
                styles.checkboxBox,
                agreedToTerms && styles.checkboxBoxChecked,
              ]}>
              {agreedToTerms && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.legalTextWrap}>
              <Text style={styles.legalNoticeText}>
                By continuing, you agree to our{' '}
                <Text
                  style={styles.legalLink}
                  onPress={() => router.push('/terms')}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.legalLink}
                  onPress={() => router.push('/privacy')}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 140,
    height: 70,
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F2942',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 20,
  },
  cardTopAccent: {
    height: 4,
    backgroundColor: '#F59E0B',
    width: '100%',
  },
  cardInner: {
    padding: 24,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  twoCol: {
    flexDirection: 'row',
  },
  primaryBtn: {
    backgroundColor: '#F59E0B',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  legalSection: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  legalTextWrap: {
    flex: 1,
  },
  legalNoticeText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
  },
  legalLink: {
    color: '#2563EB',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
