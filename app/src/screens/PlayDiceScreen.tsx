import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Trophy,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Dice3D from '../components/Dice3D';
import { playNotificationAudio, showInAppNotification, triggerPushNotification } from '../services/notificationService';

const DEFAULT_FACES = [
  { face: 1, points: 0, label: 'Better Luck Next Time' },
  { face: 2, points: 0, label: 'Better Luck Next Time' },
  { face: 3, points: 5, label: '+5 Points' },
  { face: 4, points: 5, label: '+5 Points' },
  { face: 5, points: 8, label: '+8 Points' },
  { face: 6, points: 10, label: '+10 Points' },
];

export default function PlayDiceScreen({ navigation }: any) {
  const { wallet, refreshWallet } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? Math.max(insets.top, 12) : (insets.top > 24 ? insets.top + 4 : 10);

  const [currentFace, setCurrentFace] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [settingsFaces, setSettingsFaces] = useState(DEFAULT_FACES);
  const [recentRolls, setRecentRolls] = useState<any[]>([]);
  const [rollResult, setRollResult] = useState<{ face: number; points: number; label: string } | null>(null);

  useEffect(() => {
    fetchDiceData();
  }, []);

  const fetchDiceData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dice');
      if (res.data?.success) {
        if (res.data.settings?.faces && Array.isArray(res.data.settings.faces)) {
          setSettingsFaces(res.data.settings.faces);
        }
        setCompletedCount(res.data.rolls_completed_today || 0);
        setDailyLimit(res.data.daily_limit || 10);
        if (Array.isArray(res.data.recent_rolls)) {
          setRecentRolls(res.data.recent_rolls);
        }
      }
    } catch (e) {
      console.warn('Dice data sync offline');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateRoll = async () => {
    if (completedCount >= dailyLimit || isRolling) return;

    setIsRolling(true);
    setRollResult(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const res = await api.post('/dice/roll', {
        ad_id: 'ad_mobile_dice',
        ad_title: 'Mobile Sponsored Dice',
      });

      if (res.data?.success) {
        const winningFace = res.data.face || Math.floor(Math.random() * 6) + 1;
        const awardedPoints = res.data.reward_points ?? 0;
        const label = res.data.label || (awardedPoints > 0 ? `+${awardedPoints} Points` : 'Better Luck Next Time');

        setCurrentFace(winningFace);

        setTimeout(async () => {
          setIsRolling(false);
          setRollResult({ face: winningFace, points: awardedPoints, label });
          setCompletedCount(res.data.rolls_completed_today ?? completedCount + 1);

          await refreshWallet();

          if (awardedPoints > 0) {
            showInAppNotification('Dice Victory! 🎲', `+${awardedPoints} Points added to wallet!`);
            triggerPushNotification('Lucky Dice Winner! 🎲', `You rolled face ${winningFace} and won +${awardedPoints} points!`);
          }

          setRecentRolls((prev) => [
            {
              id: `dice_${Date.now()}`,
              face: winningFace,
              reward_points: awardedPoints,
              label,
              created_at: new Date().toISOString(),
            },
            ...prev,
          ]);
        }, 1850);
        return;
      }
    } catch (err) {
      console.warn('Backend roll fallback');
    }

    // Client-side fallback if server offline
    const randomFaceObj = settingsFaces[Math.floor(Math.random() * settingsFaces.length)] || { face: 6, points: 10, label: '+10 Points' };
    setCurrentFace(randomFaceObj.face);

    setTimeout(async () => {
      setIsRolling(false);
      setRollResult({
        face: randomFaceObj.face,
        points: randomFaceObj.points,
        label: randomFaceObj.label,
      });
      setCompletedCount((prev) => prev + 1);
      await refreshWallet();

      setRecentRolls((prev) => [
        {
          id: `dice_${Date.now()}`,
          face: randomFaceObj.face,
          reward_points: randomFaceObj.points,
          label: randomFaceObj.label,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }, 1850);
  };

  const isLimitReached = completedCount >= dailyLimit;
  const remainingRolls = Math.max(0, dailyLimit - completedCount);
  const availablePoints = (wallet?.available_points ?? 0).toLocaleString();

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#1E1B4B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎲 Play Lucky 3D Dice</Text>
        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>{availablePoints} pts</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner Card - 1:1 with Web */}
        <LinearGradient
          colors={['#4C1D95', '#5B21B6', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerCard}
        >
          <View style={styles.bannerTag}>
            <Sparkles size={13} color="#FFF" />
            <Text style={styles.bannerTagText}>SPONSOR AD REWARD GAME</Text>
          </View>
          <Text style={styles.bannerHeading}>🎲 Play Lucky 3D Dice</Text>
          <Text style={styles.bannerSubtext}>
            Watch a quick sponsor ad & roll the lucky die. Win up to +10 instant wallet points per roll!
          </Text>

          <View style={[styles.countBadge, isLimitReached && styles.countBadgeDisabled]}>
            <Text style={styles.countBadgeText}>
              {completedCount} / {dailyLimit} Rolls Today
            </Text>
          </View>
        </LinearGradient>

        {/* Main 3D Dice Gameplay Card */}
        <View style={styles.diceCard}>
          {/* Subtle Ambient Radial Glow */}
          <View style={styles.ambientGlow} />

          {/* Real 3D Dice Component with Dots/Pips */}
          <Dice3D
            targetFace={currentFace}
            isRolling={isRolling}
            size={110}
          />

          {/* Result Announcement */}
          {rollResult && !isRolling && (
            <View
              style={[
                styles.resultCard,
                rollResult.points > 0 ? styles.resultCardSuccess : styles.resultCardNeutral,
              ]}
            >
              {rollResult.points > 0 ? (
                <View style={styles.resultCol}>
                  <View style={styles.resultTitleRow}>
                    <Sparkles size={18} color="#16A34A" />
                    <Text style={styles.resultWinTitle}>Won +{rollResult.points} Points!</Text>
                  </View>
                  <Text style={styles.resultWinSub}>
                    Rolled Face {rollResult.face} • Credited to your wallet balance!
                  </Text>
                </View>
              ) : (
                <View style={styles.resultCol}>
                  <Text style={styles.resultNeutralTitle}>Better Luck Next Time!</Text>
                  <Text style={styles.resultNeutralSub}>
                    Rolled Face {rollResult.face}. No reward this turn • Roll again to win!
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Action Button */}
          <View style={styles.actionWrap}>
            {isLimitReached ? (
              <View style={styles.limitReachedBox}>
                <Text style={styles.limitReachedText}>
                  🎯 All {dailyLimit} daily rolls completed! Check back tomorrow.
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleInitiateRoll}
                disabled={isRolling}
                activeOpacity={0.85}
                style={[styles.rollBtn, isRolling && styles.rollBtnDisabled]}
              >
                {isRolling ? (
                  <View style={styles.btnRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.rollBtnText}>🎲 Rolling Dice...</Text>
                  </View>
                ) : (
                  <View style={styles.btnRow}>
                    <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.rollBtnText}>Roll 3D Dice ({remainingRolls} Left)</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            <Text style={styles.actionHint}>
              ⚡ Roll the lucky 3D die to win instant reward points credited directly to your wallet.
            </Text>
          </View>
        </View>

        {/* Face Rewards Reference Matrix */}
        <View style={styles.matrixCard}>
          <View style={styles.matrixHeader}>
            <View style={styles.matrixTitleRow}>
              <Trophy size={18} color="#D97706" />
              <Text style={styles.matrixTitle}>Dice Face Payout Matrix</Text>
            </View>
            <Text style={styles.matrixSubheader}>Configured by Admin</Text>
          </View>

          <View style={styles.matrixGrid}>
            {settingsFaces.map((f) => {
              const isSelected = currentFace === f.face && !isRolling;
              const pts = Number(f.points) || 0;
              const symbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

              return (
                <View
                  key={f.face}
                  style={[
                    styles.matrixItem,
                    isSelected && styles.matrixItemSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.symbolBox,
                      isSelected ? styles.symbolBoxSelected : styles.symbolBoxNormal,
                    ]}
                  >
                    <Text style={styles.symbolText}>{symbols[f.face - 1] || '🎲'}</Text>
                  </View>

                  <Text style={styles.faceLabel}>Face {f.face}</Text>
                  <Text
                    style={[
                      styles.facePts,
                      pts > 0 ? styles.facePtsGreen : styles.facePtsGray,
                    ]}
                  >
                    {pts > 0 ? `+${pts} Pts` : '0 Pts'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Today's Dice Rolls Activity History */}
        {recentRolls.length > 0 && (
          <View style={styles.historyCard}>
            <View style={styles.historyTitleRow}>
              <Clock size={16} color="#1E1B4B" />
              <Text style={styles.historyTitle}>Today's Dice Rolls Activity</Text>
            </View>

            <View style={styles.historyList}>
              {recentRolls.map((roll, idx) => (
                <View key={roll.id || idx} style={styles.historyItem}>
                  <View style={styles.historyItemLeft}>
                    <View style={styles.historyFaceBox}>
                      <Text style={styles.historyFaceText}>{roll.face}</Text>
                    </View>
                    <View>
                      <Text style={styles.historyMainText}>
                        Rolled Face {roll.face} ({roll.label || 'Dice Roll'})
                      </Text>
                      <Text style={styles.historyTimeText}>
                        {roll.created_at ? new Date(roll.created_at).toLocaleTimeString() : 'Today'}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.historyPtsText,
                      (roll.reward_points || 0) > 0 ? styles.historyPtsGreen : styles.historyPtsGray,
                    ]}
                  >
                    {(roll.reward_points || 0) > 0 ? `+${roll.reward_points} Pts` : '0 Pts'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9FE',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
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
    fontSize: 12,
    fontWeight: '800',
    color: '#6D28D9',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  bannerCard: {
    padding: 20,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerHeading: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  bannerSubtext: {
    color: '#E9D5FF',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  countBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  countBadgeDisabled: {
    backgroundColor: '#6B7280',
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  diceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ambientGlow: {
    position: 'absolute',
    top: -50,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  resultCard: {
    width: '100%',
    padding: 14,
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 2,
  },
  resultCardSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  resultCardNeutral: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  resultCol: {
    alignItems: 'center',
    gap: 4,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultWinTitle: {
    color: '#16A34A',
    fontWeight: '900',
    fontSize: 17,
  },
  resultWinSub: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  resultNeutralTitle: {
    color: '#4B5563',
    fontWeight: '800',
    fontSize: 15,
  },
  resultNeutralSub: {
    color: '#6B7280',
    fontSize: 12,
  },
  actionWrap: {
    width: '100%',
    marginTop: 6,
  },
  rollBtn: {
    backgroundColor: '#5B21B6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  rollBtnDisabled: {
    opacity: 0.7,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rollBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  limitReachedBox: {
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  limitReachedText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '800',
  },
  actionHint: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
  matrixCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  matrixHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  matrixTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matrixTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  matrixSubheader: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '700',
  },
  matrixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  matrixItem: {
    width: '31%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  matrixItemSelected: {
    backgroundColor: '#F3E8FF',
    borderColor: '#7C3AED',
    borderWidth: 2,
    transform: [{ scale: 1.03 }],
  },
  symbolBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  symbolBoxNormal: {
    backgroundColor: '#1E1B4B',
  },
  symbolBoxSelected: {
    backgroundColor: '#7C3AED',
  },
  symbolText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  faceLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 2,
  },
  facePts: {
    fontSize: 12,
    fontWeight: '900',
  },
  facePtsGreen: {
    color: '#16A34A',
  },
  facePtsGray: {
    color: '#9CA3AF',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  historyFaceBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyFaceText: {
    color: '#5B21B6',
    fontWeight: '800',
    fontSize: 13,
  },
  historyMainText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  historyTimeText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  historyPtsText: {
    fontSize: 13,
    fontWeight: '900',
  },
  historyPtsGreen: {
    color: '#16A34A',
  },
  historyPtsGray: {
    color: '#9CA3AF',
  },
});
