import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  ScrollView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Package, ArrowLeft, Sparkles, Clock, Trophy, AlertCircle, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { playNotificationAudio, showInAppNotification, triggerPushNotification } from '../services/notificationService';

export default function MysteryBoxScreen({ navigation }: any) {
  const { wallet, refreshWallet } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? Math.max(insets.top, 12) : (insets.top > 24 ? insets.top + 4 : 10);

  const [boxState, setBoxState] = useState<'loading' | 'ready' | 'shaking' | 'opened' | 'cooldown'>('loading');
  const [eligible, setEligible] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [pointsWon, setPointsWon] = useState(0);
  const [winMessage, setWinMessage] = useState('');
  const [tierLabel, setTierLabel] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [settings, setSettings] = useState<any>(null);

  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Gentle float loop when ready
  useEffect(() => {
    let loop: Animated.CompositeAnimation;
    if (boxState === 'ready') {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 1500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    }
    return () => loop?.stop();
  }, [boxState]);

  // Cooldown countdown interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setEligible(true);
            setBoxState('ready');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  useEffect(() => {
    fetchMysteryBoxStatus();
  }, []);

  const fetchMysteryBoxStatus = async () => {
    try {
      setBoxState('loading');
      const res = await api.get('/mystery-box');
      if (res.data?.success) {
        setEligible(res.data.eligible);
        setSecondsRemaining(res.data.seconds_remaining || 0);
        if (res.data.settings) {
          setSettings(res.data.settings);
        }

        if (res.data.eligible) {
          setBoxState('ready');
        } else {
          setBoxState('cooldown');
        }
      }
    } catch {
      setBoxState('ready');
    }
  };

  const handleOpenBox = async () => {
    if (!eligible || boxState === 'shaking' || boxState === 'opened') return;
    setErrorMsg('');
    setBoxState('shaking');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Shake sequence
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]),
      { iterations: 6 }
    ).start();

    try {
      const res = await api.post('/mystery-box/open');
      if (res.data?.success) {
        const pts = res.data.points_won || 0;
        setPointsWon(pts);
        setWinMessage(res.data.message || `+${pts} Points won!`);
        setTierLabel(res.data.tier_label || (pts >= 50 ? 'Mega Jackpot!' : 'Lucky Reward!'));
        setEligible(false);
        setSecondsRemaining(24 * 3600);

        setTimeout(async () => {
          setBoxState('opened');
          showInAppNotification('Mystery Box Opened! 🎁', `+${pts} Points credited to your balance!`);
          triggerPushNotification('Mystery Box Winner! 📦', `You opened your daily mystery box and won +${pts} Points!`);
          await refreshWallet();

          // Burst scale animation
          scaleAnim.setValue(0.5);
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }, 1800);
      } else {
        setErrorMsg(res.data?.message || 'Could not open Mystery Box.');
        setBoxState('ready');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Network error opening box.';
      setErrorMsg(msg);
      if (err.response?.status === 429) {
        setBoxState('cooldown');
        setSecondsRemaining(err.response?.data?.seconds_remaining || 3600);
      } else {
        setBoxState('ready');
      }
    }
  };

  const formatCountdown = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Mystery Box</Text>
        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>{(wallet?.available_points ?? 0).toLocaleString()} pts</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Sparkles size={18} color="#7C3AED" />
          <Text style={styles.infoBannerText}>
            Open once every 24 hours to claim up to 100 free cash points!
          </Text>
        </View>

        {/* Stage Card */}
        <View style={styles.stageCard}>
          <Text style={styles.stageTitle}>Lucky Mystery Box</Text>
          <Text style={styles.stageSub}>
            Tap to open your daily box and reveal your surprise reward.
          </Text>

          {/* Interactive Box Visual */}
          <View style={styles.boxWrapper}>
            {boxState === 'ready' && (
              <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
                <TouchableOpacity onPress={handleOpenBox} activeOpacity={0.9} style={styles.boxContainer}>
                  <LinearGradient colors={['#7C3AED', '#4C1D95']} style={styles.box3D}>
                    {/* Ribbon Cross */}
                    <View style={styles.verticalRibbon} />
                    <View style={styles.horizontalRibbon} />
                    <View style={styles.centerKnot}>
                      <Sparkles size={22} color="#7C3AED" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}

            {boxState === 'shaking' && (
              <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                <View style={styles.boxContainer}>
                  <LinearGradient colors={['#EA580C', '#C2410C']} style={styles.box3D}>
                    <Sparkles size={40} color="#FFFFFF" />
                  </LinearGradient>
                </View>
              </Animated.View>
            )}

            {boxState === 'opened' && (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <LinearGradient colors={['#22C55E', '#15803D']} style={styles.openedCircle}>
                  <Trophy size={42} color="#FEF08A" />
                  <Text style={styles.openedPtsText}>+{pointsWon}</Text>
                  <Text style={styles.openedPtsSuffix}>POINTS!</Text>
                </LinearGradient>
              </Animated.View>
            )}

            {boxState === 'cooldown' && (
              <View style={styles.lockedBox}>
                <Clock size={40} color="#94A3B8" />
                <Text style={styles.lockedText}>LOCKED</Text>
              </View>
            )}

            {boxState === 'loading' && (
              <ActivityIndicator size="large" color="#7C3AED" />
            )}
          </View>

          {/* Action / Countdown */}
          {boxState === 'ready' && (
            <TouchableOpacity onPress={handleOpenBox} style={styles.openBtn} activeOpacity={0.85}>
              <Text style={styles.openBtnText}>✨ TAP TO OPEN BOX</Text>
            </TouchableOpacity>
          )}

          {boxState === 'shaking' && (
            <Text style={styles.shakingText}>Unlocking your daily reward...</Text>
          )}

          {boxState === 'opened' && (
            <View style={styles.resultBox}>
              <Text style={styles.resultWinText}>{winMessage}</Text>
              <View style={styles.tierPill}>
                <Text style={styles.tierPillText}>{tierLabel}</Text>
              </View>
              <Text style={styles.resultSub}>Next box will unlock in 24 hours.</Text>
            </View>
          )}

          {boxState === 'cooldown' && (
            <View style={styles.countdownBox}>
              <Text style={styles.countdownLabel}>NEXT BOX AVAILABLE IN:</Text>
              <Text style={styles.countdownValue}>{formatCountdown(secondsRemaining)}</Text>
            </View>
          )}

          {errorMsg ? (
            <View style={styles.errorBox}>
              <AlertCircle size={15} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}
        </View>

        {/* Odds Transparency Card */}
        <View style={styles.oddsCard}>
          <Text style={styles.oddsHeader}>🎁 Fair Play Odds & Drop Rates</Text>
          <View style={styles.oddsRow}>
            <View style={styles.oddItem}>
              <Text style={styles.oddTier}>
                TIER 1 ({settings?.tier1_probability !== undefined ? settings.tier1_probability : 60}% CHANCE)
              </Text>
              <Text style={styles.oddPts}>
                {settings?.tier1_min_points !== undefined ? settings.tier1_min_points : 0} to {settings?.tier1_max_points !== undefined ? settings.tier1_max_points : 10} Points
              </Text>
              <Text style={styles.oddDesc}>Standard daily drop</Text>
            </View>

            <View style={[styles.oddItem, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
              <Text style={[styles.oddTier, { color: '#B45309' }]}>
                TIER 2 ({settings?.tier2_probability !== undefined ? settings.tier2_probability : 40}% CHANCE)
              </Text>
              <Text style={[styles.oddPts, { color: '#92400E' }]}>
                {settings?.tier2_rewards && settings.tier2_rewards.length > 0
                  ? settings.tier2_rewards.map((r: any) => `${r.points}`).join(' or ') + ' Points'
                  : '50 or 100 Points'}
              </Text>
              <Text style={[styles.oddDesc, { color: '#B45309' }]}>Admin mega jackpot</Text>
            </View>
          </View>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    padding: 12,
    borderRadius: 14,
    gap: 8,
  },
  infoBannerText: {
    color: '#6D28D9',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  stageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  stageTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  stageSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  boxWrapper: {
    marginVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  boxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  box3D: {
    width: 140,
    height: 140,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: '#DDD6FE',
    position: 'relative',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  verticalRibbon: {
    position: 'absolute',
    width: 20,
    height: '100%',
    backgroundColor: '#F59E0B',
  },
  horizontalRibbon: {
    position: 'absolute',
    height: 20,
    width: '100%',
    backgroundColor: '#F59E0B',
  },
  centerKnot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FCD34D',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 4,
  },
  openedCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#BBF7D0',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  openedPtsText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  openedPtsSuffix: {
    color: '#DCFCE7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lockedBox: {
    width: 130,
    height: 130,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
  },
  openBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 25,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  openBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  shakingText: {
    color: '#D97706',
    fontWeight: '800',
    fontSize: 14,
  },
  resultBox: {
    alignItems: 'center',
    gap: 6,
  },
  resultWinText: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '900',
  },
  tierPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierPillText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },
  resultSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  countdownBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  countdownLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countdownValue: {
    color: '#1E1B4B',
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  oddsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  oddsHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 10,
  },
  oddsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  oddItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  oddTier: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  oddPts: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  oddDesc: {
    fontSize: 9,
    color: '#16A34A',
    marginTop: 2,
  },
});
