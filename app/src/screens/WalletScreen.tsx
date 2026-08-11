import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme';

export default function WalletScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Wallet</Text>
      <View style={styles.card}>
        <Text style={styles.label}>AVAILABLE BALANCE</Text>
        <Text style={styles.points}>2,450 Pts</Text>
        <Text style={styles.rupees}>₹245.00 Value</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepVioletDark, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginBottom: 16 },
  card: { backgroundColor: COLORS.secondaryViolet, padding: 24, borderRadius: 20 },
  label: { color: COLORS.lightVioletBg, fontSize: 12, fontWeight: 'bold' },
  points: { color: COLORS.white, fontSize: 32, fontWeight: 'bold', marginVertical: 8 },
  rupees: { color: COLORS.accentMint, fontSize: 18, fontWeight: 'bold' }
});
