import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from './StatusBadge';
import { S3Image } from './S3Image';
import { resolveImageUrls } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export const JobCardItem = ({ job, onPress }) => {
    const router = useRouter();
    const [imgFailed, setImgFailed] = useState(false);

    let themeColors = null;
    let isDark = false;
    try {
        const theme = useTheme();
        themeColors = theme.colors;
        isDark = theme.isDark;
    } catch {
        themeColors = null;
    }

    const cardBg = themeColors?.card ?? '#FFFFFF';
    const cardBorder = themeColors?.border ?? '#E2E8F0';
    const customerNameColor = themeColors?.text ?? '#0F172A';
    const deviceTextColor = themeColors?.textSecondary ?? '#334155';
    const footerValColor = themeColors?.text ?? '#0F172A';
    const footerLabelColor = themeColors?.textMuted ?? '#94A3B8';
    const footerBorderColor = themeColors?.borderSubtle ?? '#F1F5F9';
    const editBtnBg = isDark ? '#1E293B' : '#F1F5F9';
    const editBtnColor = themeColors?.textSecondary ?? '#475569';
    const fallbackImgBg = isDark ? '#1E293B' : '#F1F5F9';

    const createdDate = job.createdAt
        ? new Date(job.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
        : '';

    const handleWhatsAppPress = (e) => {
        e?.stopPropagation?.();
        if (job.customerSnapshot?.phone) {
            const clean = job.customerSnapshot.phone.replace(/\D/g, '').slice(-10);
            const customerName = job.customerSnapshot.name ? ` ${job.customerSnapshot.name}` : '';
            const orderRef = job.jobId || 'your order';
            const msg = encodeURIComponent(
                `Hello${customerName}, regarding your ${
                    job.orderType === 'accessory' ? 'accessory order' : 'repair job'
                } ${orderRef} at our shop...`
            );
            Linking.openURL(`https://wa.me/91${clean}?text=${msg}`);
        }
    };

    const handleEditPress = (e) => {
        e?.stopPropagation?.();
        router.push({
            pathname: '/job/new',
            params: { editJobId: job._id || job.id },
        });
    };

    const getDeviceStyle = () => {
        if (job.orderType === 'accessory') {
            return {
                bg: isDark ? 'rgba(168, 85, 247, 0.15)' : '#FDF4FF',
                border: isDark ? 'rgba(168, 85, 247, 0.3)' : '#F5D0FE',
                color: isDark ? '#C084FC' : '#A855F7',
                icon: 'cube-outline',
            };
        }
        if (job.deviceType === 'smartwatch') {
            return {
                bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                border: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
                color: isDark ? '#34D399' : '#059669',
                icon: 'watch-outline',
            };
        }
        if (job.deviceType === 'laptop') {
            return {
                bg: isDark ? 'rgba(96, 165, 250, 0.15)' : '#EFF6FF',
                border: isDark ? 'rgba(96, 165, 250, 0.3)' : '#BFDBFE',
                color: isDark ? '#60A5FA' : '#2563EB',
                icon: 'laptop-outline',
            };
        }
        if (job.deviceType === 'tablet') {
            return {
                bg: isDark ? 'rgba(56, 189, 248, 0.15)' : '#F0F9FF',
                border: isDark ? 'rgba(56, 189, 248, 0.3)' : '#BAE6FD',
                color: isDark ? '#38BDF8' : '#0284C7',
                icon: 'tablet-portrait-outline',
            };
        }
        return {
            bg: isDark ? 'rgba(96, 165, 250, 0.15)' : '#EFF6FF',
            border: isDark ? 'rgba(96, 165, 250, 0.3)' : '#BFDBFE',
            color: isDark ? '#60A5FA' : '#2563EB',
            icon: 'phone-portrait-outline',
        };
    };

    const deviceStyle = getDeviceStyle();
    const repairedByName =
        job.repairedBy?.name ||
        (typeof job.assignedTechnicianId === 'object' && job.assignedTechnicianId?.name);

    // Resolve uploaded photo from job creation
    const firstPhoto = Array.isArray(job.photos) && job.photos.length > 0 ? job.photos[0] : null;
    const photoUrls = firstPhoto ? resolveImageUrls(firstPhoto) : null;

    // Device label
    const deviceName =
        job.orderType === 'accessory'
            ? (job.productName || 'Accessory Item')
            : [job.brand, job.model].filter(Boolean).join(' ') || (job.deviceType ? job.deviceType.toUpperCase() : 'Device');

    // Service type description text for footer
    const serviceTypeText =
        job.orderType === 'accessory'
            ? 'Direct Sale'
            : job.problemDescription || 'General Repair';

    const isDelivered = job.status === 'delivered' || job.orderType === 'accessory';
    const dueAmount = job.cost?.due ?? 0;
    const isFullyPaid = isDelivered && dueAmount <= 0;
    const hasDue = dueAmount > 0;
    const totalPaidAmount = job.cost?.final || job.cost?.advancePaid || job.productPrice || 0;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                {
                    backgroundColor: cardBg,
                    borderColor: cardBorder,
                    shadowColor: isDark ? '#000000' : '#0F172A',
                    opacity: pressed ? 0.95 : 1,
                    transform: [{ scale: pressed ? 0.995 : 1 }],
                },
            ]}
        >
            {/* 1. Top Bar: Job ID Pill (Left) & Status Badge + Standalone Edit & WhatsApp Icons (Right) */}
            <View style={styles.topRow}>
                <View style={[styles.jobIdPill, isDark && { backgroundColor: 'rgba(96, 165, 250, 0.18)' }]}>
                    <Text style={[styles.jobIdText, isDark && { color: '#60A5FA' }]}>{job.jobId}</Text>
                </View>

                <View style={styles.topActionsRow}>
                    {job.orderType === 'accessory' ? (
                        <View style={styles.directSaleBadge}>
                            <Ionicons name="checkmark-circle" size={12} color="#059669" />
                            <Text style={styles.directSaleBadgeText}>Direct Sale</Text>
                        </View>
                    ) : (
                        <StatusBadge status={job.status} size="sm" />
                    )}

                    <View style={styles.actionDivider} />

                    {/* Edit Icon Button (repairs: only if not delivered; accessories: always editable) */}
                    {(job.status !== 'delivered' || job.orderType === 'accessory') && (
                        <Pressable
                            hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                            onPress={handleEditPress}
                            style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                        >
                            <Ionicons name="create-outline" size={18} color={isDark ? '#60A5FA' : '#2563EB'} />
                        </Pressable>
                    )}

                    {/* WhatsApp Icon Button (No circular background) */}
                    <Pressable
                        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                        onPress={handleWhatsAppPress}
                        style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                    >
                        <Ionicons name="logo-whatsapp" size={18} color="#16A34A" />
                    </Pressable>
                </View>
            </View>

            {/* 2. Middle Body: Device Icon (Left) + Full Info (Middle) + Uploaded Photo (Right) */}
            <View style={styles.bodyRow}>
                {/* Device Icon Box */}
                <View
                    style={[
                        styles.deviceIconBox,
                        { backgroundColor: deviceStyle.bg, borderColor: deviceStyle.border },
                    ]}
                >
                    <Ionicons name={deviceStyle.icon} size={25} color={deviceStyle.color} />
                </View>

                {/* Middle Info Details */}
                <View style={styles.infoCol}>
                    {/* Customer Name */}
                    <View style={styles.customerRow}>
                        <Ionicons name="person-outline" size={13} color="#64748B" />
                        <Text style={[styles.customerName, { color: customerNameColor }]} numberOfLines={1}>
                            {job.customerSnapshot?.name || 'Customer'}
                        </Text>
                    </View>

                    {/* Customer Phone */}
                    <View style={styles.metaRow}>
                        <Ionicons name="call-outline" size={13} color="#64748B" />
                        <Text style={styles.phoneText} numberOfLines={1}>
                            +91 {job.customerSnapshot?.phone || ''}
                        </Text>
                    </View>

                    {/* Device Name */}
                    <View style={styles.metaRow}>
                        <Ionicons name={deviceStyle.icon} size={13} color="#64748B" />
                        <Text style={[styles.deviceNameText, { color: deviceTextColor }]} numberOfLines={1}>
                            {deviceName}
                        </Text>
                    </View>

                    {/* Repaired by Badge */}
                    {repairedByName ? (
                        <View style={[styles.repairedByChip, isDark && { backgroundColor: '#202C33' }]}>
                            <Ionicons name="construct-outline" size={11} color={isDark ? '#60A5FA' : '#0284C7'} />
                            <Text style={[styles.repairedByText, isDark && { color: '#60A5FA' }]} numberOfLines={2}>
                                Repaired by: {repairedByName}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Right: Uploaded Photo at Job Creation */}
                <View style={[styles.imageContainer, isDark && { backgroundColor: '#0B141A', borderColor: '#202C33' }]}>
                    {photoUrls?.uri && !imgFailed ? (
                        <S3Image
                            uri={photoUrls.uri}
                            proxyUri={photoUrls.proxyUri}
                            style={styles.photoImg}
                            resizeMode="cover"
                            onAllFailed={() => setImgFailed(true)}
                        />
                    ) : (
                        <View style={[styles.fallbackImgBox, { backgroundColor: fallbackImgBg }]}>
                            <Ionicons
                                name={
                                    job.deviceType === 'laptop'
                                        ? 'laptop-outline'
                                        : job.deviceType === 'smartwatch'
                                        ? 'watch-outline'
                                        : job.deviceType === 'tablet'
                                        ? 'tablet-portrait-outline'
                                        : job.orderType === 'accessory'
                                        ? 'cube-outline'
                                        : 'phone-portrait-outline'
                                }
                                size={30}
                                color={isDark ? '#8696A0' : '#94A3B8'}
                            />
                        </View>
                    )}
                </View>
            </View>

            {/* 3. Bottom Footer Row: Sized According to Space Occupied (Due Amount | Job Date | Service Type) */}
            <View style={[styles.bottomFooterRow, { borderTopColor: footerBorderColor }]}>
                {/* 1. Due Amount / Fully Paid (Takes space occupied) */}
                <View style={styles.footerDueBlock}>
                    {isFullyPaid ? (
                        <>
                            <View style={[styles.dueCircleIcon, { backgroundColor: '#16A34A' }]}>
                                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                            </View>
                            <View style={styles.footerTextColAuto}>
                                <Text style={[styles.footerLabel, { color: '#16A34A', fontWeight: '700' }]} numberOfLines={1}>
                                    Fully Paid
                                </Text>
                                <Text style={[styles.footerValDue, { color: '#16A34A' }]} numberOfLines={1}>
                                    ₹{totalPaidAmount.toLocaleString('en-IN')}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={[styles.dueCircleIcon, { backgroundColor: isDark ? '#60A5FA' : '#2563EB' }, hasDue && { backgroundColor: '#EF4444' }]}>
                                <Text style={styles.dueCircleText}>₹</Text>
                            </View>
                            <View style={styles.footerTextColAuto}>
                                <Text style={styles.footerLabel} numberOfLines={1}>
                                    Due Amount
                                </Text>
                                <Text style={[styles.footerValDue, { color: footerValColor }, hasDue && { color: '#EF4444' }]} numberOfLines={1}>
                                    ₹{dueAmount.toLocaleString('en-IN')}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                <View style={[styles.footerDivider, { backgroundColor: footerBorderColor }]} />

                {/* 2. Job Date (Takes space occupied) */}
                <View style={styles.footerDateBlock}>
                    <Ionicons name="calendar-outline" size={15} color="#64748B" style={styles.footerIcon} />
                    <View style={styles.footerTextColAuto}>
                        <Text style={styles.footerLabel} numberOfLines={1}>
                            Job Date
                        </Text>
                        <Text style={[styles.footerValText, { color: footerValColor }]} numberOfLines={1}>
                            {createdDate}
                        </Text>
                    </View>
                </View>

                <View style={[styles.footerDivider, { backgroundColor: footerBorderColor }]} />

                {/* 3. Service Type (Takes remaining space according to content) */}
                <View style={styles.footerServiceBlock}>
                    <Ionicons name="construct-outline" size={15} color="#64748B" style={styles.footerIcon} />
                    <View style={styles.footerTextColFlex}>
                        <Text style={styles.footerLabel} numberOfLines={1} ellipsizeMode="tail">
                            Service Type
                        </Text>
                        <Text style={[styles.footerValText, { color: footerValColor }]} numberOfLines={1} ellipsizeMode="tail">
                            {serviceTypeText}
                        </Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 13,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    // Top Row: Job ID on left, Status + Actions on right
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    jobIdPill: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    jobIdText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#2563EB',
        letterSpacing: 0.2,
    },
    topActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionDivider: {
        width: 1,
        height: 14,
        backgroundColor: '#E2E8F0',
    },
    directSaleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        paddingHorizontal: 8,
        paddingVertical: 2.5,
        borderRadius: 10,
    },
    directSaleBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#059669',
    },
    // Middle Body
    bodyRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    deviceIconBox: {
        width: 46,
        height: 46,
        borderRadius: 13,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginTop: 2,
    },
    infoCol: {
        flex: 1,
        paddingRight: 8,
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        // marginBottom: 2,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: -0.2,
        flex: 1,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 2,
    },
    phoneText: {
        fontSize: 13,
        fontWeight: '400',
        letterSpacing: -0.1,
    },
    deviceNameText: {
        fontSize: 13,
        fontWeight: '400',
        letterSpacing: -0.1,
        flex: 1,
    },
    repairedByChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#EFF6FF',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        marginTop: 6,
        maxWidth: '100%',
    },
    repairedByText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#0284C7',
    },
    // Right Image
    imageContainer: {
        width: 68,
        height: 68,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
    photoImg: {
        width: '100%',
        height: '100%',
    },
    fallbackImgBox: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
    },
    // Bottom Footer - Sized according to space occupied
    bottomFooterRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        overflow: 'hidden',
    },
    footerDueBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        flexShrink: 0,
    },
    footerDateBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        flexShrink: 0,
    },
    footerServiceBlock: {
        flex: 1,
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        overflow: 'hidden',
    },
    footerDivider: {
        width: 1,
        height: 22,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 8,
        flexShrink: 0,
    },
    dueCircleIcon: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    dueCircleText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FFFFFF',
        includeFontPadding: false,
        textAlign: 'center',
    },
    footerIcon: {
        flexShrink: 0,
    },
    footerTextColAuto: {
        justifyContent: 'center',
    },
    footerTextColFlex: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    footerLabel: {
        fontSize: 9.5,
        color: '#94A3B8',
        fontWeight: '600',
        marginBottom: 1,
    },
    footerValDue: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0F172A',
    },
    footerValText: {
        fontSize: 11.5,
        fontWeight: '700',
        color: '#0F172A',
    },
});
