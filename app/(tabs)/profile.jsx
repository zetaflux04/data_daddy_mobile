import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Share,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { resolveImageUrls } from '../../services/api';
import { S3Image } from '../../components/S3Image';
import { Colors } from '../../constants/Colors';
import { QRCodeView } from '../../components/QRCodeView';

const WhatsAppDoodleBg = ({ isDark, style }) => {
  const bgColor = isDark ? '#0B141A' : '#E5E7EB';
  const iconColor = isDark ? '#1C2E38' : '#D1D5DB';

  return (
    <View style={[styles.doodleContainer, { backgroundColor: bgColor }, style]}>
      <Ionicons name="chatbubble-ellipses-outline" size={22} color={iconColor} style={[styles.doodleIcon, { top: 22, left: 24 }]} />
      <Ionicons name="phone-portrait-outline" size={20} color={iconColor} style={[styles.doodleIcon, { top: 18, left: 120 }]} />
      <Ionicons name="star-outline" size={18} color={iconColor} style={[styles.doodleIcon, { top: 22, left: 200 }]} />
      <Ionicons name="cafe-outline" size={20} color={iconColor} style={[styles.doodleIcon, { top: 20, right: 90 }]} />
      <Ionicons name="search-outline" size={18} color={iconColor} style={[styles.doodleIcon, { top: 22, right: 30 }]} />
      <Ionicons name="heart-outline" size={18} color={iconColor} style={[styles.doodleIcon, { top: 80, left: 28 }]} />
      <Ionicons name="construct-outline" size={20} color={iconColor} style={[styles.doodleIcon, { top: 82, left: 140 }]} />
      <Ionicons name="sparkles-outline" size={18} color={iconColor} style={[styles.doodleIcon, { top: 76, right: 130 }]} />
      <Ionicons name="musical-notes-outline" size={20} color={iconColor} style={[styles.doodleIcon, { top: 80, right: 36 }]} />
      <Ionicons name="camera-outline" size={20} color={iconColor} style={[styles.doodleIcon, { bottom: 26, left: 25 }]} />
      <Ionicons name="hardware-chip-outline" size={20} color={iconColor} style={[styles.doodleIcon, { bottom: 22, left: 110 }]} />
      <Ionicons name="happy-outline" size={20} color={iconColor} style={[styles.doodleIcon, { bottom: 25, right: 110 }]} />
      <Ionicons name="shield-checkmark-outline" size={20} color={iconColor} style={[styles.doodleIcon, { bottom: 26, right: 35 }]} />
    </View>
  );
};

class ProfileErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ProfileScreen error caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0B141A' }}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={{ color: '#E9EDEF', fontSize: 18, fontWeight: '700', marginTop: 12 }}>
            Profile Error
          </Text>
          <Text style={{ color: '#8696A0', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
            {this.state.error?.message || 'Failed to render profile'}
          </Text>
          <Pressable
            style={{ marginTop: 20, backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const MOOD_STORAGE_KEY = '@user_profile_mood';

// Clean WhatsApp-style list row component
const WhatsAppListItem = ({
  icon,
  iconType = 'vector', // 'vector' | 'circleBadge'
  iconFamily = 'ionicons', // 'ionicons' | 'materialCommunity'
  badgeText,
  badgeColor,
  title,
  subtitle,
  onPress,
  destructive = false,
  isDark = false,
  showChevron = false,
  rightElement,
}) => {
  const primaryTextColor = destructive
    ? Colors.rose
    : isDark
    ? '#E9EDEF'
    : '#111B21';
  const secondaryTextColor = isDark ? '#8696A0' : '#667781';
  const iconColor = destructive
    ? Colors.rose
    : isDark
    ? '#8696A0'
    : '#54656F';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.listItemRow,
        {
          backgroundColor: pressed
            ? isDark
              ? '#202C33'
              : '#F0F2F5'
            : 'transparent',
        },
      ]}
    >
      <View style={styles.listItemIconContainer}>
        {iconType === 'circleBadge' ? (
          <View
            style={[
              styles.circleBadgeBox,
              { backgroundColor: isDark ? '#202C33' : '#64748B' },
            ]}
          >
            <Text style={styles.circleBadgeText}>{badgeText || '₹'}</Text>
          </View>
        ) : iconFamily === 'materialCommunity' ? (
          <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
        ) : (
          <Ionicons name={icon} size={22} color={iconColor} />
        )}
      </View>

      <View style={styles.listItemTextContainer}>
        <View style={styles.listItemTitleRow}>
          <Text style={[styles.listItemTitle, { color: primaryTextColor }]} numberOfLines={1}>
            {title}
          </Text>
          {badgeColor ? (
            <View style={[styles.inlinePill, { backgroundColor: `${badgeColor}18` }]}>
              <Text style={[styles.inlinePillText, { color: badgeColor }]}>PRO</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <Text style={[styles.listItemSubtitle, { color: secondaryTextColor }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightElement ? (
        rightElement
      ) : showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isDark ? '#667781' : '#A0ABB2'}
          style={styles.chevronIcon}
        />
      ) : null}
    </Pressable>
  );
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { shop, user, logout, uploadShopLogo, refreshShopProfile } = useAuth();
  const { themeMode, setThemeMode, effectiveTheme, isDark, colors } = useTheme();

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] = useState(false);
  const [isSupportModalVisible, setIsSupportModalVisible] = useState(false);
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
  const [tempThemeMode, setTempThemeMode] = useState(themeMode);

  useEffect(() => {
    refreshShopProfile().catch(() => {});
  }, []);

  const handlePickImage = () => {
    Alert.alert('Profile Photo / Shop Logo', 'Upload a profile photo to store in AWS S3', [
      {
        text: 'Take Photo',
        onPress: async () => {
          try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets?.[0]?.uri) {
              await processImageUpload(result.assets[0]);
            }
          } catch (e) {
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
              Alert.alert('Permission Required', 'Photo library access is needed to select a picture.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets?.[0]?.uri) {
              await processImageUpload(result.assets[0]);
            }
          } catch (e) {
            Alert.alert('Gallery Error', e.message || 'Could not pick image');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const processImageUpload = async (asset) => {
    setIsUploadingPhoto(true);
    try {
      const fileName = asset.fileName || asset.uri?.split('/').pop() || `photo_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';
      const s3Url = await uploadShopLogo(asset.uri, mimeType, fileName);
      if (s3Url) {
        Alert.alert('Success', 'Profile photo uploaded to AWS S3 and updated successfully!');
      }
    } catch (e) {
      Alert.alert('Upload Failed', e.message || 'Could not upload profile photo to AWS S3.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out from Metafy?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleShareQr = async () => {
    try {
      const shopName = shop?.name || 'Metafy Shop';
      const shopPhone = shop?.phone || user?.phone || '';
      await Share.share({
        message: `Visit ${shopName} for trusted phone repair & tech services! Phone: +91 ${shopPhone}`,
        title: `${shopName} Digital Contact Card`,
      });
    } catch {
      // ignore
    }
  };

  const handleSupportPress = () => {
    setIsSupportModalVisible(true);
  };

  const displayName = shop?.name || user?.name || 'Shop Profile';
  const qrDataValue = JSON.stringify({
    shopId: shop?._id || user?._id || 'shop-1',
    name: displayName,
    phone: shop?.phone || user?.phone || '',
  });

  const dividerColor = isDark ? '#202C33' : '#E9EDEF';

  return (
    <ProfileErrorBoundary>
      <View style={[styles.rootContainer, { backgroundColor: isDark ? '#0B141A' : '#E5E7EB' }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* ================= HEADER SECTION WITH DOODLE BACKGROUND ================= */}
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) }]}>
          {/* Subtle WhatsApp Vector Doodle Background */}
          <WhatsAppDoodleBg isDark={isDark} />

          {/* Header Action Icons Row (Back, Search, QR Code, Pencil/Edit) */}
          <View style={styles.topActionsRow}>
            <Pressable
              onPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)')}
              style={({ pressed }) => [styles.actionIconBtn, pressed && styles.actionIconBtnPressed]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#E9EDEF' : '#111B21'} />
            </Pressable>

            <View style={styles.rightActionsRow}>
              <Pressable
                onPress={() => router.push('/search')}
                style={({ pressed }) => [styles.actionIconBtn, pressed && styles.actionIconBtnPressed]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Search"
              >
                <Ionicons name="search-outline" size={23} color={isDark ? '#E9EDEF' : '#111B21'} />
              </Pressable>

              <Pressable
                onPress={() => setIsQrModalVisible(true)}
                style={({ pressed }) => [styles.actionIconBtn, pressed && styles.actionIconBtnPressed]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="QR Code"
              >
                <Ionicons name="qr-code-outline" size={23} color={isDark ? '#E9EDEF' : '#111B21'} />
              </Pressable>

              <Pressable
                onPress={handleShareQr}
                style={({ pressed }) => [styles.actionIconBtn, pressed && styles.actionIconBtnPressed]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Share Profile"
              >
                <Ionicons name="share-social-outline" size={23} color={isDark ? '#E9EDEF' : '#111B21'} />
              </Pressable>
            </View>
          </View>

          {/* WhatsApp Centered Circular Profile Avatar */}
          <View style={styles.avatarWrapper}>
            <View
              style={[
                styles.avatarContainer,
                {
                  borderColor: isDark ? '#0B141A' : '#FFFFFF',
                  backgroundColor: Colors.primary,
                },
              ]}
            >
              {(() => {
                if (isUploadingPhoto) {
                  return <ActivityIndicator size="small" color="#FFFFFF" />;
                }
                const urls = shop?.logoUrl && !avatarFailed ? resolveImageUrls(shop.logoUrl) : null;
                if (urls && urls.uri) {
                  return (
                    <S3Image
                      uri={urls.uri}
                      proxyUri={urls.proxyUri}
                      style={styles.avatarImage}
                      resizeMode="cover"
                      onAllFailed={() => setAvatarFailed(true)}
                    />
                  );
                }
                return (
                  <Text style={styles.avatarFallbackLetter}>
                    {displayName ? displayName.charAt(0).toUpperCase() : 'M'}
                  </Text>
                );
              })()}
            </View>

            {/* Camera badge on avatar */}
            <Pressable
              style={({ pressed }) => [
                styles.cameraBadgeBtn,
                {
                  backgroundColor: isDark ? '#202C33' : '#111B21',
                  borderColor: isDark ? '#0B141A' : '#FFFFFF',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={handlePickImage}
              disabled={isUploadingPhoto}
            >
              <Ionicons name="camera" size={13} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* User / Shop Name with dropdown chevron & Subheading */}
          <Pressable
            style={styles.nameDropdownWrapper}
            onPress={() => setIsAccountModalVisible(true)}
            hitSlop={{ top: 6, bottom: 6, left: 10, right: 10 }}
          >
            <View style={styles.nameDropdownRow}>
              <Text style={[styles.userNameText, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                {displayName}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={isDark ? '#8696A0' : '#54656F'}
                style={{ marginLeft: 6, marginTop: 2 }}
              />
            </View>
            <Text style={[styles.userSubText, { color: isDark ? '#8696A0' : '#667781' }]}>
              {shop?.phone || user?.phone ? `+91 ${shop?.phone || user?.phone}` : 'Verified Repair Shop'}
            </Text>
          </Pressable>
        </View>

        {/* ================= WHATSAPP CLEAN CURVED SHEET CONTENT ================= */}
        <View
          style={[
            styles.sheetSurface,
            {
              backgroundColor: isDark ? '#0B141A' : '#FFFFFF',
              borderTopColor: isDark ? '#1F2C34' : 'transparent',
              paddingBottom: Math.max(insets.bottom, 16) + 90,
            },
          ]}
        >
          {/* 1. Payments / Financials (Rupee circular badge) */}
          <WhatsAppListItem
            iconType="circleBadge"
            badgeText="₹"
            title="Finances"
            subtitle="Profit & Loss, collected dues & invoices"
            onPress={() => router.push('/analytics')}
            isDark={isDark}
          />
          <View style={[styles.indentedDivider, { backgroundColor: dividerColor }]} />

          {/* 6. Shop Expenses */}
          <WhatsAppListItem
            icon="wallet-outline"
            title="Shop Expenses"
            subtitle="Parts purchases, rent, salaries & bills"
            onPress={() => router.push('/expenses')}
            isDark={isDark}
          />
          <View style={[styles.indentedDivider, { backgroundColor: dividerColor }]} />

          {/* Analytics */}
          <WhatsAppListItem
            icon="analytics-outline"
            title="Analytics"
            subtitle="Revenue, devices, repair status & trends"
            onPress={() => router.push('/insights')}
            isDark={isDark}
          />
          <View style={[styles.indentedDivider, { backgroundColor: dividerColor }]} />

          {/* Subscriptions */}
          <WhatsAppListItem
            icon="shield-checkmark-outline"
            title="Subscriptions"
            subtitle="Explore premium benefits • PRO Plan Active"
            badgeColor={Colors.emerald}
            onPress={() => setIsSubscriptionModalVisible(true)}
            isDark={isDark}
          />
          <View style={[styles.indentedDivider, { backgroundColor: dividerColor }]} />

          {/* Technicians */}
          <WhatsAppListItem
            icon="people-outline"
            title="Technicians"
            subtitle="Technician logins & team permissions"
            onPress={() => router.push('/staff')}
            isDark={isDark}
          />
          <View style={[styles.indentedDivider, { backgroundColor: dividerColor }]} />

          {/* Technician Guides */}
          <WhatsAppListItem
            icon="construct-outline"
            title="Technician Guides"
            subtitle="Hardware schematics, boardviews & fix videos"
            onPress={() => router.push('/guides')}
            isDark={isDark}
          />
          <View style={[styles.indentedDivider, { backgroundColor: dividerColor }]} />

          {/* Notifications */}
          <WhatsAppListItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Admin announcements & repair alerts"
            onPress={() => router.push('/notifications')}
            isDark={isDark}
          />
          <View style={[styles.indentedDivider, { backgroundColor: dividerColor }]} />

          {/* Settings (includes Account setup) */}
          <WhatsAppListItem
            icon="settings-outline"
            title="Settings"
            subtitle="Shop profile, SMS notifications & invoices"
            onPress={() => router.push('/settings')}
            isDark={isDark}
          />
          <View style={[styles.indentedDivider, { backgroundColor: dividerColor }]} />

          {/* Chats & Support */}
          <WhatsAppListItem
            icon="chatbubble-ellipses-outline"
            title="Chats & Support"
            subtitle="Live repair help, WhatsApp & contact desk"
            onPress={handleSupportPress}
            isDark={isDark}
          />
          <View style={[styles.indentedDivider, { backgroundColor: dividerColor }]} />

          {/* About Us */}
          <WhatsAppListItem
            icon="information-circle-outline"
            title="About Us"
            subtitle="App details, mission & Chipix info"
            onPress={() => router.push('/about')}
            isDark={isDark}
          />
          <View style={[styles.indentedDivider, { backgroundColor: dividerColor }]} />

          {/* Privacy Policy */}
          <WhatsAppListItem
            icon="lock-closed-outline"
            title="Privacy Policy"
            subtitle="Data protection, customer repair privacy"
            onPress={() => router.push('/privacy')}
            isDark={isDark}
          />
          <View style={[styles.indentedDivider, { backgroundColor: dividerColor }]} />

          {/* Terms & Conditions */}
          <WhatsAppListItem
            icon="document-text-outline"
            title="Terms & Conditions"
            subtitle="Usage policy and service agreement"
            onPress={() => router.push('/terms')}
            isDark={isDark}
          />
          <View style={[styles.indentedDivider, { backgroundColor: dividerColor }]} />

          {/* 11. Theme Option */}
          <WhatsAppListItem
            icon="color-palette-outline"
            title="Theme"
            subtitle={
              themeMode === 'system'
                ? 'System default'
                : themeMode === 'dark'
                ? 'Dark'
                : 'Light'
            }
            onPress={() => {
              setTempThemeMode(themeMode);
              setIsThemeModalVisible(true);
            }}
            isDark={isDark}
          />
          <View style={[styles.indentedDivider, { backgroundColor: dividerColor }]} />

          {/* 12. Sign Out */}
          <WhatsAppListItem
            icon="log-out-outline"
            title="Log out"
            subtitle="Sign out from this phone"
            destructive
            onPress={handleLogout}
            isDark={isDark}
          />

          {/* Subtle WhatsApp Footer */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerMetafyText, { color: isDark ? '#667781' : '#8696A0' }]}>
              from
            </Text>
            <Text style={[styles.footerBrandText, { color: isDark ? '#8696A0' : '#54656F' }]}>
              METAFY
            </Text>
            <Text style={[styles.footerVersionText, { color: isDark ? '#667781' : '#A0ABB2' }]}>
              v1.0.0 Enterprise • High Clarity Edition
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ================= MODAL 1: WHATSAPP QR CODE MODAL ================= */}
      <Modal
        visible={isQrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsQrModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsQrModalVisible(false)}
        >
          <Pressable
            style={[
              styles.qrCardModal,
              {
                backgroundColor: isDark ? '#111B21' : '#FFFFFF',
                borderColor: isDark ? '#202C33' : '#E9EDEF',
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.qrModalHeader}>
              <Text style={[styles.qrModalTitle, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                Shop QR Code
              </Text>
              <Pressable
                onPress={() => setIsQrModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={isDark ? '#8696A0' : '#54656F'} />
              </Pressable>
            </View>

            <View style={styles.qrCardBody}>
              <View
                style={[
                  styles.qrAvatarBadge,
                  { backgroundColor: Colors.primary, borderColor: isDark ? '#111B21' : '#FFFFFF' },
                ]}
              >
                <Text style={styles.qrAvatarText}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>

              <Text style={[styles.qrShopName, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                {displayName}
              </Text>
              {(shop?.phone || user?.phone) ? (
                <Text style={[styles.qrHandle, { color: isDark ? '#8696A0' : '#667781' }]}>
                  +91 {shop?.phone || user?.phone}
                </Text>
              ) : null}

              <View
                style={[
                  styles.qrCodeContainer,
                  {
                    backgroundColor: '#FFFFFF',
                    borderColor: isDark ? '#202C33' : '#E2E8F0',
                  },
                ]}
              >
                {isQrModalVisible ? (
                  <QRCodeView
                    value={qrDataValue}
                    size={180}
                    color="#111B21"
                    backgroundColor="#FFFFFF"
                  />
                ) : null}
              </View>

              <Text style={[styles.qrHelperText, { color: isDark ? '#8696A0' : '#667781' }]}>
                Customers or staff can scan this QR code with their camera to verify repairs and digital receipts.
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.shareQrBtn,
                  {
                    backgroundColor: isDark ? '#202C33' : '#F0F2F5',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={handleShareQr}
              >
                <Ionicons
                  name="share-social-outline"
                  size={18}
                  color={isDark ? '#E9EDEF' : '#111B21'}
                />
                <Text style={[styles.shareQrBtnText, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                  Share QR Code
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>



      {/* ================= MODAL 3: ACCOUNT SWITCHER / DETAILS SHEET ================= */}
      <Modal
        visible={isAccountModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAccountModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsAccountModalVisible(false)}
        >
          <Pressable
            style={[
              styles.accountModalSheet,
              {
                backgroundColor: isDark ? '#111B21' : '#FFFFFF',
                borderColor: isDark ? '#202C33' : '#E9EDEF',
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.accountModalHeader}>
              <Text style={[styles.accountModalTitle, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                Shop & Account Info
              </Text>
              <Pressable
                onPress={() => setIsAccountModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={isDark ? '#8696A0' : '#54656F'} />
              </Pressable>
            </View>

            <View style={styles.accountInfoContent}>
              <View style={styles.accountInfoItem}>
                <Text style={[styles.accountInfoLabel, { color: isDark ? '#8696A0' : '#667781' }]}>
                  Shop Name
                </Text>
                <Text style={[styles.accountInfoValue, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                  {shop?.name || 'Metafy Shop'}
                </Text>
              </View>

              <View style={styles.accountInfoItem}>
                <Text style={[styles.accountInfoLabel, { color: isDark ? '#8696A0' : '#667781' }]}>
                  Owner
                </Text>
                <Text style={[styles.accountInfoValue, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                  {shop?.ownerName || user?.name || 'Shop Owner'}
                </Text>
              </View>

              <View style={styles.accountInfoItem}>
                <Text style={[styles.accountInfoLabel, { color: isDark ? '#8696A0' : '#667781' }]}>
                  Phone Number
                </Text>
                <Text style={[styles.accountInfoValue, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                  +91 {shop?.phone || user?.phone || 'Not configured'}
                </Text>
              </View>

              {shop?.address ? (
                <View style={styles.accountInfoItem}>
                  <Text style={[styles.accountInfoLabel, { color: isDark ? '#8696A0' : '#667781' }]}>
                    Location
                  </Text>
                  <Text style={[styles.accountInfoValue, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                    {typeof shop.address === 'string'
                      ? shop.address
                      : [shop.address.street, shop.address.city, shop.address.state]
                          .filter(Boolean)
                          .join(', ')}
                  </Text>
                </View>
              ) : null}

              <Pressable
                style={[
                  styles.editAccountBtn,
                  { backgroundColor: isDark ? '#202C33' : '#F0F2F5' },
                ]}
                onPress={() => {
                  setIsAccountModalVisible(false);
                  router.push('/settings');
                }}
              >
                <Ionicons name="create-outline" size={18} color={isDark ? '#E9EDEF' : '#111B21'} />
                <Text style={[styles.editAccountBtnText, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                  Edit Profile in Settings
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ================= MODAL 4: SUBSCRIPTION DETAILS MODAL ================= */}
      <Modal
        visible={isSubscriptionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSubscriptionModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsSubscriptionModalVisible(false)}
        >
          <Pressable
            style={[
              styles.accountModalSheet,
              {
                backgroundColor: isDark ? '#111B21' : '#FFFFFF',
                borderColor: isDark ? '#202C33' : '#E9EDEF',
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.accountModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="shield-checkmark" size={22} color={Colors.emerald} />
                <Text style={[styles.accountModalTitle, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                  Metafy Enterprise PRO
                </Text>
              </View>
              <Pressable
                onPress={() => setIsSubscriptionModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={isDark ? '#8696A0' : '#54656F'} />
              </Pressable>
            </View>

            <View style={styles.accountInfoContent}>
              <View style={[styles.proStatusBanner, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }]}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.emerald} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.proStatusTitle, { color: Colors.emerald }]}>Plan Active & Verified</Text>
                  <Text style={[styles.proStatusSub, { color: isDark ? '#8696A0' : '#047857' }]}>
                    Enterprise tier active for {displayName}
                  </Text>
                </View>
              </View>

              <View style={styles.proFeatureList}>
                {[
                  'Unlimited Digital Job Cards & Device Intake',
                  'Instant Customer SMS & WhatsApp Notifications',
                  'Profit & Loss Financial Audits & Expense Tracking',
                  'Technician Guides, Boardviews & Schematics',
                  'Thermal Bluetooth Receipts & GST Tax Invoices',
                ].map((feature, idx) => (
                  <View key={idx} style={styles.proFeatureRow}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={Colors.emerald} />
                    <Text style={[styles.proFeatureText, { color: isDark ? '#E9EDEF' : '#334155' }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              <Pressable
                style={[
                  styles.editAccountBtn,
                  { backgroundColor: isDark ? '#202C33' : '#F0F2F5', marginTop: 16 },
                ]}
                onPress={() => setIsSubscriptionModalVisible(false)}
              >
                <Text style={[styles.editAccountBtnText, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                  Close
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ================= MODAL 5: CHATS & SUPPORT MODAL ================= */}
      <Modal
        visible={isSupportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSupportModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsSupportModalVisible(false)}
        >
          <Pressable
            style={[
              styles.accountModalSheet,
              {
                backgroundColor: isDark ? '#111B21' : '#FFFFFF',
                borderColor: isDark ? '#202C33' : '#E9EDEF',
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.accountModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="chatbubbles" size={22} color={isDark ? '#60A5FA' : Colors.primary} />
                <Text style={[styles.accountModalTitle, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                  Chats & Support
                </Text>
              </View>
              <Pressable
                onPress={() => setIsSupportModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={isDark ? '#8696A0' : '#54656F'} />
              </Pressable>
            </View>

            <View style={styles.accountInfoContent}>
              <Text style={[styles.supportIntroText, { color: isDark ? '#8696A0' : '#667781' }]}>
                Need help with repairs, printer setup, or shop billing? Connect directly with our team.
              </Text>

              {/* WhatsApp Option */}
              <Pressable
                style={({ pressed }) => [
                  styles.supportActionRow,
                  {
                    backgroundColor: isDark ? '#202C33' : '#F0F2F5',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => {
                  setIsSupportModalVisible(false);
                  Linking.openURL('https://wa.me/919311431032?text=Hi Metafy Support, I need help with my shop').catch(() => {});
                }}
              >
                <View style={[styles.supportIconCircle, { backgroundColor: '#25D366' }]}>
                  <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.supportActionTitle, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                    WhatsApp Support
                  </Text>
                  <Text style={[styles.supportActionSub, { color: isDark ? '#8696A0' : '#667781' }]}>
                    Chat with an expert (+91 93114 31032)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={isDark ? '#8696A0' : '#A0ABB2'} />
              </Pressable>

              {/* Email Option */}
              <Pressable
                style={({ pressed }) => [
                  styles.supportActionRow,
                  {
                    backgroundColor: isDark ? '#202C33' : '#F0F2F5',
                    opacity: pressed ? 0.8 : 1,
                    marginTop: 10,
                  },
                ]}
                onPress={() => {
                  setIsSupportModalVisible(false);
                  Linking.openURL('mailto:support@chipix.in?subject=Metafy Support Enquiry').catch(() => {});
                }}
              >
                <View style={[styles.supportIconCircle, { backgroundColor: '#2563EB' }]}>
                  <Ionicons name="mail" size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.supportActionTitle, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                    Email Support
                  </Text>
                  <Text style={[styles.supportActionSub, { color: isDark ? '#8696A0' : '#667781' }]}>
                    support@chipix.in
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={isDark ? '#8696A0' : '#A0ABB2'} />
              </Pressable>

              {/* Call Option */}
              <Pressable
                style={({ pressed }) => [
                  styles.supportActionRow,
                  {
                    backgroundColor: isDark ? '#202C33' : '#F0F2F5',
                    opacity: pressed ? 0.8 : 1,
                    marginTop: 10,
                  },
                ]}
                onPress={() => {
                  setIsSupportModalVisible(false);
                  Linking.openURL('tel:+919311431032').catch(() => {});
                }}
              >
                <View style={[styles.supportIconCircle, { backgroundColor: '#10B981' }]}>
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.supportActionTitle, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                    Phone Helpline
                  </Text>
                  <Text style={[styles.supportActionSub, { color: isDark ? '#8696A0' : '#667781' }]}>
                    Mon - Sat (10 AM - 7 PM)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={isDark ? '#8696A0' : '#A0ABB2'} />
              </Pressable>

              <Pressable
                style={[
                  styles.editAccountBtn,
                  { backgroundColor: isDark ? '#202C33' : '#F0F2F5', marginTop: 16 },
                ]}
                onPress={() => setIsSupportModalVisible(false)}
              >
                <Text style={[styles.editAccountBtnText, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ================= MODAL 5: CHOOSE THEME (WHATSAPP POP-UP) ================= */}
      <Modal
        visible={isThemeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsThemeModalVisible(false)}
      >
        <Pressable
          style={styles.themeModalBackdrop}
          onPress={() => setIsThemeModalVisible(false)}
        >
          <Pressable
            style={[
              styles.themeModalCard,
              {
                backgroundColor: isDark ? '#1F2C34' : '#FFFFFF',
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.themeModalTitle, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
              Choose theme
            </Text>

            {[
              { key: 'system', label: 'System default' },
              { key: 'light', label: 'Light' },
              { key: 'dark', label: 'Dark' },
            ].map((option) => {
              const isSelected = tempThemeMode === option.key;
              const themeAccent = isDark ? '#60A5FA' : Colors.primary;
              return (
                <Pressable
                  key={option.key}
                  style={styles.themeRadioRow}
                  onPress={() => setTempThemeMode(option.key)}
                >
                  <View
                    style={[
                      styles.themeRadioOuter,
                      {
                        borderColor: isSelected
                          ? themeAccent
                          : isDark
                          ? '#8696A0'
                          : '#667781',
                      },
                    ]}
                  >
                    {isSelected ? (
                      <View style={[styles.themeRadioInner, { backgroundColor: themeAccent }]} />
                    ) : null}
                  </View>
                  <Text style={[styles.themeRadioLabel, { color: isDark ? '#E9EDEF' : '#111B21' }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}

            <View style={styles.themeModalActions}>
              <Pressable
                onPress={() => setIsThemeModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
              >
                <Text style={[styles.themeModalActionBtnText, { color: isDark ? '#8696A0' : '#64748B' }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setThemeMode(tempThemeMode);
                  setIsThemeModalVisible(false);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
              >
                <Text style={[styles.themeModalActionBtnText, { color: isDark ? '#60A5FA' : Colors.primary }]}>
                  OK
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  </ProfileErrorBoundary>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* HEADER & DOODLE SECTION */
  headerContainer: {
    position: 'relative',
    alignItems: 'center',
    paddingBottom: 28,
    minHeight: 250,
  },
  doodleContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  doodleIcon: {
    position: 'absolute',
    opacity: 0.65,
  },
  topActionsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  actionIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconBtnPressed: {
    opacity: 0.6,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  /* MOOD SPEECH BUBBLE */
  moodBubbleWrapper: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
    zIndex: 10,
  },
  moodBubblePill: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  moodBubbleText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  moodBubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },

  /* CIRCULAR AVATAR */
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 10,
    zIndex: 10,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarFallbackLetter: {
    fontSize: 38,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cameraBadgeBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 3,
  },

  /* USER NAME & SUBHEADING */
  nameDropdownWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    zIndex: 10,
  },
  nameDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userNameText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  userSubText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.1,
    marginTop: 2,
  },

  /* SHEET SURFACE (WHATSAPP CURVED WHITE / DARK CARD) */
  sheetSurface: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: -6,
    flexGrow: 1,
  },

  /* LIST ITEM */
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  listItemIconContainer: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  circleBadgeBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  listItemTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  inlinePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  inlinePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  listItemSubtitle: {
    fontSize: 13,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  indentedDivider: {
    height: 1,
    marginLeft: 74,
  },

  /* THEME MODAL (WHATSAPP "CHOOSE THEME" DIALOG) */
  themeModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  themeModalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 20,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  themeModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  themeRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  themeRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  themeRadioLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
  themeModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
    gap: 24,
  },
  themeModalActionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.2,
  },

  /* FOOTER */
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 4,
  },
  footerMetafyText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  footerBrandText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
    marginBottom: 4,
  },
  footerVersionText: {
    fontSize: 12,
  },

  /* MODALS */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  /* QR CODE MODAL */
  qrCardModal: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    elevation: 10,
  },
  qrModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  qrCardBody: {
    alignItems: 'center',
  },
  qrAvatarBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 10,
  },
  qrAvatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  qrShopName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  qrHandle: {
    fontSize: 13,
    marginBottom: 16,
  },
  qrCodeContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  qrHelperText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  shareQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  shareQrBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },

  /* MOOD MODAL */
  moodModalSheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  moodModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moodModalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  moodInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  moodModalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  clearMoodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearMoodBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveMoodBtn: {
    backgroundColor: '#008069',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  saveMoodBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ACCOUNT MODAL */
  accountModalSheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  accountModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  accountModalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  accountInfoContent: {
    gap: 12,
  },
  accountInfoItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.12)',
    paddingBottom: 8,
  },
  accountInfoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  accountInfoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  editAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  editAccountBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  /* PRO SUBSCRIPTION & SUPPORT MODAL STYLES */
  proStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 4,
  },
  proStatusTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  proStatusSub: {
    fontSize: 12,
    marginTop: 2,
  },
  proFeatureList: {
    gap: 10,
    marginVertical: 8,
  },
  proFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proFeatureText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  supportIntroText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  supportActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
  },
  supportIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportActionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  supportActionSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
