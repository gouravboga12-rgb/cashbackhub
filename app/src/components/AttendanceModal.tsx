import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Gift,
  Pointer,
  Sparkles,
  UserCheck,
  X,
  Zap,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showInAppNotification, triggerPushNotification, playNotificationAudio } from '../services/notificationService';
import { showInterstitialAd } from '../services/adService';
import { COLORS } from '../theme';

interface AttendanceModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AttendanceModal({ visible, onClose }: AttendanceModalProps) {
  const { user, wallet, refreshWallet } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? Math.max(insets.top, 12) : (insets.top > 24 ? insets.top + 4 : 10);
  const [claiming, setClaiming] = useState(false);
  const [claimedState, setClaimedState] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(100);
  const [statusMessage, setStatusMessage] = useState('');

  const getISTDate = () => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  };

  const todayStr = getISTDate();
  const userId = user?.id || 'demo_user';

  useEffect(() => {
    if (visible && user?.id) {
      setClaimedState(false);
      checkAttendance();
    }
  }, [visible, user?.id]);

  const checkAttendance = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get('/attendance/today').catch(() => ({ data: {} }));
      if (res.data && res.data.success !== undefined) {
        if (typeof res.data.reward_points === 'number') {
          setRewardPoints(res.data.reward_points);
        }
        const isDone = Boolean(res.data.completed);
        setClaimedState(isDone);
        if (isDone) {
          await AsyncStorage.setItem(`cashback_attendance_claimed_${user.id}_${todayStr}`, 'true');
        } else {
          await AsyncStorage.removeItem(`cashback_attendance_claimed_${user.id}_${todayStr}`);
        }
      } else {
        // Fallback to specific user's cached claim only
        const cachedClaim = await AsyncStorage.getItem(`cashback_attendance_claimed_${user.id}_${todayStr}`);
        setClaimedState(cachedClaim === 'true');
      }
    } catch (e) {
      console.warn('Attendance check offline');
    }
  };

  const handleClaim = async () => {
    if (claiming) return;

    if (claimedState) {
      setStatusMessage('Already marked for today!');
      setTimeout(onClose, 800);
      return;
    }

    setClaiming(true);
    setStatusMessage('');

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const res = await api.post('/attendance/check-in');
      const awarded = res.data?.reward_points || rewardPoints;

      setClaimedState(true);
      setStatusMessage(`+${awarded} Points Added!`);
      await AsyncStorage.setItem(`cashback_attendance_claimed_${userId}_${todayStr}`, 'true');

      // Refresh wallet
      await refreshWallet();

      // Show Google AdMob Interstitial ad on attendance check-in
      showInterstitialAd().catch(() => {});

      // Trigger audio & notifications
      playNotificationAudio().catch(() => {});
      showInAppNotification('Attendance Marked!', `+${awarded} Points credited to your wallet!`);
      triggerPushNotification(
        'Daily Attendance Claimed! 🌟',
        `You earned +${awarded} points for checking in today!`
      );

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('already marked') || msg.includes('already checked in')) {
        setClaimedState(true);
        setStatusMessage('Already marked for today!');
        await AsyncStorage.setItem(`cashback_attendance_claimed_${userId}_${todayStr}`, 'true');
        setTimeout(onClose, 800);
      } else {
        // Fallback local claim
        setClaimedState(true);
        setStatusMessage(`+${rewardPoints} Points Added!`);
        await AsyncStorage.setItem(`cashback_attendance_claimed_${userId}_${todayStr}`, 'true');
        await refreshWallet();
        showInAppNotification('Attendance Marked!', `+${rewardPoints} Points credited!`);
        setTimeout(onClose, 1000);
      }
    } finally {
      setClaiming(false);
    }
  };

  const displayPoints = (wallet?.available_points !== undefined ? wallet.available_points : 0).toLocaleString();

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Navbar */}
        <View style={[styles.navbar, { paddingTop: topPadding }]}>
          <TouchableOpacity onPress={onClose} style={styles.navBtn}>
            <ArrowLeft size={18} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <Text style={styles.brandText}>
              Perk<Text style={{ color: COLORS.primaryGreen }}>fy</Text>
            </Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.navBtn}>
            <X size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Your Points Header Card */}
          <View style={styles.pointsCard}>
            <View style={styles.pointsLeft}>
              <View style={styles.sparkleIcon}>
                <Sparkles color="#FFFFFF" size={20} />
              </View>
              <View>
                <Text style={styles.pointsLabel}>YOUR POINTS</Text>
                <Text style={styles.pointsValue}>{displayPoints}</Text>
                <Text style={styles.pointsSub}>Total Balance</Text>
              </View>
            </View>

            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>Day 3 Streak 🔥</Text>
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.headingSection}>
            <View style={styles.headingRow}>
              <Text style={styles.headingTitle}>Daily Attendance</Text>
              <Calendar size={22} color={COLORS.secondaryViolet} />
            </View>
            <Text style={styles.headingSubtitle}>
              Push the button below to mark your daily attendance and earn{' '}
              <Text style={{ color: COLORS.primaryGreen, fontWeight: '800' }}>+{rewardPoints} points</Text> instantly!
            </Text>
          </View>

          {/* Main Attendance Card */}
          <LinearGradient colors={['#F5EEFD', '#FAF5FF']} style={styles.claimCard}>
            {/* Top Right Speech Bubble */}
            <View style={styles.ptsBubble}>
              <Text style={styles.bubbleValue}>+{rewardPoints}</Text>
              <Text style={styles.bubbleSub}>Points</Text>
            </View>

            {/* Center Pedestal */}
            <LinearGradient
              colors={claimedState ? ['#16A34A', '#15803D'] : ['#7C3AED', '#6D28D9']}
              style={styles.pedestal}
            >
              {claimedState ? (
                <Check size={42} color="#FFFFFF" strokeWidth={3} />
              ) : (
                <UserCheck size={42} color="#FFFFFF" />
              )}
            </LinearGradient>

            <Text style={styles.claimTitle}>
              {claimedState ? 'Attendance Already Marked!' : 'Ready to Claim?'}
            </Text>
            <Text style={styles.claimDesc}>
              {claimedState
                ? `You have collected today's ${rewardPoints} points! Come back tomorrow for more.`
                : `Push the button below to mark your attendance and get ${rewardPoints} points!`}
            </Text>

            {/* Big Action Button */}
            <TouchableOpacity
              onPress={handleClaim}
              disabled={claiming}
              activeOpacity={0.85}
              style={{ width: '100%' }}
            >
              <LinearGradient
                colors={
                  claimedState
                    ? ['#16A34A', '#15803D']
                    : ['#2563EB', '#1D4ED8', '#16A34A']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionBtn}
              >
                <View style={styles.btnInnerLeft}>
                  <View style={styles.btnIconWrap}>
                    {claimedState ? (
                      <CheckCircle2 size={16} color="#FFF" />
                    ) : (
                      <Pointer size={16} color="#FFF" />
                    )}
                  </View>
                  <Text style={styles.btnText}>
                    {claiming
                      ? `Claiming +${rewardPoints} pts...`
                      : claimedState
                      ? 'Attendance Marked! ✓'
                      : 'Push to Mark Attendance'}
                  </Text>
                </View>

                <View style={[styles.btnArrowWrap, { backgroundColor: claimedState ? '#15803D' : '#16A34A' }]}>
                  {claiming ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : claimedState ? (
                    <Check size={18} color="#FFF" strokeWidth={3} />
                  ) : (
                    <ChevronRight size={18} color="#FFF" />
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {statusMessage ? (
              <View style={styles.statusBox}>
                <Text style={styles.statusBoxText}>{statusMessage}</Text>
              </View>
            ) : null}

            <Text style={styles.cardFooterText}>✪ One push, {rewardPoints} points in your pocket!</Text>
          </LinearGradient>

          {/* Streak Banner */}
          <View style={styles.streakCard}>
            <View style={styles.streakLeft}>
              <Text style={{ fontSize: 24 }}>🔥</Text>
              <View>
                <Text style={styles.streakTitle}>Keep your streak going!</Text>
                <Text style={styles.streakSub}>Come back tomorrow for more points.</Text>
              </View>
            </View>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>Day 3</Text>
            </View>
          </View>

          {/* Feature Badges */}
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Gift size={16} color="#16A34A" />
              </View>
              <Text style={styles.featureTitle}>+100 Bonus</Text>
              <Text style={styles.featureSub}>Daily Check-In</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#F3E8FF' }]}>
                <Zap size={16} color="#5B21B6" />
              </View>
              <Text style={styles.featureTitle}>Instant Rewards</Text>
              <Text style={styles.featureSub}>Get instantly</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <ShieldCheck size={16} color="#D97706" />
              </View>
              <Text style={styles.featureTitle}>100% Safe</Text>
              <Text style={styles.featureSub}>Secure & Trusted</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navbar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    color: '#1E1B4B',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  pointsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#5B21B6',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  pointsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sparkleIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FEF3C7',
  },
  pointsLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pointsValue: {
    color: '#1E1B4B',
    fontSize: 22,
    fontWeight: '800',
  },
  pointsSub: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
  },
  streakBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  streakBadgeText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '800',
  },
  headingSection: {
    alignItems: 'center',
    marginTop: 4,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  headingTitle: {
    color: '#1E1B4B',
    fontSize: 22,
    fontWeight: '800',
  },
  headingSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  claimCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    elevation: 3,
    shadowColor: '#5B21B6',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  ptsBubble: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    alignItems: 'center',
    elevation: 2,
  },
  bubbleValue: {
    color: '#16A34A',
    fontSize: 15,
    fontWeight: '800',
  },
  bubbleSub: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: '700',
  },
  pedestal: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    marginVertical: 12,
    elevation: 4,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  claimTitle: {
    color: '#1E1B4B',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  claimDesc: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 8,
    lineHeight: 17,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  btnInnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  btnArrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBox: {
    marginTop: 12,
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  statusBoxText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  cardFooterText: {
    marginTop: 14,
    color: '#7C3AED',
    fontSize: 11,
    fontWeight: '700',
  },
  streakCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakTitle: {
    color: '#1E1B4B',
    fontSize: 13,
    fontWeight: '800',
  },
  streakSub: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '500',
  },
  dayBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dayBadgeText: {
    color: '#6D28D9',
    fontSize: 12,
    fontWeight: '800',
  },
  featureGrid: {
    backgroundColor: '#F8F7FC',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  featureSub: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 1,
  },
});
