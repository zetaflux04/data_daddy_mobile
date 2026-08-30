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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const { requestOtp, verifyOtp, isLoading } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const handleSendOtp = async () => {
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit Indian mobile number.');
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        {/* Brand Hero */}
        <View style={styles.heroBox}>
          <LinearGradient
            colors={Colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBadge}>
            <Ionicons name="construct" size={32} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTitle}>Data</Text>
            <Text style={[styles.brandTitle, { color: Colors.primary }]}>Daddy</Text>
          </View>
          <Text style={styles.brandSubtitle}>
            India's #1 digital register & job card tracker for repair shops
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isOtpSent ? 'Enter 6-Digit OTP' : 'Sign in with Mobile'}
          </Text>
          <Text style={styles.cardSub}>
            {isOtpSent
              ? `We sent an OTP via Fast2SMS to +91 ${phone}`
              : 'Enter your 10-digit mobile number to receive a secure login OTP'}
          </Text>

          {!isOtpSent ? (
            <>
              <Text style={styles.inputLabel}>Mobile Phone Number</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="98765 43210"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <Pressable
                style={({ pressed }) => [styles.submitBtn, { opacity: pressed || isLoading ? 0.9 : 1 }]}
                disabled={isLoading}
                onPress={handleSendOtp}>
                <LinearGradient
                  colors={Colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitBtnGradient}>
                  <Text style={styles.submitBtnText}>
                    {isLoading ? 'Sending SMS...' : 'Get OTP via Fast2SMS'}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Enter OTP</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="• • • • • •"
                keyboardType="numeric"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />

              {devOtpHint && (
                <View style={styles.devHintBox}>
                  <Text style={styles.devHintText}>
                    💡 Demo Fast2SMS Code: <Text style={{ fontWeight: '800' }}>{devOtpHint}</Text>
                  </Text>
                </View>
              )}

              <Pressable
                style={({ pressed }) => [styles.submitBtn, { opacity: pressed || isLoading ? 0.9 : 1 }]}
                disabled={isLoading}
                onPress={handleVerifyOtp}>
                <LinearGradient
                  colors={Colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitBtnGradient}>
                  <Text style={styles.submitBtnText}>
                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                  </Text>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>

              <Pressable
                style={styles.changePhoneBtn}
                onPress={() => {
                  setIsOtpSent(false);
                  setOtp('');
                }}>
                <Text style={styles.changePhoneText}>Change phone number</Text>
              </Pressable>
            </>
          )}

          {/* Quick Demo Bypass */}
          <View style={styles.demoBypassBox}>
            <Pressable
              style={styles.demoBypassBtn}
              onPress={() => router.replace('/(tabs)')}>
              <Ionicons name="flash" size={14} color={Colors.primary} />
              <Text style={styles.demoBypassText}>Instant Demo Access (Skip Login)</Text>
            </Pressable>
          </View>

          {/* View Onboarding Tour Link */}
          <View style={styles.tourLinkBox}>
            <Pressable
              style={styles.tourLinkBtn}
              onPress={() => router.push('/onboarding')}>
              <Ionicons name="compass-outline" size={15} color="#64748B" />
              <Text style={styles.tourLinkText}>New to DataDaddy? Take the 1-min tour</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  heroBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  countryCodeBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  otpInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
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
  },
  devHintText: {
    fontSize: 13,
    color: Colors.primary,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
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
  demoBypassBox: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  demoBypassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoBypassText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  tourLinkBox: {
    marginTop: 10,
    alignItems: 'center',
  },
  tourLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tourLinkText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
});
