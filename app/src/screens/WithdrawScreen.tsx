import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gift, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BrandLogo from '../components/BrandLogo';
import { playNotificationAudio, showInAppNotification, triggerPushNotification } from '../services/notificationService';

const defaultVouchers = [
  { id: 'vch_gplay', name: 'Google Play Gift Card', provider: 'Google Play', min: 100, minimum_points: 1000 },
  { id: 'vch_amazon', name: 'Amazon Pay Voucher', provider: 'Amazon', min: 100, minimum_points: 1000 },
  { id: 'vch_flipkart', name: 'Flipkart E-Voucher', provider: 'Flipkart', min: 100, minimum_points: 1000 },
  { id: 'vch_upi', name: 'Instant UPI Bank Transfer', provider: 'UPI', min: 100, minimum_points: 1000 },
];

export default function WithdrawScreen({ navigation }: any) {
  const { wallet, refreshWallet } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? Math.max(insets.top, 12) : (insets.top > 24 ? insets.top + 4 : 10);

  const [vouchers, setVouchers] = useState<any[]>(defaultVouchers);
  const [selectedBrand, setSelectedBrand] = useState<any>(defaultVouchers[0]);
  const [rupees, setRupees] = useState('100');
  const [accountDetails, setAccountDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const ratio = wallet?.points_to_rupee_ratio || 10;
  const availablePoints = wallet?.available_points ?? 0;
  const minRupees = wallet?.min_withdrawal_rupees || 100;

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await api.get('/withdraw/vouchers');
      if (res.data?.success && Array.isArray(res.data.vouchers) && res.data.vouchers.length > 0) {
        setVouchers(res.data.vouchers);
        setSelectedBrand(res.data.vouchers[0]);
      }
    } catch (e) {
      console.warn('Could not load dynamic vouchers in WithdrawScreen:', e);
    }
  };
  const requiredPoints = (Number(rupees) || 0) * ratio;

  const handleWithdraw = async () => {
    const numRupees = Number(rupees);
    if (isNaN(numRupees) || numRupees < minRupees) {
      setErrorMsg(`Minimum redemption amount is ₹${minRupees}`);
      return;
    }
    if (requiredPoints > availablePoints) {
      setErrorMsg(`Insufficient balance. You need ${requiredPoints.toLocaleString()} points.`);
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await api.post('/withdraw/request', {
        voucher_id: selectedBrand.id,
        voucher_name: selectedBrand.name,
        brand: selectedBrand.name,
        rupees: numRupees,
        points: requiredPoints,
      });

      if (res.data?.success) {
        await refreshWallet();
        playNotificationAudio().catch(() => {});
        showInAppNotification(
          'Withdrawal Submitted! 🎁',
          `Your request for ₹${numRupees} ${selectedBrand.provider} voucher has been placed.`
        );
        triggerPushNotification(
          'Withdrawal Pending ⏳',
          `Your ₹${numRupees} redemption request has been submitted for verification.`
        );
        navigation.navigate('Activity');
      } else {
        setErrorMsg(res.data?.message || 'Failed to submit withdrawal request.');
      }
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Network error during redemption.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redeem Rewards</Text>
        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>{availablePoints.toLocaleString()} pts</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Brand Selector */}
        <Text style={styles.label}>Select Voucher or Payout Method</Text>
        <View style={styles.brandGrid}>
          {vouchers.map((v) => {
            const isSelected = selectedBrand?.id === v.id;
            const minVoucherRupees = v.minimum_points ? Math.round(v.minimum_points / ratio) : (v.min || minRupees);
            return (
              <TouchableOpacity
                key={v.id}
                style={[styles.brandCard, isSelected && styles.brandCardActive]}
                onPress={() => setSelectedBrand(v)}
                activeOpacity={0.85}
              >
                <View style={{ marginBottom: 6 }}>
                  <BrandLogo
                    brandName={v.name || v.provider}
                    image={v.image_url || v.logo}
                    size={36}
                  />
                </View>
                <Text style={[styles.brandName, isSelected && { color: '#5B21B6' }]} numberOfLines={1}>
                  {v.name || v.provider}
                </Text>
                <Text style={styles.brandMin}>Min ₹{minVoucherRupees}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Amount Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Redemption Amount in INR (₹)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={rupees}
              onChangeText={setRupees}
              keyboardType="number-pad"
              placeholder="100"
            />
          </View>

          {/* Quick Amount Chips */}
          <View style={styles.chipsRow}>
            {[100, 250, 500, 1000].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[styles.chip, Number(rupees) === amt && styles.chipActive]}
                onPress={() => setRupees(String(amt))}
              >
                <Text style={[styles.chipText, Number(rupees) === amt && styles.chipTextActive]}>
                  ₹{amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Points Calculation Box */}
          <View style={styles.calcBox}>
            <Text style={styles.calcLabel}>Required Points</Text>
            <Text style={styles.calcPoints}>{requiredPoints.toLocaleString()} Pts</Text>
            <Text style={styles.calcRate}>({ratio} Pts = ₹1 INR)</Text>
          </View>

          {/* Delivery Note */}
          <Text style={{ fontSize: 12, color: '#64748B', marginTop: 12, textAlign: 'center' }}>
            Voucher code will be delivered instantly to your registered account upon admin approval.
          </Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <AlertCircle size={14} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleWithdraw}
            disabled={submitting}
            activeOpacity={0.85}
            style={{ width: '100%', marginTop: 16 }}
          >
            <LinearGradient
              colors={['#16A34A', '#15803D']}
              style={styles.submitBtn}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Redemption Request</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.trustBanner}>
          <ShieldCheck size={16} color="#7C3AED" />
          <Text style={styles.trustBannerText}>
            Verified Payouts • Delivered instantly or within 24-48 business hours
          </Text>
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  balancePill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  balanceText: {
    color: '#7C3AED',
    fontWeight: '800',
    fontSize: 12,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  brandCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  brandCardActive: {
    borderColor: '#5B21B6',
    backgroundColor: '#FAF5FF',
  },
  brandIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
  },
  brandMin: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    height: 48,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B4B',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#5B21B6',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  calcBox: {
    backgroundColor: '#F8F7FC',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  calcLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  calcPoints: {
    fontSize: 22,
    fontWeight: '900',
    color: '#5B21B6',
    marginVertical: 2,
  },
  calcRate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#F8FAFC',
    fontSize: 13,
    color: '#1E1B4B',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5EEFD',
    padding: 12,
    borderRadius: 14,
  },
  trustBannerText: {
    fontSize: 11,
    color: '#5B21B6',
    fontWeight: '600',
    flex: 1,
  },
});
