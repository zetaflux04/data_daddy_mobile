import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Keyboard, } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api, resolveImageUrls } from '../../services/api';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { AppHeader } from '../../components/AppHeader';
import { S3Image } from '../../components/S3Image';
import { OutlinedTextInput } from '../../components/OutlinedTextInput';
import { MaterialMultiSelect } from '../../components/MaterialMultiSelect';
const deviceTypes = [
    { type: 'mobile', label: 'Mobile', icon: 'phone-portrait-outline' },
    { type: 'laptop', label: 'Laptop', icon: 'laptop-outline' },
    { type: 'tablet', label: 'Tablet', icon: 'tablet-portrait-outline' },
    { type: 'smartwatch', label: 'Watch', icon: 'watch-outline' },
];

export const PROBLEM_OPTIONS = [
    'Display Broken',
    'Charging Problem',
    'Water Damage/ Dead',
    'Battery Issue',
    'Network Problem',
    'No Power On',
    'Touch Not Working',
    'Insert Sim Problem',
    'Camera Problem',
    'Others',
];

export const ACCESSORY_OPTIONS = [
    'Charging Cable',
    'Charger',
    'Tempered Glass',
    'Phone Cover',
    'Neck Band',
    'Buds',
    'Handfree',
    'Wireless Charger',
    'Lamination',
    'Speaker',
    'Watch',
    'Others',
];

