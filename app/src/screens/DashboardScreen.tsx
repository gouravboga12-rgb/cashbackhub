import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share
} from 'react-native';
import {
  Wallet as WalletIcon,
  Sparkles,
  ArrowUpRight,
  Disc,
  Dices,
  Film,
  Calendar,
  Gift,
  Share2,
  ChevronRight,
  Clock
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';
import AttendanceModal from '../components/AttendanceModal';
import api from '../services/api';

export default function DashboardScreen({ navigation }: any) {
  const { user, wallet, refreshWallet } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceClaimedToday, setAttendanceClaimedToday] = useState(false);

  useEffect(() => {
    checkDailyAttendanceStatus();
  }, []);

  const checkDailyAttendanceStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      if (res.data?.completed) {
        setAttendanceClaimedToday(true);
      }
    } catch (e) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshWallet();
    await checkDailyAttendanceStatus();
    setRefreshing(false);
  };

  const availablePoints = wallet?.available_points ?? 0;
  const ratio = wallet?.points_to_rupee_ratio || 10;
  const rupeeValue = (availablePoints / ratio).toFixed(2);

  const handleShareReferral = async () => {
    const code = user?.referral_code || 'PERKFY100';
    try {
      await Share.share({
        message: `Join Perkfy using my invite code ${code} and get 100 Free Welcome Points! Download the app: https://perkfy.app`,
      });
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B21B6']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Greeting */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.greetingText}>Hello, {user?.name || 'Friend'} 👋</Text>
            <Text style={styles.subGreeting}>Ready to collect today's earnings?</Text>
          </View>
        </View>

        {/* Hero Balance Card */}
        <LinearGradient
          colors={['#1E1B4B', '#312E81', '#4338CA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <Sparkles size={14} color="#F59E0B" />
              <Text style={styles.heroBadgeText}>TOTAL BALANCE</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Wallet')}
              style={styles.historyBtn}
            >
              <Clock size={12} color="#DDD6FE" />
              <Text style={styles.historyBtnText}>History</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroMain}>
            <Text style={styles.heroPoints}>{availablePoints.toLocaleString()}</Text>
            <Text style={styles.heroPtsSuffix}>Points</Text>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroBottom}>
            <View>
              <Text style={styles.rupeeEquivalentLabel}>Equivalent Value</Text>
              <Text style={styles.rupeeEquivalent}>₹ {rupeeValue} INR</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Withdraw')}
              style={styles.withdrawBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.withdrawBtnText}>Redeem</Text>
              <ArrowUpRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Daily Attendance Callout */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAttendanceModal(true);
          }}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#F5EEFD', '#EDE9FE']}
            style={styles.attendanceBanner}
          >
            <View style={styles.attendanceLeft}>
              <View style={styles.attIconWrap}>
                <Calendar size={22} color="#7C3AED" />
              </View>
              <View>
                <Text style={styles.attTitle}>Daily Attendance Check-In</Text>
                <Text style={styles.attSub}>
                  {attendanceClaimedToday
                    ? 'Already claimed today ✓'
                    : 'Claim your +100 daily check-in points!'}
                </Text>
              </View>
            </View>

            <View style={[styles.attBadge, attendanceClaimedToday && { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.attBadgeText, attendanceClaimedToday && { color: '#15803D' }]}>
                {attendanceClaimedToday ? 'Claimed' : '+100 Pts'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Earning Games Section */}
        <Text style={styles.sectionTitle}>Play & Earn Points</Text>

        <View style={styles.gamesGrid}>
          {/* Spin & Win */}
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => navigation.navigate('Spin')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.gameIconBadge}>
              <Disc size={26} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.gameCardTitle}>Spin & Win</Text>
            <Text style={styles.gameCardSub}>Up to 1,000 Pts</Text>
            <View style={styles.gamePill}>
              <Text style={styles.gamePillText}>10 Spins Left</Text>
            </View>
          </TouchableOpacity>

          {/* 3D Dice Game */}
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => navigation.navigate('PlayDice')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.gameIconBadge}>
              <Dices size={26} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.gameCardTitle}>Roll 3D Dice</Text>
            <Text style={styles.gameCardSub}>Multiplier Wins</Text>
            <View style={[styles.gamePill, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.gamePillText, { color: '#1D4ED8' }]}>Active</Text>
            </View>
          </TouchableOpacity>

          {/* Watch Ads */}
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => navigation.navigate('WatchAds')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#16A34A', '#15803D']} style={styles.gameIconBadge}>
              <Film size={26} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.gameCardTitle}>Watch Ads</Text>
            <Text style={styles.gameCardSub}>Instant +10 Pts</Text>
            <View style={[styles.gamePill, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.gamePillText, { color: '#15803D' }]}>10 Available</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Refer & Earn Banner */}
        <LinearGradient
          colors={['#FFFBEB', '#FEF3C7']}
          style={styles.referCard}
        >
          <View style={styles.referLeft}>
            <View style={styles.referIconWrap}>
              <Gift size={22} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.referTitle}>Refer Friends & Earn</Text>
              <Text style={styles.referSub}>
                Share your code <Text style={{ fontWeight: '800' }}>{user?.referral_code || 'PERKFY100'}</Text> & get 50 pts each!
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleShareReferral} style={styles.shareBtn}>
            <Share2 size={16} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>

      {/* 1:1 Attendance Modal */}
      <AttendanceModal
        visible={showAttendanceModal}
        onClose={() => {
          setShowAttendanceModal(false);
          checkDailyAttendanceStatus();
        }}
      />
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
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  subGreeting: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  heroCard: {
    borderRadius: 22,
    padding: 20,
    elevation: 4,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroBadgeText: {
    color: '#FCD34D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyBtnText: {
    color: '#DDD6FE',
    fontSize: 12,
    fontWeight: '600',
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 14,
    marginBottom: 10,
  },
  heroPoints: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  heroPtsSuffix: {
    color: '#A5B4FC',
    fontSize: 15,
    fontWeight: '700',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 12,
  },
  heroBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rupeeEquivalentLabel: {
    color: '#A5B4FC',
    fontSize: 10,
    fontWeight: '600',
  },
  rupeeEquivalent: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 3,
  },
  withdrawBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  attendanceBanner: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  attendanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  attIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  attTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  attSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  attBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  attBadgeText: {
    color: '#7C3AED',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
    marginTop: 4,
  },
  gamesGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  gameCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  gameIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gameCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
  },
  gameCardSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  gamePill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 8,
  },
  gamePillText: {
    color: '#7C3AED',
    fontSize: 9,
    fontWeight: '800',
  },
  referCard: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  referLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  referIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  referTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  referSub: {
    fontSize: 10,
    color: '#78350F',
    marginTop: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
