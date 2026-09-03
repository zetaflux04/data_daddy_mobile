import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api, resolveImageUrls } from '../../services/api';
import { DeviceType } from '../../types';
import { Colors } from '../../constants/Colors';
import { AppHeader } from '../../components/AppHeader';
import { S3Image } from '../../components/S3Image';

const deviceTypes: Array<{ type: DeviceType; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { type: 'mobile', label: 'Mobile', icon: 'phone-portrait-outline' },
  { type: 'laptop', label: 'Laptop', icon: 'laptop-outline' },
  { type: 'tablet', label: 'Tablet', icon: 'tablet-portrait-outline' },
  { type: 'smartwatch', label: 'Watch', icon: 'watch-outline' },
];

type OrderType = 'repair' | 'accessory';

export default function NewJobScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ customerId?: string; name?: string; phone?: string }>();

  // Customer Details
  const [customerName, setCustomerName] = useState(params.name || '');
  const [customerPhone, setCustomerPhone] = useState(params.phone || '');

  // Order Type Tab
  const [orderType, setOrderType] = useState<OrderType>('repair');

  // Repair — Device Details
  const [deviceType, setDeviceType] = useState<DeviceType>('mobile');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialOrImei, setSerialOrImei] = useState('');
  const [passcode, setPasscode] = useState('');
  const [problem, setProblem] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Accessory Fields
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');

  // Cost & Advance for Repair
  const [estimatedCost, setEstimatedCost] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card'>('cash');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo Picking Logic for Repairs (Max 5 photos)
  const handlePickPhoto = () => {
    if (photos.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 5 photos per device.');
      return;
    }

    Alert.alert(
      'Upload Device Photo',
      'Choose an option to capture or select a photo of the product to be repaired',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const permission = await ImagePicker.requestCameraPermissionsAsync();
              if (!permission.granted) {
                Alert.alert('Permission Required', 'Camera access is needed to take photos.');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.8,
              });
              if (!result.canceled && result.assets?.[0]) {
                await uploadSelectedPhoto(result.assets[0]);
              }
            } catch (e: any) {
              Alert.alert('Camera Error', e.message || 'Could not launch camera');
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!permission.granted) {
                Alert.alert('Permission Required', 'Photo library access is needed to select images.');
                return;
              }
              const remainingCount = 5 - photos.length;
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                selectionLimit: remainingCount,
                quality: 0.8,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                for (const asset of result.assets) {
                  await uploadSelectedPhoto(asset);
                }
              }
            } catch (e: any) {
              Alert.alert('Gallery Error', e.message || 'Could not pick images');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadSelectedPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    setIsUploadingPhoto(true);
    try {
      const fileName = asset.fileName || `device_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';
      const res = await api.uploadDevicePhoto(asset.uri, mimeType, fileName);
      if (res && res.url) {
        setPhotos((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, res.url];
        });
      }
    } catch (e: any) {
      Alert.alert('Upload Failed', e.message || 'Could not upload device photo to AWS S3.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      Alert.alert('Missing Customer', 'Please enter customer name and phone number.');
      return;
    }

    if (orderType === 'repair') {
      if (!brand.trim() || !model.trim() || !problem.trim()) {
        Alert.alert('Missing Device Info', 'Please enter Brand, Model, and Problem Description.');
        return;
      }
      const est = Number(estimatedCost) || 0;
      const adv = Number(advancePaid) || 0;
      if (adv > est && est > 0) {
        Alert.alert(
          'Invalid Advance Payment',
          `Advance payment (₹${adv}) cannot exceed the estimated price (₹${est}).`
        );
        return;
      }
    } else {
      if (!productName.trim() || !productPrice.trim()) {
        Alert.alert('Missing Product Info', 'Please enter Product Name and Selling Price.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        customerId: params.customerId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        paymentMode,
      };

      if (orderType === 'repair') {
        payload.deviceType = deviceType;
        payload.brand = brand.trim();
        payload.model = model.trim();
        payload.serialOrImei = serialOrImei.trim();
        payload.passcodePattern = passcode.trim();
        payload.problemDescription = problem.trim();
        payload.photos = photos;
        payload.estimatedCost = Number(estimatedCost) || 0;
        payload.advancePaid = Number(advancePaid) || 0;
      } else {
        payload.productName = productName.trim();
        payload.productPrice = Number(productPrice) || 0;
      }

      const newJob = await api.createJob(payload);

      if (newJob) {
        const message =
          orderType === 'accessory'
            ? `Accessory sale ${newJob.jobId} recorded successfully.`
            : `Job Card ${newJob.jobId} created successfully. Automated "Order Received" SMS sent to +91 ${customerPhone}.`;

        Alert.alert(
          orderType === 'accessory' ? 'Sale Recorded!' : 'Job Created!',
          message,
          [
            {
              text: 'View Job Card',
              onPress: () => router.replace(`/job/${newJob._id}`),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Unable to create job card. Please try again.');
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        (error.response?.status === 401
          ? 'Session expired. Please sign in again.'
          : error.message || 'Failed to create job card. Please try again.');
      Alert.alert('Unable to Create Job', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="New Job Card" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}>
        <ScrollView
          style={styles.flexOne}
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}
          showsVerticalScrollIndicator={false}>
          {/* SMS Notice Banner */}
          <View style={styles.smsNotice}>
            <Ionicons name="chatbox-ellipses" size={18} color="#0369A1" />
            <Text style={styles.smsNoticeText}>
              {orderType === 'repair'
                ? 'Customer will automatically receive an SMS with Job ID and shop contact number upon saving.'
                : 'Accessory sale will be recorded directly with full payment. No SMS will be sent.'}
            </Text>
          </View>

          {/* Customer Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>1. Customer Information</Text>

            <Text style={styles.fieldLabel}>Customer Full Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor="#94A3B8"
              value={customerName}
              onChangeText={setCustomerName}
            />

            <Text style={styles.fieldLabel}>Mobile Phone Number *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="10-digit number (e.g. 9876543210)"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              maxLength={10}
              value={customerPhone}
              onChangeText={setCustomerPhone}
            />
          </View>

          {/* Order Type Tab Switcher */}
          <View style={styles.tabContainer}>
            <Text style={styles.sectionHeader}>2. Order Type</Text>
            <View style={styles.tabRow}>
              <Pressable
                style={[styles.tabButton, orderType === 'repair' && styles.tabButtonActive]}
                onPress={() => setOrderType('repair')}>
                <Ionicons
                  name="construct-outline"
                  size={18}
                  color={orderType === 'repair' ? '#FFFFFF' : '#64748B'}
                />
                <Text style={[styles.tabButtonText, orderType === 'repair' && styles.tabButtonTextActive]}>
                  Repair
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tabButton, orderType === 'accessory' && styles.tabButtonActive]}
                onPress={() => setOrderType('accessory')}>
                <Ionicons
                  name="bag-handle-outline"
                  size={18}
                  color={orderType === 'accessory' ? '#FFFFFF' : '#64748B'}
                />
                <Text style={[styles.tabButtonText, orderType === 'accessory' && styles.tabButtonTextActive]}>
                  Accessories
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Repair Form */}
          {orderType === 'repair' && (
            <>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>3. Device Details</Text>

                <Text style={styles.fieldLabel}>Device Type</Text>
                <View style={styles.deviceTypeRow}>
                  {deviceTypes.map((dt) => {
                    const isSelected = deviceType === dt.type;
                    return (
                      <Pressable
                        key={dt.type}
                        style={[styles.deviceTypeChip, isSelected && styles.deviceTypeChipSelected]}
                        onPress={() => setDeviceType(dt.type)}>
                        <Ionicons
                          name={dt.icon}
                          size={16}
                          color={isSelected ? Colors.primary : '#64748B'}
                        />
                        <Text style={[styles.deviceTypeLabel, isSelected && styles.deviceTypeLabelSelected]}>
                          {dt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Brand *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Apple"
                      placeholderTextColor="#94A3B8"
                      value={brand}
                      onChangeText={setBrand}
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Model *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. iPhone 13"
                      placeholderTextColor="#94A3B8"
                      value={model}
                      onChangeText={setModel}
                    />
                  </View>
                </View>

                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>IMEI / Serial (Opt)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Optional"
                      placeholderTextColor="#94A3B8"
                      value={serialOrImei}
                      onChangeText={setSerialOrImei}
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Passcode / PIN</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 1234"
                      placeholderTextColor="#94A3B8"
                      value={passcode}
                      onChangeText={setPasscode}
                    />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Problem Description *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describe broken screen, water damage, battery drain, no display, etc."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  value={problem}
                  onChangeText={setProblem}
                />

                {/* Device Photos (Max 5 photos) */}
                <View style={{ marginTop: 14 }}>
                  <View style={styles.photoHeaderRow}>
                    <Text style={[styles.fieldLabel, { marginTop: 0, marginBottom: 0 }]}>
                      Product Photos ({photos.length}/5)
                    </Text>
                    <Text style={styles.photoSubLabel}>Max 5 photos for repair records</Text>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                    {photos.map((photoUrl, idx) => {
                      const urls = resolveImageUrls(photoUrl);
                      return (
                        <View key={idx} style={styles.photoThumbWrapper}>
                          {urls ? (
                            <S3Image
                              uri={urls.uri}
                              proxyUri={urls.proxyUri}
                              style={styles.photoThumb}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={[styles.photoThumb, { backgroundColor: '#F1F5F9' }]} />
                          )}
                          <Pressable
                            style={styles.photoDeleteBtn}
                            onPress={() => handleRemovePhoto(idx)}>
                            <Ionicons name="close" size={14} color="#FFFFFF" />
                          </Pressable>
                          <View style={styles.photoIndexBadge}>
                            <Text style={styles.photoIndexText}>{idx + 1}</Text>
                          </View>
                        </View>
                      );
                    })}

                    {photos.length < 5 && (
                      <Pressable
                        style={[styles.addPhotoBtn, isUploadingPhoto && styles.addPhotoBtnDisabled]}
                        disabled={isUploadingPhoto}
                        onPress={handlePickPhoto}>
                        {isUploadingPhoto ? (
                          <ActivityIndicator size="small" color={Colors.primary} />
                        ) : (
                          <>
                            <Ionicons name="camera" size={24} color={Colors.primary} />
                            <Text style={styles.addPhotoText}>+ Add Photo</Text>
                          </>
                        )}
                      </Pressable>
                    )}
                  </ScrollView>
                </View>
              </View>

              {/* Cost & Payment Section — Repair */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>4. Cost Estimation & Advance</Text>

                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Estimated Cost (₹)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 2500"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={estimatedCost}
                      onChangeText={setEstimatedCost}
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Advance Paid (₹)</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        Number(advancePaid) > Number(estimatedCost) &&
                          Number(estimatedCost) > 0 && { borderColor: Colors.rose, borderWidth: 1.5 },
                      ]}
                      placeholder="e.g. 500"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={advancePaid}
                      onChangeText={setAdvancePaid}
                    />
                  </View>
                </View>

                {Number(advancePaid) > Number(estimatedCost) && Number(estimatedCost) > 0 && (
                  <Text style={{ color: Colors.rose, fontSize: 12, marginTop: 4, fontWeight: '600' }}>
                    Advance payment cannot exceed estimated cost ₹{estimatedCost}
                  </Text>
                )}

                {Number(advancePaid) > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.fieldLabel}>Advance Payment Mode</Text>
                    <View style={styles.deviceTypeRow}>
                      {(['cash', 'upi', 'card'] as const).map((m) => (
                        <Pressable
                          key={m}
                          style={[styles.deviceTypeChip, paymentMode === m && styles.deviceTypeChipSelected]}
                          onPress={() => setPaymentMode(m)}>
                          <Text
                            style={[
                              styles.deviceTypeLabel,
                              paymentMode === m && styles.deviceTypeLabelSelected,
                            ]}>
                            {m.toUpperCase()}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Accessory Form — Clean 2-Field Flow Without Advance Field */}
          {orderType === 'accessory' && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>3. Accessory Details</Text>

              <Text style={styles.fieldLabel}>Product / Accessory Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Tempered Glass, Phone Cover, 65W Fast Charger"
                placeholderTextColor="#94A3B8"
                value={productName}
                onChangeText={setProductName}
              />

              <Text style={styles.fieldLabel}>Selling Price (₹) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 299"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={productPrice}
                onChangeText={setProductPrice}
              />

              <View style={{ marginTop: 12 }}>
                <Text style={styles.fieldLabel}>Payment Mode *</Text>
                <View style={styles.deviceTypeRow}>
                  {(['cash', 'upi', 'card'] as const).map((m) => (
                    <Pressable
                      key={m}
                      style={[styles.deviceTypeChip, paymentMode === m && styles.deviceTypeChipSelected]}
                      onPress={() => setPaymentMode(m)}>
                      <Text
                        style={[
                          styles.deviceTypeLabel,
                          paymentMode === m && styles.deviceTypeLabelSelected,
                        ]}>
                        {m.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            style={({ pressed }) => [styles.submitBtn, { opacity: pressed || isSubmitting ? 0.88 : 1 }]}
            disabled={isSubmitting}
            onPress={handleSubmit}>
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>
              {isSubmitting
                ? 'Saving...'
                : orderType === 'accessory'
                  ? 'Record Accessory Sale'
                  : 'Save Job Card & Send SMS'}
            </Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flexOne: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  smsNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  smsNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 16,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top',
  },
  twoCol: {
    flexDirection: 'row',
  },
  deviceTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  deviceTypeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  deviceTypeChipSelected: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primaryLight,
  },
  deviceTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  deviceTypeLabelSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  // Order Type Tab Switcher
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  // Photos Section
  photoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  photoSubLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  photoScroll: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  photoThumbWrapper: {
    position: 'relative',
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  photoDeleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.88)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIndexBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  photoIndexText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    borderStyle: 'dashed',
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoBtnDisabled: {
    opacity: 0.6,
  },
  addPhotoText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
