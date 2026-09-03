import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestOtp, verifyOtp, isLoading } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSendOtp = async () => {
    if (!agreedToTerms) {
      Alert.alert(
        'Agreement Required',
        'Please check the box to agree to our Terms of Service and Privacy Policy before continuing.'
      );
      return;
    }

    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    const res = await requestOtp(clean);
    if (res.success) {
      setIsOtpSent(true);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
    } else {
      Alert.alert('Error', res.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!agreedToTerms) {
      Alert.alert(
        'Agreement Required',
        'Please agree to our Terms of Service and Privacy Policy to continue.'
      );
      return;
    }

    if (!otp || otp.length < 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP code.');
      return;
    }

    const clean = phone.replace(/\D/g, '').slice(-10);
    const res = await verifyOtp(clean, otp);

    if (res.success) {
      if (res.needsRegistration) {
        router.replace({
          pathname: '/(auth)/register',
          params: { phone: clean },
        });
      } else {
        router.replace('/(tabs)');
      }
    } else {
      Alert.alert('Verification Failed', res.message || 'Invalid or expired OTP.');
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
          <Text style={styles.brandSubtitle}>Sign in to manage your workshop</Text>
        </View>

        {/* Main Card with Top Blue Accent Bar */}
        <View style={styles.card}>
          <View style={styles.cardTopAccent} />

          <View style={styles.cardInner}>
            <Text style={styles.cardHeading}>
              {isOtpSent ? 'Verify OTP' : 'Welcome Back'}
            </Text>

            {!isOtpSent ? (
              <>
                <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter 10 digit number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                {/* Send OTP Button (Brand Blue) */}
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { opacity: pressed || isLoading ? 0.88 : 1 },
                  ]}
                  disabled={isLoading}
                  onPress={handleSendOtp}>
                  <Text style={styles.primaryBtnText}>
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.otpHelperText}>
                  Enter the 6-digit verification code sent to +91 {phone}
                </Text>

                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • • • •"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />

                {devOtpHint && (
                  <View style={styles.devHintBox}>
                    <Text style={styles.devHintText}>
                      💡 Test OTP: <Text style={{ fontWeight: '800' }}>{devOtpHint}</Text>
                    </Text>
                  </View>
                )}

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { opacity: pressed || isLoading ? 0.88 : 1 },
                  ]}
                  disabled={isLoading}
                  onPress={handleVerifyOtp}>
                  <Text style={styles.primaryBtnText}>
                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.changePhoneBtn}
                  onPress={() => {
                    setIsOtpSent(false);
                    setOtp('');
                  }}>
                  <Text style={styles.changePhoneText}>Change mobile number</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Terms & Conditions & Privacy Policy with Tick/Untick Checkbox */}
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
    width: 300,
    height: 150,
    marginBottom: 10,
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
    marginBottom: 24,
  },
  cardTopAccent: {
    height: 4,
    backgroundColor: '#2563EB',
    width: '100%',
  },
  cardInner: {
    padding: 24,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    height: 52,
  },
  countryCodeBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    height: '100%',
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  otpHelperText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  otpInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    height: 52,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 16,
  },
  devHintBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  devHintText: {
    fontSize: 13,
    color: '#1D4ED8',
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
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
  changePhoneBtn: {
    alignItems: 'center',
    marginTop: 14,
  },
  changePhoneText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
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
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
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
