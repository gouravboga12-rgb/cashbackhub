import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import {
  Wallet as WalletIcon,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Gift,
  Film,
  Disc,
  Dices,
  RefreshCw
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { COLORS } from '../theme';

export default function WalletScreen({ navigation }: any) {
  const { wallet, refreshWallet } = useAuth();

  const [activeTab, setActiveTab] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

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
    setRefreshing(false);
  };

  const availablePoints = wallet?.available_points ?? 0;
  const ratio = wallet?.points_to_rupee_ratio || 10;
  const rupeeValue = (availablePoints / ratio).toFixed(2);
  const totalEarned = wallet?.total_earned ?? availablePoints;
  const totalRedeemed = wallet?.total_redeemed ?? 0;

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'CREDIT') return tx.type === 'CREDIT' || (tx.points && tx.points > 0);
    if (activeTab === 'DEBIT') return tx.type === 'DEBIT' || (tx.points && tx.points < 0);
    return true;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B21B6']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Summary Card */}
        <LinearGradient
          colors={['#1E1B4B', '#312E81']}
          style={styles.balanceCard}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>Available Balance</Text>
            <View style={styles.ratePill}>
              <Text style={styles.ratePillText}>{ratio} Pts = ₹1 INR</Text>
            </View>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.pointsText}>{availablePoints.toLocaleString()}</Text>
            <Text style={styles.pointsUnit}>Points</Text>
          </View>
          <Text style={styles.rupeeText}>≈ ₹ {rupeeValue} INR</Text>

          <View style={styles.cardDivider} />

          {/* Stats Sub-row */}
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statsLabel}>Lifetime Earned</Text>
              <Text style={styles.statsEarned}>+{totalEarned.toLocaleString()} pts</Text>
            </View>
            <View style={styles.statsSep} />
            <View>
              <Text style={styles.statsLabel}>Total Redeemed</Text>
              <Text style={styles.statsRedeemed}>-{totalRedeemed.toLocaleString()} pts</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Withdraw')}
            style={styles.redeemActionBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.redeemBtnText}>Redeem Gift Vouchers</Text>
            <ArrowUpRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Transactions Section */}
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
    padding: 16,
    gap: 16,
    paddingBottom: 30,
  },
  balanceCard: {
    borderRadius: 22,
    padding: 20,
    elevation: 4,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    color: '#DDD6FE',
    fontSize: 13,
    fontWeight: '700',
  },
  ratePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ratePillText: {
    color: '#FCD34D',
    fontSize: 10,
    fontWeight: '800',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 12,
  },
  pointsText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  pointsUnit: {
    color: '#A5B4FC',
    fontSize: 15,
    fontWeight: '700',
  },
  rupeeText: {
    color: '#86EFAC',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsLabel: {
    color: '#A5B4FC',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsEarned: {
    color: '#86EFAC',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
  },
  statsRedeemed: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
  },
  statsSep: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  redeemActionBtn: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 25,
  },
  redeemBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  refreshIconBtn: {
    padding: 6,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 3,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#1E1B4B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  emptySub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  txItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  txIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  txDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  txPoints: {
    fontSize: 14,
    fontWeight: '800',
  },
});
