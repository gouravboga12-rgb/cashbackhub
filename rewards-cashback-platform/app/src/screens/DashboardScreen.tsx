import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';

export default function DashboardScreen({ navigation }: any) {
  const [wallet, setWallet] = useState({ available_points: 2450, total_earned: 3250, total_redeemed: 800 });
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* User Greeting */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, User! 👋</Text>
        <Text style={styles.subtext}>Keep earning, keep winning!</Text>
      </View>

      {/* Main Wallet Banner Card */}
      <View style={styles.walletCard}>
        <Text style={styles.walletLabel}>MY WALLET</Text>
        <Text style={styles.pointsText}>{wallet.available_points.toLocaleString()} Pts</Text>
        <Text style={styles.rupeeText}>₹{(wallet.available_points / 10).toFixed(2)} Value</Text>
        <Text style={styles.rateLabel}>10 Points = ₹1.00</Text>
      </View>

      {/* Daily Tasks */}
      <Text style={styles.sectionTitle}>Today's Activity</Text>

      {/* Daily Attendance Card */}
      <View style={styles.taskCard}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>🗓️ Daily Attendance</Text>
          <Text style={styles.taskSub}>Mark attendance and earn 10 points</Text>
        </View>
        <TouchableOpacity 
          style={[styles.taskBtn, attendanceMarked ? styles.btnDone : styles.btnActive]}
          onPress={() => setAttendanceMarked(true)}
          disabled={attendanceMarked}
        >
          <Text style={styles.btnText}>{attendanceMarked ? '✓ Marked' : '+10 Check In'}</Text>
        </TouchableOpacity>
      </View>

      {/* Watch Ads Card */}
      <View style={styles.taskCard}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>📺 Watch Ads (0/10)</Text>
          <Text style={styles.taskSub}>Watch 10 ads and earn 10 points per ad</Text>
        </View>
        <TouchableOpacity style={styles.btnActive} onPress={() => navigation.navigate('WatchAds')}>
          <Text style={styles.btnText}>Start</Text>
        </TouchableOpacity>
      </View>

      {/* Spin & Win Card */}
      <View style={styles.taskCard}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>🎡 Spin & Win</Text>
          <Text style={styles.taskSub}>Spin the wheel and win exciting points</Text>
        </View>
        <TouchableOpacity style={styles.btnActive} onPress={() => navigation.navigate('Spin')}>
          <Text style={styles.btnText}>Spin</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepVioletDark, padding: 20 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  subtext: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  walletCard: {
    backgroundColor: COLORS.secondaryViolet,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: COLORS.primaryViolet,
    shadowRadius: 15,
    shadowOpacity: 0.4
  },
  walletLabel: { color: COLORS.lightVioletBg, fontSize: 12, fontWeight: 'bold', tracking: 1 },
  pointsText: { color: COLORS.white, fontSize: 36, fontWeight: 'bold', marginVertical: 8 },
  rupeeText: { color: COLORS.accentMint, fontSize: 20, fontWeight: 'bold' },
  rateLabel: { color: COLORS.textSecondary, fontSize: 12, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white, marginBottom: 16 },
  taskCard: {
    backgroundColor: COLORS.cardBgDark,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark
  },
  taskInfo: { flex: 1, marginRight: 12 },
  taskTitle: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  taskSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  taskBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btnActive: { backgroundColor: COLORS.primaryGreen },
  btnDone: { backgroundColor: COLORS.secondaryViolet },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 }
});
