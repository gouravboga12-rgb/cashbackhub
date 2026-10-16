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
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Tv,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import AttendanceModal from '../components/AttendanceModal';
import SpinWheel from '../components/SpinWheel';
import SocialConnect from '../components/SocialConnect';
import api from '../services/api';
import { showInAppNotification } from '../services/notificationService';
import { showRewardedAd, showPostLoginAd } from '../services/adService';

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
  const [spinDailyLimit, setSpinDailyLimit] = useState(20);
  const [spinSlices, setSpinSlices] = useState<any[]>([]);
  const [costPerSpin, setCostPerSpin] = useState(10);
  const [diceProgress, setDiceProgress] = useState({ completed: 0, limit: 10 });
  const [platformRatio, setPlatformRatio] = useState<number>(10);
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<any>({
    points_to_rupee_ratio: 10,
    attendance_reward_points: 100,
    ad_reward_points: 10,
    daily_ad_limit: 10,
    daily_spin_limit: 10,
    cost_per_spin: 10,
    signup_bonus_points: 100,
    min_withdrawal_rupees: 100,
    min_withdrawal_points: 1000,
    referral_reward_points: 100,
  });

  useEffect(() => {
    hasAutoPromptedAttendance.current = false;
    fetchDashboardData();

    // Trigger single post-login Open Ad 2.5 seconds after landing on Dashboard
    const loginAdTimer = setTimeout(() => {
      showPostLoginAd().catch(() => {});
    }, 2500);

    return () => {
      clearTimeout(loginAdTimer);
    };
  }, [user?.id]);

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

      // Auto-prompt attendance only after the post-login ad window (6.5s) if still unclaimed
      if (!isAttDone && !hasAutoPromptedAttendance.current) {
        hasAutoPromptedAttendance.current = true;
        setTimeout(() => {
          setShowAttendanceModal(true);
        }, 6500);
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
        if (spinRes.data.daily_limit !== undefined) {
          setSpinDailyLimit(spinRes.data.daily_limit);
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
        setPlatformSettings((prev: any) => ({ ...prev, ...ps }));
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
    // Show Google AdMob Rewarded Ad before spinning
    await showRewardedAd();

    try {
      if (wallet && typeof wallet.available_points === 'number') {
        wallet.available_points = Math.max(0, wallet.available_points - costPerSpin);
      }
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
            dailyLimit={spinDailyLimit}
            costPerSpin={costPerSpin}
            userPoints={availablePoints}
            onSpin={handleDashboardSpinPlay}
            onClaim={handleDashboardClaimReward}
            onNavigateToAds={() => navigation.navigate('PlayDice')}
          />
        </View>

        {/* 8. App Reward Guidelines & Fair Play Policy (AdMob Policy Compliant) */}
        <View style={styles.guidelinesCard}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setGuidelinesExpanded(!guidelinesExpanded);
            }}
            activeOpacity={0.85}
            style={styles.guidelinesHeader}
          >
            <View style={styles.guidelinesHeaderLeft}>
              <View style={styles.guidelinesIconCircle}>
                <ShieldCheck size={20} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.guidelinesTitle}>App Guidelines & Reward Rules</Text>
                <Text style={styles.guidelinesSub}>AdMob Compliant • Tap to {guidelinesExpanded ? 'hide' : 'view'} details</Text>
              </View>
            </View>
            {guidelinesExpanded ? (
              <ChevronUp size={20} color="#4F46E5" />
            ) : (
              <ChevronDown size={20} color="#64748B" />
            )}
          </TouchableOpacity>

          {guidelinesExpanded && (
            <View style={styles.guidelinesBody}>
              {/* 1. Daily Check-in */}
              <View style={styles.guidelineItem}>
                <View style={styles.guidelineBulletIcon}>
                  <Calendar size={16} color="#16A34A" />
                </View>
                <View style={styles.guidelineContent}>
                  <Text style={styles.guidelineItemTitle}>Daily Check-In Attendance</Text>
                  <Text style={styles.guidelineItemText}>
                    Claim <Text style={styles.guidelineHighlight}>+{platformSettings.attendance_reward_points || attendanceRewardPts} Bonus Points</Text> once per calendar day (IST) simply by opening the app and checking in.
                  </Text>
                </View>
              </View>

              {/* 2. Lucky Dice */}
              <View style={styles.guidelineItem}>
                <View style={styles.guidelineBulletIcon}>
                  <Dices size={16} color="#4F46E5" />
                </View>
                <View style={styles.guidelineContent}>
                  <Text style={styles.guidelineItemTitle}>Lucky 3D Dice Game</Text>
                  <Text style={styles.guidelineItemText}>
                    Roll the 3D dice up to <Text style={styles.guidelineHighlight}>{diceProgress.limit || 10} times daily</Text>. Win points matching the dice face multiplier. 100% free to play.
                  </Text>
                </View>
              </View>

              {/* 3. Spin the Wheel */}
              <View style={styles.guidelineItem}>
                <View style={styles.guidelineBulletIcon}>
                  <Disc size={16} color="#EA580C" />
                </View>
                <View style={styles.guidelineContent}>
                  <Text style={styles.guidelineItemTitle}>Lucky Spin & Win</Text>
                  <Text style={styles.guidelineItemText}>
                    Spin up to <Text style={styles.guidelineHighlight}>{spinDailyLimit} times daily</Text> (cost: {costPerSpin} pts per spin). Win reward multipliers, cash points, or try again.
                  </Text>
                </View>
              </View>

              {/* 4. Voluntary Video Ads (AdMob Compliant) */}
              <View style={styles.guidelineItem}>
                <View style={styles.guidelineBulletIcon}>
                  <Tv size={16} color="#2563EB" />
                </View>
                <View style={styles.guidelineContent}>
                  <Text style={styles.guidelineItemTitle}>Optional Rewarded Video Ads</Text>
                  <Text style={styles.guidelineItemText}>
                    <Text style={styles.guidelineSubBold}>Voluntary Participation:</Text> You can voluntarily choose to watch short video ads up to <Text style={styles.guidelineHighlight}>{platformSettings.daily_ad_limit || 10} times daily</Text> to earn <Text style={styles.guidelineHighlight}>+{platformSettings.ad_reward_points || 10} Points</Text> per completed video.
                  </Text>
                  <View style={styles.guidelineNoticeBox}>
                    <Text style={styles.guidelineNoticeText}>
                      ⚠️ <Text style={{ fontWeight: '700' }}>Important AdMob Notice:</Text> Please only click on advertisements if you are genuinely interested in the advertised sponsor or service. Points are awarded solely for viewing videos to completion, NEVER for clicking on ads.
                    </Text>
                  </View>
                </View>
              </View>

              {/* 5. Refer & Earn */}
              <View style={styles.guidelineItem}>
                <View style={styles.guidelineBulletIcon}>
                  <Users size={16} color="#9333EA" />
                </View>
                <View style={styles.guidelineContent}>
                  <Text style={styles.guidelineItemTitle}>Refer & Earn</Text>
                  <Text style={styles.guidelineItemText}>
                    Share your unique referral code with real friends. Earn <Text style={styles.guidelineHighlight}>+{platformSettings.referral_reward_points || 100} Points</Text> when a genuine friend registers with your code.
                  </Text>
                </View>
              </View>

              {/* 6. Conversion & Redemption Rules */}
              <View style={styles.guidelineItem}>
                <View style={styles.guidelineBulletIcon}>
                  <Gift size={16} color="#059669" />
                </View>
                <View style={styles.guidelineContent}>
                  <Text style={styles.guidelineItemTitle}>Redemption & Conversion Rate</Text>
                  <Text style={styles.guidelineItemText}>
                    Redeem your points for official digital gift cards (Amazon, Flipkart, PhonePe, Google Play, etc.) at the rate of <Text style={styles.guidelineHighlight}>{ratio} Points = ₹1.00</Text>. Minimum redemption threshold is <Text style={styles.guidelineHighlight}>₹{platformSettings.min_withdrawal_rupees || 100} ({(platformSettings.min_withdrawal_rupees || 100) * ratio} Points)</Text>.
                  </Text>
                </View>
              </View>

              {/* 7. Fair Play & Security Badge */}
              <View style={styles.fairPlayBox}>
                <ShieldCheck size={18} color="#4338CA" />
                <Text style={styles.fairPlayText}>
                  <Text style={{ fontWeight: '800' }}>Fair Play & Security Guarantee:</Text> Perkfy strictly adheres to Google AdMob traffic policies. The use of VPNs, bots, proxies, auto-clickers, or duplicate accounts is strictly prohibited and results in immediate disqualification and account forfeiture.
                </Text>
              </View>
            </View>
          )}
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
  // Guidelines Card
  guidelinesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  guidelinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  guidelinesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guidelinesIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidelinesTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  guidelinesSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  guidelinesBody: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 16,
    paddingTop: 14,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guidelineBulletIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guidelineContent: {
    flex: 1,
  },
  guidelineItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 3,
  },
  guidelineItemText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  guidelineHighlight: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  guidelineSubBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  guidelineNoticeBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  guidelineNoticeText: {
    fontSize: 11.5,
    color: '#92400E',
    lineHeight: 16,
  },
  fairPlayBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
  },
  fairPlayText: {
    flex: 1,
    fontSize: 11.5,
    color: '#312E81',
    lineHeight: 17,
  },
});
