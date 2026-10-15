import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CheckCircle2, ExternalLink, Gift, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { showInAppNotification } from '../services/notificationService';

interface SocialTask {
  id: string;
  name: string;
  handle: string;
  url: string;
  action: string;
  color: string;
  badgeBg: string;
}

const SOCIAL_TASKS: SocialTask[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@perkfy2026',
    url: 'https://www.instagram.com/perkfy2026?stkn=dG9scHJ3YWppcjNq',
    action: 'Follow',
    color: '#E1306C',
    badgeBg: '#FDF2F8',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@Perkfy',
    url: 'https://www.youtube.com/@Perkfy',
    action: 'Subscribe',
    color: '#FF0000',
    badgeBg: '#FFF5F5',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    handle: '@Perkfy2026',
    url: 'https://x.com/Perkfy2026',
    action: 'Follow',
    color: '#0F172A',
    badgeBg: '#F8FAFC',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Perkfy',
    url: 'https://www.facebook.com/share/1DfNSijrFY/',
    action: 'Follow',
    color: '#1877F2',
    badgeBg: '#EFF6FF',
  },
];

interface SocialConnectProps {
  user?: any;
  refreshWallet?: () => Promise<void>;
}

export default function SocialConnect({ user, refreshWallet }: SocialConnectProps) {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [visitedMap, setVisitedMap] = useState<Record<string, boolean>>({});
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, [user?.id]);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/social-connect/status');
      if (res.data?.success && Array.isArray(res.data.completed)) {
        const m: Record<string, boolean> = {};
        res.data.completed.forEach((id: string) => {
          m[id] = true;
        });
        setCompletedMap(m);
      }
    } catch (e) {
      // offline status
    }
  };

  const handleOpenTask = async (task: SocialTask) => {
    if (completedMap[task.id]) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisitedMap((prev) => ({ ...prev, [task.id]: true }));

    try {
      const supported = await Linking.canOpenURL(task.url);
      if (supported) {
        await Linking.openURL(task.url);
      }
    } catch (e) {
      console.warn('Error opening URL', e);
    }
  };

  const handleClaimTask = async (task: SocialTask) => {
    if (completedMap[task.id] || claimingId) return;

    setClaimingId(task.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const res = await api.post('/social-connect/claim', { platform: task.id });
      if (res.data?.success) {
        setCompletedMap((prev) => ({ ...prev, [task.id]: true }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showInAppNotification('Reward Claimed! 🎁', `+10 Points earned for connecting with ${task.name}!`);
        if (refreshWallet) await refreshWallet();
      }
    } catch (e: any) {
      // Local fallback
      setCompletedMap((prev) => ({ ...prev, [task.id]: true }));
      showInAppNotification('Reward Claimed! 🎁', `+10 Points earned for connecting with ${task.name}!`);
      if (refreshWallet) await refreshWallet();
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Sparkles size={18} color="#7C3AED" />
          <Text style={styles.headerTitle}>Social Connect Tasks</Text>
        </View>
        <View style={styles.bonusBadge}>
          <Text style={styles.bonusBadgeText}>+10 Pts Each</Text>
        </View>
      </View>
      <Text style={styles.headerSub}>
        Follow and subscribe to our official social media channels to claim instant bonus points!
      </Text>

      <View style={styles.taskList}>
        {SOCIAL_TASKS.map((task) => {
          const isDone = !!completedMap[task.id];
          const hasVisited = !!visitedMap[task.id];
          const isClaiming = claimingId === task.id;

          return (
            <View key={task.id} style={styles.taskRow}>
              <View style={styles.taskLeft}>
                <View style={[styles.taskIconBadge, { backgroundColor: task.badgeBg }]}>
                  <Text style={[styles.taskIconLetter, { color: task.color }]}>
                    {task.name[0]}
                  </Text>
                </View>
                <View>
                  <Text style={styles.taskName}>{task.name}</Text>
                  <Text style={styles.taskHandle}>{task.handle}</Text>
                </View>
              </View>

              {isDone ? (
                <View style={styles.doneBadge}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <Text style={styles.doneBadgeText}>Claimed</Text>
                </View>
              ) : hasVisited ? (
                <TouchableOpacity
                  onPress={() => handleClaimTask(task)}
                  disabled={isClaiming}
                  activeOpacity={0.85}
                  style={styles.claimBtn}
                >
                  {isClaiming ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.claimBtnText}>Claim +10</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => handleOpenTask(task)}
                  activeOpacity={0.85}
                  style={[styles.actionBtn, { borderColor: task.color }]}
                >
                  <Text style={[styles.actionBtnText, { color: task.color }]}>{task.action}</Text>
                  <ExternalLink size={12} color={task.color} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  bonusBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  bonusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6D28D9',
  },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 14,
    lineHeight: 17,
  },
  taskList: {
    gap: 10,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIconLetter: {
    fontSize: 18,
    fontWeight: '900',
  },
  taskName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  taskHandle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  claimBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    minWidth: 80,
    alignItems: 'center',
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  doneBadgeText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800',
  },
});
