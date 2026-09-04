import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';
import { AppHeader } from '../components/AppHeader';
export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const { shop, updateShopProfile, refreshShopProfile } = useAuth();
    const getInitialAddress = (addr) => {
        if (!addr)
            return '';
        if (typeof addr === 'string')
            return addr;
        const parts = [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean);
        return parts.join(', ');
    };
    const [shopName, setShopName] = useState(shop?.name || '');
    const [ownerName, setOwnerName] = useState(shop?.ownerName || '');
    const [phone, setPhone] = useState(shop?.phone || '');
    const [address, setAddress] = useState(getInitialAddress(shop?.address));
    const [isSaving, setIsSaving] = useState(false);
    // SMS Notification Toggles
    const [smsOrderReceived, setSmsOrderReceived] = useState(shop?.settings?.smsNotificationsEnabled ?? true);
    const [smsRepaired, setSmsRepaired] = useState(shop?.settings?.smsNotificationsEnabled ?? true);
    const [smsDelivered, setSmsDelivered] = useState(shop?.settings?.smsNotificationsEnabled ?? true);
    useEffect(() => {
        if (shop) {
            if (shop.name)
                setShopName(shop.name);
            if (shop.ownerName)
                setOwnerName(shop.ownerName);
            if (shop.phone)
                setPhone(shop.phone);
            if (shop.address)
                setAddress(getInitialAddress(shop.address));
            if (shop.settings?.smsNotificationsEnabled !== undefined) {
                setSmsOrderReceived(shop.settings.smsNotificationsEnabled);
                setSmsRepaired(shop.settings.smsNotificationsEnabled);
                setSmsDelivered(shop.settings.smsNotificationsEnabled);
            }
        }
    }, [shop]);
    const handleSave = async () => {
        if (!shopName.trim()) {
            Alert.alert('Validation Error', 'Shop Business Name cannot be empty.');
            return;
        }
        if (!ownerName.trim()) {
            Alert.alert('Validation Error', 'Owner Name cannot be empty.');
            return;
        }
        if (!phone.trim()) {
            Alert.alert('Validation Error', 'Phone number cannot be empty.');
            return;
        }
        setIsSaving(true);
        try {
            const smsEnabled = smsOrderReceived || smsRepaired || smsDelivered;
            const updated = await updateShopProfile({
                name: shopName.trim(),
                ownerName: ownerName.trim(),
                phone: phone.trim(),
                address: address.trim(),
                settings: {
                    smsNotificationsEnabled: smsEnabled,
                },
            });
            if (updated) {
                Alert.alert('Settings Saved', 'Shop details and SMS preferences updated in database successfully.');
            }
            else {
                Alert.alert('Save Failed', 'Could not save shop details. Please verify your connection.');
            }
        }
        catch (e) {
            Alert.alert('Save Error', 'An error occurred while saving settings to the database.');
        }
        finally {
            setIsSaving(false);
        }
    };
    return (<View style={styles.container}>
      <AppHeader title="Shop Settings"/>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flexOne}>
        <ScrollView style={styles.flexOne} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 20 }]} showsVerticalScrollIndicator={false}>
          {/* SMS Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Automated Customer SMS Notifications</Text>
            <Text style={styles.sectionSubtitle}>
              Configure which customer events automatically trigger instant SMS alerts
            </Text>

            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Order Received SMS</Text>
                  <Text style={styles.switchDesc}>Sent with Job ID & shop phone number upon job card intake</Text>
                </View>
                <Switch value={smsOrderReceived} onValueChange={setSmsOrderReceived} trackColor={{ false: '#CBD5E1', true: Colors.primary }} thumbColor="#FFFFFF"/>
              </View>

              <View style={styles.divider}/>

              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Device Repaired (Ready for Pickup)</Text>
                  <Text style={styles.switchDesc}>Alerts customer their device is ready with outstanding balance</Text>
                </View>
                <Switch value={smsRepaired} onValueChange={setSmsRepaired} trackColor={{ false: '#CBD5E1', true: Colors.primary }} thumbColor="#FFFFFF"/>
              </View>

              <View style={styles.divider}/>

              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Delivered Confirmation SMS</Text>
                  <Text style={styles.switchDesc}>Sent upon final delivery and receipt payment collection</Text>
                </View>
                <Switch value={smsDelivered} onValueChange={setSmsDelivered} trackColor={{ false: '#CBD5E1', true: Colors.primary }} thumbColor="#FFFFFF"/>
              </View>
            </View>
          </View>

          {/* Shop Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop Profile Details</Text>
            <View style={styles.card}>
              <Text style={styles.inputLabel}>Shop Business Name</Text>
              <TextInput style={styles.textInput} value={shopName} onChangeText={setShopName} placeholderTextColor="#94A3B8"/>

              <Text style={styles.inputLabel}>Owner / Primary Manager</Text>
              <TextInput style={styles.textInput} value={ownerName} onChangeText={setOwnerName} placeholderTextColor="#94A3B8"/>

              <Text style={styles.inputLabel}>Shop Contact Phone</Text>
              <TextInput style={styles.textInput} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#94A3B8"/>

              <Text style={styles.inputLabel}>Physical Address (Prints on Invoice)</Text>
              <TextInput style={styles.textInput} value={address} onChangeText={setAddress} placeholderTextColor="#94A3B8"/>
            </View>
          </View>

          {/* Save Button */}
          <Pressable disabled={isSaving} style={({ pressed }) => [styles.saveBtn, { opacity: pressed || isSaving ? 0.88 : 1 }]} onPress={handleSave}>
            {isSaving ? (<ActivityIndicator size="small" color="#FFFFFF"/>) : (<>
                <Ionicons name="save-outline" size={18} color="#FFFFFF"/>
                <Text style={styles.saveBtnText}>Save Preferences</Text>
              </>)}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 4,
        marginLeft: 4,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 10,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    switchInfo: {
        flex: 1,
        marginRight: 12,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 2,
    },
    switchDesc: {
        fontSize: 12,
        color: '#94A3B8',
        lineHeight: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 10,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6,
        marginTop: 10,
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
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});
