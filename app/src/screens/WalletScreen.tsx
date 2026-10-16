import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
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
  RotateCcw,
  Clock,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BrandLogo from '../components/BrandLogo';
import { showInAppNotification } from '../services/notificationService';

export default function WalletScreen({ navigation }: any) {
  const { wallet, refreshWallet } = useAuth();

  const [activeTab, setActiveTab] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showConverted, setShowConverted] = useState(false);

  // Dynamic Vouchers list synchronized with Backend Admin Settings
  const defaultVouchers = [
    { id: 'vch_phonepe', name: 'PhonePe Gift Voucher', provider: 'PhonePe', minimum_points: 100 },
    { id: 'vch_flipkart', name: 'Flipkart Voucher', provider: 'Flipkart', minimum_points: 100 },
    { id: 'vch_amazon', name: 'Amazon Pay Gift Card', provider: 'Amazon', minimum_points: 100 },
    { id: 'vch_gplay', name: 'Google Play Gift Voucher', provider: 'Google Play', minimum_points: 100 },
  ];

  const [vouchers, setVouchers] = useState<any[]>(defaultVouchers);
  const [selectedBrand, setSelectedBrand] = useState<any>(defaultVouchers[0]);
  const [platformRatio, setPlatformRatio] = useState<number | null>(null);
  const [platformMinRupees, setPlatformMinRupees] = useState<number | null>(null);

  const [withdrawRupees, setWithdrawRupees] = useState('');
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

  const isUnderMin = numRupees > 0 && numRupees < minRupees;
  const isInsufficient = numRupees >= minRupees && pointsRequired > availablePoints && !successWithdrawal;
  const neededPoints = Math.max(0, pointsRequired - availablePoints);
  const neededRupees = (neededPoints / ratio).toFixed(2);

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
        setVouchers(res.data.vouchers);
        setSelectedBrand(res.data.vouchers[0]);
        if (res.data.points_to_rupee_ratio) setPlatformRatio(Number(res.data.points_to_rupee_ratio));
        if (res.data.min_withdrawal_rupees) setPlatformMinRupees(Number(res.data.min_withdrawal_rupees));
      } else {
        setSelectedBrand(defaultVouchers[0]);
      }
    } catch (e) {
      setSelectedBrand(defaultVouchers[0]);
    }
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
      setFeedbackError(
        `Insufficient Points: You have ${availablePoints} Pts (₹${availableRupees}). You need ${neededPoints} more Pts (₹${neededRupees}) to withdraw ₹${numRupees.toFixed(2)}.`
      );
      return;
    }

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await api.post('/withdraw/request', {
        voucher_id: selectedBrand.id,
        voucher_name: selectedBrand.name,
        points: pointsRequired,
        rupee_value: numRupees,
        denomination: numRupees,
      });

      if (res.data && res.data.success) {
        setSuccessWithdrawal({
          brand: selectedBrand.name,
          amount: numRupees,
          points: pointsRequired,
          referenceId: res.data.withdrawal?.reference_id || `WD-${Date.now()}`,
        });
        setWithdrawRupees('');
        setFeedbackError(null);
        await refreshWallet();
        await fetchTransactions();
        showInAppNotification('Withdrawal Submitted! 🎉', `₹${numRupees} ${selectedBrand.name} placed.`);
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

  const rupeePresets = [
    { rupee: 10, pts: 10 * ratio },
    { rupee: 20, pts: 20 * ratio },
    { rupee: 50, pts: 50 * ratio },
    { rupee: 100, pts: 100 * ratio },
    { rupee: 250, pts: 250 * ratio },
    { rupee: 500, pts: 500 * ratio },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B21B6']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. PREMIUM WALLET HERO BANNER (1:1 with Web) */}
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

            {/* Rupee Conversion Button / Converted Display */}
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

          {/* Bottom Action Bar */}
          <View style={styles.heroBottomRow}>
            <View style={styles.rateRow}>
              <Sparkles size={13} color="#4ADE80" style={{ flexShrink: 0, marginTop: 2 }} />
              <View style={{ flex: 1, paddingRight: 6 }}>
                <Text style={styles.rateText} numberOfLines={1}>
                  {ratio} Points = ₹1.00
                </Text>
                <Text style={styles.rateSubText} numberOfLines={1}>
                  Min: ₹{minRupees.toFixed(2)} ({minPoints} Pts)
                </Text>
              </View>
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
                <CheckCircle2 size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Withdrawal Request Submitted! 🎉</Text>
              <Text style={styles.successDesc}>
                Your withdrawal request for <Text style={{ fontWeight: '800' }}>₹{successWithdrawal.amount.toFixed(2)} {successWithdrawal.brand}</Text> has been submitted to Perkfy.
              </Text>

              <View style={styles.trustEtaBox}>
                <Clock size={15} color="#15803D" />
                <Text style={styles.trustEtaText}>
                  You will get an update about your gift voucher in 24 hours.
                </Text>
              </View>

              <Text style={styles.successRef}>
                Ref ID: <Text style={{ fontFamily: 'monospace', fontWeight: '800', color: '#5B21B6' }}>{successWithdrawal.referenceId}</Text> • Status: <Text style={{ color: '#D97706', fontWeight: '700' }}>Processing (Within 24 Hours)</Text>
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
                  <RotateCcw size={14} color="#15803D" />
                  <Text style={styles.anotherBtnText}>Make Another</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.sectionTitleRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Gift size={18} color="#5B21B6" />
                  <Text style={styles.sectionHeading}>Gift Card Withdrawal</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                  Withdraw your points as instant brand digital gift vouchers ({ratio} Points = ₹1.00)
                </Text>
              </View>

              {/* Step 1: Select Brand Gift Card */}
              <Text style={styles.stepLabel}>1. Select Gift Card Brand:</Text>
              <View style={styles.brandsGrid}>
                {vouchers.map((v) => {
                  const isSelected = selectedBrand?.id === v.id;
                  const brandMinPts = v.minimum_points || v.minPoints || minPoints;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      onPress={() => {
                        setSelectedBrand(v);
                        setFeedbackError(null);
                      }}
                      style={[styles.brandItem, isSelected && styles.brandItemActive]}
                      activeOpacity={0.85}
                    >
                      <BrandLogo
                        brandName={v.name || v.provider}
                        image={v.image_url || v.logo}
                        size={34}
                      />
                      <View style={{ flex: 1, overflow: 'hidden' }}>
                        <Text
                          style={[styles.brandNameText, isSelected && { color: '#5B21B6', fontWeight: '800' }]}
                          numberOfLines={1}
                        >
                          {v.name || v.provider}
                        </Text>
                        <Text style={styles.brandMinText}>
                          Min: ₹{(brandMinPts / ratio).toFixed(2)} ({brandMinPts} Pts)
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Step 2: Choose Denomination Presets */}
              <Text style={[styles.stepLabel, { marginTop: 16 }]}>2. Choose Denomination (Rupees):</Text>
              <View style={styles.presetRow}>
                {rupeePresets.map((d) => {
                  const isSelected = numRupees === d.rupee;
                  const canAfford = availablePoints >= d.pts;
                  return (
                    <TouchableOpacity
                      key={d.rupee}
                      onPress={() => {
                        setWithdrawRupees(d.rupee.toString());
                        setFeedbackError(null);
                      }}
                      style={[
                        styles.presetPill,
                        isSelected && styles.presetPillActive,
                        !canAfford && !isSelected && styles.presetPillDisabled,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                        ₹{d.rupee}
                      </Text>
                      <Text style={[styles.presetPts, isSelected && styles.presetPtsActive]}>
                        {d.pts} Pts
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* All Balance Preset */}
                <TouchableOpacity
                  onPress={() => {
                    if (availablePoints >= ratio) {
                      setWithdrawRupees(Math.floor(availablePoints / ratio).toString());
                    } else {
                      setWithdrawRupees(minRupees.toString());
                    }
                    setFeedbackError(null);
                  }}
                  style={styles.allBalancePill}
                  activeOpacity={0.8}
                >
                  <Text style={styles.allBalanceText}>All Balance</Text>
                  <Text style={styles.allBalancePts}>{availablePoints} Pts</Text>
                </TouchableOpacity>
              </View>

              {/* Step 3: Direct Custom Amount in Rupees */}
              <Text style={[styles.stepLabel, { marginTop: 14 }]}>
                Or Enter Custom Amount in Rupees (₹):
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  (isInsufficient || isUnderMin) && { borderColor: '#F87171' },
                ]}
              >
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  value={withdrawRupees}
                  onChangeText={(val) => {
                    setWithdrawRupees(val.replace(/[^0-9]/g, ''));
                    setFeedbackError(null);
                  }}
                  keyboardType="numeric"
                  placeholder={`Enter amount in ₹ (Minimum ₹${minRupees.toFixed(2)})`}
                  placeholderTextColor="#94A3B8"
                  style={styles.textInput}
                />
              </View>

              {/* Live Calculation / Points Deduction Display */}
              {numRupees > 0 && (
                <View
                  style={[
                    styles.calcBanner,
                    (isInsufficient || isUnderMin) ? styles.calcBannerAlert : styles.calcBannerSuccess,
                  ]}
                >
                  <View>
                    <Text
                      style={[
                        styles.calcLabel,
                        { color: (isInsufficient || isUnderMin) ? '#991B1B' : '#166534' },
                      ]}
                    >
                      YOU WILL RECEIVE:
                    </Text>
                    <Text
                      style={[
                        styles.calcReceiveAmount,
                        { color: (isInsufficient || isUnderMin) ? '#DC2626' : '#16A34A' },
                      ]}
                    >
                      ₹{numRupees.toFixed(2)}{' '}
                      <Text style={{ fontSize: 11, color: '#1E1B4B', fontWeight: '700' }}>
                        ({selectedBrand?.name || 'Gift Voucher'})
                      </Text>
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.calcPtsLabel}>Points Deducted:</Text>
                    <Text style={styles.calcPtsValue}>
                      -{pointsRequired.toLocaleString()} Pts
                    </Text>
                  </View>
                </View>
              )}

              {/* Minimum ₹ Warning Alert Box (when user enters < minRupees) */}
              {isUnderMin && (
                <View style={styles.alertBoxWarning}>
                  <AlertCircle size={18} color="#D97706" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitleWarning}>
                      Minimum Withdrawal is ₹{minRupees.toFixed(2)} ({minPoints} Points)
                    </Text>
                    <Text style={styles.alertDescWarning}>
                      {availablePoints < minPoints ? (
                        <>
                          Your current balance is <Text style={{ fontWeight: '800' }}>{availablePoints} Pts</Text> (₹{availableRupees}). You need <Text style={{ fontWeight: '800' }}>{minPoints - availablePoints} more Pts</Text> to make a withdrawal.
                        </>
                      ) : (
                        <>Please enter an amount of at least ₹{minRupees.toFixed(2)} ({minPoints} Points).</>
                      )}
                    </Text>
                  </View>
                </View>
              )}

              {/* Insufficient Points Warning Box (when amount >= min but balance < needed) */}
              {isInsufficient && (
                <View style={styles.alertBoxError}>
                  <AlertCircle size={18} color="#DC2626" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitleError}>Insufficient Points Balance!</Text>
                    <Text style={styles.alertDescError}>
                      You have <Text style={{ fontWeight: '800' }}>{availablePoints} Pts</Text> (₹{availableRupees}). You need <Text style={{ fontWeight: '800' }}>{neededPoints} more Pts</Text> (₹{neededRupees}) to withdraw ₹{numRupees.toFixed(2)}.
                    </Text>
                  </View>
                </View>
              )}

              {/* API Feedback Error */}
              {feedbackError && (
                <View style={styles.alertBoxError}>
                  <AlertCircle size={16} color="#DC2626" />
                  <Text style={styles.alertDescError}>{feedbackError}</Text>
                </View>
              )}

              {/* Clean Full-Width Submit Button */}
              <TouchableOpacity
                onPress={handleWithdrawSubmit}
                disabled={submitting || isInsufficient || numRupees < minRupees}
                activeOpacity={0.85}
                style={{ marginTop: 14 }}
              >
                <LinearGradient
                  colors={
                    isInsufficient || numRupees < minRupees
                      ? ['#9CA3AF', '#9CA3AF']
                      : ['#22C55E', '#16A34A']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitBtn}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Gift size={18} color="#FFFFFF" />
                      <Text style={styles.submitBtnText}>
                        {isUnderMin
                          ? `Minimum Withdrawal is ₹${minRupees.toFixed(2)} (${minPoints} Pts)`
                          : isInsufficient
                          ? `Need ${neededPoints} More Points to Withdraw`
                          : numRupees >= minRupees
                          ? `Submit Withdrawal Request (₹${numRupees.toFixed(2)})`
                          : `Enter Amount (Min ₹${minRupees.toFixed(2)})`}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 3. TRANSACTION HISTORY LEDGER (1:1 with Web) */}
        <View style={styles.ledgerCard}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <WalletIcon size={16} color="#5B21B6" />
              <Text style={styles.sectionTitle}>Points Activity Ledger</Text>
            </View>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshIconBtn}>
              <RefreshCw size={13} color="#64748B" />
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
              <Text style={styles.emptySub}>
                Earn points by spinning the wheel, rolling dice, or completing tasks!
              </Text>
            </View>
          ) : (
            filteredTransactions.map((tx, idx) => {
              const isCredit = tx.type === 'CREDIT' || (tx.points && tx.points > 0);
              return (
                <View key={tx.id || idx} style={styles.txItem}>
                  <View style={[styles.txIconWrap, { backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' }]}>
                    {isCredit ? (
                      <ArrowDownLeft size={16} color="#16A34A" />
                    ) : (
                      <ArrowUpRight size={16} color="#DC2626" />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.txTitle}>{tx.title || tx.description || 'Points Adjustment'}</Text>
                    <Text style={styles.txDate}>
                      {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'Today'}
                    </Text>
                  </View>

                  <Text style={[styles.txPoints, { color: isCredit ? '#16A34A' : '#DC2626' }]}>
                    {isCredit ? `+${tx.points || tx.amount || 0}` : `${tx.points || tx.amount || 0}`} Pts
                  </Text>
                </View>
              );
            })
          )}
        </View>
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
    fontSize: 32,
    fontWeight: '900',
  },
  heroPointsUnit: {
    color: '#DDD6FE',
    fontSize: 15,
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
    alignItems: 'flex-start',
    gap: 6,
    flex: 1,
  },
  rateText: {
    color: '#E9D5FF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  rateSubText: {
    color: '#DDD6FE',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  myWdBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
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
    marginBottom: 14,
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
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
    gap: 10,
  },
  brandItemActive: {
    borderColor: '#5B21B6',
    backgroundColor: '#F5F3FF',
  },
  brandNameText: {
    color: '#1E1B4B',
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
    gap: 8,
    marginBottom: 10,
  },
  presetPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 64,
    alignItems: 'center',
  },
  presetPillActive: {
    backgroundColor: '#5B21B6',
    borderColor: '#5B21B6',
  },
  presetPillDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  presetTextActive: {
    color: '#FFFFFF',
  },
  presetPts: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  presetPtsActive: {
    color: '#E9D5FF',
  },
  allBalancePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
  },
  allBalanceText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  allBalancePts: {
    fontSize: 9,
    fontWeight: '600',
    color: '#166534',
    marginTop: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5B21B6',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5B21B6',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  calcBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  calcBannerSuccess: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  calcBannerAlert: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  calcLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  calcReceiveAmount: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  calcPtsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  calcPtsValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 2,
  },
  alertBoxWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  alertTitleWarning: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '800',
  },
  alertDescWarning: {
    color: '#92400E',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  alertBoxError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  alertTitleError: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '800',
  },
  alertDescError: {
    color: '#991B1B',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
    flex: 1,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  successBanner: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#14532D',
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 13,
    color: '#166534',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  trustEtaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  trustEtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  successRef: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 6,
    textAlign: 'center',
  },
  successActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  trackBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  anotherBtnText: {
    color: '#15803D',
    fontWeight: '800',
    fontSize: 12,
  },
  ledgerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#1E1B4B',
    fontSize: 14,
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
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#5B21B6',
  },
  tabBtnText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#1E1B4B',
    fontSize: 13,
    fontWeight: '800',
  },
  emptySub: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F7FC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 10,
    marginBottom: 8,
  },
  txIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    color: '#1E1B4B',
    fontSize: 12,
    fontWeight: '700',
  },
  txDate: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 1,
  },
  txPoints: {
    fontSize: 13,
    fontWeight: '800',
  },
});