export default function NewJobScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { isDark, colors } = useTheme();
    const isEditing = Boolean(params.editJobId);
    const [isLoadingEdit, setIsLoadingEdit] = useState(isEditing);

    // Customer Details
    const [customerName, setCustomerName] = useState(params.name || '');
    const [customerPhone, setCustomerPhone] = useState(params.phone || '');
    // Order Type Tab
    const [orderType, setOrderType] = useState('repair');
    // Repair — Device Details
    const [deviceType, setDeviceType] = useState('mobile');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [serialOrImei, setSerialOrImei] = useState('');
    const [passcode, setPasscode] = useState('');
    // Problem selection
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [customProblem, setCustomProblem] = useState('');
    const [photos, setPhotos] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    // Accessory selection
    const [selectedAccessories, setSelectedAccessories] = useState([]);
    const [customAccessory, setCustomAccessory] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [accessoryPhoto, setAccessoryPhoto] = useState(null);
    const [isUploadingAccessoryPhoto, setIsUploadingAccessoryPhoto] = useState(false);
    // Cost & Advance for Repair
    const [estimatedCost, setEstimatedCost] = useState('');
    const [advancePaid, setAdvancePaid] = useState('');
    const [paymentMode, setPaymentMode] = useState('cash');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const clearRepairFields = () => {
        setDeviceType('mobile');
        setBrand('');
        setModel('');
        setSerialOrImei('');
        setPasscode('');
        setSelectedProblems([]);
        setCustomProblem('');
        setPhotos([]);
        setEstimatedCost('');
        setAdvancePaid('');
    };

    const clearAccessoryFields = () => {
        setSelectedAccessories([]);
        setCustomAccessory('');
        setProductPrice('');
        setAccessoryPhoto(null);
    };

    const handleOrderTypeChange = (nextType) => {
        if (isEditing || nextType === orderType) return;
        if (nextType === 'repair') {
            clearAccessoryFields();
        } else {
            clearRepairFields();
        }
        setOrderType(nextType);
    };

    // Load existing job details when in Edit mode
    useEffect(() => {
        if (!params.editJobId) return;
        async function fetchExistingJob() {
            try {
                setIsLoadingEdit(true);
                const existing = await api.getJobById(params.editJobId);
                if (existing) {
                    if (existing.status === 'delivered' && existing.orderType !== 'accessory') {
                        Alert.alert(
                            'Job Locked',
                            'This job has already been delivered to the customer. All details are read-only and cannot be changed.',
                            [{ text: 'OK', onPress: () => router.back() }]
                        );
                        return;
                    }
                    setOrderType(existing.orderType || 'repair');
                    setCustomerName(existing.customerSnapshot?.name || '');
                    setCustomerPhone(existing.customerSnapshot?.phone || '');
                    if (existing.orderType === 'accessory') {
                        const existingProd = existing.productName || '';
                        if (existingProd) {
                            const rawItems = existingProd.split(',').map((s) => s.trim()).filter(Boolean);
                            const known = [];
                            const others = [];
                            rawItems.forEach((item) => {
                                if (ACCESSORY_OPTIONS.filter((o) => o !== 'Others').includes(item)) {
                                    known.push(item);
                                } else {
                                    others.push(item);
                                }
                            });
                            if (others.length > 0) {
                                known.push('Others');
                                setCustomAccessory(others.join(', '));
                            }
                            setSelectedAccessories(known);
                        } else {
                            setSelectedAccessories([]);
                            setCustomAccessory('');
                        }
                        setProductPrice(String(existing.cost?.final || existing.productPrice || ''));
                        const existingImg = existing.productImage || existing.photos?.[0] || null;
                        if (existingImg) {
                            setAccessoryPhoto(typeof existingImg === 'string' ? { url: existingImg } : existingImg);
                        } else {
                            setAccessoryPhoto(null);
                        }
                    } else {
                        setDeviceType(existing.deviceType || 'mobile');
                        setBrand(existing.brand || '');
                        setModel(existing.model || '');
                        setSerialOrImei(existing.serialOrImei || '');
                        setPasscode(existing.passcodePattern || '');
                        const existingProb = existing.problemDescription || '';
                        if (existingProb) {
                            const rawProbs = existingProb.split(',').map((s) => s.trim()).filter(Boolean);
                            const known = [];
                            const others = [];
                            rawProbs.forEach((p) => {
                                if (PROBLEM_OPTIONS.filter((o) => o !== 'Others').includes(p)) {
                                    known.push(p);
                                } else {
                                    others.push(p);
                                }
                            });
                            if (others.length > 0) {
                                known.push('Others');
                                setCustomProblem(others.join(', '));
                            }
                            setSelectedProblems(known);
                        } else {
                            setSelectedProblems([]);
                            setCustomProblem('');
                        }
                        setPhotos((existing.photos || []).map(p => (typeof p === 'string' ? { url: p } : p)));
                        setEstimatedCost(String(existing.cost?.estimated || existing.cost?.final || ''));
                        setAdvancePaid(String(existing.cost?.advancePaid || ''));
                    }
                    if (existing.payments?.[0]?.mode) {
                        setPaymentMode(existing.payments[0].mode);
                    }
                }
            } catch {
                Alert.alert('Load Error', 'Could not load existing job details.');
            } finally {
                setIsLoadingEdit(false);
            }
        }
        fetchExistingJob();
    }, [params.editJobId]);

    // Keyboard & Auto-Scroll Helpers for Cost Section & Accessory
    const scrollViewRef = useRef(null);
    const advancePaidInputRef = useRef(null);
    const costSectionY = useRef(0);
    const accessorySectionY = useRef(0);
    const focusedFieldRef = useRef(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const scrollToCostSection = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const scrollToAccessorySection = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    useEffect(() => {
        const onShow = (e) => {
            const height = e?.endCoordinates?.height || 300;
            setKeyboardHeight(height);
            if (focusedFieldRef.current === 'cost' || focusedFieldRef.current === 'accessory') {
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        };

        const onHide = () => {
            setKeyboardHeight(0);
            focusedFieldRef.current = null;
        };

        const showSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            onShow
        );
        const hideSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            onHide
        );

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const handleCostFocus = () => {
        focusedFieldRef.current = 'cost';
        scrollToCostSection();
    };

    const handleAccessoryFocus = () => {
        focusedFieldRef.current = 'accessory';
        scrollToAccessorySection();
    };

    // Photo Picking Logic for Repairs (Max 3 photos)
    const handlePickPhoto = () => {
        if (photos.length >= 3) {
            Alert.alert('Limit Reached', 'You can upload a maximum of 3 photos per device.');
            return;
        }
        Alert.alert('Upload Device Photo', 'Choose an option to capture or select a photo of the product to be repaired', [
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
                            quality: 0.9, // Compress 10% of the image (90% quality)
                        });
                        if (!result.canceled && result.assets?.[0]) {
                            await uploadSelectedPhoto(result.assets[0]);
                        }
                    }
                    catch (e) {
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
                        const remainingCount = 3 - photos.length;
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsMultipleSelection: true,
                            selectionLimit: remainingCount,
                            quality: 0.9, // Compress 10% of the image (90% quality)
                        });
                        if (!result.canceled && result.assets && result.assets.length > 0) {
                            for (const asset of result.assets) {
                                await uploadSelectedPhoto(asset);
                            }
                        }
                    }
                    catch (e) {
                        Alert.alert('Gallery Error', e.message || 'Could not pick images');
                    }
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };
    const uploadSelectedPhoto = async (asset) => {
        setIsUploadingPhoto(true);
        try {
            const fileName = asset.fileName || asset.uri?.split('/').pop() || `device_${Date.now()}.jpg`;
            const mimeType = asset.mimeType || 'image/jpeg';
            const res = await api.uploadDevicePhoto(asset.uri, mimeType, fileName);
            if (res && res.url) {
                setPhotos((prev) => {
                    if (prev.length >= 3)
                        return prev;
                    return [...prev, { url: res.url, localUri: asset.uri }];
                });
            }
        }
        catch (e) {
            Alert.alert('Upload Failed', e.message || 'Could not upload device photo to AWS S3.');
        }
        finally {
            setIsUploadingPhoto(false);
        }
    };
    const handleRemovePhoto = (indexToRemove) => {
        setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };
    // Single Product Photo for Accessories
    const handlePickAccessoryPhoto = () => {
        Alert.alert('Product Image', 'Choose an option to capture or select a photo of this product / accessory', [
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
                            quality: 0.9,
                        });
                        if (!result.canceled && result.assets?.[0]) {
                            await uploadAccessoryPhoto(result.assets[0]);
                        }
                    }
                    catch (e) {
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
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsMultipleSelection: false,
                            selectionLimit: 1,
                            quality: 0.9,
                        });
                        if (!result.canceled && result.assets?.[0]) {
                            await uploadAccessoryPhoto(result.assets[0]);
                        }
                    }
                    catch (e) {
                        Alert.alert('Gallery Error', e.message || 'Could not pick image');
                    }
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };
    const uploadAccessoryPhoto = async (asset) => {
        setIsUploadingAccessoryPhoto(true);
        try {
            const fileName = asset.fileName || asset.uri?.split('/').pop() || `accessory_${Date.now()}.jpg`;
            const mimeType = asset.mimeType || 'image/jpeg';
            const res = await api.uploadDevicePhoto(asset.uri, mimeType, fileName);
            if (res && res.url) {
                setAccessoryPhoto({ url: res.url, localUri: asset.uri });
            }
        }
        catch (e) {
            Alert.alert('Upload Failed', e.message || 'Could not upload product photo to AWS S3.');
        }
        finally {
            setIsUploadingAccessoryPhoto(false);
        }
    };
    const handleSubmit = async () => {
        const problemParts = selectedProblems
            .map((p) => (p === 'Others' ? customProblem.trim() : p.trim()))
            .filter(Boolean);
        const finalProblem = problemParts.join(', ');

        const accessoryParts = selectedAccessories
            .map((a) => (a === 'Others' ? customAccessory.trim() : a.trim()))
            .filter(Boolean);
        const finalProduct = accessoryParts.join(', ');

        if (!customerName.trim() || !customerPhone.trim()) {
            Alert.alert('Missing Customer', 'Please enter customer name and phone number.');
            return;
        }
        if (orderType === 'repair') {
            if (!brand.trim() || !model.trim() || !finalProblem) {
                Alert.alert('Missing Device Info', 'Please enter Brand, Model, and Problem Description.');
                return;
            }
            const est = Number(estimatedCost) || 0;
            const adv = Number(advancePaid) || 0;
            if (adv > est) {
                Alert.alert('Invalid Advance Payment', `Advance payment (₹${adv}) cannot exceed the estimated price (₹${est}).`);
                return;
            }
        }
        else {
            if (!finalProduct || !productPrice.trim()) {
                Alert.alert('Missing Product Info', 'Please select or enter Product Name and Selling Price.');
                return;
            }
        }
        setIsSubmitting(true);
        try {
            const payload = {
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
                payload.problemDescription = finalProblem;
                payload.photos = photos.map((p) => (typeof p === 'string' ? p : p.url));
                payload.estimatedCost = Number(estimatedCost) || 0;
                payload.advancePaid = Number(advancePaid) || 0;
            }
            else {
                payload.productName = finalProduct;
                payload.productPrice = Number(productPrice) || 0;
                const photoUrl = accessoryPhoto ? (typeof accessoryPhoto === 'string' ? accessoryPhoto : accessoryPhoto.url) : '';
                payload.productImage = photoUrl || '';
                payload.photos = photoUrl ? [photoUrl] : [];
            }
            if (isEditing) {
                const updated = await api.updateJob(params.editJobId, payload);
                if (updated) {
                    Alert.alert(
                        orderType === 'accessory' ? 'Sale Updated!' : 'Job Card Updated!',
                        `Successfully updated ${updated.jobId || 'job card'}.`,
                        [
                            {
                                text: 'OK',
                                onPress: () => router.back(),
                            },
                        ]
                    );
                } else {
                    Alert.alert('Error', 'Unable to update job card. Please try again.');
                }
            } else {
                const newJob = await api.createJob(payload);
                if (newJob) {
                    const message = orderType === 'accessory'
                        ? `Accessory sale ${newJob.jobId} recorded successfully.`
                        : `Job Card ${newJob.jobId} created successfully. Automated "Order Received" SMS sent to +91 ${customerPhone}.`;
                    Alert.alert(orderType === 'accessory' ? 'Sale Recorded!' : 'Job Created!', message, [
                        {
                            text: 'View Job Card',
                            onPress: () => router.replace(`/job/${newJob._id}`),
                        },
                    ]);
                }
                else {
                    Alert.alert('Error', 'Unable to create job card. Please try again.');
                }
            }
        }
        catch (error) {
            const msg = error.response?.data?.message ||
                (error.response?.status === 401
                    ? 'Session expired. Please sign in again.'
                    : error.message || 'Failed to save job card. Please try again.');
            Alert.alert(isEditing ? 'Unable to Update' : 'Unable to Create Job', msg);
        }
        finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingEdit) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <AppHeader title="Edit Job Card" />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={isDark ? '#60A5FA' : Colors.primary} />
                    <Text style={{ marginTop: 12, color: colors.textSecondary, fontWeight: '600' }}>Loading job details...</Text>
                </View>
            </View>
        );
    }

    const headerTitle = isEditing
        ? (orderType === 'accessory' ? 'Edit Accessory Sale' : 'Edit Job Card')
        : (orderType === 'accessory' ? 'Record Accessory Sale' : 'New Job Card');

    return (<View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title={headerTitle}/>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 54 : 0}
        style={styles.flexOne}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.flexOne}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom:
                keyboardHeight > 0 ? 16 : Math.max(insets.bottom, 16) + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* SMS Notice Banner */}
          <View style={[styles.smsNotice, isDark && { backgroundColor: 'rgba(96, 165, 250, 0.12)', borderColor: 'rgba(96, 165, 250, 0.28)' }]}>
            <Ionicons name="chatbox-ellipses" size={18} color={isDark ? '#60A5FA' : '#0369A1'}/>
            <Text style={[styles.smsNoticeText, isDark && { color: '#E9EDEF' }]}>
              {orderType === 'repair'
            ? 'Customer will automatically receive an SMS with Job ID and shop contact number upon saving.'
            : 'Accessory sale will be recorded directly with full payment. No SMS will be sent.'}
            </Text>
          </View>

          {/* Customer Section */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>1. Customer Information</Text>

            <OutlinedTextInput
              label="Customer Full Name"
              required
              placeholder="Raman Kasana"
              value={customerName}
              onChangeText={setCustomerName}
            />

            <OutlinedTextInput
              label="Mobile Phone Number"
              required
              placeholder="9876543210"
              startAdornment="+91"
              keyboardType="phone-pad"
              maxLength={10}
              value={customerPhone}
              onChangeText={setCustomerPhone}
            />
          </View>

          {/* Order Type Tab Switcher */}
          <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>2. Order Type</Text>
            {isEditing ? (
              <View style={[styles.orderTypeLockedPill, isDark && { backgroundColor: '#202C33', borderColor: '#2A3942' }]}>
                <Ionicons
                  name={orderType === 'accessory' ? 'bag-handle-outline' : 'construct-outline'}
                  size={16}
                  color={isDark ? '#60A5FA' : Colors.primary}
                />
                <Text style={[styles.orderTypeLockedText, isDark && { color: '#60A5FA' }]}>
                  {orderType === 'accessory' ? 'Accessory Sale' : 'Repair Job'}
                </Text>
                <Text style={[styles.orderTypeLockedHint, isDark && { color: '#8696A0' }]}>Order type cannot be changed after creation</Text>
              </View>
            ) : (
              <View style={[styles.tabRow, isDark && { backgroundColor: '#202C33' }]}>
                <Pressable style={[styles.tabButton, orderType === 'repair' && styles.tabButtonActive]} onPress={() => handleOrderTypeChange('repair')}>
                  <Ionicons name="construct-outline" size={18} color={orderType === 'repair' ? '#FFFFFF' : (isDark ? '#8696A0' : '#64748B')}/>
                  <Text style={[styles.tabButtonText, { color: orderType === 'repair' ? '#FFFFFF' : (isDark ? '#8696A0' : '#64748B') }, orderType === 'repair' && styles.tabButtonTextActive]}>
                    Repair
                  </Text>
                </Pressable>
                <Pressable style={[styles.tabButton, orderType === 'accessory' && styles.tabButtonActive]} onPress={() => handleOrderTypeChange('accessory')}>
                  <Ionicons name="bag-handle-outline" size={18} color={orderType === 'accessory' ? '#FFFFFF' : (isDark ? '#8696A0' : '#64748B')}/>
                  <Text style={[styles.tabButtonText, { color: orderType === 'accessory' ? '#FFFFFF' : (isDark ? '#8696A0' : '#64748B') }, orderType === 'accessory' && styles.tabButtonTextActive]}>
                    Accessories
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Repair Form */}
          {orderType === 'repair' && (<>
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>3. Device Details</Text>

                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Device Type</Text>
                <View style={styles.deviceTypeRow}>
                  {deviceTypes.map((dt) => {
                const isSelected = deviceType === dt.type;
                return (<Pressable
                  key={dt.type}
                  style={[
                    styles.deviceTypeChip,
                    isDark && { backgroundColor: '#202C33', borderColor: '#2A3942' },
                    isSelected && [styles.deviceTypeChipSelected, isDark && { backgroundColor: 'rgba(96, 165, 250, 0.18)', borderColor: '#60A5FA' }],
                  ]}
                  onPress={() => setDeviceType(dt.type)}
                >
                        <Ionicons
                          name={dt.icon}
                          size={16}
                          color={isSelected ? (isDark ? '#60A5FA' : Colors.primary) : (isDark ? '#8696A0' : '#64748B')}
                        />
                        <Text
                          style={[
                            styles.deviceTypeLabel,
                            isDark && { color: '#8696A0' },
                            isSelected && [styles.deviceTypeLabelSelected, isDark && { color: '#60A5FA' }],
                          ]}
                        >
                          {dt.label}
                        </Text>
                      </Pressable>);
            })}
                </View>

                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <OutlinedTextInput
                      label="Brand"
                      required
                      placeholder="Apple"
                      value={brand}
                      onChangeText={setBrand}
                    />
                  </View>
                  <View style={{ width: 12 }}/>
                  <View style={{ flex: 1 }}>
                    <OutlinedTextInput
                      label="Model"
                      required
                      placeholder="iPhone 13"
                      value={model}
                      onChangeText={setModel}
                    />
                  </View>
                </View>

                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <OutlinedTextInput
                      label="IMEI / Serial (Opt)"
                      placeholder="Optional"
                      value={serialOrImei}
                      onChangeText={setSerialOrImei}
                    />
                  </View>
                  <View style={{ width: 12 }}/>
                  <View style={{ flex: 1 }}>
                    <OutlinedTextInput
                      label="Passcode / PIN"
                      placeholder="1234"
                      value={passcode}
                      onChangeText={setPasscode}
                    />
                  </View>
                </View>

                <MaterialMultiSelect
                  label="Problem Description"
                  required
                  options={PROBLEM_OPTIONS}
                  value={selectedProblems}
                  placeholder="Select problem descriptions..."
                  onChange={(updated) => {
                    setSelectedProblems(updated);
                    if (!updated.includes('Others')) {
                      setCustomProblem('');
                    }
                  }}
                />

                {selectedProblems.includes('Others') && (
                  <View style={{ marginTop: 10 }}>
                    <OutlinedTextInput
                      label="Describe Problem / Fault"
                      required
                      multiline
                      numberOfLines={3}
                      placeholder="Describe broken screen, water damage, battery drain, no display, etc."
                      value={customProblem}
                      onChangeText={setCustomProblem}
                    />
                  </View>
                )}

                {/* Device Photos (Max 3 photos) */}
                <View style={{ marginTop: 14 }}>
                  <View style={styles.photoHeaderRow}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 0, marginBottom: 0 }]}>
                      Product Photos ({photos.length}/3)
                    </Text>
                    <Text style={[styles.photoSubLabel, { color: colors.textSecondary }]}>Max 3 photos for repair records</Text>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                    {photos.map((item, idx) => {
                const photoUrl = typeof item === 'string' ? item : item.url;
                const localUri = typeof item === 'object' ? item.localUri : null;
                const urls = resolveImageUrls(photoUrl);
                const displayUri = localUri || urls?.uri || photoUrl;
                const proxyFallback = urls?.proxyUri;
                return (<Pressable key={idx} style={[styles.photoThumbWrapper, isDark && { borderColor: '#2A3942' }]} onPress={() => setPreviewImage(displayUri)}>
                          <S3Image uri={displayUri} proxyUri={proxyFallback} style={[styles.photoThumb, isDark && { backgroundColor: '#202C33' }]} resizeMode="cover"/>
                          <Pressable style={styles.photoDeleteBtn} onPress={(e) => { e.stopPropagation?.(); handleRemovePhoto(idx); }}>
                            <Ionicons name="close" size={14} color="#FFFFFF"/>
                          </Pressable>
                          <View style={styles.photoIndexBadge}>
                            <Text style={styles.photoIndexText}>{idx + 1}</Text>
                          </View>
                        </Pressable>);
            })}

                    {photos.length < 3 && (<Pressable
                      style={[
                        styles.addPhotoBtn,
                        isDark && { backgroundColor: '#202C33', borderColor: '#60A5FA' },
                        isUploadingPhoto && styles.addPhotoBtnDisabled,
                      ]}
                      disabled={isUploadingPhoto}
                      onPress={handlePickPhoto}
                    >
                        {isUploadingPhoto ? (<ActivityIndicator size="small" color={isDark ? '#60A5FA' : Colors.primary}/>) : (<>
                            <Ionicons name="camera" size={24} color={isDark ? '#60A5FA' : Colors.primary}/>
                            <Text style={[styles.addPhotoText, isDark && { color: '#60A5FA' }]}>+ Add Photo</Text>
                          </>)}
                      </Pressable>)}
                  </ScrollView>
                </View>
              </View>

              {/* Cost & Payment Section — Repair */}
              <View
                style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onLayout={(e) => {
                  costSectionY.current = e.nativeEvent.layout.y;
                }}
              >
                <Text style={[styles.sectionHeader, { color: colors.text }]}>4. Cost Estimation & Advance</Text>

                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <OutlinedTextInput
                      label="Estimated Cost"
                      placeholder="2500"
                      startAdornment="₹"
                      keyboardType="numeric"
                      returnKeyType="next"
                      onSubmitEditing={() => advancePaidInputRef.current?.focus()}
                      value={estimatedCost}
                      onChangeText={setEstimatedCost}
                      onFocus={handleCostFocus}
                    />
                  </View>
                  <View style={{ width: 12 }}/>
                  <View style={{ flex: 1 }}>
                    <OutlinedTextInput
                      ref={advancePaidInputRef}
                      label="Advance Paid"
                      placeholder="500"
                      startAdornment="₹"
                      keyboardType="numeric"
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                      error={
                        Number(advancePaid) > Number(estimatedCost) && Number(estimatedCost) > 0
                          ? `Max ₹${estimatedCost}`
                          : undefined
                      }
                      value={advancePaid}
                      onChangeText={setAdvancePaid}
                      onFocus={handleCostFocus}
                    />
                  </View>
                </View>

                {Number(advancePaid) > Number(estimatedCost) && Number(estimatedCost) > 0 && (<Text style={{ color: Colors.rose, fontSize: 12, marginTop: 4, fontWeight: '600' }}>
                    Advance payment cannot exceed estimated cost ₹{estimatedCost}
                  </Text>)}

                {Number(advancePaid) > 0 && (<View style={{ marginTop: 10 }}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Advance Payment Mode</Text>
                    <View style={styles.deviceTypeRow}>
                      {['cash', 'upi', 'card'].map((m) => (<Pressable
                        key={m}
                        style={[
                          styles.deviceTypeChip,
                          isDark && { backgroundColor: '#202C33', borderColor: '#2A3942' },
                          paymentMode === m && [styles.deviceTypeChipSelected, isDark && { backgroundColor: 'rgba(96, 165, 250, 0.18)', borderColor: '#60A5FA' }],
                        ]}
                        onPress={() => setPaymentMode(m)}
                      >
                          <Text style={[
                        styles.deviceTypeLabel,
                        isDark && { color: '#8696A0' },
                        paymentMode === m && [styles.deviceTypeLabelSelected, isDark && { color: '#60A5FA' }],
                    ]}>
                            {m.toUpperCase()}
                          </Text>
                        </Pressable>))}
                    </View>
                  </View>)}
              </View>
            </>)}

          {/* Accessory Form — Clean 2-Field Flow Without Advance Field */}
          {orderType === 'accessory' && (
            <View
              style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onLayout={(e) => {
                accessorySectionY.current = e.nativeEvent.layout.y;
              }}
            >
              <Text style={[styles.sectionHeader, { color: colors.text }]}>3. Accessory Details</Text>

              <MaterialMultiSelect
                label="Product / Accessory Name"
                required
                options={ACCESSORY_OPTIONS}
                value={selectedAccessories}
                placeholder="Select accessory products..."
                onChange={(updated) => {
                  setSelectedAccessories(updated);
                  if (!updated.includes('Others')) {
                    setCustomAccessory('');
                  }
                }}
              />

              {selectedAccessories.includes('Others') && (
                <View style={{ marginTop: 10 }}>
                  <OutlinedTextInput
                    label="Enter Custom Accessory Name"
                    required
                    placeholder="OTG Adapter, Car Mount, Power Bank"
                    value={customAccessory}
                    onChangeText={setCustomAccessory}
                  />
                </View>
              )}

              <OutlinedTextInput
                label="Selling Price"
                required
                placeholder="299"
                startAdornment="₹"
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                value={productPrice}
                onChangeText={setProductPrice}
                onFocus={handleAccessoryFocus}
              />

              {/* Product Image Option (Max 1 photo) */}
              <View style={{ marginTop: 14 }}>
                <View style={styles.photoHeaderRow}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 0, marginBottom: 0 }]}>
                    Product Image {accessoryPhoto ? '(1/1)' : '(Optional)'}
                  </Text>
                  <Text style={[styles.photoSubLabel, { color: colors.textSecondary }]}>1 photo limit for product record</Text>
                </View>

                {accessoryPhoto ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    {(() => {
                      const photoUrl = typeof accessoryPhoto === 'string' ? accessoryPhoto : accessoryPhoto.url;
                      const localUri = typeof accessoryPhoto === 'object' ? accessoryPhoto.localUri : null;
                      const urls = resolveImageUrls(photoUrl);
                      const displayUri = localUri || urls?.uri || photoUrl;
                      const proxyFallback = urls?.proxyUri;
                      return (
                        <Pressable style={[styles.photoThumbWrapper, isDark && { borderColor: '#2A3942' }]} onPress={() => setPreviewImage(displayUri)}>
                          <S3Image uri={displayUri} proxyUri={proxyFallback} style={[styles.photoThumb, isDark && { backgroundColor: '#202C33' }]} resizeMode="cover" />
                          <Pressable
                            style={styles.photoDeleteBtn}
                            onPress={(e) => {
                              e.stopPropagation?.();
                              setAccessoryPhoto(null);
                            }}
                          >
                            <Ionicons name="close" size={14} color="#FFFFFF" />
                          </Pressable>
                          <View style={styles.photoIndexBadge}>
                            <Text style={styles.photoIndexText}>1</Text>
                          </View>
                        </Pressable>
                      );
                    })()}

                    <Pressable
                      style={[styles.rePickPhotoBtn, isUploadingAccessoryPhoto && styles.addPhotoBtnDisabled]}
                      disabled={isUploadingAccessoryPhoto}
                      onPress={handlePickAccessoryPhoto}
                    >
                      <Ionicons name="camera-reverse-outline" size={16} color={isDark ? '#60A5FA' : Colors.primary} />
                      <Text style={[styles.rePickPhotoText, isDark && { color: '#60A5FA' }]}>Change Photo</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    style={[
                      styles.addPhotoBtn,
                      { marginTop: 8 },
                      isDark && { backgroundColor: '#202C33', borderColor: '#60A5FA' },
                      isUploadingAccessoryPhoto && styles.addPhotoBtnDisabled,
                    ]}
                    disabled={isUploadingAccessoryPhoto}
                    onPress={handlePickAccessoryPhoto}
                  >
                    {isUploadingAccessoryPhoto ? (
                      <ActivityIndicator size="small" color={isDark ? '#60A5FA' : Colors.primary} />
                    ) : (
                      <>
                        <Ionicons name="camera" size={24} color={isDark ? '#60A5FA' : Colors.primary} />
                        <Text style={[styles.addPhotoText, isDark && { color: '#60A5FA' }]}>+ Add Photo</Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>

              <View style={{ marginTop: 14 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Payment Mode *</Text>
                <View style={styles.deviceTypeRow}>
                  {['cash', 'upi', 'card'].map((m) => (<Pressable
                    key={m}
                    style={[
                      styles.deviceTypeChip,
                      isDark && { backgroundColor: '#202C33', borderColor: '#2A3942' },
                      paymentMode === m && [styles.deviceTypeChipSelected, isDark && { backgroundColor: 'rgba(96, 165, 250, 0.18)', borderColor: '#60A5FA' }],
                    ]}
                    onPress={() => setPaymentMode(m)}
                  >
                      <Text style={[
                    styles.deviceTypeLabel,
                    isDark && { color: '#8696A0' },
                    paymentMode === m && [styles.deviceTypeLabelSelected, isDark && { color: '#60A5FA' }],
                ]}>
                        {m.toUpperCase()}
                      </Text>
                    </Pressable>))}
                </View>
              </View>
            </View>)}

          {/* Submit Button */}
          <Pressable style={({ pressed }) => [styles.submitBtn, { opacity: pressed || isSubmitting ? 0.88 : 1 }]} disabled={isSubmitting} onPress={handleSubmit}>
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF"/>
            <Text style={styles.submitBtnText}>
              {isSubmitting
            ? 'Saving...'
            : isEditing
            ? (orderType === 'accessory' ? 'Update Sale Details' : 'Update Job Card')
            : (orderType === 'accessory'
                ? 'Record Accessory Sale'
                : 'Save Job Card & Send SMS')}
            </Text>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fullscreen Photo Viewer Modal */}
      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.imageModalBackdrop}>
          {/* Top Bar with Title and Close Button */}
          <View style={[styles.imageModalTopBar, { paddingTop: Math.max(insets.top + 10, 24) }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="image-outline" size={20} color="#FFFFFF" />
              <Text style={styles.imageModalTitle}>Product Photo</Text>
            </View>
            <Pressable
              onPress={() => setPreviewImage(null)}
              style={styles.imageModalCloseBtn}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Centered Image Container */}
          <Pressable
            style={styles.imageModalContent}
            onPress={() => setPreviewImage(null)}
          >
            {previewImage && (() => {
              const urls = resolveImageUrls(previewImage);
              const targetUri = urls?.uri || (typeof previewImage === 'string' ? previewImage : previewImage?.localUri || previewImage?.url);
              const targetProxy = urls?.proxyUri || targetUri;
              return (
                <S3Image
                  uri={targetUri}
                  proxyUri={targetProxy}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              );
            })()}
          </Pressable>
        </View>
      </Modal>
    </View>);
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
    orderTypeLockedPill: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    orderTypeLockedText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E40AF',
    },
    orderTypeLockedHint: {
        fontSize: 12,
        color: '#64748B',
        flexBasis: '100%',
        marginTop: 2,
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
    rePickPhotoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#DBEAFE',
        marginLeft: 10,
    },
    rePickPhotoText: {
        fontSize: 13,
        fontWeight: '600',
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
    imageModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.94)',
        justifyContent: 'center',
    },
    imageModalTopBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 14,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
    imageModalTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    imageModalCloseBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255, 255, 255, 0.22)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageModalContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
    },
    fullScreenImage: {
        width: '100%',
        height: '80%',
    },
    dropdownSelector: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 48,
    },
    dropdownSelectorPlaceholder: {
        borderColor: '#E2E8F0',
    },
    dropdownSelectorText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        flex: 1,
        marginRight: 8,
    },
    placeholderText: {
        color: '#94A3B8',
        fontWeight: '400',
    },
    pickerModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    pickerModalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    pickerModalCard: {
        width: '100%',
        maxWidth: 360,
        maxHeight: '75%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    pickerModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        marginBottom: 8,
    },
    pickerModalTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
    },
    pickerModalCloseBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerModalScroll: {
        maxHeight: 380,
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginVertical: 2,
    },
    pickerItemSelected: {
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
    },
    pickerItemText: {
        fontSize: 15,
        color: '#334155',
        fontWeight: '500',
    },
    pickerItemTextSelected: {
        color: Colors.primary,
        fontWeight: '700',
    },
    pickerModalDoneBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
    },
    pickerModalDoneBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
});

