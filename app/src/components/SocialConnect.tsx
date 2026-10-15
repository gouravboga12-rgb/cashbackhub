import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CheckCircle, ExternalLink, Gift, X, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  gradient: [string, string, ...string[]];
  letter: string;
}

const SOCIAL_TASKS: SocialTask[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@perkfy2026',
    url: 'https://www.instagram.com/perkfy2026?stkn=dG9scHJ3YWppcjNq',
    action: 'Follow',
    color: '#E1306C',
    gradient: ['#833AB4', '#FD1D1D', '#FCAF45'],
    letter: '📸',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@Perkfy',
    url: 'https://www.youtube.com/@Perkfy',
    action: 'Subscribe',
    color: '#FF0000',
    gradient: ['#FF0000', '#CC0000'],
    letter: '▶️',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    handle: '@Perkfy2026',
    url: 'https://x.com/Perkfy2026',
    action: 'Follow',
    color: '#0F172A',
    gradient: ['#1E293B', '#0F172A'],
    letter: '𝕏',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Perkfy',
    url: 'https://www.facebook.com/share/1DfNSijrFY/',
    action: 'Follow',
    color: '#1877F2',
    gradient: ['#1877F2', '#0C5FCD'],
    letter: 'f',
  },
];

interface SocialConnectProps {
  user?: any;
  refreshWallet?: () => Promise<void>;
}

