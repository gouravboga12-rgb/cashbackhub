import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Film, ArrowLeft, Play, CheckCircle2, Clock, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { playNotificationAudio, showInAppNotification, triggerPushNotification } from '../services/notificationService';

export default function WatchAdsScreen({ navigation }: any) {
  const { wallet, refreshWallet } = useAuth();

  const [ads, setAds] = useState([
    { id: 'ad_1', title: 'Top Cashback Deals 2026', duration: 6, points: 10 },
    { id: 'ad_2', title: 'Smart Shopping & Discounts', duration: 6, points: 10 },
    { id: 'ad_3', title: 'Mobile Recharges & Vouchers', duration: 6, points: 10 },
    { id: 'ad_4', title: 'Gaming Rewards & Credits', duration: 6, points: 10 },
  ]);

  const [activeAd, setActiveAd] = useState<any | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeAd && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeAd, countdown]);

  const startAd = (ad: any) => {
    if (completedIds.includes(ad.id)) return;
    setActiveAd(ad);
    setCountdown(ad.duration || 6);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const verifyAndClaim = async () => {
    if (!activeAd || countdown > 0 || isVerifying) return;
    setIsVerifying(true);

    try {
      await api.post('/ads/verify', { ad_id: activeAd.id }).catch(() => {});
    } catch (e) {}

    const pts = activeAd.points || 10;
    setCompletedIds((prev) => [...prev, activeAd.id]);
    setIsVerifying(false);
    setActiveAd(null);

    await refreshWallet();
    playNotificationAudio().catch(() => {});
    showInAppNotification('Ad Completed!', `+${pts} Points added to your balance!`);
    triggerPushNotification('Reward Earned! 🎬', `You watched a sponsor clip and received +${pts} Points!`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Watch Ads & Earn</Text>
        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>{(wallet?.available_points ?? 0).toLocaleString()} pts</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBanner}>
          <Sparkles size={18} color="#15803D" />
          <Text style={styles.infoBannerText}>
            Watch quick 6-second sponsor videos and earn instant points!
          </Text>
        </View>

        {ads.map((ad) => {
          const isDone = completedIds.includes(ad.id);
          return (
            <View key={ad.id} style={styles.adCard}>
              <View style={styles.adLeft}>
                <View style={[styles.adIconWrap, isDone && { backgroundColor: '#DCFCE7' }]}>
                  {isDone ? (
                    <CheckCircle2 size={20} color="#16A34A" />
                  ) : (
                    <Film size={20} color="#5B21B6" />
                  )}
                </View>
                <View>
                  <Text style={styles.adTitle}>{ad.title}</Text>
                  <View style={styles.adMetaRow}>
                    <Clock size={12} color="#94A3B8" />
                    <Text style={styles.adDuration}>{ad.duration}s duration</Text>
                    <Text style={styles.adPoints}>+{ad.points} Pts</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => startAd(ad)}
                disabled={isDone}
                style={[styles.watchBtn, isDone && styles.watchBtnDone]}
              >
                <Text style={[styles.watchBtnText, isDone && styles.watchBtnTextDone]}>
                  {isDone ? 'Completed' : 'Watch'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Ad Modal Player */}
      <Modal visible={!!activeAd} transparent animationType="fade">
        <View style={styles.adModalOverlay}>
          <View style={styles.adPlayerCard}>
            <LinearGradient colors={['#1E1B4B', '#312E81']} style={styles.videoPlaceholder}>
              <Film size={48} color="#DDD6FE" />
              <Text style={styles.sponsorText}>SPONSOR ADVERTISEMENT</Text>
              <Text style={styles.adCountdownText}>
                {countdown > 0 ? `Reward ready in ${countdown}s` : 'Reward Ready! 🎉'}
              </Text>
            </LinearGradient>

            <View style={styles.adModalFooter}>
              <Text style={styles.adModalTitle}>{activeAd?.title}</Text>
              <TouchableOpacity
                onPress={verifyAndClaim}
                disabled={countdown > 0 || isVerifying}
                style={[styles.claimAdBtn, countdown > 0 && styles.claimAdBtnDisabled]}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.claimAdBtnText}>
                    {countdown > 0 ? `Please wait (${countdown}s)` : 'Claim +10 Points'}
                  </Text>
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
    paddingTop: 45,
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
    gap: 8,
    marginBottom: 4,
  },
  infoBannerText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
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
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  adMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  adDuration: {
    fontSize: 11,
    color: '#64748B',
  },
  adPoints: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  watchBtn: {
    backgroundColor: '#5B21B6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  watchBtnDone: {
    backgroundColor: '#F1F5F9',
  },
  watchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  watchBtnTextDone: {
    color: '#94A3B8',
  },
  adModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  adPlayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    width: '100%',
    overflow: 'hidden',
  },
  videoPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sponsorText: {
    color: '#A5B4FC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  adCountdownText: {
    color: '#FCD34D',
    fontSize: 16,
    fontWeight: '800',
  },
  adModalFooter: {
    padding: 16,
    alignItems: 'center',
  },
  adModalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 12,
  },
  claimAdBtn: {
    backgroundColor: '#16A34A',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  claimAdBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  claimAdBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
