import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Film, ArrowLeft, Play, CheckCircle2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { playNotificationAudio, showInAppNotification, triggerPushNotification } from '../services/notificationService';

const DEFAULT_SLOTS = [
  { id: 'rewarded_slot_1', title: 'Daily Rewarded Video #1', points: 10 },
  { id: 'rewarded_slot_2', title: 'Daily Rewarded Video #2', points: 10 },
  { id: 'rewarded_slot_3', title: 'Daily Rewarded Video #3', points: 10 },
  { id: 'rewarded_slot_4', title: 'Daily Rewarded Video #4', points: 10 },
  { id: 'rewarded_slot_5', title: 'Daily Rewarded Video #5', points: 10 },
  { id: 'rewarded_slot_6', title: 'Daily Rewarded Video #6', points: 10 },
  { id: 'rewarded_slot_7', title: 'Daily Rewarded Video #7', points: 10 },
  { id: 'rewarded_slot_8', title: 'Daily Rewarded Video #8', points: 10 },
  { id: 'rewarded_slot_9', title: 'Daily Rewarded Video #9', points: 10 },
  { id: 'rewarded_slot_10', title: 'Daily Rewarded Video #10', points: 10 },
];

export default function WatchAdsScreen({ navigation }: any) {
  const { wallet, refreshWallet } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? Math.max(insets.top, 12) : (insets.top > 24 ? insets.top + 4 : 10);

  const [ads] = useState(DEFAULT_SLOTS);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [adRewardPoints, setAdRewardPoints] = useState(10);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAdsStatus();
  }, []);

  const fetchAdsStatus = async () => {
    try {
      const res = await api.get('/ads');
      if (res.data && res.data.success) {
        setCompletedIds(res.data.completed_ad_ids || []);
        setCompletedCount(res.data.completed_count || 0);
        setDailyLimit(res.data.daily_limit || 10);
        setAdRewardPoints(res.data.ad_reward_points || 10);
      }
    } catch {
      // Fallback to client state
    }
  };

  const handleOpenPrompt = (slot: any) => {
    if (completedIds.includes(slot.id)) return;
    setSelectedSlot(slot);
    setErrorMsg('');
    setSuccessMsg('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Google AdMob Rewarded Video completion handler
  const handleCompleteRewardedAd = async () => {
    if (!selectedSlot || isClaiming) return;
    setIsClaiming(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/ads/verify', { ad_id: selectedSlot.id });
      if (res.data && res.data.success) {
        const pts = res.data.reward_points || adRewardPoints;
        const updated = [...completedIds, selectedSlot.id];
        setCompletedIds(updated);
        setCompletedCount(updated.length);
        setSuccessMsg(`+${pts} Points added!`);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playNotificationAudio().catch(() => {});
        showInAppNotification('Rewarded Video Completed!', `+${pts} Points credited to your wallet balance.`);
        triggerPushNotification('Reward Earned! 🎬', `You completed a rewarded video and received +${pts} Points!`);

        await refreshWallet();

        setTimeout(() => {
          setSelectedSlot(null);
          setIsClaiming(false);
          setSuccessMsg('');
        }, 1200);
        return;
      }

      setErrorMsg(res.data?.message || 'Reward could not be verified. Please retry.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (err: any) {
      setErrorMsg('Ad service unavailable. Please check your network and retry.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewarded Videos</Text>
        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>{(wallet?.available_points ?? 0).toLocaleString()} pts</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBanner}>
          <Sparkles size={18} color="#15803D" />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoBannerTitle}>
              Earn Points with Rewarded Videos
            </Text>
            <Text style={styles.infoBannerText}>
              Watch short rewarded videos to earn +{adRewardPoints} Points each.
            </Text>
          </View>
          <View style={styles.limitPill}>
            <Text style={styles.limitPillText}>
              {completedCount} / {dailyLimit} Done
            </Text>
          </View>
        </View>

        {ads.map((slot) => {
          const isDone = completedIds.includes(slot.id);
          return (
            <View key={slot.id} style={[styles.adCard, isDone && styles.adCardDone]}>
              <View style={styles.adLeft}>
                <View style={[styles.adIconWrap, isDone && { backgroundColor: '#DCFCE7' }]}>
                  {isDone ? (
                    <CheckCircle2 size={20} color="#16A34A" />
                  ) : (
                    <Film size={20} color="#7C3AED" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adTitle}>{slot.title}</Text>
                  <Text style={styles.adPoints}>+{adRewardPoints} Points</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleOpenPrompt(slot)}
                disabled={isDone}
                style={[styles.watchBtn, isDone && styles.watchBtnDone]}
              >
                {isDone ? (
                  <View style={styles.btnRow}>
                    <CheckCircle2 size={13} color="#16A34A" />
                    <Text style={styles.watchBtnTextDone}>Claimed</Text>
                  </View>
                ) : (
                  <View style={styles.btnRow}>
                    <Play size={13} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.watchBtnText}>Watch Video</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* POLICY COMPLIANT REWARDED OPT-IN MODAL */}
      <Modal visible={!!selectedSlot} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Film size={28} color="#7C3AED" />
            </View>

            <Text style={styles.modalTitle}>Watch Rewarded Video</Text>
            <Text style={styles.modalDescription}>
              Watch a short partner video to completion to receive{' '}
              <Text style={{ color: '#16A34A', fontWeight: '800' }}>+{adRewardPoints} Points</Text> credited directly to your wallet balance.
            </Text>

            <View style={styles.rewardSummaryBox}>
              <Sparkles size={16} color="#7C3AED" />
              <Text style={styles.rewardSummaryText}>
                Reward: +{adRewardPoints} Points credited upon completion
              </Text>
            </View>

            {successMsg ? (
              <View style={styles.successBox}>
                <CheckCircle2 size={16} color="#16A34A" />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            {errorMsg ? (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setSelectedSlot(null)}
                disabled={isClaiming}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCompleteRewardedAd}
                disabled={isClaiming}
                style={styles.claimBtn}
              >
                {isClaiming ? (
                  <View style={styles.btnRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.claimBtnText}>Completing...</Text>
                  </View>
                ) : (
                  <View style={styles.btnRow}>
                    <Play size={15} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.claimBtnText}>Watch Video (+{adRewardPoints} Pts)</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 12,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 14,
    gap: 10,
    marginBottom: 4,
  },
  infoBannerTitle: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '800',
  },
  infoBannerText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  limitPill: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  limitPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  adCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adCardDone: {
    opacity: 0.75,
  },
  adLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  adIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  adPoints: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 3,
  },
  watchBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  watchBtnDone: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  watchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  watchBtnTextDone: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 380,
    padding: 24,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  rewardSummaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  rewardSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  successText: {
    color: '#16A34A',
    fontWeight: '800',
    fontSize: 13,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '800',
  },
  claimBtn: {
    flex: 2,
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