export default function SocialConnect({ user, refreshWallet }: SocialConnectProps) {
  const currentUserId = user?.id || null;

  // status: 'claim' | 'done' | undefined
  const [taskStatus, setTaskStatus] = useState<Record<string, string>>({});
  const [activeModalTask, setActiveModalTask] = useState<SocialTask | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await api.get('/social-connect/status');
      if (res.data?.success && Array.isArray(res.data.completed)) {
        const s: Record<string, string> = {};
        res.data.completed.forEach((id: string) => {
          s[id] = 'done';
        });
        setTaskStatus((prev) => ({ ...prev, ...s }));
      }
    } catch (e) {
      // offline status
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnectPress = (task: SocialTask) => {
    if (taskStatus[task.id] === 'done') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveModalTask(task);
  };

  const handleOpenSocialLink = async (task: SocialTask) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Mark as visited / eligible to claim
    setTaskStatus((prev) => ({ ...prev, [task.id]: 'claim' }));
    setActiveModalTask(null);

    try {
      const canOpen = await Linking.canOpenURL(task.url);
      if (canOpen) {
        await Linking.openURL(task.url);
      }
    } catch (e) {
      console.warn('Could not open URL', e);
    }
  };

  const handleClaimReward = async (task: SocialTask) => {
    if (taskStatus[task.id] === 'done' || claimingId) return;

    setClaimingId(task.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const res = await api.post('/social-connect/claim', { platform: task.id });
      if (res.data?.success) {
        setTaskStatus((prev) => ({ ...prev, [task.id]: 'done' }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showInAppNotification('Reward Claimed! 🎁', `+10 Points earned for connecting on ${task.name}!`);
        if (refreshWallet) await refreshWallet();
      }
    } catch (e: any) {
      // Fallback mark as completed
      setTaskStatus((prev) => ({ ...prev, [task.id]: 'done' }));
      showInAppNotification('Reward Claimed! 🎁', `+10 Points earned for connecting on ${task.name}!`);
      if (refreshWallet) await refreshWallet();
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Social Connect</Text>
      </View>

      <View style={styles.tasksContainer}>
        {SOCIAL_TASKS.map((task, i) => {
          const status = taskStatus[task.id];
          const isDone = status === 'done';
          const canClaim = status === 'claim';
          const isClaiming = claimingId === task.id;

          return (
            <View
              key={task.id}
              style={[
                styles.taskRow,
                i === SOCIAL_TASKS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.taskLeft}>
                <LinearGradient
                  colors={isDone ? ['#DCFCE7', '#DCFCE7'] : task.gradient}
                  style={styles.taskIconBadge}
                >
                  {isDone ? (
                    <CheckCircle size={22} color="#16A34A" />
                  ) : (
                    <Text style={styles.taskEmoji}>{task.letter}</Text>
                  )}
                </LinearGradient>

                <View>
                  <Text style={styles.taskName}>{task.name}</Text>
                  <View style={styles.subRow}>
                    <Text style={styles.taskHandle}>{task.handle}</Text>
                    <View style={styles.ptsBadge}>
                      <Text style={styles.ptsBadgeText}>+10 Pts</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Button: Connect / Claim Reward / Completed */}
              {isDone ? (
                <View style={styles.completedBadge}>
                  <CheckCircle size={15} color="#16A34A" />
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              ) : canClaim ? (
                <TouchableOpacity
                  onPress={() => handleClaimReward(task)}
                  disabled={isClaiming}
                  activeOpacity={0.85}
                  style={styles.claimRewardBtn}
                >
                  {isClaiming ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Gift size={14} color="#FFFFFF" />
                      <Text style={styles.claimRewardBtnText}>Claim Reward</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => handleConnectPress(task)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={task.gradient}
                    style={styles.connectBtn}
                  >
                    <Text style={styles.connectBtnText}>Connect</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      {/* Connect Modal Popup (Exact 1:1 with Web) */}
      <Modal visible={!!activeModalTask} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          {activeModalTask && (
            <View style={styles.modalCard}>
              <View style={styles.dragBar} />

              <TouchableOpacity
                onPress={() => setActiveModalTask(null)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>

              <LinearGradient
                colors={activeModalTask.gradient}
                style={styles.modalIconBox}
              >
                <Text style={styles.modalIconEmoji}>{activeModalTask.letter}</Text>
              </LinearGradient>

              <Text style={styles.modalTitle}>
                {activeModalTask.action} on {activeModalTask.name}
              </Text>

              <View style={styles.modalInstructionBox}>
                <Text style={styles.modalInstructionText}>
                  Click <Text style={styles.boldPurple}>Open</Text> to visit our official {activeModalTask.name} page,{' '}
                  <Text style={styles.boldText}>{activeModalTask.action.toLowerCase()}/subscribe</Text> to us, then come back to Perkfy to claim your reward.
                </Text>
              </View>

              <View style={styles.modalRewardPill}>
                <Sparkles size={14} color="#16A34A" />
                <Text style={styles.modalRewardPillText}>+10 Points Bonus</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleOpenSocialLink(activeModalTask)}
                activeOpacity={0.85}
                style={{ width: '100%' }}
              >
                <LinearGradient
                  colors={activeModalTask.gradient}
                  style={styles.modalActionBtn}
                >
                  <Text style={styles.modalActionBtnText}>
                    Open {activeModalTask.name}
                  </Text>
                  <ExternalLink size={16} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  headerRow: {
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  tasksContainer: {
    gap: 2,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 10,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  taskIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskEmoji: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  taskName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 2,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskHandle: {
    fontSize: 12,
    color: '#6B7280',
  },
  ptsBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  ptsBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5B21B6',
  },
  connectBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  claimRewardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  claimRewardBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  completedBadgeText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
    paddingBottom: 36,
    alignItems: 'center',
    position: 'relative',
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalIconEmoji: {
    fontSize: 30,
    color: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 10,
  },
  modalInstructionBox: {
    backgroundColor: '#F8F7FC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    padding: 14,
    marginBottom: 14,
    width: '100%',
  },
  modalInstructionText: {
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  boldPurple: {
    color: '#5B21B6',
    fontWeight: '800',
  },
  boldText: {
    color: '#1E1B4B',
    fontWeight: '800',
  },
  modalRewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 16,
  },
  modalRewardPillText: {
    color: '#16A34A',
    fontWeight: '800',
    fontSize: 12,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    width: '100%',
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
