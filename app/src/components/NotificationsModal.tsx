import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Bell,
  CheckCircle2,
  Trash2,
  X,
  Gift,
  Disc,
  Dices,
  Calendar,
  Tv,
  Wallet,
  Sparkles,
  CheckCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { COLORS } from '../theme';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onNotificationsChanged?: () => void;
  navigation?: any;
}

function formatRelativeTime(dateString: string) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function getNotificationMeta(type?: string) {
  switch (type) {
    case 'referral':
      return {
        Icon: Gift,
        color: '#16A34A',
        bg: '#DCFCE7',
        badge: 'Referral',
      };
    case 'welcome':
      return {
        Icon: Sparkles,
        color: '#7C3AED',
        bg: '#EDE9FE',
        badge: 'Welcome',
      };
    case 'spin':
      return {
        Icon: Disc,
        color: '#9333EA',
        bg: '#F3E8FF',
        badge: 'Spin Win',
      };
    case 'dice':
      return {
        Icon: Dices,
        color: '#4F46E5',
        bg: '#EEF2FF',
        badge: 'Dice Roll',
      };
    case 'attendance':
      return {
        Icon: Calendar,
        color: '#059669',
        bg: '#D1FAE5',
        badge: 'Attendance',
      };
    case 'ad':
      return {
        Icon: Tv,
        color: '#D97706',
        bg: '#FEF3C7',
        badge: 'Ad Reward',
      };
    case 'withdrawal':
    case 'voucher':
      return {
        Icon: Wallet,
        color: '#2563EB',
        bg: '#DBEAFE',
        badge: 'Voucher',
      };
    default:
      return {
        Icon: Bell,
        color: '#5B21B6',
        bg: '#EDE9FE',
        badge: 'Alert',
      };
  }
}

export default function NotificationsModal({
  visible,
  onClose,
  onNotificationsChanged,
  navigation,
}: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data?.success && Array.isArray(res.data.notifications)) {
        setNotifications(res.data.notifications);
      }
    } catch (e) {
      console.warn('Could not fetch notifications', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible, fetchNotifications]);

  const handleMarkAllRead = async () => {
    if (notifications.length === 0 || actionLoading) return;
    setActionLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Optimistically update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      await api.put('/notifications/read-all');
      if (onNotificationsChanged) onNotificationsChanged();
    } catch (err) {
      console.warn('Mark all read error', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0 || actionLoading) return;
    setActionLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Optimistically clear immediately
    setNotifications([]);

    try {
      await api.delete('/notifications/clear-all').catch(() => api.post('/notifications/clear-all'));
      if (onNotificationsChanged) onNotificationsChanged();
    } catch (err) {
      console.warn('Clear all error', err);
      fetchNotifications();
    } finally {
      setActionLoading(false);
    }
  };

  const handleSingleRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await api.put(`/notifications/${id}/read`);
      if (onNotificationsChanged) onNotificationsChanged();
    } catch (e) {}
  };

  const handleItemPress = (notif: any) => {
    handleSingleRead(notif.id, Boolean(notif.is_read));
    onClose();
    if (navigation) {
      if (notif.type === 'voucher' || notif.type === 'withdrawal' || notif.data?.screen === 'Activity') {
        navigation.navigate('Activity');
      } else if (notif.type === 'spin' || notif.data?.screen === 'Spin') {
        navigation.navigate('Spin');
      } else if (notif.type === 'dice' || notif.data?.screen === 'PlayDice') {
        navigation.navigate('PlayDice');
      } else if (notif.type === 'ad' || notif.data?.screen === 'WatchAds') {
        navigation.navigate('WatchAds');
      } else if (notif.type === 'referral' || notif.data?.screen === 'Profile') {
        navigation.navigate('Profile');
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.bellIconWrap}>
                <Bell size={18} color="#5B21B6" />
              </View>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Quick Actions Bar */}
          {notifications.length > 0 ? (
            <View style={styles.actionsBar}>
              <TouchableOpacity
                onPress={handleMarkAllRead}
                disabled={actionLoading || unreadCount === 0}
                style={[
                  styles.actionBtn,
                  unreadCount === 0 && { opacity: 0.4 },
                ]}
                activeOpacity={0.7}
              >
                <CheckCheck size={14} color="#5B21B6" />
                <Text style={styles.actionBtnText}>Read All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClearAll}
                disabled={actionLoading}
                style={[styles.actionBtn, { borderColor: '#FCA5A5' }]}
                activeOpacity={0.7}
              >
                <Trash2 size={13} color="#DC2626" />
                <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Clear All</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Content Area */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#5B21B6" />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Bell size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySub}>
                You are all caught up! You will be notified here when you earn points, unlock game rewards, or claim gift vouchers.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.listScroll}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {notifications.map((notif) => {
                const meta = getNotificationMeta(notif.type);
                const IconComponent = meta.Icon;
                const isRead = Boolean(notif.is_read);

                return (
                  <TouchableOpacity
                    key={notif.id}
                    onPress={() => handleItemPress(notif)}
                    activeOpacity={0.8}
                    style={[
                      styles.notifCard,
                      !isRead && styles.notifCardUnread,
                    ]}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
                      <IconComponent size={18} color={meta.color} />
                    </View>

                    <View style={styles.textWrap}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.badgeRow}>
                          <Text style={[styles.badgeText, { color: meta.color }]}>
                            {meta.badge}
                          </Text>
                          {!isRead ? <View style={styles.unreadDot} /> : null}
                        </View>
                        <Text style={styles.timeText}>
                          {formatRelativeTime(notif.created_at)}
                        </Text>
                      </View>

                      <Text style={[styles.notifTitle, !isRead && styles.notifTitleUnread]}>
                        {notif.title}
                      </Text>
                      <Text style={styles.notifMessage} numberOfLines={3}>
                        {notif.message}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  unreadBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  unreadBadgeText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B21B6',
  },
  loadingContainer: {
    paddingVertical: 45,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 45,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  listScroll: {
    maxHeight: 460,
  },
  listContent: {
    padding: 14,
    gap: 10,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifCardUnread: {
    backgroundColor: '#FAF5FF',
    borderColor: '#C084FC',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  textWrap: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  notifTitleUnread: {
    color: '#1E1B4B',
    fontWeight: '800',
  },
  notifMessage: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
});
