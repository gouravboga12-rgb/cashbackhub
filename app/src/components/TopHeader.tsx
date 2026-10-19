import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, StatusBar, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Sparkles, User as UserIcon } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { COLORS } from '../theme';
import { showInAppNotification, playNotificationAudio } from '../services/notificationService';

interface TopHeaderProps {
  onOpenNotifications?: () => void;
  onNavigateToWallet?: () => void;
  onNavigateToProfile?: () => void;
  refreshTrigger?: number;
}

export default function TopHeader({
  onOpenNotifications,
  onNavigateToWallet,
  onNavigateToProfile,
  refreshTrigger,
}: TopHeaderProps) {
  const { user, wallet } = useAuth();
  const insets = useSafeAreaInsets();
  const [unreadCount, setUnreadCount] = useState(0);
  const prevCountRef = useRef<number | null>(null);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        const count = res.data.unread_count || 0;
        if (prevCountRef.current !== null && count > prevCountRef.current) {
          const latest = res.data.notifications?.[0];
          if (latest) {
            showInAppNotification(latest.title || 'Gift Card Fulfilled! 🎉', latest.message || 'Check your Activity tab!');
          } else {
            playNotificationAudio().catch(() => {});
          }
        }
        prevCountRef.current = count;
        setUnreadCount(count);
      }
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        fetchUnread();
      }
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [user, refreshTrigger, fetchUnread]);

  // Dynamic slight gap padding with status bar:
  // On iOS: insets.top handles the notch / Dynamic Island.
  // On Android: slight, normal gap of 8px (or insets.top + 4 if edge-to-edge).
  const topPadding = Platform.OS === 'ios'
    ? Math.max(insets.top, 12)
    : (insets.top > 24 ? insets.top + 4 : 8);

  const displayPoints = (wallet?.available_points !== undefined ? wallet.available_points : 0).toLocaleString();
  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <View style={[styles.header, { paddingTop: topPadding }]}>
      {/* Brand */}
      <View style={styles.brandRow}>
        <Image
          source={require('../../assets/perkfy-logo.png')}
          style={styles.logoImage}
          resizeMode="cover"
        />
        <Text style={styles.brandTitle}>
          Perk<Text style={{ color: COLORS.primaryGreen }}>fy</Text>
        </Text>
      </View>

      {/* Right Controls */}
      <View style={styles.rightRow}>
        {/* Wallet Balance Pill */}
        <TouchableOpacity
          onPress={onNavigateToWallet}
          activeOpacity={0.8}
          style={styles.balancePill}
        >
          <View style={styles.coinDot}>
            <Sparkles size={11} color="#FFFFFF" />
          </View>
          <Text style={styles.balanceText}>{displayPoints}</Text>
          <Text style={styles.ptsLabel}>pts</Text>
        </TouchableOpacity>

        {/* Notification Bell */}
        <TouchableOpacity
          onPress={onOpenNotifications}
          activeOpacity={0.8}
          style={styles.iconBtn}
        >
          <Bell size={18} color="#334155" />
          {unreadCount > 0 ? <View style={styles.unreadDot} /> : null}
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity
          onPress={onNavigateToProfile}
          activeOpacity={0.8}
          style={styles.avatarBtn}
        >
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarLetter}>{userInitial}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 9,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: -0.3,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    gap: 5,
  },
  coinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceText: {
    color: '#5B21B6',
    fontWeight: '800',
    fontSize: 13,
  },
  ptsLabel: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE9FE',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarLetter: {
    color: '#6D28D9',
    fontWeight: '800',
    fontSize: 15,
  },
});
