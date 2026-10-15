import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Share,
  Platform,
} from 'react-native';
import {
  Wallet as WalletIcon,
  Sparkles,
  ArrowUpRight,
  Disc,
  Dices,
  Calendar,
  Gift,
  Users,
  CheckCircle2,
  RefreshCw,
  Package,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import AttendanceModal from '../components/AttendanceModal';
import SpinWheel from '../components/SpinWheel';
import SocialConnect from '../components/SocialConnect';
import api from '../services/api';
import { showInAppNotification } from '../services/notificationService';

export default function DashboardScreen({ navigation }: any) {
  const { user, wallet, refreshWallet } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceClaimedToday, setAttendanceClaimedToday] = useState(false);
  const [attendanceRewardPts, setAttendanceRewardPts] = useState(100);
  const [mysteryBoxEligible, setMysteryBoxEligible] = useState(true);
  const [showConvertedRupee, setShowConvertedRupee] = useState(false);
  const hasAutoPromptedAttendance = useRef(false);

  // Dynamic Earning Progress Counters from Backend APIs
  const [spinsAvailable, setSpinsAvailable] = useState(10);
  const [spinSlices, setSpinSlices] = useState<any[]>([]);
  const [costPerSpin, setCostPerSpin] = useState(10);
  const [diceProgress, setDiceProgress] = useState({ completed: 0, limit: 10 });
  const [platformRatio, setPlatformRatio] = useState<number>(10);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [attRes, diceRes, spinRes, settingsRes, mbRes] = await Promise.all([
        api.get('/attendance/today').catch(() => ({ data: {} })),
        api.get('/dice').catch(() => ({ data: {} })),
        api.get('/spin/config').catch(() => ({ data: {} })),
        api.get('/platform-settings').catch(() => ({ data: {} })),
        api.get('/mystery-box').catch(() => ({ data: {} })),
      ]);

      let isAttDone = false;
      if (attRes.data) {
        if (attRes.data.completed) {
          isAttDone = true;
          setAttendanceClaimedToday(true);
        } else {
          setAttendanceClaimedToday(false);
        }
        if (typeof attRes.data.reward_points === 'number') {
          setAttendanceRewardPts(attRes.data.reward_points);
        }
      }

      // AUTO-PROMPT ATTENDANCE ON LOGIN IF NOT CLAIMED TODAY
      if (!isAttDone && !hasAutoPromptedAttendance.current) {
        hasAutoPromptedAttendance.current = true;
        setTimeout(() => {
          setShowAttendanceModal(true);
        }, 600);
      }

      if (mbRes.data && mbRes.data.success !== undefined) {
        setMysteryBoxEligible(mbRes.data.eligible);
      }

      if (diceRes.data && diceRes.data.success) {
        setDiceProgress({
          completed: diceRes.data.rolls_completed_today || 0,
          limit: diceRes.data.daily_limit || 10,
        });
      }

      if (spinRes.data && spinRes.data.success) {
        if (spinRes.data.spins_available_today !== undefined) {
          setSpinsAvailable(spinRes.data.spins_available_today);
        }
        if (Array.isArray(spinRes.data.slices) && spinRes.data.slices.length > 0) {
          setSpinSlices(spinRes.data.slices);
        }
        if (spinRes.data.cost_per_spin !== undefined) {
          setCostPerSpin(spinRes.data.cost_per_spin);
        }
      }

      if (settingsRes.data?.platform_settings) {
        const ps = settingsRes.data.platform_settings;
        if (ps.points_to_rupee_ratio) setPlatformRatio(Number(ps.points_to_rupee_ratio));
        if (ps.attendance_reward_points) setAttendanceRewardPts(Number(ps.attendance_reward_points));
      }
    } catch (e) {
      console.warn('Dashboard sync fallback');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshWallet();
    await fetchDashboardData();
    setRefreshing(false);
  };

  const availablePoints = wallet?.available_points ?? 0;
  const ratio = platformRatio || wallet?.points_to_rupee_ratio || 10;
  const rupeeValue = (availablePoints / ratio).toFixed(2);

  const handleShareReferral = async () => {
    const code = user?.referral_code || 'PERKFY100';
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `🎁 Join Perkfy using my invite code ${code} and get 100 Free Welcome Points! Download the app: https://perkfy.app`,
      });
    } catch (error) {}
  };

  // In-page Spin Handlers
  const handleDashboardSpinPlay = async () => {
    try {
      const res = await api.post('/spin/play');
      if (res.data?.success) {
        if (typeof res.data.spins_remaining === 'number') {
          setSpinsAvailable(res.data.spins_remaining);
        } else {
          setSpinsAvailable((prev) => Math.max(0, prev - 1));
        }
        return {
          targetIndex: typeof res.data.targetIndex === 'number' ? res.data.targetIndex : 0,
          reward_points: res.data.reward_points ?? 0,
          cost_points: res.data.cost_points ?? costPerSpin,
          message: res.data.message,
          wallet: res.data.wallet,
        };
      }
    } catch (e: any) {
      if (e.response?.data?.message) {
        showInAppNotification('Spin Alert', e.response.data.message, 'error');
      }
    }
    return {
      targetIndex: 0,
      reward_points: 0,
      cost_points: costPerSpin,
      message: 'Better luck next time!',
    };
  };

  const handleDashboardClaimReward = async (spinData: any) => {
    await refreshWallet();
    if (spinData?.reward_points > 0) {
      showInAppNotification('Spin Reward Credited! 🎉', `+${spinData.reward_points} Points added to your wallet!`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B21B6']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. 3D Visual Hero Banner - Exactly as Web */}
        <View style={styles.heroBannerCard}>
          <Image
            source={require('../../assets/hero_banner.png')}
            style={styles.heroBannerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['#5B21B6', '#1E1B4B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBannerBottomStrip}
          >
            <Text style={styles.heroBannerTag}>⚡ DAILY REWARDS HUB</Text>
            <Text style={styles.heroBannerHeading}>
              Earn Real Cash & Instant Gift Vouchers!
            </Text>
            <Text style={styles.heroBannerSubtext}>
              Check in daily, watch video ads, and spin the lucky wheel to claim your points.
            </Text>
          </LinearGradient>
        </View>

        {/* 2. Header Greeting - 1:1 with Web */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Hello, {user?.name || 'User'}! 👋</Text>
          <Text style={styles.greetingSub}>Keep earning, keep winning!</Text>
        </View>

        {/* 3. Premium Credit Card Style Wallet Card - 1:1 with Web */}
        <LinearGradient
          colors={['#4C1D95', '#5B21B6', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.walletCard}
        >
          {/* Ambient Glow */}
          <View style={styles.walletAmbientGlow} />

          {/* Top Row: MY WALLET & Manage */}
          <View style={styles.walletTopRow}>
            <View style={styles.walletTitleGroup}>
              <View style={styles.walletIconCircle}>
                <WalletIcon color="#4ADE80" size={16} />
              </View>
              <Text style={styles.walletCardLabel}>MY WALLET</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Wallet')}
              activeOpacity={0.8}
              style={styles.walletManageBtn}
            >
              <Text style={styles.walletManageText}>Manage</Text>
              <ArrowUpRight size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Balance & Convert to ₹ Toggle */}
          <View style={styles.walletBalanceRow}>
            <View>
              <Text style={styles.walletPointsValue}>
                {availablePoints.toLocaleString()}{' '}
                <Text style={styles.walletPointsSuffix}>Pts</Text>
              </Text>
            </View>

            {!showConvertedRupee ? (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowConvertedRupee(true);
                }}
                activeOpacity={0.85}
                style={styles.convertBtn}
              >
                <RefreshCw size={14} color="#FFFFFF" />
                <Text style={styles.convertBtnText}>Convert to ₹</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowConvertedRupee(false);
                }}
                activeOpacity={0.85}
                style={styles.convertedRupeeBox}
              >
                <Text style={styles.convertedRupeeLabel}>CONVERTED RUPEES</Text>
                <Text style={styles.convertedRupeeValue}>₹{rupeeValue}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom Formula Ticker Bar */}
          <View style={styles.walletTickerBar}>
            <Text style={styles.walletTickerText}>
              ✨ {ratio} Points = ₹1.00 Value
            </Text>
          </View>
        </LinearGradient>

        {/* 4. Today's Activity Section - 1:1 with Web */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionHeading}>Today's Activity</Text>

          <View style={styles.activityListCard}>
            {/* Daily Attendance Item */}
            <View style={styles.activityRow}>
              <View style={styles.activityLeft}>
                <LinearGradient
                  colors={['#22C55E', '#16A34A']}
                  style={styles.activityIconBox}
                >
                  <Calendar color="#FFFFFF" size={24} />
                </LinearGradient>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>Daily Attendance</Text>
                  <Text style={styles.activityDesc}>
                    Mark attendance and earn {attendanceRewardPts} points
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAttendanceModal(true);
                }}
                disabled={attendanceClaimedToday}
                activeOpacity={0.85}
                style={[
                  styles.activityActionBtn,
                  attendanceClaimedToday
                    ? styles.activityActionBtnDone
                    : styles.activityActionBtnGreen,
                ]}
              >
                {attendanceClaimedToday ? (
                  <View style={styles.rowCentered}>
                    <CheckCircle2 size={16} color="#16A34A" />
                    <Text style={styles.activityBtnTextDone}>+{attendanceRewardPts}</Text>
                  </View>
                ) : (
                  <Text style={styles.activityBtnTextGreen}>+{attendanceRewardPts} Check In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Lucky Mystery Box Item */}
            <View style={styles.activityRow}>
              <View style={styles.activityLeft}>
                <LinearGradient
                  colors={['#7C3AED', '#5B21B6']}
                  style={styles.activityIconBox}
                >
                  <Package color="#FDE047" size={24} />
                </LinearGradient>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>Lucky Mystery Box</Text>
                  <Text style={styles.activityDesc}>
                    Open daily surprise box to unbox random cash points (up to 100 pts)
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('MysteryBox')}
                activeOpacity={0.85}
                style={[
                  styles.activityActionBtn,
                  mysteryBoxEligible
                    ? styles.activityActionBtnViolet
                    : styles.activityActionBtnMuted,
                ]}
              >
                <Text
                  style={
                    mysteryBoxEligible
                      ? styles.activityBtnTextViolet
                      : styles.activityBtnTextMuted
                  }
                >
                  {mysteryBoxEligible ? '✨ Open Box' : 'View Box'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Play Dice Game Item */}
            <View style={styles.activityRow}>
              <View style={styles.activityLeft}>
                <LinearGradient
                  colors={['#4C1D95', '#7C3AED']}
                  style={styles.activityIconBox}
                >
                  <Dices color="#FFFFFF" size={24} />
                </LinearGradient>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>
                    Play Dice ({diceProgress.completed}/{diceProgress.limit})
                  </Text>
                  <Text style={styles.activityDesc}>
                    Watch sponsor ad & roll lucky 3D die for up to 10 points per roll
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('PlayDice')}
                activeOpacity={0.85}
                style={[styles.activityActionBtn, styles.activityActionBtnViolet]}
              >
                <Text style={styles.activityBtnTextViolet}>Play Game</Text>
              </TouchableOpacity>
            </View>

            {/* Spin & Win Item */}
            <View style={styles.activityRow}>
              <View style={styles.activityLeft}>
                <LinearGradient
                  colors={['#FF6B00', '#EA580C']}
                  style={styles.activityIconBox}
                >
                  <Disc color="#FFFFFF" size={24} />
                </LinearGradient>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>Spin & Win</Text>
                  <Text style={styles.activityDesc}>
                    Spin the wheel and win exciting points
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('SpinWin')}
                activeOpacity={0.85}
                style={[styles.activityActionBtn, styles.activityActionBtnViolet]}
              >
                <Text style={styles.activityBtnTextViolet}>Spin</Text>
              </TouchableOpacity>
            </View>

            {/* Refer & Earn Item */}
            <View style={[styles.activityRow, { borderBottomWidth: 0 }]}>
              <View style={styles.activityLeft}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.activityIconBox}
                >
                  <Users color="#FFFFFF" size={24} />
                </LinearGradient>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>Refer & Earn (+100 Pts)</Text>
                  <Text style={styles.activityDesc}>
                    Invite friends and earn 100 points per refer
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleShareReferral}
                activeOpacity={0.85}
                style={[styles.activityActionBtn, styles.activityActionBtnGreen]}
              >
                <Text style={styles.activityBtnTextGreen}>Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 5. Social Connect Tasks - 1:1 with Web */}
        <SocialConnect user={user} refreshWallet={refreshWallet} />

        {/* 6. Play Dice Promo Banner Card - 1:1 with Web */}
        <LinearGradient
          colors={['#4C1D95', '#5B21B6', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dicePromoCard}
        >
          <View style={styles.dicePromoTextCol}>
            <Text style={styles.dicePromoTitle}>Roll the Dice. Win Instant Points!</Text>
            <Text style={styles.dicePromoSub}>
              Watch a short sponsor ad & roll the lucky 3D die up to {diceProgress.limit} times daily!
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('PlayDice')}
            activeOpacity={0.85}
            style={styles.dicePromoBtn}
          >
            <Text style={styles.dicePromoBtnText}>Play Dice Now</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* 7. In-Page Lucky Spin Wheel Widget - 1:1 with Web */}
        <View style={styles.spinWidgetCard}>
          <Text style={styles.spinWidgetTitle}>🎡 Lucky Spin Wheel</Text>
          <Text style={styles.spinWidgetSub}>Spin daily for bonus rewards!</Text>

          <SpinWheel
            slices={spinSlices}
            spinsAvailable={spinsAvailable}
            costPerSpin={costPerSpin}
            userPoints={availablePoints}
            onSpin={handleDashboardSpinPlay}
            onClaim={handleDashboardClaimReward}
            onNavigateToAds={() => navigation.navigate('PlayDice')}
          />
        </View>
      </ScrollView>

      {/* Daily Attendance Modal (Auto-triggered or manual) */}
      <AttendanceModal
        visible={showAttendanceModal}
        onClose={() => {
          setShowAttendanceModal(false);
          refreshWallet();
          fetchDashboardData();
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
    paddingBottom: 40,
    gap: 18,
  },
  // Hero Banner
  heroBannerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  heroBannerImage: {
    width: '100%',
    height: 160,
  },
  heroBannerBottomStrip: {
    padding: 14,
  },
  heroBannerTag: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  heroBannerHeading: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroBannerSubtext: {
    color: '#E9D5FF',
    fontSize: 12,
    lineHeight: 16,
  },
  // Greeting
  greetingSection: {
    paddingHorizontal: 4,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 2,
  },
  greetingSub: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  // Wallet Card
  walletCard: {
    borderRadius: 22,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  walletAmbientGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  walletTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  walletTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletCardLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  walletManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  walletManageText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  walletBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  walletPointsValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  walletPointsSuffix: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  convertBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  convertedRupeeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'flex-end',
  },
  convertedRupeeLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9,
    fontWeight: '800',
  },
  convertedRupeeValue: {
    color: '#4ADE80',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 1,
  },
  walletTickerBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
    marginTop: 16,
    paddingTop: 10,
  },
  walletTickerText: {
    color: '#E9D5FF',
    fontSize: 11,
    fontWeight: '700',
  },
  // Today's Activity Section
  activitySection: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E1B4B',
    paddingHorizontal: 4,
  },
  activityListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 10,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  activityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  activityDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 15,
  },
  activityActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityActionBtnGreen: {
    backgroundColor: '#22C55E',
  },
  activityActionBtnDone: {
    backgroundColor: '#DCFCE7',
  },
  activityActionBtnViolet: {
    backgroundColor: '#5B21B6',
  },
  activityActionBtnMuted: {
    backgroundColor: '#EDE9FE',
  },
  activityBtnTextGreen: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  activityBtnTextDone: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800',
  },
  activityBtnTextViolet: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  activityBtnTextMuted: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '800',
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // Dice Promo Banner
  dicePromoCard: {
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  dicePromoTextCol: {
    gap: 4,
  },
  dicePromoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  dicePromoSub: {
    color: '#E9D5FF',
    fontSize: 12,
    lineHeight: 17,
  },
  dicePromoBtn: {
    backgroundColor: '#22C55E',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  dicePromoBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  // Spin Widget Card
  spinWidgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  spinWidgetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 2,
  },
  spinWidgetSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
});
