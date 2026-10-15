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
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dices, ArrowLeft, Trophy, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { playNotificationAudio, showInAppNotification, triggerPushNotification } from '../services/notificationService';

export default function PlayDiceScreen({ navigation }: any) {
  const { wallet, refreshWallet } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? Math.max(insets.top, 12) : (insets.top > 24 ? insets.top + 4 : 10);

  const [diceValue, setDiceValue] = useState(6);
  const [isRolling, setIsRolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [recentRolls, setRecentRolls] = useState<any[]>([]);
  const [lastWonResult, setLastWonResult] = useState<{ face: number; points: number; label: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchDiceData();
  }, []);

  const fetchDiceData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dice');
      if (res.data?.success) {
        setCompletedCount(res.data.rolls_completed_today || 0);
        setDailyLimit(res.data.daily_limit || 10);
        if (Array.isArray(res.data.recent_rolls)) {
          setRecentRolls(res.data.recent_rolls);
        }
      }
    } catch (e) {
      console.warn('Dice status offline');
    } finally {
      setLoading(false);
    }
  };

  const handleRollDice = async () => {
    if (isRolling || completedCount >= dailyLimit) return;

    setErrorMessage('');
    setIsRolling(true);
    setLastWonResult(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Spin animation
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 720,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    try {
      const res = await api.post('/dice/roll', {
        ad_id: 'ad_mobile_dice',
        ad_title: 'Mobile Sponsored Dice',
      });

      if (res.data?.success) {
        const winningFace = res.data.face || Math.floor(Math.random() * 6) + 1;
        const awardedPoints = res.data.reward_points || 0;
        const label = res.data.label || (awardedPoints > 0 ? `+${awardedPoints} Points` : 'Better Luck Next Time');

        setTimeout(async () => {
          setDiceValue(winningFace);
          setIsRolling(false);
          setCompletedCount(res.data.rolls_completed_today ?? completedCount + 1);
          setLastWonResult({ face: winningFace, points: awardedPoints, label });

          await refreshWallet();

          if (awardedPoints > 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            playNotificationAudio().catch(() => {});
            showInAppNotification('Dice Roll Winner! 🎲', `+${awardedPoints} Points added to wallet!`);
            triggerPushNotification('Dice Victory! 🎲', `You rolled face ${winningFace} and won +${awardedPoints} points!`);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }

          fetchDiceData();
        }, 1800);
        return;
      }

      setErrorMessage(res.data?.message || 'Roll failed. Please try again.');
      setIsRolling(false);
    } catch (err: any) {
      setIsRolling(false);
      setErrorMessage(err.response?.data?.message || 'Daily limit reached or service offline.');
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 720],
    outputRange: ['0deg', '720deg'],
  });

  const availablePoints = (wallet?.available_points ?? 0).toLocaleString();
  const rollsRemaining = Math.max(0, dailyLimit - completedCount);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lucky 3D Dice Roll</Text>
        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>{availablePoints} pts</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoLeft}>
            <Trophy size={18} color="#D97706" />
            <Text style={styles.infoBannerTitle}>
              Roll the lucky die to win up to 10 points!
            </Text>
          </View>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {completedCount}/{dailyLimit} Done
            </Text>
          </View>
        </View>

        {/* Dice Arena */}
        <LinearGradient
          colors={['#1E1B4B', '#312E81', '#4338CA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.arena}
        >
          <View style={styles.glowEffect} />

          <Animated.View style={[styles.diceBox, { transform: [{ rotate: spin }] }]}>
            <Text style={styles.diceFaceNumber}>{diceValue}</Text>
          </Animated.View>

          <Text style={styles.arenaSubtitle}>
            {isRolling
              ? 'Rolling lucky 3D die...'
              : lastWonResult
              ? lastWonResult.label
              : `Tap roll to spin face (Last: Face ${diceValue})`}
          </Text>
        </LinearGradient>

        {/* Result Callout */}
        {lastWonResult ? (
          <View
            style={[
              styles.resultBanner,
              lastWonResult.points > 0 ? styles.resultBannerSuccess : styles.resultBannerNeutral,
            ]}
          >
            {lastWonResult.points > 0 ? (
              <CheckCircle2 size={18} color="#166534" />
            ) : (
              <Sparkles size={18} color="#64748B" />
            )}
            <Text
              style={[
                styles.resultText,
                lastWonResult.points > 0 ? { color: '#166534' } : { color: '#475569' },
              ]}
            >
              {lastWonResult.points > 0
                ? `🎉 You rolled Face ${lastWonResult.face} and won +${lastWonResult.points} Points!`
                : `Rolled Face ${lastWonResult.face}. Better luck next roll!`}
            </Text>
          </View>
        ) : null}

        {/* Error message */}
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color="#DC2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Roll Button */}
        <TouchableOpacity
          onPress={handleRollDice}
          disabled={isRolling || rollsRemaining <= 0}
          activeOpacity={0.85}
          style={{ width: '100%', marginTop: 8 }}
        >
          <LinearGradient
            colors={
              rollsRemaining <= 0
                ? ['#94A3B8', '#64748B']
                : isRolling
                ? ['#6D28D9', '#5B21B6']
                : ['#16A34A', '#15803D']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rollBtn}
          >
            {isRolling ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Dices size={20} color="#FFFFFF" />
                <Text style={styles.rollBtnText}>
                  {rollsRemaining <= 0
                    ? 'All Daily Rolls Completed'
                    : `ROLL 3D DICE (${rollsRemaining} LEFT)`}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Admin Server-Side RNG Engine • 100% fair and transparent odds
        </Text>
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
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  balanceText: {
    color: '#6D28D9',
    fontWeight: '800',
    fontSize: 12,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 35,
  },
  infoBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  countPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  arena: {
    borderRadius: 22,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
  },
  diceBox: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#4ADE80',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 6,
  },
  diceFaceNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  arenaSubtitle: {
    color: '#E9D5FF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 18,
  },
  resultBanner: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  resultBannerSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  resultBannerNeutral: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  resultText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  rollBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#16A34A',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  rollBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footnote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
