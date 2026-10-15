import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Clipboard
} from 'react-native';
import { Gift, Clock, CheckCircle2, XCircle, Copy, Check, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { showInAppNotification } from '../services/notificationService';
import { COLORS } from '../theme';

export default function MyWithdrawalsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'Pending' | 'Fulfilled' | 'Rejected'>('ALL');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

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

  const copyCode = (code: string, id: string) => {
    Clipboard.setString(code);
    setCopiedId(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showInAppNotification('Copied!', 'Voucher code copied to clipboard');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filtered = withdrawals.filter((w) => {
    if (activeTab === 'Pending') return w.status === 'Pending';
    if (activeTab === 'Fulfilled') return w.status === 'Fulfilled';
    if (activeTab === 'Rejected') return w.status === 'Rejected';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Activity & Payouts</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B21B6']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Filter Tabs */}
        <View style={styles.tabBar}>
          {(['ALL', 'Pending', 'Fulfilled', 'Rejected'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#5B21B6" style={{ marginTop: 24 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Gift size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No redemptions found</Text>
            <Text style={styles.emptySub}>
              When you redeem gift cards or UPI payouts, your claims and voucher codes will appear here!
            </Text>
          </View>
        ) : (
          filtered.map((item, idx) => {
            const isPending = item.status === 'Pending';
            const isFulfilled = item.status === 'Fulfilled';
            const isRejected = item.status === 'Rejected';

            return (
              <View key={item.id || idx} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.brandRow}>
                    <View style={styles.brandIconWrap}>
                      <Gift size={18} color="#5B21B6" />
                    </View>
                    <View>
                      <Text style={styles.brandName}>{item.brand || 'Gift Voucher'}</Text>
                      <Text style={styles.dateText}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      isPending && { backgroundColor: '#FEF3C7' },
                      isFulfilled && { backgroundColor: '#DCFCE7' },
                      isRejected && { backgroundColor: '#FEE2E2' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        isPending && { color: '#D97706' },
                        isFulfilled && { color: '#16A34A' },
                        isRejected && { color: '#DC2626' },
                      ]}
                    >
                      {item.status || 'Pending'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardDetails}>
                  <View>
                    <Text style={styles.amountLabel}>Payout Amount</Text>
                    <Text style={styles.amountVal}>₹{item.rupees || 100}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.amountLabel}>Points Debited</Text>
                    <Text style={styles.ptsVal}>-{item.points || 1000} pts</Text>
                  </View>
                </View>

                {/* If Fulfilled Voucher Code Available */}
                {item.voucher_code ? (
                  <View style={styles.codeBox}>
                    <Text style={styles.codeText}>{item.voucher_code}</Text>
                    <TouchableOpacity
                      onPress={() => copyCode(item.voucher_code, item.id)}
                      style={styles.copyBtn}
                    >
                      {copiedId === item.id ? (
                        <Check size={16} color="#16A34A" />
                      ) : (
                        <Copy size={16} color="#5B21B6" />
                      )}
                    </TouchableOpacity>
                  </View>
                ) : null}
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  scroll: {
    padding: 16,
    gap: 14,
    paddingBottom: 30,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 3,
    marginBottom: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#1E1B4B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  dateText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  amountVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
    marginTop: 1,
  },
  ptsVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 1,
  },
  codeBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B4B',
    letterSpacing: 1,
  },
  copyBtn: {
    padding: 4,
  },
});
