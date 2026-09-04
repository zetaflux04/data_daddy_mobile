import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import Constants from 'expo-constants';

import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { QRCodeView } from '../../components/QRCodeView';
import { numberToWordsINR } from '../../utils/numberToWords';

export default function InvoiceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { shop: authShop, user } = useAuth();

  const [job, setJob] = useState(null);
  const [shop, setShop] = useState(authShop || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const jobData = await api.getJobById(id);
        if (mounted) {
          setJob(jobData);
        }
        if (!shop && jobData?.shopId) {
          if (typeof jobData.shopId === 'object') {
            setShop(jobData.shopId);
          }
        }
      } catch (err) {
        console.error('Failed to load invoice data:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Compute invoice fields
  const invoiceNumber =
    job?.invoice?.invoiceNumber ||
    (job?.jobId ? `INV-${job.jobId.replace('JOB-', '')}` : `INV-${Date.now().toString().slice(-6)}`);

  const rawDate = job?.invoice?.issuedAt || job?.createdAt || Date.now();
  const invoiceDateStr = new Date(rawDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const deliveryDateStr = job?.dates?.deliveredAt
    ? new Date(job.dates.deliveredAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : invoiceDateStr;

  const shopName =
    shop?.name ||
    (typeof job?.shopId === 'object' && job.shopId?.name) ||
    'Repair Solutions';

  const shopOwnerName =
    shop?.ownerName ||
    (typeof job?.shopId === 'object' && job.shopId?.ownerName) ||
    user?.name ||
    'Shop Owner';

  const shopAddressStr =
    typeof shop?.address === 'string'
      ? shop.address
      : [shop?.address?.street, shop?.address?.city, shop?.address?.state, shop?.address?.pincode]
          .filter(Boolean)
          .join(', ') || '123 Market Street, Tech Hub, Mumbai, MH 400001';

  const shopGstin = shop?.gstin || '27AAAAA0000A1Z5';
  const shopPhone = shop?.phone || '98765 43210';

  const customerName = job?.customerSnapshot?.name || 'Rahul Sharma';
  const customerPhone = job?.customerSnapshot?.phone ? `+91 ${job.customerSnapshot.phone}` : '+91 91234 56789';
  const customerAddress =
    typeof job?.customerSnapshot?.address === 'string'
      ? job.customerSnapshot.address
      : [job?.customerSnapshot?.address?.street, job?.customerSnapshot?.address?.city, job?.customerSnapshot?.address?.pincode]
          .filter(Boolean)
          .join(', ') || '45, Sunset Boulevard, Andheri West, Mumbai, MH 400053';

  const ticketRef = job?.jobId || `REP-${Date.now().toString().slice(-4)}`;

  const totalAmount = job?.cost?.final || job?.cost?.estimated || 13000;
  const advancePaid = job?.cost?.advancePaid || 0;
  const balanceDue = job?.cost?.due ?? Math.max(0, totalAmount - advancePaid);

  const amountWords = numberToWordsINR(totalAmount);

  // Generate public invoice URL for QR code
  const getPublicInvoiceUrl = () => {
    const orderId = job?.jobId || id;
    if (process.env.EXPO_PUBLIC_WEBSITE_URL) {
      return `${process.env.EXPO_PUBLIC_WEBSITE_URL.replace(/\/$/, '')}/invoice/${orderId}`;
    }
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
      const hostIp = hostUri.split(':')[0];
      if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
        return `http://${hostIp}:3000/invoice/${orderId}`;
      }
    }
    return `https://datadaddy.in/invoice/${orderId}`;
  };

  const invoiceUrl = getPublicInvoiceUrl();

  // HTML Generator for Print & PDF
  const generateInvoiceHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tax Invoice - ${invoiceNumber}</title>
        <style>
          @page { margin: 15mm; size: A4 portrait; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0F172A;
            margin: 0;
            padding: 20px;
            background: #FFFFFF;
          }
          .card {
            max-width: 750px;
            margin: 0 auto;
            border: 1px solid #E2E8F0;
            border-radius: 16px;
            padding: 28px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
          }
          .brand-title {
            font-size: 24px;
            font-weight: 800;
            color: #0F172A;
            margin: 0 0 6px 0;
          }
          .shop-meta {
            font-size: 13px;
            color: #475569;
            line-height: 1.45;
          }
          .inv-title {
            font-size: 22px;
            font-weight: 900;
            color: #0F172A;
            letter-spacing: 0.5px;
            text-align: right;
            margin-bottom: 12px;
          }
          .qr-box {
            text-align: right;
          }
          .billed-section {
            margin: 20px 0 16px 0;
          }
          .label {
            font-size: 11px;
            font-weight: 700;
            color: #64748B;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .cust-name {
            font-size: 19px;
            font-weight: 800;
            color: #0F172A;
            margin: 0 0 4px 0;
          }
          .meta-grid {
            margin: 16px 0 20px 0;
            font-size: 13px;
            color: #334155;
            line-height: 1.7;
          }
          .meta-grid b {
            color: #0F172A;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background: #F8FAFC;
            text-align: left;
            padding: 10px 14px;
            font-size: 11px;
            font-weight: 800;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #E2E8F0;
          }
          td {
            padding: 14px;
            border-bottom: 1px solid #F1F5F9;
            font-size: 13px;
          }
          .item-title {
            font-weight: 700;
            font-size: 14px;
            color: #0F172A;
            margin-bottom: 3px;
          }
          .item-sub {
            color: #64748B;
            font-size: 12px;
          }
          .calc-table {
            width: 100%;
            margin-top: 14px;
          }
          .calc-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 14px;
          }
          .calc-row.total {
            font-size: 18px;
            font-weight: 800;
            border-top: 1px solid #E2E8F0;
            padding-top: 10px;
            margin-top: 6px;
          }
          .calc-row.advance {
            color: #16A34A;
            font-weight: 600;
          }
          .calc-row.balance {
            color: #DC2626;
            font-size: 18px;
            font-weight: 800;
            padding: 8px 0;
          }
          .words-box {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 10px 14px;
            margin: 16px 0;
            font-size: 13px;
            font-style: italic;
            color: #334155;
          }
          .terms {
            margin-top: 24px;
            font-size: 11px;
            color: #64748B;
            line-height: 1.5;
          }
          .terms-title {
            font-weight: 800;
            color: #475569;
            margin-bottom: 6px;
            text-transform: uppercase;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 36px;
            padding-top: 10px;
          }
          .sig-line {
            width: 180px;
            border-top: 1px solid #94A3B8;
            text-align: center;
            font-size: 10px;
            font-weight: 700;
            color: #64748B;
            padding-top: 6px;
            text-transform: uppercase;
          }
          .watermark {
            font-family: Georgia, serif;
            font-size: 20px;
            font-style: italic;
            color: #0F172A;
            font-weight: 700;
            text-align: center;
            margin-bottom: 4px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div>
              <div class="brand-title">${shopName}</div>
              <div class="shop-meta">
                ${shopAddressStr}<br/>
                <b>GSTIN:</b> ${shopGstin}<br/>
                <b>Ph:</b> +91 ${shopPhone}
              </div>
            </div>
            <div class="qr-box">
              <div class="inv-title">TAX<br/>INVOICE</div>
            </div>
          </div>

          <div class="billed-section">
            <div class="label">BILLED TO</div>
            <div class="cust-name">${customerName}</div>
            <div class="shop-meta">
              ${customerAddress}<br/>
              ${customerPhone}
            </div>
          </div>

          <div class="meta-grid">
            <div><b>INVOICE NO:</b> ${invoiceNumber}</div>
            <div><b>DATE:</b> ${invoiceDateStr}</div>
            <div><b>TICKET REF:</b> ${ticketRef}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>DEVICE & ISSUE</th>
                <th style="text-align: right;">DELIVERY DATE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="item-title">${job?.brand || 'Apple'} ${job?.model || 'iPhone 13 Pro'}</div>
                  <div class="item-sub">${job?.problemDescription || 'Screen Replacement (OLED OEM) + Water Sealant'}</div>
                  ${job?.serialOrImei ? `<div class="item-sub">IMEI: ${job.serialOrImei}</div>` : ''}
                </td>
                <td style="text-align: right; color: #475569; font-weight: 600;">
                  ${deliveryDateStr}
                </td>
              </tr>
              ${
                job?.warranty?.hasWarranty
                  ? `<tr>
                      <td>
                        <div class="item-title">Warranty Coverage Guarantee</div>
                        <div class="item-sub">${job.warranty.period} ${job.warranty.unit} parts & service warranty</div>
                      </td>
                      <td style="text-align: right; color: #16A34A; font-weight: 700;">Included</td>
                    </tr>`
                  : ''
              }
            </tbody>
          </table>

          <div class="calc-table">
            <div class="calc-row">
              <span style="color: #64748B;">Subtotal</span>
              <span style="font-weight: 600;">₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="calc-row">
              <span style="color: #64748B;">CGST + SGST (18%)</span>
              <span style="font-weight: 600;">Included</span>
            </div>
            <div class="calc-row total">
              <span>Total</span>
              <span>₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="calc-row advance">
              <span>Amount Paid (Advance)</span>
              <span>- ₹${advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="calc-row balance">
              <span>Balance Due</span>
              <span>₹${balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div class="label" style="margin-top: 14px;">AMOUNT IN WORDS</div>
          <div class="words-box">${amountWords}</div>

          <div class="terms">
            <div class="terms-title">TERMS & CONDITIONS</div>
            1. All repairs come with a 30-day warranty on replaced parts unless specified otherwise.<br/>
            2. Physical or liquid damage after repair voids all warranty claims.<br/>
            3. Devices not collected within 45 days of repair completion may be recycled or sold to recover costs.<br/>
            4. This is a computer-generated invoice and does not require a physical signature.
          </div>

          <div class="signatures">
            <div class="sig-line">CUSTOMER SIGNATURE</div>
            <div>
              <div class="watermark">${shopOwnerName}</div>
              <div class="sig-line">AUTHORIZED SIGNATORY<br/><span style="font-size: 8px; font-weight: normal; text-transform: none;">(${shopOwnerName})</span></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Actions
  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const html = generateInvoiceHtml();
      await Print.printAsync({ html });
    } catch (err) {
      console.error('Print error:', err);
      Alert.alert('Print Error', 'Could not open print preview.');
    } finally {
      setIsPrinting(false);
    }
  };

  const generatePdfFile = async () => {
    const html = generateInvoiceHtml();
    const { uri, base64 } = await Print.printToFileAsync({ html, base64: true });

    // On Android (especially in Expo Go), Print.printToFileAsync writes to unscoped cache
    // which ExpoSharing cannot read ("Not allowed to read file under given URL").
    // We write/copy the file to FileSystem.documentDirectory (or cacheDirectory) so it is
    // within the scoped permissions of the app, and has a clean filename.
    const cleanNum = (invoiceNumber || 'receipt').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `Invoice-${cleanNum}.pdf`;
    const targetDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;

    if (targetDir) {
      const targetUri = `${targetDir}${fileName}`;
      if (base64) {
        await FileSystem.writeAsStringAsync(targetUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return targetUri;
      } else {
        await FileSystem.copyAsync({ from: uri, to: targetUri });
        return targetUri;
      }
    }
    return uri;
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const pdfUri = await generatePdfFile();

      // On Android, if StorageAccessFramework is available, allow direct saving to a folder
      if (Platform.OS === 'android' && FileSystem.StorageAccessFramework) {
        try {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const cleanNum = (invoiceNumber || 'receipt').replace(/[^a-zA-Z0-9_-]/g, '_');
            const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              `Invoice-${cleanNum}.pdf`,
              'application/pdf'
            );
            const base64Content = await FileSystem.readAsStringAsync(pdfUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            await FileSystem.writeAsStringAsync(fileUri, base64Content, {
              encoding: FileSystem.EncodingType.Base64,
            });
            Alert.alert('PDF Downloaded', 'Invoice PDF has been successfully saved to your selected folder.');
            return;
          }
        } catch (safErr) {
          console.log('SAF error or user cancelled:', safErr);
        }
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Download Invoice #${invoiceNumber}`,
        });
      } else {
        Alert.alert('PDF Generated', `Invoice PDF saved to:\n${pdfUri}`);
      }
    } catch (err) {
      console.error('PDF error:', err);
      Alert.alert('Download Error', `Could not download PDF: ${err.message || err}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSharePdf = async () => {
    try {
      setIsSharing(true);
      const pdfUri = await generatePdfFile();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Share Invoice PDF #${invoiceNumber}`,
        });
      } else {
        await Share.share({
          title: `Invoice ${invoiceNumber}`,
          message: `Tax Invoice #${invoiceNumber} for ${customerName}\nShop: ${shopName}\nTotal: ₹${totalAmount.toLocaleString('en-IN')}\nBalance Due: ₹${balanceDue.toLocaleString('en-IN')}\n\nView digital invoice & receipt:\n${invoiceUrl}`,
          url: invoiceUrl,
        });
      }
    } catch (err) {
      console.error('Share error:', err);
      Alert.alert('Share Error', `Could not share PDF: ${err.message || err}`);
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Loading Tax Invoice...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 16) + 8, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Clean top navigation row without brand navbar */}
        <View style={styles.topNavRow}>
          <Pressable
            style={({ pressed }) => [styles.backLink, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={16} color="#334155" />
            <Text style={styles.backLinkText}>BACK TO REPAIRS</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.topCloseBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
            hitSlop={10}
          >
            <Ionicons name="close" size={20} color="#475569" />
          </Pressable>
        </View>

        {/* The White Invoice Card */}
        <View style={styles.invoiceCard}>
          {/* Card Header: Shop info on left (NO DataDaddy logo), TAX INVOICE + QR on right */}
          <View style={styles.cardHeader}>
            <View style={styles.shopInfoCol}>
              <Text style={styles.cardShopTitle}>{shopName}</Text>
              <Text style={styles.shopAddress}>{shopAddressStr}</Text>
              <Text style={styles.shopGstin}>GSTIN: {shopGstin}</Text>
              <Text style={styles.shopPhone}>Ph: +91 {shopPhone}</Text>
            </View>

            <View style={styles.taxInvoiceCol}>
              <Text style={styles.taxInvoiceTitle}>TAX</Text>
              <Text style={styles.taxInvoiceTitle}>INVOICE</Text>

              {/* QR Code Container */}
              <View style={styles.qrCodeWrapper}>
                <QRCodeView value={invoiceUrl} size={84} />
              </View>
            </View>
          </View>

          {/* BILLED TO Section */}
          <View style={styles.billedSection}>
            <Text style={styles.sectionLabel}>BILLED TO</Text>
            <Text style={styles.customerName}>{customerName}</Text>
            <Text style={styles.customerAddress}>{customerAddress}</Text>
            <Text style={styles.customerPhone}>{customerPhone}</Text>
          </View>

          {/* Invoice Metadata */}
          <View style={styles.metaBlock}>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>INVOICE NO:  </Text>
              <Text style={styles.metaVal}>{invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>DATE:  </Text>
              <Text style={styles.metaVal}>{invoiceDateStr}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>TICKET REF:  </Text>
              <Text style={styles.metaVal}>{ticketRef}</Text>
            </View>
          </View>

          {/* Device & Issue Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderColLeft}>DEVICE & ISSUE</Text>
            <Text style={styles.tableHeaderColRight}>DELIVERY DATE</Text>
          </View>

          {/* Row 1: Device & Primary Issue */}
          <View style={styles.tableRow}>
            <View style={styles.tableRowLeft}>
              <Text style={styles.deviceTitle}>
                {job?.brand || 'Apple'} {job?.model || 'iPhone 13 Pro'}
              </Text>
              <Text style={styles.issueSubtitle}>
                {job?.problemDescription || 'Screen Replacement (OLED OEM) + Water Sealant'}
              </Text>
              {job?.serialOrImei && (
                <Text style={styles.imeiText}>IMEI: {job.serialOrImei}</Text>
              )}
            </View>
            <Text style={styles.deliveryDateText}>{deliveryDateStr}</Text>
          </View>

          {/* Row 2: Secondary / Diagnostic Service */}
          <View style={styles.tableRow}>
            <View style={styles.tableRowLeft}>
              <Text style={styles.deviceTitle}>Diagnostic & Inspection</Text>
              <Text style={styles.issueSubtitle}>
                Motherboard trace checking & component testing
              </Text>
            </View>
            <Text style={styles.deliveryDateText}>{deliveryDateStr}</Text>
          </View>

          {/* Financial Breakdown */}
          <View style={styles.financialsContainer}>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Subtotal</Text>
              <Text style={styles.calcValue}>
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>CGST + SGST (18%)</Text>
              <Text style={styles.calcValue}>Included</Text>
            </View>

            <View style={styles.thinDivider} />

            <View style={styles.calcRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.advanceLabel}>Amount Paid (Advance)</Text>
              <Text style={styles.advanceValue}>
                - ₹{advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={[styles.calcRow, styles.balanceRow]}>
              <Text style={styles.balanceLabel}>Balance Due</Text>
              <Text style={styles.balanceValue}>
                ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Amount In Words */}
          <View style={styles.amountWordsSection}>
            <Text style={styles.sectionLabel}>AMOUNT IN WORDS</Text>
            <View style={styles.wordsPill}>
              <Text style={styles.wordsText}>{amountWords}</Text>
            </View>
          </View>

          {/* Terms & Conditions */}
          <View style={styles.termsSection}>
            <Text style={styles.termsHeading}>TERMS & CONDITIONS</Text>
            <Text style={styles.termItem}>
              1. All repairs come with a 30-day warranty on replaced parts unless specified otherwise.
            </Text>
            <Text style={styles.termItem}>
              2. Physical or liquid damage after repair voids all warranty claims.
            </Text>
            <Text style={styles.termItem}>
              3. Devices not collected within 45 days of repair completion may be recycled or sold to recover costs.
            </Text>
            <Text style={styles.termItem}>
              4. This is a computer-generated invoice and does not require a physical signature.
            </Text>
          </View>

          {/* Signatures Section with Shop Owner Digital Signature */}
          <View style={styles.signaturesRow}>
            <View style={styles.sigCol}>
              <View style={styles.sigUnderline} />
              <Text style={styles.sigLabel}>CUSTOMER SIGNATURE</Text>
            </View>

            <View style={styles.sigCol}>
              <Text style={styles.ownerSignatureText}>{shopOwnerName}</Text>
              <View style={styles.sigUnderline} />
              <Text style={styles.sigLabel}>AUTHORIZED SIGNATORY</Text>
              <Text style={styles.sigOwnerSub}>({shopOwnerName})</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
          onPress={handlePrint}
          disabled={isPrinting || isSharing || isDownloading}
        >
          {isPrinting ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <>
              <Ionicons name="print-outline" size={22} color="#0F172A" />
              <Text style={styles.actionBtnText}>PRINT</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
          onPress={handleSharePdf}
          disabled={isPrinting || isSharing || isDownloading}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <>
              <Ionicons name="share-social-outline" size={22} color="#0F172A" />
              <Text style={styles.actionBtnText}>SHARE PDF</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.pdfBtn, pressed && { opacity: 0.85 }]}
          onPress={handleDownloadPdf}
          disabled={isPrinting || isSharing || isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              <Text style={styles.pdfBtnText}>DOWNLOAD PDF</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },

  /* Scroll Area */
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
  },

  /* Top Nav Row */
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  backLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  topCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* The White Invoice Card */
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  /* Card Header */
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  shopInfoCol: {
    flex: 1,
    paddingRight: 12,
  },
  cardShopTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  shopAddress: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
    marginBottom: 4,
  },
  shopGstin: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: 2,
  },
  shopPhone: {
    fontSize: 12,
    color: '#334155',
  },

  taxInvoiceCol: {
    alignItems: 'flex-end',
  },
  taxInvoiceTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  qrCodeWrapper: {
    marginTop: 10,
  },

  /* Billed Section */
  billedSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 3,
  },
  customerPhone: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },

  /* Metadata */
  metaBlock: {
    marginBottom: 18,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaKey: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Table */
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  tableHeaderColLeft: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  tableHeaderColRight: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRowLeft: {
    flex: 1,
    paddingRight: 10,
  },
  deviceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  issueSubtitle: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  imeiText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  deliveryDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },

  /* Financials */
  financialsContainer: {
    marginTop: 14,
    gap: 8,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    fontSize: 13,
    color: '#475569',
  },
  calcValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  thinDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  advanceLabel: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '600',
  },
  advanceValue: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '700',
  },
  balanceRow: {
    marginTop: 4,
  },
  balanceLabel: {
    fontSize: 17,
    fontWeight: '900',
    color: '#DC2626',
  },
  balanceValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#DC2626',
  },

  /* Amount in Words */
  amountWordsSection: {
    marginTop: 18,
  },
  wordsPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 6,
  },
  wordsText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#334155',
    fontWeight: '500',
  },

  /* Terms */
  termsSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  termsHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  termItem: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    marginBottom: 4,
  },

  /* Signatures */
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 30,
    paddingTop: 8,
  },
  sigCol: {
    width: 145,
    alignItems: 'center',
  },
  ownerSignatureText: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontStyle: 'italic',
    color: '#0F172A',
    marginBottom: 4,
    fontWeight: '700',
    textAlign: 'center',
  },
  sigUnderline: {
    width: '100%',
    height: 1,
    backgroundColor: '#94A3B8',
    marginBottom: 6,
  },
  sigLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  sigOwnerSub: {
    fontSize: 8,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },

  /* Bottom Action Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 70,
    paddingVertical: 4,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  pdfBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 125,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  pdfBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
