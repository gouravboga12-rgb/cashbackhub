import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
  Linking,
  Share,
} from 'react-native';
import {
  Gift,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Eye,
  X,
  Calendar,
  Info,
  Download,
  Share2,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import api from '../services/api';
import BrandLogo from '../components/BrandLogo';
import { showInAppNotification } from '../services/notificationService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MyWithdrawalsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'Pending' | 'Fulfilled' | 'Rejected'>('ALL');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Auto-refresh when user switches back to Activity tab (page-switch refresh without polling)
  useFocusEffect(
    useCallback(() => {
      fetchWithdrawals();
    }, [])
  );

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/withdraw/history');
      if (res.data?.success && Array.isArray(res.data.withdrawals)) {
        setWithdrawals(res.data.withdrawals);
      }
    } catch (e) {
      console.warn('Withdrawals history fallback');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchWithdrawals();
    setRefreshing(false);
  };

  const copyToClipboard = async (text: string, key: string, label: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    setCopiedKey(key);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showInAppNotification('Copied to Clipboard!', `${label} copied successfully.`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const resolveImageUrl = (url: string | undefined | null) => {
    if (!url || typeof url !== 'string' || !url.trim()) return null;
    const clean = url.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:image/')) {
      return clean;
    }
    const base = api.defaults.baseURL?.replace(/\/api\/v1\/?$/, '') || 'https://perkfy.co.in';
    return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
  };

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadImage = async (url: string, refId?: string) => {
    if (!url) return;
    const downloadKey = refId || url;
    setDownloadingId(downloadKey);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    showInAppNotification('Downloading...', 'Saving high-resolution voucher to your phone...');

    try {
      let targetUrl = url;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = resolveImageUrl(targetUrl) || targetUrl;
      }

      const extMatch = targetUrl.match(/\.(png|jpg|jpeg|webp)/i);
      const ext = extMatch ? extMatch[1].toLowerCase() : 'png';
      const cleanRef = (refId || Date.now()).toString().replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanFilename = `Perkfy_Voucher_${cleanRef}.${ext}`;
      const localUri = `${FileSystem.documentDirectory}${cleanFilename}`;

      // 1. Download file to local app storage
      const downloadResult = await FileSystem.downloadAsync(targetUrl, localUri);

      // 2. Open native Android/iOS share & save sheet (requires 0 dangerous permissions)
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          dialogTitle: 'Save Perkfy Voucher Image',
          UTI: `public.image`,
        });
        showInAppNotification('Voucher Ready', 'Choose "Save to device" or save to your files.');
      } else {
        await Linking.openURL(targetUrl);
      }
    } catch (err: any) {
      console.warn('Download error:', err.message);
      showInAppNotification('Opening in Browser', 'Could not save directly, opening in browser...');
      try {
        await Linking.openURL(url);
      } catch (e) {}
    } finally {
      setDownloadingId(null);
    }
  };


  const filtered = withdrawals.filter((w) => {
    if (activeTab === 'Pending') return w.status === 'Pending';
    if (activeTab === 'Fulfilled') return w.status === 'Fulfilled';
    if (activeTab === 'Rejected') return w.status === 'Rejected';
    return true;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B21B6']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner matching web Portal */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerTextWrap}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Gift size={22} color="#4ADE80" />
              <Text style={styles.bannerTitle}>My Activity & Payouts</Text>
            </View>
            <Text style={styles.bannerSubtitle}>
              Access fulfilled digital voucher codes, PINs, and downloaded cards
            </Text>
          </View>
          <TouchableOpacity
            onPress={fetchWithdrawals}
            disabled={loading}
            style={styles.refreshBtn}
            activeOpacity={0.8}
          >
            <RefreshCw size={14} color="#5B21B6" />
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.tabBar}>
          {(['ALL', 'Pending', 'Fulfilled', 'Rejected'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Withdrawals List */}
        {loading && withdrawals.length === 0 ? (
          <ActivityIndicator size="small" color="#5B21B6" style={{ marginTop: 24 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Gift size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No withdrawal requests found</Text>
            <Text style={styles.emptySub}>
              Your gift card redemptions will appear here with full card codes once fulfilled.
            </Text>
          </View>
        ) : (
          filtered.map((item) => {
            const isFulfilled = item.status === 'Fulfilled';
            const isPending = item.status === 'Pending' || !item.status;
            const isRejected = item.status === 'Rejected';
            const f = item.fulfillment || {};
            const cardNumber = f.card_number || item.voucher_code || item.card_number;
            const cardPin = f.pin || item.voucher_pin || item.pin;
            const expiryDate = f.expiry_date || item.expiry_date;
            const instructions = f.instructions || item.instructions;
            const rawImage = f.voucher_image_url || item.voucher_image_url || f.screenshot_url || item.screenshot_url || f.image_url || item.image_url;
            const voucherImage = resolveImageUrl(rawImage);
            const rupeeAmount = item.rupee_value || item.rupees || (item.points ? item.points / 10 : 0);
            const voucherTitle = item.voucher_name || item.brand || 'Gift Voucher';
            const brandLogo = item.voucher_logo || item.logo || item.brand_logo;

            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  isFulfilled && styles.cardFulfilled,
                ]}
              >
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.brandGroup}>
                    <BrandLogo
                      brandName={voucherTitle}
                      image={rawImage}
                      logo={brandLogo}
                      size={42}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.voucherName} numberOfLines={1}>
                        {voucherTitle}
                      </Text>
                      <Text style={styles.refDateText}>
                        Ref:{' '}
                        <Text style={styles.refCode}>
                          {item.reference_id || item.id}
                        </Text>{' '}
                        • {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.amountStatusGroup}>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.rupeeVal}>₹{rupeeAmount}</Text>
                      <Text style={styles.ptsDebited}>
                        -{item.points ? item.points.toLocaleString() : (rupeeAmount * 10).toLocaleString()} Pts
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        isFulfilled && styles.badgeFulfilled,
                        isPending && styles.badgePending,
                        isRejected && styles.badgeRejected,
                      ]}
                    >
                      {isFulfilled ? (
                        <>
                          <CheckCircle2 size={12} color="#166534" />
                          <Text style={[styles.badgeText, { color: '#166534' }]}>Fulfilled</Text>
                        </>
                      ) : isRejected ? (
                        <>
                          <AlertCircle size={12} color="#991B1B" />
                          <Text style={[styles.badgeText, { color: '#991B1B' }]}>Rejected</Text>
                        </>
                      ) : (
                        <>
                          <Clock size={12} color="#92400E" />
                          <Text style={[styles.badgeText, { color: '#92400E' }]}>Pending</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>

                {/* FULFILLED SECTION (1:1 with Web) */}
                {isFulfilled && (
                  <View style={styles.fulfillmentBox}>
                    <View style={styles.fulfillmentTop}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={15} color="#16A34A" />
                        <Text style={styles.readyText}>Ready for Redemption</Text>
                      </View>
                      {f.fulfilled_at && (
                        <Text style={styles.deliveredText}>
                          Delivered: {new Date(f.fulfilled_at).toLocaleDateString()}
                        </Text>
                      )}
                    </View>

                    {/* Voucher Code */}
                    <View style={styles.codeRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.codeLabel}>VOUCHER / CARD CODE</Text>
                        <Text style={styles.codeValue} selectable>
                          {cardNumber || 'Delivered directly'}
                        </Text>
                      </View>
                      {cardNumber ? (
                        <TouchableOpacity
                          onPress={() => copyToClipboard(cardNumber, `${item.id}_code`, 'Voucher Code')}
                          style={[
                            styles.copyBtn,
                            copiedKey === `${item.id}_code` && styles.copyBtnSuccess,
                          ]}
                          activeOpacity={0.8}
                        >
                          {copiedKey === `${item.id}_code` ? (
                            <>
                              <Check size={13} color="#16A34A" />
                              <Text style={styles.copiedText}>Copied</Text>
                            </>
                          ) : (
                            <>
                              <Copy size={13} color="#475569" />
                              <Text style={styles.copyText}>Copy</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    {/* PIN (if available) */}
                    {cardPin ? (
                      <View style={styles.codeRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.codeLabel}>VOUCHER PIN</Text>
                          <Text style={styles.codeValue} selectable>
                            {cardPin}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => copyToClipboard(cardPin, `${item.id}_pin`, 'Voucher PIN')}
                          style={[
                            styles.copyBtn,
                            copiedKey === `${item.id}_pin` && styles.copyBtnSuccess,
                          ]}
                          activeOpacity={0.8}
                        >
                          {copiedKey === `${item.id}_pin` ? (
                            <>
                              <Check size={13} color="#16A34A" />
                              <Text style={styles.copiedText}>Copied</Text>
                            </>
                          ) : (
                            <>
                              <Copy size={13} color="#475569" />
                              <Text style={styles.copyText}>Copy</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    {/* Expiry Date (if available) */}
                    {expiryDate ? (
                      <View style={styles.expiryRow}>
                        <Calendar size={13} color="#6B7280" />
                        <Text style={styles.expiryLabel}>VALID UNTIL / EXPIRY:</Text>
                        <Text style={styles.expiryValue}>
                          {new Date(expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                    ) : null}

                    {/* Instructions (if available) */}
                    {instructions ? (
                      <View style={styles.instructionsBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                          <Info size={12} color="#166534" />
                          <Text style={styles.instructionsLabel}>HOW TO REDEEM</Text>
                        </View>
                        <Text style={styles.instructionsText}>{instructions}</Text>
                      </View>
                    ) : null}

                    {/* Gift Card Photo / Attachment Section (Clean, Spacious Mobile Layout) */}
                    {voucherImage ? (
                      <View style={styles.voucherImageCard}>
                        {/* Top Info Row: Thumbnail + Title + Subtitle */}
                        <TouchableOpacity
                          style={styles.voucherImageTopRow}
                          onPress={() => setPreviewImage(voucherImage)}
                          activeOpacity={0.85}
                        >
                          <Image
                            source={{ uri: voucherImage }}
                            style={styles.voucherThumb}
                            resizeMode="cover"
                          />
                          <View style={styles.voucherTextWrap}>
                            <View style={styles.voucherBadgeRow}>
                              <Text style={styles.voucherImageTitle} numberOfLines={1}>
                                Voucher Card Document
                              </Text>
                              <View style={styles.verifiedDocBadge}>
                                <CheckCircle2 size={10} color="#15803D" />
                                <Text style={styles.verifiedDocText}>Official</Text>
                              </View>
                            </View>
                            <Text style={styles.voucherImageSub} numberOfLines={2}>
                              Official redemption voucher screenshot & code
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {/* Bottom Actions Row: 2 Balanced, Full-Width Action Buttons */}
                        <View style={styles.voucherActionsRow}>
                          <TouchableOpacity
                            onPress={() => setPreviewImage(voucherImage)}
                            style={styles.previewBtn}
                            activeOpacity={0.8}
                          >
                            <Eye size={14} color="#5B21B6" />
                            <Text style={styles.previewBtnText}>Preview</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleDownloadImage(voucherImage, item.reference_id || item.id)}
                            style={styles.downloadBtn}
                            activeOpacity={0.8}
                            disabled={downloadingId === (item.reference_id || item.id || voucherImage)}
                          >
                            {downloadingId === (item.reference_id || item.id || voucherImage) ? (
                              <ActivityIndicator size="small" color="#15803D" />
                            ) : (
                              <>
                                <Download size={14} color="#15803D" />
                                <Text style={styles.downloadBtnText}>Save to Gallery</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : null}
                  </View>
                )}

                {/* PENDING INFO */}
                {isPending && (
                  <View style={styles.pendingInfoBox}>
                    <Text style={styles.pendingInfoText}>
                      Your redemption is being reviewed and processed by the admin team. Once approved, your voucher code and PIN will be displayed right here.
                    </Text>
                  </View>
                )}

                {/* REJECTED INFO */}
                {isRejected && (
                  <View style={styles.rejectedInfoBox}>
                    <Text style={styles.rejectedInfoText}>
                      This withdrawal request was rejected and all points have been refunded to your wallet.
                    </Text>
                    {item.rejection_reason || item.admin_notes ? (
                      <Text style={[styles.rejectedInfoText, { marginTop: 4, fontWeight: '700' }]}>
                        Reason: {item.rejection_reason || item.admin_notes}
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* High-Resolution Image Preview Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Gift size={18} color="#4ADE80" />
                <Text style={styles.modalTitle}>Gift Card Voucher Image</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => previewImage && handleDownloadImage(previewImage)}
                  style={styles.modalDownloadBtn}
                  activeOpacity={0.8}
                  disabled={downloadingId === previewImage}
                >
                  {downloadingId === previewImage ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Download size={14} color="#FFFFFF" />
                      <Text style={styles.modalDownloadText}>Save to Gallery</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPreviewImage(null)} style={styles.closeBtn} activeOpacity={0.8}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                style={styles.previewImg}
                resizeMode="contain"
              />
            )}
            <Text style={styles.modalHint}>Use the voucher code & PIN shown on the Activity card to redeem</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    padding: 14,
    gap: 12,
    paddingBottom: 35,
  },
  bannerCard: {
    backgroundColor: '#5B21B6',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#5B21B6',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  bannerSubtitle: {
    color: '#E9D5FF',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
  },
  refreshBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  refreshBtnText: {
    color: '#5B21B6',
    fontSize: 12,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: '#5B21B6',
    shadowColor: '#5B21B6',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  emptyTitle: {
    color: '#1E1B4B',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
    gap: 12,
  },
  cardFulfilled: {
    borderColor: '#86EFAC',
    backgroundColor: '#FAFFFD',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  voucherName: {
    color: '#1E1B4B',
    fontSize: 14,
    fontWeight: '800',
  },
  refDateText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  refCode: {
    fontFamily: 'monospace',
    color: '#5B21B6',
    fontWeight: '800',
  },
  amountStatusGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rupeeVal: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '800',
  },
  ptsDebited: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeFulfilled: {
    backgroundColor: '#DCFCE7',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  fulfillmentBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  fulfillmentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readyText: {
    color: '#166534',
    fontWeight: '800',
    fontSize: 12,
  },
  deliveredText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '600',
  },
  codeRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  codeValue: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#1E1B4B',
    fontWeight: '800',
    marginTop: 2,
  },
  copyBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  copyBtnSuccess: {
    backgroundColor: '#DCFCE7',
  },
  copyText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  copiedText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  expiryLabel: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  expiryValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  instructionsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#86EFAC',
  },
  instructionsLabel: {
    fontSize: 9,
    color: '#166534',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  instructionsText: {
    fontSize: 11,
    color: '#1F2937',
    lineHeight: 16,
  },
  voucherImageCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 6,
    shadowColor: '#16A34A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  voucherImageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voucherThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  voucherTextWrap: {
    flex: 1,
  },
  voucherBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  voucherImageTitle: {
    fontWeight: '800',
    fontSize: 13,
    color: '#1E1B4B',
  },
  verifiedDocBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedDocText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  voucherImageSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  voucherActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  previewBtnText: {
    color: '#5B21B6',
    fontSize: 12,
    fontWeight: '800',
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  downloadBtnText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
  },
  modalDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  modalDownloadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  pendingInfoBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  pendingInfoText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  rejectedInfoBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  rejectedInfoText: {
    fontSize: 11,
    color: '#991B1B',
    lineHeight: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
  },
  previewImg: {
    width: SCREEN_WIDTH - 64,
    height: Math.min(SCREEN_HEIGHT * 0.55, 380),
    borderRadius: 12,
    backgroundColor: '#0F172A',
  },
  modalHint: {
    color: '#C4B5FD',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
});
