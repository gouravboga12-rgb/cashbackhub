import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import {
  Wallet as WalletIcon,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Check
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { playNotificationAudio, showInAppNotification, triggerPushNotification } from '../services/notificationService';
import { COLORS } from '../theme';

export default function WalletScreen({ navigation }: any) {
  const { wallet, refreshWallet } = useAuth();

  const [activeTab, setActiveTab] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showConverted, setShowConverted] = useState(false);

  // Dynamic Vouchers list synchronized with Backend Admin Settings
  const defaultVouchers = [
    { id: 'vch_phonepe', name: 'PhonePe Gift Voucher', provider: 'PhonePe', minPoints: 100, color: '#5F259F' },
    { id: 'vch_flipkart', name: 'Flipkart Voucher', provider: 'Flipkart', minPoints: 100, color: '#2874F0' },
    { id: 'vch_amazon', name: 'Amazon Pay Gift Card', provider: 'Amazon', minPoints: 100, color: '#FF9900' },
    { id: 'vch_gplay', name: 'Google Play Gift Voucher', provider: 'Google Play', minPoints: 100, color: '#01875F' },
  ];

  const [vouchers, setVouchers] = useState(defaultVouchers);
  const [selectedBrand, setSelectedBrand] = useState(defaultVouchers[0]);
  const [platformRatio, setPlatformRatio] = useState<number | null>(null);
  const [platformMinRupees, setPlatformMinRupees] = useState<number | null>(null);

  const [withdrawRupees, setWithdrawRupees] = useState('100');
  const [accountDetails, setAccountDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [successWithdrawal, setSuccessWithdrawal] = useState<any | null>(null);

  const ratio = platformRatio || wallet?.points_to_rupee_ratio || 10;
  const minRupees = platformMinRupees || wallet?.min_withdrawal_rupees || 100;
  const availablePoints = wallet?.available_points ?? 0;
  const availableRupees = (availablePoints / ratio).toFixed(2);

  const numRupees = parseFloat(withdrawRupees) || 0;
  const pointsRequired = Math.round(numRupees * ratio);
  const minPoints = Math.round(minRupees * ratio);

  useEffect(() => {
    fetchTransactions();
    fetchPlatformSettings();
    fetchVouchers();
  }, []);

  const fetchPlatformSettings = async () => {
    try {
      const res = await api.get('/platform-settings');
      if (res.data?.platform_settings) {
        const ps = res.data.platform_settings;
        if (ps.points_to_rupee_ratio) setPlatformRatio(Number(ps.points_to_rupee_ratio));
        if (ps.min_withdrawal_rupees) setPlatformMinRupees(Number(ps.min_withdrawal_rupees));
      }
    } catch (e) {}
  };

  const fetchVouchers = async () => {
    try {
      const res = await api.get('/withdraw/vouchers');
      if (res.data?.success && Array.isArray(res.data.vouchers) && res.data.vouchers.length > 0) {
        const mapped = res.data.vouchers.map((v: any) => ({
          id: v.id,
          name: v.name || v.provider,
          provider: v.provider || v.name,
          minPoints: v.minimum_points || v.minPoints || 100,
          color: v.color || (v.provider?.toLowerCase().includes('phonepe') ? '#5F259F' : v.provider?.toLowerCase().includes('flipkart') ? '#2874F0' : v.provider?.toLowerCase().includes('amazon') ? '#FF9900' : '#01875F'),
        }));
        setVouchers(mapped);
        setSelectedBrand(mapped[0]);
        if (res.data.points_to_rupee_ratio) setPlatformRatio(Number(res.data.points_to_rupee_ratio));
        if (res.data.min_withdrawal_rupees) setPlatformMinRupees(Number(res.data.min_withdrawal_rupees));
      }
    } catch (e) {}
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wallet/transactions');
      if (res.data?.success && Array.isArray(res.data.transactions)) {
        setTransactions(res.data.transactions);
      }
    } catch (e) {
      console.warn('Transactions fallback');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshWallet();
    await fetchTransactions();
    await fetchPlatformSettings();
    await fetchVouchers();
    setRefreshing(false);
  };

  const handleWithdrawSubmit = async () => {
    setFeedbackError(null);

    if (!selectedBrand) {
      setFeedbackError('Please select a Gift Card Brand.');
      return;
    }

    if (!numRupees || numRupees < minRupees) {
      setFeedbackError(`Minimum withdrawal amount is ₹${minRupees.toFixed(2)} (${minPoints} Points).`);
      return;
    }

    if (pointsRequired > availablePoints) {
      const neededPoints = pointsRequired - availablePoints;
      const neededRupees = (neededPoints / ratio).toFixed(2);
      setFeedbackError(`Insufficient Points: You have ${availablePoints} Pts (₹${availableRupees}). You need ${neededPoints} more Pts (₹${neededRupees}).`);
      return;
    }

    if (!accountDetails.trim()) {
      setFeedbackError('Please enter your UPI ID or voucher delivery email.');
      return;
    }

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await api.post('/withdraw/request', {
        voucher_id: selectedBrand.id,
        voucher_name: selectedBrand.name,
        brand: selectedBrand.name,
        points: pointsRequired,
        rupee_value: numRupees,
        denomination: numRupees,
        account_details: accountDetails.trim()
      });

      if (res.data && res.data.success) {
        setSuccessWithdrawal({
          brand: selectedBrand.name,
          amount: numRupees,
          points: pointsRequired,
          referenceId: res.data.withdrawal?.reference_id || `WD-${Date.now()}`
        });
        setWithdrawRupees('');
        setAccountDetails('');
        setFeedbackError(null);
        await refreshWallet();
        await fetchTransactions();
        playNotificationAudio().catch(() => {});
        showInAppNotification('Withdrawal Submitted! 🎉', `₹${numRupees} ${selectedBrand.name} placed.`);
        triggerPushNotification('Withdrawal Placed', `Your ₹${numRupees} payout is pending verification.`);
      } else {
        setFeedbackError(res.data?.message || 'Withdrawal request failed.');
      }
    } catch (err: any) {
      setFeedbackError(err.response?.data?.message || 'Failed to submit withdrawal request.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'CREDIT') return tx.type === 'CREDIT' || (tx.points && tx.points > 0);
    if (activeTab === 'DEBIT') return tx.type === 'DEBIT' || (tx.points && tx.points < 0);
    return true;
  });

  const rupeePresets = [10, 20, 50, 100, 250, 500];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B21B6']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. PREMIUM WALLET HERO CARD (1:1 with Web) */}
        <LinearGradient
          colors={['#4C1D95', '#5B21B6', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroSubHeader}>AVAILABLE BALANCE</Text>
              <View style={styles.heroBalanceRow}>
                <Text style={styles.heroPointsText}>{availablePoints.toLocaleString()}</Text>
                <Text style={styles.heroPointsUnit}>Pts</Text>
              </View>
            </View>

            {/* Convert to ₹ Button / Converted Display */}
            {!showConverted ? (
              <TouchableOpacity
                onPress={() => setShowConverted(true)}
                activeOpacity={0.85}
                style={styles.convertBtn}
              >
                <RefreshCw size={13} color="#FFFFFF" />
                <Text style={styles.convertBtnText}>Convert to ₹</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setShowConverted(false)}
                activeOpacity={0.85}
                style={styles.convertedBox}
              >
                <Text style={styles.convertedLabel}>CONVERTED RUPEES</Text>
                <Text style={styles.convertedValue}>₹{availableRupees}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom Row */}
          <View style={styles.heroBottomRow}>
            <View style={styles.rateRow}>
              <Sparkles size={13} color="#4ADE80" />
              <Text style={styles.rateText}>
                {ratio} Points = ₹1.00 (Min: ₹{minRupees})
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Activity')}
              style={styles.myWdBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.myWdBtnText}>My Withdrawals</Text>
              <ArrowRight size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 2. DEDICATED GIFT CARD WITHDRAWAL SECTION (1:1 with Web) */}
        <View style={styles.cardWhite}>
          {successWithdrawal ? (
            <View style={styles.successBanner}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={30} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Withdrawal Request Submitted! 🎉</Text>
              <Text style={styles.successDesc}>
                Your request for ₹{successWithdrawal.amount.toFixed(2)} {successWithdrawal.brand} has been placed.
              </Text>
              <Text style={styles.successRef}>
                Ref ID: <Text style={{ fontFamily: 'monospace', fontWeight: '800' }}>{successWithdrawal.referenceId}</Text>
              </Text>

              <View style={styles.successActionsRow}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Activity')}
                  style={styles.trackBtn}
                >
                  <Text style={styles.trackBtnText}>Track in My Withdrawals</Text>
                  <ArrowRight size={14} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSuccessWithdrawal(null)}
                  style={styles.anotherBtn}
                >
                  <Text style={styles.anotherBtnText}>Make Another</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.sectionTitleRow}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Gift size={18} color="#5B21B6" />
                    <Text style={styles.sectionHeading}>Gift Card Withdrawal</Text>
                  </View>
                  <Text style={styles.sectionSubtitle}>
                    Withdraw points as instant digital vouchers ({ratio} Pts = ₹1.00)
                  </Text>
                </View>
              </View>

              {/* Step 1: Select Brand */}
              <Text style={styles.stepLabel}>1. Select Gift Card Brand:</Text>
              <View style={styles.brandsGrid}>
                {vouchers.map((v) => {
                  const isSelected = selectedBrand.id === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      onPress={() => {
                        setSelectedBrand(v);
                        setFeedbackError(null);
                      }}
                      style={[
                        styles.brandItem,
                        isSelected && styles.brandItemActive
                      ]}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.brandDot, { backgroundColor: v.color }]}>
                        <Text style={styles.brandInitial}>{v.provider.charAt(0)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.brandNameText, isSelected && { color: '#5B21B6', fontWeight: '800' }]}>
                          {v.provider}
                        </Text>
                        <Text style={styles.brandMinText}>Min {v.minPoints} pts</Text>
                      </View>
                      {isSelected && <Check size={16} color="#5B21B6" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Step 2: Withdrawal Amount */}
              <Text style={[styles.stepLabel, { marginTop: 16 }]}>2. Withdrawal Amount in Rupees (₹):</Text>
              
              {/* Presets */}
              <View style={styles.presetRow}>
                {rupeePresets.map((amt) => {
                  const isPresetActive = numRupees === amt;
                  return (
                    <TouchableOpacity
                      key={amt}
                      onPress={() => setWithdrawRupees(amt.toString())}
                      style={[styles.presetPill, isPresetActive && styles.presetPillActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.presetText, isPresetActive && styles.presetTextActive]}>
                        ₹{amt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Input Box */}
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  value={withdrawRupees}
                  onChangeText={(val) => {
                    setWithdrawRupees(val);
                    setFeedbackError(null);
                  }}
                  keyboardType="numeric"
                  placeholder="Amount in Rupees"
                  placeholderTextColor="#94A3B8"
                  style={styles.textInput}
                />
              </View>

              {/* Calculation Banner */}
              <View style={styles.calcBanner}>
                <Text style={styles.calcText}>
                  Points Required: <Text style={{ fontWeight: '900', color: '#1E1B4B' }}>{pointsRequired.toLocaleString()} Pts</Text>
                </Text>
                {pointsRequired > availablePoints ? (
                  <Text style={styles.insufficientText}>Insufficient points (Have: {availablePoints})</Text>
                ) : (
                  <Text style={styles.sufficientText}>✓ Sufficient points</Text>
                )}
              </View>

              {/* Delivery Details */}
              <Text style={[styles.stepLabel, { marginTop: 14 }]}>3. UPI ID or Delivery Email:</Text>
              <TextInput
                value={accountDetails}
                onChangeText={setAccountDetails}
                placeholder="e.g. yourname@okaxis or email@gmail.com"
                placeholderTextColor="#94A3B8"
                style={styles.deliveryInput}
              />

              {feedbackError && (
                <View style={styles.errorBanner}>
                  <AlertCircle size={15} color="#DC2626" />
                  <Text style={styles.errorText}>{feedbackError}</Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleWithdrawSubmit}
                disabled={submitting || pointsRequired > availablePoints || numRupees < minRupees}
                activeOpacity={0.85}
                style={{ marginTop: 14 }}
              >
                <LinearGradient
                  colors={
                    pointsRequired > availablePoints || numRupees < minRupees
                      ? ['#CBD5E1', '#94A3B8']
                      : ['#16A34A', '#15803D']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitBtn}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitBtnText}>Submit Withdrawal Request</Text>
                      <ArrowUpRight size={17} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 3. TRANSACTION HISTORY SECTION (1:1 with Web) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshIconBtn}>
            <RefreshCw size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabBar}>
          {(['ALL', 'CREDIT', 'DEBIT'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                {tab === 'ALL' ? 'All Activity' : tab === 'CREDIT' ? 'Earnings' : 'Redemptions'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction Items */}
        {loading ? (
          <ActivityIndicator size="small" color="#5B21B6" style={{ marginTop: 20 }} />
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No transactions recorded</Text>
            <Text style={styles.emptySub}>Earn points by spinning the wheel, rolling dice, or marking attendance!</Text>
          </View>
        ) : (
          filteredTransactions.map((tx, idx) => {
            const isCredit = tx.type === 'CREDIT' || (tx.points && tx.points > 0);
            return (
              <View key={tx.id || idx} style={styles.txItem}>
                <View style={[styles.txIconWrap, { backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' }]}>
                  {isCredit ? (
                    <ArrowDownLeft size={18} color="#16A34A" />
                  ) : (
                    <ArrowUpRight size={18} color="#DC2626" />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.txTitle}>{tx.title || tx.description || 'Points Adjustment'}</Text>
                  <Text style={styles.txDate}>
                    {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'Today'}
                  </Text>
                </View>

                <Text style={[styles.txPoints, { color: isCredit ? '#16A34A' : '#DC2626' }]}>
                  {isCredit ? '+' : ''}{tx.points || tx.amount || 0} pts
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
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
    gap: 14,
    paddingBottom: 35,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#5B21B6',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroSubHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DDD6FE',
    letterSpacing: 0.5,
  },
  heroBalanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  heroPointsText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  heroPointsUnit: {
    color: '#DDD6FE',
    fontSize: 16,
    fontWeight: '700',
  },
  convertBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#16A34A',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  convertBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  convertedBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  convertedLabel: {
    color: '#DDD6FE',
    fontSize: 9,
    fontWeight: '800',
  },
  convertedValue: {
    color: '#4ADE80',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  rateText: {
    color: '#E9D5FF',
    fontSize: 11,
    fontWeight: '700',
  },
  myWdBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  myWdBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cardWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitleRow: {
    marginBottom: 12,
  },
  sectionHeading: {
    color: '#1E1B4B',
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  stepLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  brandsGrid: {
    gap: 8,
  },
  brandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
    gap: 10,
  },
  brandItemActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  brandDot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInitial: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  brandNameText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '700',
  },
  brandMinText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetPillActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#7C3AED',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  presetTextActive: {
    color: '#5B21B6',
    fontWeight: '800',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16A34A',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  calcBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  calcText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  insufficientText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '800',
  },
  sufficientText: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '800',
  },
  deliveryInput: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: '#1E1B4B',
    backgroundColor: '#FFFFFF',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  submitBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  successBanner: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#14532D',
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 12,
    color: '#166534',
    textAlign: 'center',
    marginTop: 4,
  },
  successRef: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  successActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  trackBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  anotherBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  anotherBtnText: {
    color: '#15803D',
    fontWeight: '800',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    color: '#1E1B4B',
    fontSize: 16,
    fontWeight: '800',
  },
  refreshIconBtn: {
    padding: 6,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#5B21B6',
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    color: '#1E1B4B',
    fontSize: 14,
    fontWeight: '800',
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  txIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    color: '#1E1B4B',
    fontSize: 13,
    fontWeight: '700',
  },
  txDate: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  txPoints: {
    fontSize: 13,
    fontWeight: '800',
  },
});
