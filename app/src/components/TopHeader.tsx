import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell, Sparkles, User as UserIcon } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';

interface TopHeaderProps {
  onOpenNotifications?: () => void;
  onNavigateToWallet?: () => void;
  onNavigateToProfile?: () => void;
}

export default function TopHeader({
  onOpenNotifications,
  onNavigateToWallet,
  onNavigateToProfile,
}: TopHeaderProps) {
  const { user, wallet } = useAuth();

  const displayPoints = (wallet?.available_points !== undefined ? wallet.available_points : 0).toLocaleString();

  return (
    <View style={styles.header}>
      {/* Brand */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeLetter}>P</Text>
        </View>
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
            <Sparkles size={12} color="#FFFFFF" />
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
          <Bell size={20} color="#334155" />
          <View style={styles.unreadDot} />
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
            <UserIcon size={18} color="#7C3AED" />
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
    paddingTop: 45,
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
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#5B21B6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeLetter: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
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
});
